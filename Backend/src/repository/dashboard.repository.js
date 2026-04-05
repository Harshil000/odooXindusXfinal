import { pool } from "../config/database.js";
import * as Q from "../queries/dashboard.query.js";

export async function getCategoryOrderCounts(restaurant_id, startDate, endDate) {
  const result = await pool.query(Q.GET_CATEGORY_ORDER_COUNTS, [
    restaurant_id,
    startDate,
    endDate,
  ]);
  return result.rows;
}

export async function getTotalOrdersInRange(restaurant_id, startDate, endDate) {
  const result = await pool.query(Q.GET_TOTAL_ORDERS_IN_RANGE, [
    restaurant_id,
    startDate,
    endDate,
  ]);
  return result.rows[0]?.total_orders || 0;
}

export async function getDashboardOverview(restaurant_id, startDate, endDate) {
  const result = await pool.query(Q.GET_DASHBOARD_OVERVIEW, [
    restaurant_id,
    startDate,
    endDate,
  ]);
  return result.rows[0];
}

export async function getCategoryDashboard(restaurant_id, startDate, endDate) {
  const result = await pool.query(Q.GET_CATEGORY_DASHBOARD, [
    restaurant_id,
    startDate,
    endDate,
  ]);
  return result.rows;
}

export async function getProductDashboard(restaurant_id, startDate, endDate) {
  const result = await pool.query(Q.GET_PRODUCT_DASHBOARD, [
    restaurant_id,
    startDate,
    endDate,
  ]);
  return result.rows;
}
