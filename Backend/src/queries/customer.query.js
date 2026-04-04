// CREATE CUSTOMER
exports.CREATE_CUSTOMER = `
INSERT INTO customers (restaurant_id, name, email, phone)
VALUES ($1, $2, $3, $4)
RETURNING *;
`;

// GET ALL CUSTOMERS
exports.GET_CUSTOMERS = `
SELECT * FROM customers
ORDER BY created_at DESC;
`;

// GET SINGLE CUSTOMER
exports.GET_CUSTOMER_BY_ID = `
SELECT * FROM customers
WHERE id = $1;
`;

// UPDATE CUSTOMER
exports.UPDATE_CUSTOMER = `
UPDATE customers
SET name = $1,
    email = $2,
    phone = $3
WHERE id = $4
RETURNING *;
`;

// DELETE CUSTOMER
exports.DELETE_CUSTOMER = `
DELETE FROM customers
WHERE id = $1;
`;