// CREATE CATEGORY
export const CREATE_CATEGORY = `
INSERT INTO categories (restaurant_id, name, color)
VALUES ($1, $2, $3)
RETURNING *;
`;

// GET ALL
export const GET_CATEGORIES = `
SELECT * FROM categories
WHERE restaurant_id = $1
ORDER BY name;
`;

// GET BY ID
export const GET_CATEGORY_BY_ID = `
SELECT * FROM categories
WHERE id = $1 AND restaurant_id = $2;
`;

// UPDATE
export const UPDATE_CATEGORY = `
UPDATE categories
SET name = $1,
    color = $2
WHERE id = $3 AND restaurant_id = $4
RETURNING *;
`;

// DELETE
export const DELETE_CATEGORY = `
DELETE FROM categories
WHERE id = $1 AND restaurant_id = $2;
`;
