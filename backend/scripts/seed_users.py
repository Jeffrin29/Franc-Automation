# backend/scripts/seed_users.py
"""
Run inside container or venv:
python backend/scripts/seed_users.py
"""
from werkzeug.security import generate_password_hash
from backend.models import db, User, Role
from backend.app import create_app  # or import app variable depending on your app layout

app = create_app()  # or however you create your flask app

users_to_create = [
    ("Superadmin", "superadmin123", "superadmin"),
    ("Admin", "admin123", "admin"),
    ("User1", "user@1", "user"),
    ("User2", "user@2", "user"),
    ("User3", "user@3", "user"),
    ("User4", "user@4", "user"),
    # optional: add 4 more accounts to reach 10 if you want:
    ("User5", "user@5", "user"),
    ("User6", "user@6", "user"),
    ("User7", "user@7", "user"),
    ("User8", "user@8", "user"),
]

role_defs = [
    ("superadmin", "Super Administrator: full access"),
    ("admin", "Admin (limited)"),
    ("user", "Regular user (monitoring)"),
]

with app.app_context():
    # ensure roles exist
    for rname, rdesc in role_defs:
        r = Role.query.filter_by(name=rname).first()
        if not r:
            r = Role(name=rname, description=rdesc)
            db.session.add(r)
    db.session.commit()

    for username, password, role_name in users_to_create:
        if User.query.filter_by(username=username).first():
            print("Skipping existing", username)
            continue
        hashed = generate_password_hash(password)
        u = User(username=username, email=f"{username.lower()}@local", password=hashed)
        db.session.add(u)
        db.session.commit()
        r = Role.query.filter_by(name=role_name).first()
        if r:
            u.roles.append(r)
            db.session.commit()
        print("Created", username)
