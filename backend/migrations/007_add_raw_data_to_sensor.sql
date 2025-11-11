-- Add missing raw_data column to sensors
ALTER TABLE sensor ADD COLUMN raw_data TEXT;
