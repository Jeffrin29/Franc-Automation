import os
import threading
import tempfile
import subprocess
import time
from flask import Flask, jsonify
from flask_cors import CORS
from extensions import db, socketio

# Lightweight cross-platform inter-process file lock to avoid adding the 'fasteners' dependency.
try:
    import msvcrt  # Windows
except ImportError:
    import fcntl  # Unix

class InterProcessLock:
    def __init__(self, path):
        self.lockfile = os.path.abspath(path)
        self.fd = None

    def acquire(self, blocking=True, timeout=None):
        start = time.time()
        # open file for locking
        self.fd = open(self.lockfile, "w+")
        while True:
            try:
                if os.name == "nt":
                    # Lock 1 byte (Windows)
                    msvcrt.locking(self.fd.fileno(), msvcrt.LK_NBLCK, 1)
                else:
                    # Exclusive non-blocking lock (Unix)
                    fcntl.flock(self.fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
                return True
            except (BlockingIOError, IOError, OSError):
                if not blocking:
                    return False
                if timeout is not None and (time.time() - start) >= timeout:
                    return False
                time.sleep(0.1)

    def release(self):
        try:
            if self.fd:
                if os.name == "nt":
                    self.fd.seek(0)
                    msvcrt.locking(self.fd.fileno(), msvcrt.LK_UNLCK, 1)
                else:
                    fcntl.flock(self.fd, fcntl.LOCK_UN)
                self.fd.close()
                self.fd = None
                try:
                    os.remove(self.lockfile)
                except OSError:
                    pass
        except Exception:
            pass

    def __enter__(self):
        self.acquire()
        return self

    def __exit__(self, exc_type, exc, tb):
        self.release()

from flask_migrate import Migrate
from models import *
#from hooks.model_listeners import register_listeners

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
    from routes.user_routes import user_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(device_bp, url_prefix="/api")
    app.register_blueprint(data_bp, url_prefix="/api")
    app.register_blueprint(settings_bp, url_prefix="/api")
    app.register_blueprint(sensor_bp, url_prefix="/api")
    app.register_blueprint(user_bp,url_prefix="/api")

    @app.route("/")
    def home():
        return jsonify({"message": "✅ Franc Automation Backend Active"})

       # after db.init_app(app) inside create_app
        with app.app_context():
         register_listeners()

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
