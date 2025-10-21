# backend/scripts/seed_roles_permissions.py
from app import create_app, db
from models import Role, Permission

app = create_app()

with app.app_context():
    default_roles = ["Admin", "Manager", "Technician", "Viewer"]
    default_permissions = [
        "view_dashboard",
        "manage_devices",
        "manage_users",
        "view_reports"
    ]

    for role_name in default_roles:
        if not Role.query.filter_by(name=role_name).first():
            db.session.add(Role(name=role_name))

    for perm_name in default_permissions:
        if not Permission.query.filter_by(name=perm_name).first():
            db.session.add(Permission(name=perm_name))

    db.session.commit()
    print("✅ Roles and permissions seeded successfully!")
