import unittest
from app import create_app
from extensions import db
from models import User


class UserRoutesTestCase(unittest.TestCase):
    def setUp(self):
        """Create temporary app and DB for testing."""
        self.app = create_app(testing=True)
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        """Clean up after each test."""
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    # ---------------------------------------
    # ✅ Test 1: Register user
    # ---------------------------------------
    def test_register_user(self):
        payload = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "test123"
        }
        response = self.client.post("/api/users/register", json=payload)
        self.assertEqual(response.status_code, 201)
        self.assertIn("User registered successfully", response.get_data(as_text=True))

    # ---------------------------------------
    # ✅ Test 2: Login user
    # ---------------------------------------
    def test_login_user(self):
        # First register a user
        self.client.post("/api/users/register", json={
            "username": "loginuser",
            "email": "login@example.com",
            "password": "pass123"
        })

        # Then try logging in
        response = self.client.post("/api/users/login", json={
            "email": "login@example.com",
            "password": "pass123"
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn("token", response.get_data(as_text=True))

    # ---------------------------------------
    # ✅ Test 3: Get all users
    # ---------------------------------------
    def test_get_all_users(self):
        response = self.client.get("/api/users")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json, list)


if __name__ == "__main__":
    unittest.main()
