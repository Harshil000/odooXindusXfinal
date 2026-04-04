import { pool } from "../config/database.js";
import * as Q from "../queries/product.query.js";

export async function createProduct(...values) {
  const result = await pool.query(Q.CREATE_PRODUCT, values);
  return result.rows[0];
}

export async function getAllProducts() {
  const result = await pool.query(Q.GET_PRODUCTS);
  return result.rows;
}

export async function updateProduct(price, id) {
  const result = await pool.query(Q.UPDATE_PRODUCT, [price, id]);
  return result.rows[0];
}

export async function deleteProduct(id) {
  await pool.query(Q.DELETE_PRODUCT, [id]);
}
