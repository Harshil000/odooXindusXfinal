// CREATE ITEM
export const CREATE_ORDER_ITEM = `
INSERT INTO order_items (order_id, product_id, quantity, price, subtotal)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;
`;

// GET ALL ITEMS
export const GET_ORDER_ITEMS = `
SELECT * FROM order_items;
`;

// GET BY ORDER
export const GET_ITEMS_BY_ORDER = `
SELECT * FROM order_items
WHERE order_id = $1;
`;

// UPDATE ITEM
export const UPDATE_ORDER_ITEM = `
UPDATE order_items
SET quantity = $1,
    subtotal = $2
WHERE id = $3
RETURNING *;
`;

// DELETE ITEM
export const DELETE_ORDER_ITEM = `
DELETE FROM order_items
WHERE id = $1;
`;
