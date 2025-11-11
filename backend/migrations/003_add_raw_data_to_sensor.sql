-- =========================================================
-- 003_add_raw_data_to_sensor.sql — Adds JSON column to Sensor table
-- =========================================================

ALTER TABLE sensor ADD COLUMN raw_data TEXT;

UPDATE sensor SET raw_data = NULL WHERE raw_data IS NULL;
