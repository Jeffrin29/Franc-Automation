# backend/utils/audit.py
import logging
from extensions import socketio
from flask import current_app

# configure root logger (only once)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)

logger = logging.getLogger("franc-automation")

def log_info(msg, **kwargs):
    """Log to terminal and Flask app.logger if available."""
    logger.info(msg)
    try:
        current_app.logger.info(msg)
    except Exception:
        pass

def emit_event(event_name: str, payload: dict):
    """Emit over socketio and also log to terminal."""
    try:
        socketio.emit(event_name, payload)
        log_info(f"EMIT {event_name}: {payload}")
    except Exception as e:
        log_info(f"EMIT ERROR {event_name}: {e}")
