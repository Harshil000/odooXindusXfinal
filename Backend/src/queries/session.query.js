// CREATE
export const CREATE_SESSION = `
INSERT INTO pos_sessions (restaurant_id, opened_by)
VALUES ($1, $2)
RETURNING *;
`;

// CHECK ACTIVE
export const GET_ACTIVE_SESSION = `
SELECT * FROM pos_sessions
WHERE restaurant_id = $1 AND closed_at IS NULL
LIMIT 1;
`;

// CLOSE SESSION
export const CLOSE_SESSION = `
UPDATE pos_sessions
SET closed_at = NOW(),
    total_sales = (
        SELECT COALESCE(SUM(oi.subtotal), 0)
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE o.session_id = $1
    )
WHERE id = $1 AND restaurant_id = $2
RETURNING *;
`;

// GET ALL
export const GET_ALL_SESSIONS = `
SELECT
    ps.id,
    ps.restaurant_id,
    ps.opened_by,
    ps.opened_at,
    ps.closed_at,
    COALESCE(sales.total_sales, 0)::numeric(10,2) AS total_sales
FROM pos_sessions ps
LEFT JOIN (
    SELECT
        o.session_id,
        COALESCE(SUM(oi.subtotal), 0) AS total_sales
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    GROUP BY o.session_id
) sales ON sales.session_id = ps.id
WHERE ps.restaurant_id = $1
ORDER BY ps.opened_at DESC;
`;
