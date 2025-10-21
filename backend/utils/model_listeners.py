# backend/hooks/model_listeners.py
from sqlalchemy import event
from models import User, Role, Device, Permission, SensorData
from utils.audit import log_info, emit_event

def _serialize(target):
    try:
        return target.to_dict()
    except Exception:
        # fallback: simple attrs
        data = {}
        for c in getattr(target, '__table__').columns:
            data[c.name] = getattr(target, c.name, None)
        return data

def after_insert(mapper, connection, target):
    payload = {"action": "created", "model": target.__tablename__, "data": _serialize(target)}
    log_info(f"{target.__tablename__} created -> {payload['data']}")
    emit_event(f"{target.__tablename__}_created", payload)

def after_update(mapper, connection, target):
    payload = {"action": "updated", "model": target.__tablename__, "data": _serialize(target)}
    log_info(f"{target.__tablename__} updated -> {payload['data']}")
    emit_event(f"{target.__tablename__}_updated", payload)

def after_delete(mapper, connection, target):
    payload = {"action": "deleted", "model": target.__tablename__, "data": _serialize(target)}
    log_info(f"{target.__tablename__} deleted -> {payload['data']}")
    emit_event(f"{target.__tablename__}_deleted", payload)

def register_listeners():
    # Users
    event.listen(User, 'after_insert', after_insert)
    event.listen(User, 'after_update', after_update)
    event.listen(User, 'after_delete', after_delete)
    # Roles & Permissions
    event.listen(Role, 'after_insert', after_insert)
    event.listen(Role, 'after_update', after_update)
    event.listen(Role, 'after_delete', after_delete)
    event.listen(Permission, 'after_insert', after_insert)
    event.listen(Permission, 'after_update', after_update)
    event.listen(Permission, 'after_delete', after_delete)
    # Devices
    event.listen(Device, 'after_insert', after_insert)
    event.listen(Device, 'after_update', after_update)
    event.listen(Device, 'after_delete', after_delete)
    # SensorData
    event.listen(SensorData, 'after_insert', after_insert)
    event.listen(SensorData, 'after_update', after_update)
    event.listen(SensorData, 'after_delete', after_delete)
