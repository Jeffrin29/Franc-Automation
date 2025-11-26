INSERT INTO roles (name, description)
VALUES
    ('superadmin', 'Full system access'),
    ('admin', 'Admin without user/role management'),
    ('user', 'Standard user')
ON CONFLICT(name) DO NOTHING;
