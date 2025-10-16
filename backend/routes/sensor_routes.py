# backend/routes/sensor_routes.py
from flask import Blueprint, request, jsonify
from extensions import db, socketio
from models import Sensor, Device  # assumes both models exist

sensor_bp = Blueprint("sensors", __name__)

# --------------------------
# 📘 Get all sensors
# --------------------------
@sensor_bp.route("/sensors", methods=["GET"])
def get_sensors():
    sensors = Sensor.query.all()
    result = []
    for s in sensors:
        device = Device.query.get(s.device_id)
        result.append({
            "id": s.id,
            "name": s.name,
            "friendly_name": s.friendly_name,
            "device_id": s.device_id,
            "device_name": device.name if device else None,
            "unit": getattr(s, "unit", None),
            "type": getattr(s, "type", None),
            "created_at": getattr(s, "created_at", None)
        })
    return jsonify(result), 200


# --------------------------
# 📗 Add a new sensor
# --------------------------
@sensor_bp.route("/sensors", methods=["POST"])
def create_sensor():
    data = request.get_json()
    required = ["name", "friendly_name", "device_id"]

    if not all(k in data for k in required):
        return jsonify({"error": "Missing required fields"}), 400

    sensor = Sensor(
        name=data["name"],
        friendly_name=data["friendly_name"],
        device_id=data["device_id"],
        type=data.get("type"),
        unit=data.get("unit")
    )

    db.session.add(sensor)
    db.session.commit()

    socketio.emit("sensor_added", {"id": sensor.id, "name": sensor.name})
    return jsonify({"message": "Sensor added successfully", "id": sensor.id}), 201


# --------------------------
# 📙 Update a sensor
# --------------------------
@sensor_bp.route("/sensors/<int:sensor_id>", methods=["PUT"])
def update_sensor(sensor_id):
    data = request.get_json()
    sensor = Sensor.query.get(sensor_id)

    if not sensor:
        return jsonify({"error": "Sensor not found"}), 404

    sensor.name = data.get("name", sensor.name)
    sensor.friendly_name = data.get("friendly_name", sensor.friendly_name)
    sensor.device_id = data.get("device_id", sensor.device_id)
    sensor.unit = data.get("unit", sensor.unit)
    sensor.type = data.get("type", sensor.type)

    db.session.commit()
    socketio.emit("sensor_updated", {"id": sensor.id, "name": sensor.name})
    return jsonify({"message": "Sensor updated successfully"}), 200


# --------------------------
# 📕 Delete a sensor
# --------------------------
@sensor_bp.route("/sensors/<int:sensor_id>", methods=["DELETE"])
def delete_sensor(sensor_id):
    sensor = Sensor.query.get(sensor_id)

    if not sensor:
        return jsonify({"error": "Sensor not found"}), 404

    db.session.delete(sensor)
    db.session.commit()

    socketio.emit("sensor_deleted", {"id": sensor.id})
    return jsonify({"message": "Sensor deleted successfully"}), 200
