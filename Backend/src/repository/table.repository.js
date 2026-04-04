import { pool } from "../config/database.js";
import * as Q from "../queries/table.query.js";

export async function createTable(restaurant_id, floor_id, table_number, seats, status) {
  const result = await pool.query(Q.CREATE_TABLE, [
    restaurant_id,
    floor_id,
    table_number,
    seats,
    status,
  ]);
  return result.rows[0];
}

export async function getAllTables(restaurant_id) {
  const result = await pool.query(Q.GET_TABLES, [restaurant_id]);
  return result.rows;
}

export async function getTablesByFloor(restaurant_id, floor_id) {
  const result = await pool.query(Q.GET_TABLES_BY_FLOOR, [restaurant_id, floor_id]);
  return result.rows;
}

export async function getTableById(id, restaurant_id) {
  const result = await pool.query(Q.GET_TABLE_BY_ID, [id, restaurant_id]);
  return result.rows[0];
}

export async function updateTable(floor_id, table_number, seats, status, id, restaurant_id) {
  const result = await pool.query(Q.UPDATE_TABLE, [
    floor_id,
    table_number,
    seats,
    status,
    id,
    restaurant_id,
  ]);
  return result.rows[0];
}

export async function deleteTable(id, restaurant_id) {
  await pool.query(Q.DELETE_TABLE, [id, restaurant_id]);
}

export async function updateTableStatus(status, id, restaurant_id) {
  const result = await pool.query(Q.UPDATE_TABLE_STATUS, [status, id, restaurant_id]);
  return result.rows[0];
}

export async function releaseTablesBySession(restaurant_id, session_id) {
  const result = await pool.query(Q.RELEASE_TABLES_BY_SESSION, [restaurant_id, session_id]);
  return result.rows;
}
