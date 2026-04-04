const db = require("../config/db");
const Q = require("../queries/orderItem.query");

// CREATE
exports.createOrderItem = async (req, res) => {
  const { order_id, product_id, quantity, price } = req.body;

  const subtotal = quantity * price;

  const result = await db.query(Q.CREATE_ORDER_ITEM, [
    order_id,
    product_id,
    quantity,
    price,
    subtotal,
  ]);

  res.status(201).json(result.rows[0]);
};

// GET ALL
exports.getOrderItems = async (req, res) => {
  const result = await db.query(Q.GET_ORDER_ITEMS);
  res.json(result.rows);
};

// GET BY ORDER
exports.getItemsByOrder = async (req, res) => {
  const result = await db.query(Q.GET_ITEMS_BY_ORDER, [
    req.params.order_id,
  ]);
  res.json(result.rows);
};

// UPDATE
exports.updateOrderItem = async (req, res) => {
  const { quantity, price } = req.body;

  const subtotal = quantity * price;

  const result = await db.query(Q.UPDATE_ORDER_ITEM, [
    quantity,
    subtotal,
    req.params.id,
  ]);

  res.json(result.rows[0]);
};

// DELETE
exports.deleteOrderItem = async (req, res) => {
  await db.query(Q.DELETE_ORDER_ITEM, [req.params.id]);
  res.json({ message: "Order item deleted" });
};