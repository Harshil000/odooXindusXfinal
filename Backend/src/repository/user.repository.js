import { pool } from "../config/database.js";
import argon2 from "argon2";
import {
  SELECT_USER_BY_EMAIL_QUERY,
  INSERT_USER_QUERY,
  INSERT_RESTAURANT_QUERY,
} from "../queries/user.query.js";

export async function createUser({
  name,
  email,
  password,
  role,
  restaurant_name,
}) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const normalizedRole = role?.toLowerCase();
    const passwordHash = await argon2.hash(password);
    const userValues = [name, email, passwordHash, normalizedRole];
    const userResult = await client.query(INSERT_USER_QUERY, userValues);
    const createdUser = userResult.rows[0];

    let restaurant = null;
    if (normalizedRole === "owner") {
      restaurant = await client.query(INSERT_RESTAURANT_QUERY, [
        restaurant_name,
        createdUser.id,
      ]);
    }

    await client.query("COMMIT");
    return {
      ...createdUser,
      ...(restaurant ? restaurant.rows[0] : {}),
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
