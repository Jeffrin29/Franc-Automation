INSERT INTO roles (name, description, created_at)
VALUES
    ('superadmin', 'Full Access', datetime('now')),
    ('admin', 'Admin (No User/Role Mgmt)', datetime('now')),
    ('user', 'Regular User', datetime('now'))
ON CONFLICT(name) DO NOTHING;
