# ==========================================================
# backend/routes/dashboard_routes.py — Unified Dashboard API (Enhanced)
# ==========================================================
from flask import Blueprint, jsonify
from backend.extensions import db, socketio
from backend.models import Sensor, Device
from sqlalchemy import desc
from datetime import datetime
from pytz import timezone
from backend.utils.dashboard import emit_dashboard_update
from backend.mqtt_service import emit_global_mqtt_status
from backend.utils.audit import log_info

dashboard_bp = Blueprint("dashboard_bp", __name__, url_prefix="/api")
INDIA_TZ = timezone("Asia/Kolkata")


def _num(v, default=0.0):
    """Ensure a numeric value is returned (float)."""
    try:
        if v is None:
            return float(default)
        return float(v)
    except Exception:
        return float(default)


# ==========================================================
# 📊 Get latest overall dashboard metrics
# ==========================================================
@dashboard_bp.route("/dashboard/current", methods=["GET"])
def get_current_data():
    """
    Returns the latest sensor data and overall dashboard metrics.
    Always returns numeric values for temperature/humidity/pressure
    so frontend code that calls toFixed() won't crash.
    """
    latest = Sensor.query.order_by(desc(Sensor.timestamp)).first()
    devices_online = Device.query.filter_by(status="online").count()
    total_devices = Device.query.count()

    if not latest:
        return jsonify({
            "temperature": 0.0,
            "humidity": 0.0,
            "pressure": 0.0,
            "devices_online": devices_online,
            "devices_total": total_devices,
            "status": "offline",
            "timestamp_iso": "--",
            "timestamp_ms": 0,
        }), 200

    data = {
        "temperature": round(_num(latest.temperature, 0.0), 2),
        "humidity": round(_num(latest.humidity, 0.0), 2),
        "pressure": round(_num(latest.pressure, 0.0), 2),
        "devices_online": devices_online,
        "devices_total": total_devices,
        "status": "online" if devices_online > 0 else "offline",
        "timestamp_iso": latest.timestamp.astimezone(INDIA_TZ).isoformat(timespec="milliseconds"),
        "timestamp_ms": int(latest.timestamp.timestamp() * 1000),
    }
    log_info(f"[DASHBOARD] 📊 Latest data served: {data}")
    return jsonify(data), 200


# ==========================================================
# 📈 Chart Data (Recent 50 readings for visualization)
# ==========================================================
@dashboard_bp.route("/dashboard/chart", methods=["GET"])
def get_chart_data():
    """
    Returns the 50 most recent sensor readings for dashboard charts.
    Ensures numeric types for charting.
    """
    records = Sensor.query.order_by(desc(Sensor.timestamp)).limit(50).all()
    chart_data = [
        {
            "timestamp": s.timestamp.astimezone(INDIA_TZ).strftime("%H:%M:%S"),
            "temperature": _num(s.temperature, 0.0),
            "humidity": _num(s.humidity, 0.0),
            "pressure": _num(s.pressure, 0.0),
        }
        for s in reversed(records)
    ]

    log_info(f"[DASHBOARD] 📈 Chart data returned ({len(chart_data)} points)")
    return jsonify(chart_data), 200


# ==========================================================
# 💻 Device summary for dashboard sidebar
# ==========================================================
@dashboard_bp.route("/dashboard/devices", methods=["GET"])
def get_device_summary():
    """
    Returns a summary of total, online, and offline devices;
    emits updates to socket clients as a side-effect.
    """
    devices = Device.query.all()
    total = len(devices)
    online = sum(1 for d in devices if d.status == "online")
    offline = total - online

    data = {
        "total_devices": total,
        "online": online,
        "offline": offline,
        "mqtt_status": "connected" if online > 0 else "disconnected",
        "timestamp_iso": datetime.now(INDIA_TZ).isoformat(timespec="milliseconds"),
    }

    # Push real-time updates to all dashboards
    emit_dashboard_update()
    emit_global_mqtt_status()
    log_info(f"[DASHBOARD] 💻 Device summary updated: {data}")

    return jsonify(data), 200


# ==========================================================
# 🔄 Real-Time Socket Bridge
# ==========================================================
@socketio.on("new_sensor_data")
def handle_new_sensor_data(data):
    """
    When backend receives new MQTT or manual sensor data,
    broadcast to all connected dashboards.
    """
    # do not mutate client payload; ensure callers send numeric fields
    log_info(f"[SOCKET] 🔄 Broadcasting dashboard update: {data}")
    socketio.emit("dashboard_update", data)
