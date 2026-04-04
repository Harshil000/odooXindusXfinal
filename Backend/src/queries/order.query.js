export const CREATE_ORDER = `
INSERT INTO orders (restaurant_id, table_id, session_id)
VALUES ($1, $2, $3)
RETURNING *;
`;

export const GET_ORDERS = `
SELECT *
FROM orders
WHERE restaurant_id = $1
ORDER BY created_at DESC;
`;

export const GET_ORDER_BY_ID = `
SELECT * FROM orders
WHERE id = $1 AND restaurant_id = $2;
`;

export const UPDATE_ORDER_STATUS = `
UPDATE orders
SET status = $1
WHERE id = $2 AND restaurant_id = $3
RETURNING *;
`;

export const DELETE_ORDER = `
DELETE FROM orders
WHERE id = $1 AND restaurant_id = $2;
`;

export const GET_KITCHEN_ORDERS = `
SELECT
	o.*,
	COALESCE(COUNT(oi.id), 0)::int AS item_count
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.restaurant_id = $1
	AND o.status = ANY($2::text[])
GROUP BY o.id
ORDER BY o.created_at ASC;
`;

export const GET_TRACKING_ORDERS_BY_TABLE = `
SELECT
	o.*,
	COALESCE(COUNT(oi.id), 0)::int AS item_count
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.restaurant_id = $1
	AND o.table_id = $2
	AND ($3::uuid IS NULL OR o.session_id = $3::uuid)
	AND o.status = ANY($4::text[])
GROUP BY o.id
ORDER BY o.created_at DESC;
`;

export const COUNT_UNPAID_ORDERS_BY_TABLE = `
SELECT COUNT(*)::int AS count
FROM orders
WHERE restaurant_id = $1
	AND table_id = $2
	AND status <> 'paid';
`;

export const COUNT_UNPAID_ORDERS_BY_SESSION = `
SELECT COUNT(*)::int AS count
FROM orders
WHERE restaurant_id = $1
	AND session_id = $2
	AND status <> 'paid';
`;
