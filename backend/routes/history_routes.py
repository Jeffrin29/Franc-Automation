<<<<<<< HEAD
# ==========================================================
# backend/routes/history_routes.py — Rolling 7-Day History API + ZIP Export
# ==========================================================
from flask import Blueprint, jsonify, send_file, request
from backend.models import Sensor
from datetime import datetime, timedelta
import io, json, csv, zipfile

history_bp = Blueprint("history_bp", __name__)

@history_bp.route("/api/history", methods=["GET"])
def get_last_7_days_history():
    """Return last 7 days grouped by date."""
    now = datetime.utcnow()
    seven_days_ago = now - timedelta(days=7)

    sensors = (
        Sensor.query.filter(Sensor.timestamp >= seven_days_ago)
        .order_by(Sensor.timestamp.desc())
=======
# ======================================
# history_routes.py — Export Per Day | FIXED
# ======================================

from flask import Blueprint, jsonify, request, make_response
from datetime import datetime, timedelta
from io import BytesIO
import csv
import json

from backend.models import db, History

# Correct Blueprint URL prefix matching frontend calls
history_bp = Blueprint("history", __name__, url_prefix="/api/history")

# Default days range
DAYS = 7

# ======================================
# GET: Grouped History JSON (Last 7 Days)
# ======================================
@history_bp.route("/", methods=["GET"])
def get_history():
    since = datetime.utcnow() - timedelta(days=DAYS)

    records = (
        History.query.filter(History.timestamp >= since)
        .order_by(History.timestamp.desc())
>>>>>>> temp-merge
        .all()
    )

    grouped = {}
<<<<<<< HEAD
    for s in sensors:
        day = s.timestamp.strftime("%Y-%m-%d")
        if day not in grouped:
            grouped[day] = []
        grouped[day].append(s.to_dict())

    # Keep most recent 7 days
    recent_dates = sorted(grouped.keys(), reverse=True)[:7]
    filtered = {d: grouped[d] for d in recent_dates}

    return jsonify({"status": "success", "data": filtered})


@history_bp.route("/api/history/download/<date_str>", methods=["GET"])
def download_day_history(date_str):
    """Download one day’s data in JSON or CSV."""
    fmt = request.args.get("format", "json")
    start = datetime.strptime(date_str, "%Y-%m-%d")
    end = start + timedelta(days=1)

    sensors = (
        Sensor.query.filter(Sensor.timestamp >= start, Sensor.timestamp < end)
        .order_by(Sensor.timestamp.asc())
        .all()
    )

    if fmt == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["id", "device_id", "temperature", "humidity", "pressure", "timestamp"])
        for s in sensors:
            writer.writerow([
                s.id, s.device_id, s.temperature, s.humidity, s.pressure, s.timestamp
            ])
        output.seek(0)
        return send_file(
            io.BytesIO(output.getvalue().encode()),
            mimetype="text/csv",
            as_attachment=True,
            download_name=f"{date_str}_sensors.csv"
        )

    # Default JSON
    data = [s.to_dict() for s in sensors]
    return send_file(
        io.BytesIO(json.dumps(data, indent=2).encode()),
        mimetype="application/json",
        as_attachment=True,
        download_name=f"{date_str}_sensors.json"
    )


@history_bp.route("/api/history/download/last7.zip", methods=["GET"])
def download_last_7_days_zip():
    """Download all last 7 days’ data as a ZIP file (JSON or CSV)."""
    fmt = request.args.get("format", "json")
    now = datetime.utcnow()
    seven_days_ago = now - timedelta(days=7)

    sensors = (
        Sensor.query.filter(Sensor.timestamp >= seven_days_ago)
        .order_by(Sensor.timestamp.asc())
        .all()
    )

    grouped = {}
    for s in sensors:
        day = s.timestamp.strftime("%Y-%m-%d")
        if day not in grouped:
            grouped[day] = []
        grouped[day].append(s)

    # Create ZIP in memory
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for day, entries in grouped.items():
            if fmt == "csv":
                output = io.StringIO()
                writer = csv.writer(output)
                writer.writerow(["id", "device_id", "temperature", "humidity", "pressure", "timestamp"])
                for s in entries:
                    writer.writerow([
                        s.id, s.device_id, s.temperature, s.humidity, s.pressure, s.timestamp
                    ])
                zf.writestr(f"{day}_sensors.csv", output.getvalue())
            else:
                json_data = json.dumps([s.to_dict() for s in entries], indent=2)
                zf.writestr(f"{day}_sensors.json", json_data)

    zip_buffer.seek(0)
    return send_file(
        zip_buffer,
        mimetype="application/zip",
        as_attachment=True,
        download_name=f"last_7_days_{fmt}.zip"
    )
=======
    for rec in records:
        date_key = rec.timestamp.strftime("%Y-%m-%d")
        if date_key not in grouped:
            grouped[date_key] = []
        grouped[date_key].append(rec.to_dict())

    return jsonify({"status": "success", "data": grouped})


# ======================================
# EXPORT JSON (per-day)
# Example: /api/history/export/json?date=2025-11-21
# ======================================
@history_bp.route("/export/json", methods=["GET"])
def export_json():
    date = request.args.get("date")
    if not date:
        return jsonify({"status": "error", "message": "Missing ?date=YYYY-MM-DD"}), 400

    try:
        start = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid date format"}), 400

    end = start + timedelta(days=1)

    records = History.query.filter(
        History.timestamp >= start, History.timestamp < end
    ).all()

    payload = [r.to_dict() for r in records]

    response = make_response(json.dumps(payload, indent=2))
    response.headers["Content-Disposition"] = f"attachment; filename=history_{date}.json"
    response.headers["Content-Type"] = "application/json"
    return response


# ======================================
# EXPORT CSV (per-day)
# Example: /api/history/export/csv?date=2025-11-21
# ======================================
@history_bp.route("/export/csv", methods=["GET"])
def export_csv():
    date = request.args.get("date")
    if not date:
        return jsonify({"status": "error", "message": "Missing ?date=YYYY-MM-DD"}), 400

    try:
        start = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid date format"}), 400

    end = start + timedelta(days=1)

    records = History.query.filter(
        History.timestamp >= start, History.timestamp < end
    ).all()

    output = BytesIO()
    writer = csv.writer(output)
    writer.writerow(["device_id", "temperature", "humidity", "pressure", "timestamp"])

    for r in records:
        writer.writerow(
            [
                r.device_id,
                r.temperature,
                r.humidity,
                r.pressure,
                r.timestamp.isoformat(),
            ]
        )

    output.seek(0)

    response = make_response(output.read())
    response.headers["Content-Disposition"] = (
        f"attachment; filename=history_{date}.csv"
    )
    response.headers["Content-Type"] = "text/csv"
    return response
>>>>>>> temp-merge
