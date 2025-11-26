INSERT INTO users (username, email, password)
VALUES
    ('superadmin', 'superadmin@mail.com', 'TEMP'),
    ('admin', 'admin@mail.com', 'TEMP'),
    ('user1', 'user1@mail.com', 'TEMP'),
    ('user2', 'user2@mail.com', 'TEMP'),
    ('user3', 'user3@mail.com', 'TEMP'),
    ('user4', 'user4@mail.com', 'TEMP')
ON CONFLICT(username) DO NOTHING;

-- Assign roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'superadmin' AND r.name='superadmin';

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'admin' AND r.name='admin';

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username LIKE 'user%' AND r.name='user';
