const db = require("../config/db");
const Q = require("../queries/product.query");

exports.createProduct = async (req, res) => {
  const result = await db.query(Q.CREATE_PRODUCT, Object.values(req.body));
  res.json(result.rows[0]);
};

exports.getProducts = async (req, res) => {
  const result = await db.query(Q.GET_PRODUCTS);
  res.json(result.rows);
};

exports.updateProduct = async (req, res) => {
  const result = await db.query(Q.UPDATE_PRODUCT, [
    req.body.price,
    req.params.id,
  ]);
  res.json(result.rows[0]);
};

exports.deleteProduct = async (req, res) => {
  await db.query(Q.DELETE_PRODUCT, [req.params.id]);
  res.json({ message: "Deleted" });
};