import { pool } from "../config/database.js";
import * as Q from "../queries/category.query.js";

export async function createCategory(restaurant_id, name) {
  const result = await pool.query(Q.CREATE_CATEGORY, [restaurant_id, name]);
  return result.rows[0];
}

export async function getAllCategories() {
  const result = await pool.query(Q.GET_CATEGORIES);
  return result.rows;
}

export async function getCategoryById(id) {
  const result = await pool.query(Q.GET_CATEGORY_BY_ID, [id]);
  return result.rows[0];
}

export async function updateCategory(name, id) {
  const result = await pool.query(Q.UPDATE_CATEGORY, [name, id]);
  return result.rows[0];
}

export async function deleteCategory(id) {
  await pool.query(Q.DELETE_CATEGORY, [id]);
}
