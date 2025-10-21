from extensions import db
from models import SensorData, Device
from datetime import datetime, timedelta
import random

def seed_dashboard_data():
    device = Device.query.first()
    if not device:
        device = Device(name="Demo Device", protocol="MQTT", host="localhost")
        db.session.add(device)
        db.session.commit()

    for i in range(50):
        entry = SensorData(
            device_id=device.id,
            temperature=random.uniform(22, 35),
            humidity=random.uniform(40, 80),
            pressure=random.uniform(1000, 1020),
            timestamp=datetime.utcnow() - timedelta(minutes=(50 - i)),
        )
        db.session.add(entry)
    db.session.commit()
    print("✅ Dashboard sample data seeded successfully!")
