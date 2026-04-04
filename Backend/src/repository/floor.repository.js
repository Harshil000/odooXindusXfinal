import { pool } from "../config/database.js";
import * as Q from "../queries/floor.query.js";

export async function createFloor(restaurant_id, name) {
  const result = await pool.query(Q.CREATE_FLOOR, [restaurant_id, name]);
  return result.rows[0];
}

export async function getAllFloors(restaurant_id) {
  const result = await pool.query(Q.GET_FLOORS, [restaurant_id]);
  return result.rows;
}

export async function getFloorById(id, restaurant_id) {
  const result = await pool.query(Q.GET_FLOOR_BY_ID, [id, restaurant_id]);
  return result.rows[0];
}

export async function updateFloor(name, id, restaurant_id) {
  const result = await pool.query(Q.UPDATE_FLOOR, [name, id, restaurant_id]);
  return result.rows[0];
}

export async function deleteFloor(id, restaurant_id) {
  await pool.query(Q.DELETE_FLOOR, [id, restaurant_id]);
}
