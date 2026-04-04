import { pool } from "../config/database.js";
import * as Q from "../queries/floor.query.js";

export async function createFloor(restaurant_id, name) {
  const result = await pool.query(Q.CREATE_FLOOR, [restaurant_id, name]);
  return result.rows[0];
}

export async function getAllFloors() {
  const result = await pool.query(Q.GET_FLOORS);
  return result.rows;
}

export async function getFloorById(id) {
  const result = await pool.query(Q.GET_FLOOR_BY_ID, [id]);
  return result.rows[0];
}

export async function updateFloor(name, id) {
  const result = await pool.query(Q.UPDATE_FLOOR, [name, id]);
  return result.rows[0];
}

export async function deleteFloor(id) {
  await pool.query(Q.DELETE_FLOOR, [id]);
}
