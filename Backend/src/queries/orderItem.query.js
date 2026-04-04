// CREATE ITEM
exports.CREATE_ORDER_ITEM = `
INSERT INTO order_items (order_id, product_id, quantity, price, subtotal)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;
`;

// GET ALL ITEMS
exports.GET_ORDER_ITEMS = `
SELECT * FROM order_items;
`;

// GET BY ORDER
exports.GET_ITEMS_BY_ORDER = `
SELECT * FROM order_items
WHERE order_id = $1;
`;

// UPDATE ITEM
exports.UPDATE_ORDER_ITEM = `
UPDATE order_items
SET quantity = $1,
    subtotal = $2
WHERE id = $3
RETURNING *;
`;

// DELETE ITEM
exports.DELETE_ORDER_ITEM = `
DELETE FROM order_items
WHERE id = $1;
`;