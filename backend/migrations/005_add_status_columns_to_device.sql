-- =========================================================
-- 005_add_status_columns_to_device.sql
-- Adds extra columns to the Device table for online status,
-- MQTT broker tracking, and last update timestamp.
-- =========================================================

ALTER TABLE device ADD COLUMN is_connected BOOLEAN DEFAULT 0;
ALTER TABLE device ADD COLUMN broker_url TEXT;
ALTER TABLE device ADD COLUMN last_update DATETIME;

-- Optional: initialize values
UPDATE device
SET is_connected = 0,
    broker_url = 'broker.hivemq.com',
    last_update = CURRENT_TIMESTAMP
WHERE is_connected IS NULL;
