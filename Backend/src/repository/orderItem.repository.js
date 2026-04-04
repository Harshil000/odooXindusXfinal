import { pool } from "../config/database.js";
import * as Q from "../queries/orderItem.query.js";

export async function createOrderItem(
  order_id,
  product_id,
  quantity,
  price,
  subtotal,
) {
  const result = await pool.query(Q.CREATE_ORDER_ITEM, [
    order_id,
    product_id,
    quantity,
    price,
    subtotal,
  ]);
  return result.rows[0];
}

export async function getAllOrderItems() {
  const result = await pool.query(Q.GET_ORDER_ITEMS);
  return result.rows;
}

export async function getItemsByOrder(order_id) {
  const result = await pool.query(Q.GET_ITEMS_BY_ORDER, [order_id]);
  return result.rows;
}

export async function updateOrderItem(quantity, subtotal, id) {
  const result = await pool.query(Q.UPDATE_ORDER_ITEM, [
    quantity,
    subtotal,
    id,
  ]);
  return result.rows[0];
}

export async function deleteOrderItem(id) {
  await pool.query(Q.DELETE_ORDER_ITEM, [id]);
}
