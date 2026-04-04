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
SELECT id, restaurant_id, name, email, password AS password_hash, role
FROM users
WHERE email = $1
LIMIT 1;
`;

export const SELECT_USER_BY_ID_QUERY = `
SELECT id, restaurant_id, name, email, role
FROM users
WHERE id = $1
LIMIT 1;
`;