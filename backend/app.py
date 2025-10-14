import os
import threading
import tempfile
from flask import Flask, jsonify
from flask_cors import CORS
from extensions import db, socketio
from fasteners import InterProcessLock


def create_app():
    app = Flask(__name__)

    # ✅ Ensure instance folder exists (absolute path)
    instance_path = os.path.join(app.root_path, "instance")
    os.makedirs(instance_path, exist_ok=True)

    # ✅ Build absolute path for SQLite DB
    db_path = os.path.join(instance_path, "devices.db")

    # Database configuration
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", f"sqlite:///{db_path}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Enable CORS for frontend
    CORS(app)

    # Initialize extensions
    db.init_app(app)
    socketio.init_app(app, cors_allowed_origins="*")

    # Register blueprints
    from routes.device_routes import device_bp
    from routes.data_routes import data_bp
    from routes.auth_routes import auth_bp
    from routes.settings_routes import settings_bp  # ✅ include settings route

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(device_bp, url_prefix="/api")
    app.register_blueprint(data_bp, url_prefix="/api")
    app.register_blueprint(settings_bp, url_prefix="/api")  # ✅ register

    # Basic route to confirm backend is running
    @app.route("/")
    def home():
        return jsonify({"message": "✅ Franc Automation Backend Active"})

    return app


# Initialize the app
app = create_app()


# --- MQTT Background Thread ---
def run_mqtt_thread():
    """Runs MQTT service in background."""
    from mqtt_service import start_mqtt  # Lazy import to avoid circular import
    print("[MQTT] Starting background thread...")
    start_mqtt()
    print("[MQTT] Background thread running.")


# Prevent Flask debug reloader from spawning duplicate MQTT threads
os.environ["WERKZEUG_RUN_MAIN"] = "true"

if __name__ == "__main__":
    # Create DB tables inside app context
    with app.app_context():
        db.create_all()
        print("✅ Database ensured at:", os.path.join(app.root_path, "instance", "devices.db"))

    # Use a lock file to prevent multiple MQTT threads
    lock_path = os.path.join(tempfile.gettempdir(), "mqtt_init.lock")
    mqtt_lock = InterProcessLock(lock_path)

    if mqtt_lock.acquire(blocking=False):
        print("[INIT] MQTT starting once across all Flask reloads...")
        mqtt_thread = threading.Thread(target=run_mqtt_thread, daemon=True)
        mqtt_thread.start()
    else:
        print("[SKIP] MQTT already running in another process.")

    print("\n Franc Automation Backend running at: http://127.0.0.1:5000\n")

    socketio.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=False)
