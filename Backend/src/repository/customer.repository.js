import { pool } from "../config/database.js";
import * as Q from "../queries/customer.query.js";

export async function createCustomer(restaurant_id, name, email, phone) {
  const result = await pool.query(Q.CREATE_CUSTOMER, [
    restaurant_id,
    name,
    email,
    phone,
  ]);
  return result.rows[0];
}

export async function getAllCustomers() {
  const result = await pool.query(Q.GET_CUSTOMERS);
  return result.rows;
}

export async function getCustomerById(id) {
  const result = await pool.query(Q.GET_CUSTOMER_BY_ID, [id]);
  return result.rows[0];
}

export async function updateCustomer(name, email, phone, id) {
  const result = await pool.query(Q.UPDATE_CUSTOMER, [name, email, phone, id]);
  return result.rows[0];
}

export async function deleteCustomer(id) {
  await pool.query(Q.DELETE_CUSTOMER, [id]);
}
