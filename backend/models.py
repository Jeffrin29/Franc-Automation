from datetime import datetime
from extensions import db

# -------------------------------
# User Model (for Authentication)
# -------------------------------
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default="user")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "role": self.role,
            "created_at": self.created_at.isoformat()
        }


# -------------------------------
# Device Model
# -------------------------------
class Device(db.Model):
    __tablename__ = "devices"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    protocol = db.Column(db.String(20))
    host = db.Column(db.String(120))
    port = db.Column(db.Integer, default=1883)
    client_id = db.Column(db.String(120))
    username = db.Column(db.String(120))
    password = db.Column(db.String(120))
    mqtt_version = db.Column(db.String(20))
    keep_alive = db.Column(db.Integer)
    auto_reconnect = db.Column(db.Boolean)
    reconnect_period = db.Column(db.Integer)
    status = db.Column(db.String(20), default="offline")  # ✅ fixed column
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sensor_data = db.relationship("SensorData", backref="device", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "protocol": self.protocol,
            "host": self.host,
            "port": self.port,
            "clientId": self.client_id,
            "username": self.username,
            "mqttVersion": self.mqtt_version,
            "keepAlive": self.keep_alive,
            "autoReconnect": self.auto_reconnect,
            "reconnectPeriod": self.reconnect_period,
            "status": self.status,
            "lastSeen": self.updated_at.isoformat() if self.updated_at else None,
            "createdAt": self.created_at.isoformat()
        }


# -------------------------------
# Sensor Data Model
# -------------------------------
class SensorData(db.Model):
    __tablename__ = "sensor_data"

    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.Integer, db.ForeignKey("devices.id"), nullable=False)
    topic = db.Column(db.String(255))
    payload = db.Column(db.Text)
    temperature = db.Column(db.Float, nullable=True)
    humidity = db.Column(db.Float, nullable=True)
    pressure = db.Column(db.Float, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "deviceId": self.device_id,
            "topic": self.topic,
            "payload": self.payload,
            "temperature": self.temperature,
            "humidity": self.humidity,
            "pressure": self.pressure,
            "timestamp": self.timestamp.isoformat()
        }


# -------------------------------
# Settings Model (optional)
# -------------------------------
class Setting(db.Model):
    __tablename__ = "settings"

    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), unique=True, nullable=False)
    value = db.Column(db.String(255))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {"key": self.key, "value": self.value}
