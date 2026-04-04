exports.CREATE_PRODUCT = `
INSERT INTO products (restaurant_id, category_id, name, price)
VALUES ($1,$2,$3,$4)
RETURNING *;
`;

exports.GET_PRODUCTS = `SELECT * FROM products;`;

exports.UPDATE_PRODUCT = `
UPDATE products SET price=$1 WHERE id=$2 RETURNING *;
`;

exports.DELETE_PRODUCT = `
DELETE FROM products WHERE id=$1;
`;