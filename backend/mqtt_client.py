# backend/mqtt_client.py
# ==========================================================
# Unified MQTT entrypoint (delegates to mqtt_service)
# ==========================================================
from backend.mqtt_service import init_mqtt_system, start_mqtt_client, stop_mqtt_client
from backend.models import Device
from backend.utils.audit import log_info

def start_all_mqtt():
    """Initialize MQTT system on app startup."""
    init_mqtt_system()
    log_info("✅ MQTT client system ready (single-device mode).")

def connect_first_device():
    """Optionally auto-connect the first device (for testing)."""
    dev = Device.query.first()
    if dev:
        start_mqtt_client(dev)
        log_info(f"🔌 Auto-connected device: {dev.name}")
    else:
        log_info("⚠️ No device found to auto-connect.")
