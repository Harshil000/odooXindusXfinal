const db = require("../config/db");
const Q = require("../queries/order.query");

exports.createOrder = async (req, res) => {
  const { restaurant_id, table_id, session_id } = req.body;

  const result = await db.query(Q.CREATE_ORDER, [
    restaurant_id,
    table_id,
    session_id,
  ]);

  res.json(result.rows[0]);
};

exports.getOrders = async (req, res) => {
  const result = await db.query(Q.GET_ORDERS);
  res.json(result.rows);
};

exports.updateOrder = async (req, res) => {
  const result = await db.query(Q.UPDATE_ORDER_STATUS, [
    req.body.status,
    req.params.id,
  ]);

  res.json(result.rows[0]);
};

exports.deleteOrder = async (req, res) => {
  await db.query(Q.DELETE_ORDER, [req.params.id]);
  res.json({ message: "Deleted" });
};