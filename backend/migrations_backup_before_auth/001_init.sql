-- =========================================================
-- 001_init.sql — FULL BASE SCHEMA MATCHING SQLALCHEMY MODELS
-- =========================================================

-- ============================
-- USERS TABLE
-- ============================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- ROLES TABLE
-- ============================
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- PERMISSIONS TABLE
-- ============================
CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT
);

-- ============================
-- USER ↔ ROLES (many-to-many)
-- ============================
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- ============================
-- ROLE ↔ PERMISSIONS (many-to-many)
-- ============================
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id)
);

-- ============================
-- DEVICES TABLE
-- ============================
CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    broker_url TEXT DEFAULT 'broker.hivemq.com',
    protocol TEXT,
    host TEXT,
    port INTEGER DEFAULT 1883,
    client_id TEXT,
    username TEXT,
    password TEXT,
    mqtt_version TEXT,
    keep_alive INTEGER,
    auto_reconnect BOOLEAN,
    reconnect_period INTEGER,
    status TEXT DEFAULT 'offline',
    enable_tls BOOLEAN DEFAULT 0,
    is_connected BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    last_seen DATETIME
);

-- ============================
-- USER ↔ DEVICE (many-to-many)
-- ============================
CREATE TABLE IF NOT EXISTS user_devices (
    user_id INTEGER,
    device_id INTEGER,
    PRIMARY KEY (user_id, device_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- ============================
-- SENSORS TABLE
-- ============================
CREATE TABLE IF NOT EXISTS sensors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER NOT NULL,
    topic TEXT,
    payload TEXT,
    temperature REAL,
    humidity REAL,
    pressure REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    raw_data TEXT,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- ============================
-- SETTINGS TABLE
-- ============================
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
