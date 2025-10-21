# backend/scripts/seed_superadmin.py
from app import create_app, db
from models import User, Role
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    username = "superadmin"
    email = "admin@francautomation.com"
    password = "admin123"

    if not User.query.filter_by(email=email).first():
        superadmin = User(
            username=username,
            email=email,
            password=generate_password_hash(password),
            is_active=True,
            image_url="/default-user.png",
        )
        db.session.add(superadmin)
        db.session.commit()

        # Assign all roles to superadmin
        roles = Role.query.all()
        for role in roles:
            superadmin.roles.append(role)
        db.session.commit()

        print("✅ Superadmin created successfully!")
    else:
        print("ℹ️ Superadmin already exists.")
