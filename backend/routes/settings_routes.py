from flask import Blueprint, jsonify

# -------------------------------
# Settings Blueprint (Placeholder)
# -------------------------------
settings_bp = Blueprint("settings_bp", __name__)

@settings_bp.route("/settings", methods=["GET"])
def get_settings():
    """
    Temporary route for verifying that the settings module is live.
    You can later extend this to fetch or update MQTT or system settings
    from the database.
    """
    return jsonify({
        "status": "ok",
        "message": "Settings route is active (feature under development)."
    }), 200
