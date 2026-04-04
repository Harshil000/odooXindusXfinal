export const CREATE_TABLE = `
INSERT INTO restaurant_tables (restaurant_id, floor_id, table_number, seats, status)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;
`;

export const GET_TABLES = `
SELECT * FROM restaurant_tables
WHERE restaurant_id = $1
ORDER BY created_at DESC;
`;

export const GET_TABLES_BY_FLOOR = `
SELECT * FROM restaurant_tables
WHERE restaurant_id = $1 AND floor_id = $2
ORDER BY table_number;
`;

export const GET_TABLE_BY_ID = `
SELECT * FROM restaurant_tables
WHERE id = $1 AND restaurant_id = $2;
`;

export const UPDATE_TABLE = `
UPDATE restaurant_tables
SET floor_id = $1,
    table_number = $2,
    seats = $3,
    status = $4
WHERE id = $5 AND restaurant_id = $6
RETURNING *;
`;

export const DELETE_TABLE = `
DELETE FROM restaurant_tables
WHERE id = $1 AND restaurant_id = $2;
`;