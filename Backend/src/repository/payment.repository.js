import { pool } from "../config/database.js";
import * as Q from "../queries/payment.query.js";

export async function createPayment(
  restaurant_id,
  order_id,
  amount,
  payment_method,
  status,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  paid_at,
) {
  const result = await pool.query(Q.CREATE_PAYMENT, [
    restaurant_id,
    order_id,
    amount,
    payment_method,
    status,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    paid_at,
  ]);
  return result.rows[0];
}

export async function getAllPayments() {
  const result = await pool.query(Q.GET_PAYMENTS);
  return result.rows;
}

export async function getPaymentsByRestaurant(restaurant_id) {
  const result = await pool.query(Q.GET_PAYMENTS_BY_RESTAURANT, [restaurant_id]);
  return result.rows;
}

export async function getPaymentByOrder(order_id) {
  const result = await pool.query(Q.GET_PAYMENT_BY_ORDER, [order_id]);
  return result.rows;
}

export async function getPaymentByRazorpayPaymentId(razorpay_payment_id) {
  const result = await pool.query(Q.GET_PAYMENT_BY_RAZORPAY_PAYMENT_ID, [
    razorpay_payment_id,
  ]);
  return result.rows[0];
}

export async function getPaymentByRazorpayOrderId(razorpay_order_id) {
  const result = await pool.query(Q.GET_PAYMENT_BY_RAZORPAY_ORDER_ID, [
    razorpay_order_id,
  ]);
  return result.rows[0];
}

export async function getPaymentsByStatus(status) {
  const result = await pool.query(Q.GET_PAYMENTS_BY_STATUS, [status]);
  return result.rows;
}

export async function updatePaymentStatus(
  status,
  razorpay_payment_id,
  razorpay_signature,
  id,
) {
  const result = await pool.query(Q.UPDATE_PAYMENT_STATUS, [
    status,
    razorpay_payment_id,
    razorpay_signature,
    id,
  ]);
  return result.rows[0];
}

export async function updatePaymentByRazorpayId(
  status,
  razorpay_signature,
  razorpay_payment_id,
) {
  const result = await pool.query(Q.UPDATE_PAYMENT_BY_RAZORPAY_ID, [
    status,
    razorpay_signature,
    razorpay_payment_id,
  ]);
  return result.rows[0];
}

export async function deletePayment(id) {
  await pool.query(Q.DELETE_PAYMENT, [id]);
}

export async function createRefund(
  payment_id,
  razorpay_refund_id,
  amount,
  reason,
  status,
) {
  const result = await pool.query(Q.CREATE_REFUND, [
    payment_id,
    razorpay_refund_id,
    amount,
    reason,
    status,
  ]);
  return result.rows[0];
}

export async function getRefundsByPaymentId(payment_id) {
  const result = await pool.query(Q.GET_REFUNDS_BY_PAYMENT_ID, [payment_id]);
  return result.rows;
}

export async function updateRefundStatus(status, id) {
  const result = await pool.query(Q.UPDATE_REFUND_STATUS, [status, id]);
  return result.rows[0];
}
