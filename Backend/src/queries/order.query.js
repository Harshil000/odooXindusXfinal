exports.CREATE_ORDER = `
INSERT INTO orders (restaurant_id, table_id, session_id)
VALUES ($1, $2, $3)
RETURNING *;
`;

exports.GET_ORDERS = `
SELECT * FROM orders;
`;

exports.UPDATE_ORDER_STATUS = `
UPDATE orders
SET status = $1
WHERE id = $2
RETURNING *;
`;

exports.DELETE_ORDER = `
DELETE FROM orders WHERE id = $1;
`;