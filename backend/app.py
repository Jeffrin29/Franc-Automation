import os
import threading
import tempfile
import subprocess
from flask import Flask, jsonify
from flask_cors import CORS
from extensions import db, socketio
from fasteners import InterProcessLock
from flask_migrate import Migrate
from models import *


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
    migrate = Migrate(app, db)
    socketio.init_app(app, cors_allowed_origins="*")

    # Register blueprints
    from routes.device_routes import device_bp
    from routes.data_routes import data_bp
    from routes.auth_routes import auth_bp
    from routes.settings_routes import settings_bp 
    from routes.sensor_routes import sensor_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(device_bp, url_prefix="/api")
    app.register_blueprint(data_bp, url_prefix="/api")
    app.register_blueprint(settings_bp, url_prefix="/api")
    app.register_blueprint(sensor_bp, url_prefix="/api")

    @app.route("/")
    def home():
        return jsonify({"message": "✅ Franc Automation Backend Active"})

    return app


app = create_app()


# --- Helper: Auto-migration ---
def auto_migrate():
    """Automatically migrate DB schema when app starts or model changes occur."""
    try:
        print("[MIGRATION] 🔍 Checking for new migrations...")
        subprocess.run(["flask", "db", "migrate", "-m", "auto migration"], check=False)
        subprocess.run(["flask", "db", "upgrade"], check=False)
        print("[MIGRATION] ✅ Database migration applied successfully!")
    except Exception as e:
        print(f"[MIGRATION] ⚠️ Auto-migration failed: {e}")


# --- MQTT Background Thread ---
def run_mqtt_thread():
    from mqtt_service import start_mqtt
    print("[MQTT] Starting background thread...")
    start_mqtt()
    print("[MQTT] Background thread running.")


os.environ["WERKZEUG_RUN_MAIN"] = "true"

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        print("✅ Database ensured at:", os.path.join(app.root_path, "instance", "devices.db"))
        auto_migrate()  # ✅ Automatically run migrations at startup

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
