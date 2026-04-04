// CREATE FLOOR
export const CREATE_FLOOR = `
INSERT INTO floors (restaurant_id, name)
VALUES ($1, $2)
RETURNING *;
`;

// GET ALL
export const GET_FLOORS = `
SELECT * FROM floors
ORDER BY name;
`;

// GET BY ID
export const GET_FLOOR_BY_ID = `
SELECT * FROM floors
WHERE id = $1;
`;

// UPDATE
export const UPDATE_FLOOR = `
UPDATE floors
SET name = $1
WHERE id = $2
RETURNING *;
`;

// DELETE
export const DELETE_FLOOR = `
DELETE FROM floors
WHERE id = $1;
`;
