export const INSERT_USER_QUERY = `
INSERT INTO users (name, email, password_hash, role)
VALUES ($1, $2, $3, $4)
RETURNING id, name, email, role;
`;

export const INSERT_RESTAURANT_QUERY = `
INSERT INTO restaurants (name, owner_id)
VALUES ($1, $2)
RETURNING id AS restaurant_id, name AS restaurant_name;
`;

export const SELECT_USER_BY_EMAIL_QUERY = `
SELECT id, name, email, password_hash, role
FROM users
WHERE email = $1
LIMIT 1;
`;