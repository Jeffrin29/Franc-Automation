-- =========================================================
-- 004_add_raw_data_to_sensor.sql
-- Adds a raw_data JSON/TEXT column for full MQTT payload storage.
-- Used by Dashboard & Live Data pages to verify original data packets.
-- =========================================================

ALTER TABLE sensor ADD COLUMN raw_data TEXT;

-- Optional: backfill with NULLs for existing rows
UPDATE sensor SET raw_data = NULL WHERE raw_data IS NULL;

-- ✅ Done: Added raw_data column for storing JSON payloads
