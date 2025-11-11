-- =========================================================
-- 001_init.sql — Base schema for Franc Automation System
-- =========================================================

-- Create table: device
CREATE TABLE IF NOT EXISTS device (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    broker_url TEXT DEFAULT 'broker.hivemq.com',
    is_connected BOOLEAN DEFAULT 0,
    last_update DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create table: sensor
CREATE TABLE IF NOT EXISTS sensor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER,
    temperature REAL,
    humidity REAL,
    pressure REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    raw_data TEXT,
    FOREIGN KEY (device_id) REFERENCES device (id)
);
