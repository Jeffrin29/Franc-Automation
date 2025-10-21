import unittest
from app import create_app
from extensions import db
from models import Sensor


class SensorRoutesTestCase(unittest.TestCase):
    def setUp(self):
        """Setup a temporary app context and in-memory database."""
        self.app = create_app(testing=True)
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        """Tear down database after each test."""
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    # ---------------------------------------
    # ✅ Test 1: Add new sensor
    # ---------------------------------------
    def test_add_sensor(self):
        payload = {
            "name": "Temperature Sensor 1",
            "type": "Temperature",
            "value": 23.5,
            "unit": "Celsius",
            "status": "Active"
        }
        response = self.client.post("/api/sensors", json=payload)
        self.assertEqual(response.status_code, 201)
        self.assertIn("Sensor added successfully", response.get_data(as_text=True))

    # ---------------------------------------
    # ✅ Test 2: Get all sensors
    # ---------------------------------------
    def test_get_all_sensors(self):
        response = self.client.get("/api/sensors")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json, list)

    # ---------------------------------------
    # ✅ Test 3: Get sensor by ID
    # ---------------------------------------
    def test_get_sensor_by_id(self):
        self.client.post("/api/sensors", json={
            "name": "Pressure Sensor",
            "type": "Pressure",
            "value": 1.2,
            "unit": "bar",
            "status": "Active"
        })
        response = self.client.get("/api/sensors/1")
        self.assertEqual(response.status_code, 200)
        self.assertIn("Pressure Sensor", response.get_data(as_text=True))

    # ---------------------------------------
    # ✅ Test 4: Update sensor
    # ---------------------------------------
    def test_update_sensor(self):
        self.client.post("/api/sensors", json={
            "name": "Humidity Sensor",
            "type": "Humidity",
            "value": 60,
            "unit": "%",
            "status": "Inactive"
        })
        response = self.client.put("/api/sensors/1", json={
            "status": "Active"
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn("Sensor updated successfully", response.get_data(as_text=True))

    # ---------------------------------------
    # ✅ Test 5: Delete sensor
    # ---------------------------------------
    def test_delete_sensor(self):
        self.client.post("/api/sensors", json={
            "name": "CO2 Sensor",
            "type": "Gas",
            "value": 400,
            "unit": "ppm",
            "status": "Active"
        })
        response = self.client.delete("/api/sensors/1")
        self.assertEqual(response.status_code, 200)
        self.assertIn("Sensor deleted successfully", response.get_data(as_text=True))


if __name__ == "__main__":
    unittest.main()
