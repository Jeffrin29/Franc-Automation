INSERT INTO users (username, password)
VALUES
    ('superadmin', 'superadmin123'),
    ('admin', 'admin123'),
    ('user1', 'user@1'),
    ('user2', 'user@2'),
    ('user3', 'user@3'),
    ('user4', 'user@4'),
    ('user5', 'user@5'),
    ('user6', 'user@6'),
    ('user7', 'user@7'),
    ('user8', 'user@8'),
    ('user9', 'user@9'),
    ('user10', 'user@10');

-- Assign roles
INSERT INTO user_roles (user_id, role_id)
SELECT users.id, roles.id FROM users, roles
WHERE users.username = 'superadmin' AND roles.name = 'superadmin';

INSERT INTO user_roles (user_id, role_id)
SELECT users.id, roles.id FROM users, roles
WHERE users.username = 'admin' AND roles.name = 'admin';

INSERT INTO user_roles (user_id, role_id)
SELECT users.id, roles.id FROM users, roles
WHERE users.username LIKE 'user%' AND roles.name = 'user';
