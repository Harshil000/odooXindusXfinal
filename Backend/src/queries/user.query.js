export const INSERT_USER_QUERY = `
INSERT INTO users (restaurant_id, name, email, password, role)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, restaurant_id, name, email, role;
`;

export const INSERT_RESTAURANT_QUERY = `
INSERT INTO restaurants (name, owner_email)
VALUES ($1, $2)
RETURNING id AS restaurant_id, name AS restaurant_name;
`;

export const SELECT_RESTAURANT_BY_ID_QUERY = `
SELECT id, name
FROM restaurants
WHERE id = $1
LIMIT 1;
`;

export const SELECT_USER_BY_EMAIL_QUERY = `
SELECT u.id, u.restaurant_id, u.name, u.email, u.password AS password_hash, u.role, r.name AS restaurant_name
FROM users
u
LEFT JOIN restaurants r ON r.id = u.restaurant_id
WHERE u.email = $1
LIMIT 1;
`;

export const SELECT_USER_BY_ID_QUERY = `
SELECT u.id, u.restaurant_id, u.name, u.email, u.role, r.name AS restaurant_name
FROM users u
LEFT JOIN restaurants r ON r.id = u.restaurant_id
WHERE u.id = $1
LIMIT 1;
`;