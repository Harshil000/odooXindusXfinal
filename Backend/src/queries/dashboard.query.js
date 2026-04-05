export const GET_CATEGORY_ORDER_COUNTS = `
SELECT
  c.id,
  c.name,
  c.color,
  COALESCE(COUNT(DISTINCT oi.order_id), 0)::int AS order_count
FROM categories c
LEFT JOIN products p
  ON p.category_id = c.id
  AND p.restaurant_id = c.restaurant_id
LEFT JOIN order_items oi
  ON oi.product_id = p.id
LEFT JOIN orders o
  ON o.id = oi.order_id
  AND o.restaurant_id = c.restaurant_id
  AND o.created_at >= $2
  AND o.created_at < $3
WHERE c.restaurant_id = $1
GROUP BY c.id, c.name, c.color
ORDER BY order_count DESC, c.name ASC;
`;

export const GET_TOTAL_ORDERS_IN_RANGE = `
SELECT COALESCE(COUNT(*), 0)::int AS total_orders
FROM orders o
WHERE o.restaurant_id = $1
  AND o.created_at >= $2
  AND o.created_at < $3;
`;

export const GET_DASHBOARD_OVERVIEW = `
WITH scoped_orders AS (
  SELECT id, status
  FROM orders
  WHERE restaurant_id = $1
    AND created_at >= $2
    AND created_at < $3
),
paid_orders AS (
  SELECT id
  FROM scoped_orders
  WHERE status = 'paid'
),
revenue_rollup AS (
  SELECT
    COALESCE(SUM(oi.subtotal), 0)::numeric(10,2) AS total_revenue,
    COALESCE(SUM(oi.quantity), 0)::int AS items_sold
  FROM order_items oi
  INNER JOIN paid_orders po ON po.id = oi.order_id
),
status_rollup AS (
  SELECT
    COALESCE(COUNT(*) FILTER (WHERE status = 'paid'), 0)::int AS paid_orders,
    COALESCE(COUNT(*) FILTER (WHERE status = 'completed'), 0)::int AS completed_orders,
    COALESCE(COUNT(*) FILTER (WHERE status = 'preparing'), 0)::int AS preparing_orders,
    COALESCE(COUNT(*) FILTER (WHERE status = 'to_cook'), 0)::int AS to_cook_orders
  FROM scoped_orders
),
daily_revenue AS (
  SELECT
    DATE(o.created_at) AS day,
    COALESCE(SUM(oi.subtotal), 0)::numeric(10,2) AS revenue,
    COALESCE(COUNT(DISTINCT o.id), 0)::int AS orders
  FROM orders o
  LEFT JOIN order_items oi ON oi.order_id = o.id
  WHERE o.restaurant_id = $1
    AND o.created_at >= $2
    AND o.created_at < $3
    AND o.status = 'paid'
  GROUP BY DATE(o.created_at)
)
SELECT
  (SELECT COUNT(*) FROM scoped_orders)::int AS total_orders,
  (SELECT COUNT(*) FROM paid_orders)::int AS settled_orders,
  (SELECT COUNT(*) FROM scoped_orders WHERE status <> 'paid')::int AS open_orders,
  (SELECT total_revenue FROM revenue_rollup) AS total_revenue,
  CASE
    WHEN (SELECT COUNT(*) FROM paid_orders) = 0 THEN 0
    ELSE ROUND((SELECT total_revenue FROM revenue_rollup) / NULLIF((SELECT COUNT(*) FROM paid_orders), 0), 2)
  END AS average_order_value,
  (SELECT items_sold FROM revenue_rollup)::int AS items_sold,
  (SELECT COUNT(*) FROM categories WHERE restaurant_id = $1)::int AS total_categories,
  (SELECT COUNT(*) FROM products WHERE restaurant_id = $1)::int AS total_products,
  (SELECT COUNT(*) FROM products WHERE restaurant_id = $1 AND is_active = TRUE)::int AS active_products,
  (SELECT COUNT(*) FROM products WHERE restaurant_id = $1 AND is_active = FALSE)::int AS inactive_products,
  (SELECT paid_orders FROM status_rollup)::int AS paid_orders_count,
  (SELECT completed_orders FROM status_rollup)::int AS completed_orders,
  (SELECT preparing_orders FROM status_rollup)::int AS preparing_orders,
  (SELECT to_cook_orders FROM status_rollup)::int AS to_cook_orders,
  COALESCE((SELECT json_agg(daily_revenue ORDER BY day) FROM daily_revenue), '[]'::json) AS daily_revenue
;
`;

export const GET_CATEGORY_DASHBOARD = `
SELECT
  c.id,
  c.name,
  c.color,
  COALESCE(COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'paid'), 0)::int AS order_count,
  COALESCE(SUM(CASE WHEN o.status = 'paid' THEN oi.subtotal ELSE 0 END), 0)::numeric(10,2) AS revenue,
  COALESCE(SUM(CASE WHEN o.status = 'paid' THEN oi.quantity ELSE 0 END), 0)::int AS items_sold
FROM categories c
LEFT JOIN products p
  ON p.category_id = c.id
  AND p.restaurant_id = c.restaurant_id
LEFT JOIN order_items oi
  ON oi.product_id = p.id
LEFT JOIN orders o
  ON o.id = oi.order_id
  AND o.restaurant_id = c.restaurant_id
  AND o.created_at >= $2
  AND o.created_at < $3
WHERE c.restaurant_id = $1
GROUP BY c.id, c.name, c.color
ORDER BY revenue DESC, order_count DESC, c.name ASC;
`;

export const GET_PRODUCT_DASHBOARD = `
SELECT
  p.id,
  p.name,
  p.price,
  COALESCE(c.name, 'Uncategorized') AS category_name,
  COALESCE(SUM(CASE WHEN o.status = 'paid' THEN oi.quantity ELSE 0 END), 0)::int AS quantity_sold,
  COALESCE(SUM(CASE WHEN o.status = 'paid' THEN oi.subtotal ELSE 0 END), 0)::numeric(10,2) AS revenue
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN orders o
  ON o.id = oi.order_id
  AND o.restaurant_id = p.restaurant_id
  AND o.created_at >= $2
  AND o.created_at < $3
WHERE p.restaurant_id = $1
GROUP BY p.id, p.name, p.price, c.name
ORDER BY revenue DESC, quantity_sold DESC, p.name ASC
LIMIT 10;
`;
