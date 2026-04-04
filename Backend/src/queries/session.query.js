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
        SELECT COALESCE(SUM(total_amount),0)
        FROM orders WHERE session_id = $1
    )
WHERE id = $1
RETURNING *;
`;

// GET ALL
export const GET_ALL_SESSIONS = `
SELECT * FROM pos_sessions
WHERE restaurant_id = $1
ORDER BY opened_at DESC;
`;
