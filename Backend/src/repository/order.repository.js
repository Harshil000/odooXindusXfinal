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

export async function getAllOrders(restaurant_id) {
  const result = await pool.query(Q.GET_ORDERS, [restaurant_id]);
  return result.rows;
}

export async function getOrderById(id, restaurant_id) {
  const result = await pool.query(Q.GET_ORDER_BY_ID, [id, restaurant_id]);
  return result.rows[0];
}

export async function updateOrderStatus(status, id, restaurant_id) {
  const result = await pool.query(Q.UPDATE_ORDER_STATUS, [status, id, restaurant_id]);
  return result.rows[0];
}

export async function deleteOrder(id, restaurant_id) {
  await pool.query(Q.DELETE_ORDER, [id, restaurant_id]);
}

export async function getKitchenOrders(restaurant_id, statuses) {
  const result = await pool.query(Q.GET_KITCHEN_ORDERS, [restaurant_id, statuses]);
  return result.rows;
}

export async function getOrdersByTableForTracking(restaurant_id, table_id, session_id, statuses) {
  const result = await pool.query(Q.GET_TRACKING_ORDERS_BY_TABLE, [
    restaurant_id,
    table_id,
    session_id || null,
    statuses,
  ]);
  return result.rows;
}

export async function countUnpaidOrdersByTable(restaurant_id, table_id) {
  const result = await pool.query(Q.COUNT_UNPAID_ORDERS_BY_TABLE, [restaurant_id, table_id]);
  return result.rows[0]?.count || 0;
}

export async function countUnpaidOrdersBySession(restaurant_id, session_id) {
  const result = await pool.query(Q.COUNT_UNPAID_ORDERS_BY_SESSION, [restaurant_id, session_id]);
  return result.rows[0]?.count || 0;
}

export async function getRestaurantById(restaurant_id) {
  const result = await pool.query(Q.GET_RESTAURANT_BY_ID, [restaurant_id]);
  return result.rows[0] || null;
}
