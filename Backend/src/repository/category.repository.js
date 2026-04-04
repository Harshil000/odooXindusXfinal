import { pool } from "../config/database.js";
import * as Q from "../queries/category.query.js";

export async function createCategory(restaurant_id, name, color) {
  const result = await pool.query(Q.CREATE_CATEGORY, [
    restaurant_id,
    name,
    color,
  ]);
  return result.rows[0];
}

export async function getAllCategories(restaurant_id) {
  const result = await pool.query(Q.GET_CATEGORIES, [restaurant_id]);
  return result.rows;
}

export async function getCategoryById(id, restaurant_id) {
  const result = await pool.query(Q.GET_CATEGORY_BY_ID, [id, restaurant_id]);
  return result.rows[0];
}

export async function updateCategory(name, color, id, restaurant_id) {
  const result = await pool.query(Q.UPDATE_CATEGORY, [name, color, id, restaurant_id]);
  return result.rows[0];
}

export async function deleteCategory(id, restaurant_id) {
  await pool.query(Q.DELETE_CATEGORY, [id, restaurant_id]);
}
