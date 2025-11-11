# ==========================================================
# backend/routes/device_routes.py — Cleaned version (matches new mqtt_service.py)
# ==========================================================
from flask import Blueprint, jsonify, request
from backend.extensions import db, socketio
from backend.models import Device
from backend.mqtt_service import (
    start_mqtt_client,
    stop_mqtt_client,
    emit_global_mqtt_status,
    start_simulator,
    stop_simulator,
)
from backend.utils.audit import log_info
from datetime import datetime
from pytz import timezone

device_bp = Blueprint("device_bp", __name__, url_prefix="/api")
INDIA_TZ = timezone("Asia/Kolkata")

# ==========================================================
# 🧩 Get all devices
# ==========================================================
@device_bp.route("/devices", methods=["GET"])
def get_all_devices():
    devices = Device.query.all()
    data = [
        {
            "id": d.id,
            "name": d.name,
            "host": d.host,
            "status": d.status,
            "is_connected": d.is_connected,
            "last_seen": d.last_seen.isoformat(timespec="seconds") if d.last_seen else None,
        }
        for d in devices
    ]
    return jsonify(data), 200


# ==========================================================
# ➕ Add a new device
# ==========================================================
@device_bp.route("/devices", methods=["POST"])
def add_device():
    data = request.json
    name = data.get("name")
    host = data.get("host", "broker.hivemq.com")

    if not name:
        return jsonify({"error": "Device name is required"}), 400

    if Device.query.filter_by(name=name).first():
        return jsonify({"error": "Device already exists"}), 400

    device = Device(name=name, host=host, status="offline", is_connected=False)
    db.session.add(device)
    db.session.commit()

    log_info(f"[DEVICE] ➕ Added new device: {name} ({host})")
    emit_global_mqtt_status()
    return jsonify({"message": "Device added successfully"}), 201


# ==========================================================
# 🔌 Connect a device
# ==========================================================
@device_bp.route("/devices/<int:device_id>/connect", methods=["POST"])
def connect_device(device_id):
    device = Device.query.get(device_id)
    if not device:
        return jsonify({"error": "Device not found"}), 404

    if start_mqtt_client(device):
        log_info(f"[DEVICE] ✅ Connected device: {device.name}")
        emit_global_mqtt_status()
        return jsonify({"message": "Device connected successfully"}), 200
    else:
        return jsonify({"error": "Device connection failed"}), 500


# ==========================================================
# 🔌 Disconnect a device
# ==========================================================
@device_bp.route("/devices/<int:device_id>/disconnect", methods=["POST"])
def disconnect_device(device_id):
    device = Device.query.get(device_id)
    if not device:
        return jsonify({"error": "Device not found"}), 404

    stop_mqtt_client(device)
    stop_simulator(device)
    log_info(f"[DEVICE] 🔌 Disconnected device: {device.name}")
    emit_global_mqtt_status()
    return jsonify({"message": "Device disconnected successfully"}), 200


# ==========================================================
# ❌ Delete a device
# ==========================================================
@device_bp.route("/devices/<int:device_id>", methods=["DELETE"])
def delete_device(device_id):
    device = Device.query.get(device_id)
    if not device:
        return jsonify({"error": "Device not found"}), 404

    # Make sure it’s stopped first
    stop_mqtt_client(device)
    stop_simulator(device)

    db.session.delete(device)
    db.session.commit()

    log_info(f"[DEVICE] ❌ Deleted device: {device.name}")
    emit_global_mqtt_status()
    return jsonify({"message": "Device deleted successfully"}), 200
