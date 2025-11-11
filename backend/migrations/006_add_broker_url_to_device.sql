-- Add missing broker_url column to devices
ALTER TABLE device ADD COLUMN broker_url TEXT DEFAULT 'broker.hivemq.com';
