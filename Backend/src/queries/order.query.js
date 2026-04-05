export const CREATE_ORDER = `
INSERT INTO orders (restaurant_id, table_id, session_id, status)
VALUES ($1, $2, $3, 'to_cook')
RETURNING *;
`;

export const GET_ORDERS = `
SELECT
	o.*,
	MAX(rt.table_number) AS table_number,
	COALESCE(COUNT(oi.id), 0)::int AS item_count,
	COALESCE(SUM(oi.subtotal), 0)::numeric(10,2) AS total_amount
FROM orders o
LEFT JOIN restaurant_tables rt ON rt.id = o.table_id
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.restaurant_id = $1
GROUP BY o.id
ORDER BY o.created_at DESC;
`;

export const GET_ORDER_BY_ID = `
SELECT
	o.*,
	MAX(rt.table_number) AS table_number,
	COALESCE(COUNT(oi.id), 0)::int AS item_count,
	COALESCE(SUM(oi.subtotal), 0)::numeric(10,2) AS total_amount
FROM orders o
LEFT JOIN restaurant_tables rt ON rt.id = o.table_id
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.id = $1 AND o.restaurant_id = $2
GROUP BY o.id;
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
	MAX(rt.table_number) AS table_number,
	COALESCE(SUM(oi.quantity), 0)::int AS item_count,
	COALESCE(
		ARRAY_REMOVE(ARRAY_AGG(DISTINCT p.name), NULL),
		'{}'::text[]
	) AS product_names
FROM orders o
LEFT JOIN restaurant_tables rt ON rt.id = o.table_id
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN products p ON p.id = oi.product_id
WHERE o.restaurant_id = $1
	AND o.status = ANY($2::text[])
GROUP BY o.id
ORDER BY o.created_at ASC;
`;

export const GET_TRACKING_ORDERS_BY_TABLE = `
SELECT
	o.*,
	COALESCE(SUM(oi.quantity), 0)::int AS item_count,
	COALESCE(
		ARRAY_REMOVE(ARRAY_AGG(DISTINCT p.name), NULL),
		'{}'::text[]
	) AS product_names
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN products p ON p.id = oi.product_id
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
