# backend/routes/auth_routes.py
from flask import Blueprint, request, jsonify, current_app
import jwt, datetime, os
from backend.models import db, User, Role, user_roles
from backend.config import Config

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# -------------------------------
# Predefined users (10) - plain text passwords (per your request)
# -------------------------------
DEFAULT_USERS = [
    ("superadmin", "superadmin123", "superadmin"),
    ("admin", "admin123", "admin"),
    ("user1", "user@1", "user"),
    ("user2", "user@2", "user"),
    ("user3", "user@3", "user"),
    ("user4", "user@4", "user"),
    ("user5", "user5pass", "user"),
    ("user6", "user6pass", "user"),
    ("user7", "user7pass", "user"),
    ("user8", "user8pass", "user"),
]

def seed_default_users():
    """Create roles + users if they don't exist. Plain-text passwords (by design)."""
    try:
        # ensure roles exist
        for _, _, role_name in DEFAULT_USERS:
            if not Role.query.filter_by(name=role_name).first():
                r = Role(name=role_name)
                db.session.add(r)
        db.session.commit()
    except Exception:
        db.session.rollback()

    try:
        for username, pwd, role_name in DEFAULT_USERS:
            if User.query.filter_by(username=username).first():
                continue
            # create user
            u = User(
                username=username,
                email=f"{username}@local",  # kept for model compatibility; not used by frontend
                password=pwd,               # stored in plain text (per your request)
            )
            # attach role
            role = Role.query.filter_by(name=role_name).first()
            if role:
                u.roles.append(role)
            db.session.add(u)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        current_app.logger.exception("Seeding default users failed: %s", e)


# ------------------------------------------------------
# Login
# ------------------------------------------------------
@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"status": "error", "message": "username and password required"}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"status": "error", "message": "Invalid credentials"}), 401

    # Plain-text check (no hashing) — as requested
    if user.password != password:
        return jsonify({"status": "error", "message": "Invalid credentials"}), 401

    role = user.roles[0].name if user.roles else "user"

    secret = getattr(Config, "SECRET_KEY", None) or os.environ.get("SECRET_KEY", "franc-secret")
    token = jwt.encode(
        {"user_id": user.id, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=12)},
        secret,
        algorithm="HS256",
    )

    return jsonify({
        "status": "success",
        "token": token,
        "role": role,
        "username": user.username
    })


# ------------------------------------------------------
# Signup
# ------------------------------------------------------
@auth_bp.post("/signup")
def signup():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"status": "error", "message": "username and password required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"status": "error", "message": "Username already exists"}), 400

    # ensure 'user' role exists
    role = Role.query.filter_by(name="user").first()
    if not role:
        role = Role(name="user")
        db.session.add(role)
        db.session.commit()

    user = User(username=username, email=f"{username}@local", password=password)
    user.roles.append(role)
    db.session.add(user)
    db.session.commit()

    secret = getattr(Config, "SECRET_KEY", None) or os.environ.get("SECRET_KEY", "franc-secret")
    token = jwt.encode(
        {"user_id": user.id, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=12)},
        secret,
        algorithm="HS256",
    )

    return jsonify({
        "status": "success",
        "token": token,
        "role": "user",
        "username": user.username
    })


# ------------------------------------------------------
# Whoami - return current user info (by token)
# ------------------------------------------------------
@auth_bp.get("/whoami")
def whoami():
    auth = request.headers.get("Authorization", "") or request.args.get("token", "")
    token = None
    if auth.startswith("Bearer "):
        token = auth.split(" ", 1)[1]
    elif auth:
        token = auth

    if not token:
        return jsonify({"status": "error", "message": "Missing token"}), 401

    secret = getattr(Config, "SECRET_KEY", None) or os.environ.get("SECRET_KEY", "franc-secret")
    try:
        data = jwt.decode(token, secret, algorithms=["HS256"])
        uid = data.get("user_id")
        user = User.query.get(uid)
        if not user:
            return jsonify({"status": "error", "message": "User not found"}), 404
        role = user.roles[0].name if user.roles else "user"
        return jsonify({"status": "success", "username": user.username, "role": role})
    except jwt.ExpiredSignatureError:
        return jsonify({"status": "error", "message": "Token expired"}), 401
    except Exception as e:
        return jsonify({"status": "error", "message": "Invalid token", "detail": str(e)}), 401
