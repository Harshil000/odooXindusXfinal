import { pool } from "../config/database.js";
import * as Q from "../queries/order.query.js";

export async function createOrder(restaurant_id, table_id, session_id) {
  const result = await pool.query(Q.CREATE_ORDER, [
    restaurant_id,
    table_id,
    session_id,
  ]);
  return result.rows[0];
}

export async function getAllOrders() {
  const result = await pool.query(Q.GET_ORDERS);
  return result.rows;
}

export async function updateOrderStatus(status, id) {
  const result = await pool.query(Q.UPDATE_ORDER_STATUS, [status, id]);
  return result.rows[0];
}

export async function deleteOrder(id) {
  await pool.query(Q.DELETE_ORDER, [id]);
}
