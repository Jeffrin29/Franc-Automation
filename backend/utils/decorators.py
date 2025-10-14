import jwt
from functools import wraps
from flask import request, jsonify, current_app
from models import User
from werkzeug.security import check_password_hash

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # JWT can be provided in Authorization header as "Bearer <token>"
        auth = request.headers.get('Authorization', None)
        if auth and auth.startswith("Bearer "):
            token = auth.split(" ", 1)[1]

        if not token:
            return jsonify({"message": "Token is missing!"}), 401

        try:
            payload = jwt.decode(token, current_app.config["JWT_SECRET"], algorithms=[current_app.config.get("JWT_ALGORITHM","HS256")])
            username = payload.get("sub")
            user = User.query.filter_by(username=username).first()
            if not user:
                return jsonify({"message": "User not found"}), 401
            # attach user to request context
            request.user = user
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired, please login again"}), 401
        except Exception as e:
            current_app.logger.exception("JWT decode error: %s", e)
            return jsonify({"message": "Invalid token"}), 401

        return f(*args, **kwargs)
    return decorated

def roles_required(allowed_roles):
    def wrapper(fn):
        @wraps(fn)
        def decorated(*args, **kwargs):
            user = getattr(request, "user", None)
            if not user:
                return jsonify({"message": "Authentication required"}), 401
            if user.role not in allowed_roles:
                return jsonify({"message": "Permission denied"}), 403
            return fn(*args, **kwargs)
        return decorated
    return wrapper
