import { pool } from "../config/database.js";
import argon2 from "argon2";
import {
  INSERT_USER_PROFILE_QUERY,
  INSERT_USER_PROFILE_WITH_DEFAULT_PIC_QUERY,
  SELECT_USER_BY_EMAIL_QUERY,
  INSERT_USER_QUERY,
} from "../queries/user.queries.js";

export async function createUser({ username, email, password, full_name, bio, profile_pic_url = null }) {
    const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const passwordHash = await argon2.hash(password);
    const userValues = [username, email, passwordHash];
    const userResult = await client.query(INSERT_USER_QUERY, userValues);
    const createdUser = userResult.rows[0];
    const profileResult = profile_pic_url == null
      ? await client.query(INSERT_USER_PROFILE_WITH_DEFAULT_PIC_QUERY, [createdUser.id, full_name, bio ?? null])
      : await client.query(INSERT_USER_PROFILE_QUERY, [createdUser.id, full_name, bio ?? null, profile_pic_url]);
    await client.query("COMMIT");
    return {
      ...createdUser,
      ...profileResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function findUserByEmail(email) {
  const result = await pool.query(SELECT_USER_BY_EMAIL_QUERY, [email]);
  return result.rows[0] || null;
}