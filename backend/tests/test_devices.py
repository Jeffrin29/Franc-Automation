import unittest
from app import create_app
from extensions import db
from models import Device


class DeviceRoutesTestCase(unittest.TestCase):
    def setUp(self):
        """Create temporary app and DB for testing."""
        self.app = create_app(testing=True)
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        """Clean up DB after test."""
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    # ---------------------------------------
    # ✅ Test 1: Add a device
    # ---------------------------------------
    def test_add_device(self):
        payload = {
            "name": "Drone X1",
            "type": "Agriculture",
            "status": "Active"
        }
        response = self.client.post("/api/devices", json=payload)
        self.assertEqual(response.status_code, 201)
        self.assertIn("Device added successfully", response.get_data(as_text=True))

    # ---------------------------------------
    # ✅ Test 2: Get all devices
    # ---------------------------------------
    def test_get_devices(self):
        response = self.client.get("/api/devices")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json, list)

    # ---------------------------------------
    # ✅ Test 3: Update device
    # ---------------------------------------
    def test_update_device(self):
        # Add a device first
        self.client.post("/api/devices", json={
            "name": "Drone X2",
            "type": "Logistics",
            "status": "Inactive"
        })
        # Update
        response = self.client.put("/api/devices/1", json={
            "status": "Active"
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn("Device updated successfully", response.get_data(as_text=True))

    # ---------------------------------------
    # ✅ Test 4: Delete device
    # ---------------------------------------
    def test_delete_device(self):
        self.client.post("/api/devices", json={
            "name": "Drone Y1",
            "type": "Inspection",
            "status": "Active"
        })
        response = self.client.delete("/api/devices/1")
        self.assertEqual(response.status_code, 200)
        self.assertIn("Device deleted successfully", response.get_data(as_text=True))


if __name__ == "__main__":
    unittest.main()
