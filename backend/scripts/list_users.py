# backend/scripts/list_users.py
from app import create_app, db
from models import User

app = create_app()

with app.app_context():
    users = User.query.all()
    if not users:
        print("No users found.")
    else:
        for u in users:
            print(f"{u.id}: {u.username} ({u.email}) - Active: {u.is_active}")
