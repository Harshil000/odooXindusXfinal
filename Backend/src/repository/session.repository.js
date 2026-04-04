import { pool } from "../config/database.js";
import * as Q from "../queries/session.query.js";

export async function createSession(restaurant_id, opened_by) {
  const existing = await pool.query(Q.GET_ACTIVE_SESSION, [restaurant_id]);

  if (existing.rows.length > 0) {
    const err = new Error("Session already active");
    err.status = 400;
    throw err;
  }

  const result = await pool.query(Q.CREATE_SESSION, [restaurant_id, opened_by]);
  return result.rows[0];
}

export async function getActiveSession(restaurant_id) {
  const result = await pool.query(Q.GET_ACTIVE_SESSION, [restaurant_id]);
  return result.rows[0];
}

export async function closeSession(id) {
  const result = await pool.query(Q.CLOSE_SESSION, [id]);
  return result.rows[0];
}

export async function getAllSessions(restaurant_id) {
  const result = await pool.query(Q.GET_ALL_SESSIONS, [restaurant_id]);
  return result.rows;
}
