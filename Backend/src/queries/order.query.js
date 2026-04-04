export const CREATE_ORDER = `
INSERT INTO orders (restaurant_id, table_id, session_id)
VALUES ($1, $2, $3)
RETURNING *;
`;

export const GET_ORDERS = `
SELECT * FROM orders;
`;

export const UPDATE_ORDER_STATUS = `
UPDATE orders
SET status = $1
WHERE id = $2
RETURNING *;
`;

export const DELETE_ORDER = `
DELETE FROM orders WHERE id = $1;
`;
