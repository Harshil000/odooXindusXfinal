import { pool } from "../config/database.js";
import * as Q from "../queries/product.query.js";

export async function createProduct(
  restaurant_id,
  category_id,
  name,
  description,
  price,
  tax_percent,
  variants,
  is_active,
) {
  const result = await pool.query(Q.CREATE_PRODUCT, [
    restaurant_id,
    category_id,
    name,
    description,
    price,
    tax_percent,
    variants,
    is_active,
  ]);
  return result.rows[0];
}

export async function getAllProducts(restaurant_id) {
  const result = await pool.query(Q.GET_PRODUCTS_BY_RESTAURANT, [
    restaurant_id,
  ]);
  return result.rows;
}

export async function updateProduct(
  category_id,
  name,
  description,
  price,
  tax_percent,
  variants,
  is_active,
  id,
  restaurant_id,
) {
  const result = await pool.query(Q.UPDATE_PRODUCT, [
    category_id,
    name,
    description,
    price,
    tax_percent,
    variants,
    is_active,
    id,
    restaurant_id,
  ]);
  return result.rows[0];
}

export async function deleteProduct(id, restaurant_id) {
  await pool.query(Q.DELETE_PRODUCT, [id, restaurant_id]);
}
