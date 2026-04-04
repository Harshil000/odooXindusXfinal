export const CREATE_PRODUCT = `
INSERT INTO products (restaurant_id, category_id, name, price, tax_percent, variants, is_active)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;
`;

export const GET_PRODUCTS_BY_RESTAURANT = `
SELECT p.*, c.name AS category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.restaurant_id = $1
ORDER BY p.name ASC;
`;

export const UPDATE_PRODUCT = `
UPDATE products
SET category_id = $1,
    name = $2,
    price = $3,
    tax_percent = $4,
    variants = $5,
    is_active = $6
WHERE id = $7 AND restaurant_id = $8
RETURNING *;
`;

export const DELETE_PRODUCT = `
DELETE FROM products WHERE id=$1 AND restaurant_id = $2;
`;
