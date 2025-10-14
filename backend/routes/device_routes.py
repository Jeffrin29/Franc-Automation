from flask import Blueprint, request, jsonify, current_app
from extensions import db
from models import Device
from datetime import datetime

device_bp = Blueprint("device_bp", __name__)


# -------------------------------
# 🔹 Add new device
# -------------------------------
@device_bp.route("/devices", methods=["POST"])
def add_device():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    name = data.get("name")
    if not name:
        return jsonify({"error": "Device name is required"}), 400

    # Prevent duplicates
    if Device.query.filter_by(name=name).first():
        return jsonify({"error": "Device already exists"}), 409

    device = Device(
        name=name,
        protocol=data.get("protocol", "mqtt"),
        host=data.get("host"),
        port=data.get("port", 1883),
        client_id=data.get("clientId"),
        username=data.get("username"),
        password=data.get("password"),
        mqtt_version=data.get("mqttVersion"),
        keep_alive=data.get("keepAlive"),
        auto_reconnect=data.get("autoReconnect"),
        reconnect_period=data.get("reconnectPeriod"),
        status="offline",
        updated_at=datetime.utcnow()
    )

    db.session.add(device)
    db.session.commit()

    current_app.logger.info(f"[API] Device added: {device.name} (id={device.id})")
    return jsonify({"message": "Device added", "device": device.to_dict()}), 201


# -------------------------------
# 🔹 List all devices
# -------------------------------
@device_bp.route("/devices", methods=["GET"])
def list_devices():
    devices = Device.query.order_by(Device.created_at.desc()).all()
    return jsonify([d.to_dict() for d in devices]), 200


# -------------------------------
# 🔹 Update a device
# -------------------------------
@device_bp.route("/devices/<int:device_id>", methods=["PUT"])
def update_device(device_id):
    device = Device.query.get_or_404(device_id)
    data = request.get_json(silent=True) or {}

    # Map frontend-friendly keys to model attributes
    mapping = {
        "clientId": "client_id",
        "mqttVersion": "mqtt_version",
        "keepAlive": "keep_alive",
        "autoReconnect": "auto_reconnect",
        "reconnectPeriod": "reconnect_period",
    }

    for key, value in data.items():
        field = mapping.get(key, key)
        if hasattr(device, field):
            setattr(device, field, value)

    device.updated_at = datetime.utcnow()
    db.session.commit()

    current_app.logger.info(f"[API] Device updated: id={device.id}")
    return jsonify({"message": "Device updated", "device": device.to_dict()}), 200


# -------------------------------
# 🔹 Delete a device
# -------------------------------
@device_bp.route("/devices/<int:device_id>", methods=["DELETE"])
def delete_device(device_id):
    device = Device.query.get_or_404(device_id)
    db.session.delete(device)
    db.session.commit()

    current_app.logger.info(f"[API] Device deleted: id={device_id}")
    return jsonify({"message": "Device deleted"}), 200
