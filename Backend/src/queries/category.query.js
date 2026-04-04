// CREATE CATEGORY
export const CREATE_CATEGORY = `
INSERT INTO categories (restaurant_id, name)
VALUES ($1, $2)
RETURNING *;
`;

// GET ALL
export const GET_CATEGORIES = `
SELECT * FROM categories
ORDER BY name;
`;

// GET BY ID
export const GET_CATEGORY_BY_ID = `
SELECT * FROM categories
WHERE id = $1;
`;

// UPDATE
export const UPDATE_CATEGORY = `
UPDATE categories
SET name = $1
WHERE id = $2
RETURNING *;
`;

// DELETE
export const DELETE_CATEGORY = `
DELETE FROM categories
WHERE id = $1;
`;
