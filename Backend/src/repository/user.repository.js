import { pool } from "../config/database.js";
import argon2 from "argon2";
import {
  SELECT_USER_BY_EMAIL_QUERY,
  INSERT_USER_QUERY,
  INSERT_RESTAURANT_QUERY,
  SELECT_RESTAURANT_BY_ID_QUERY,
  SELECT_USER_BY_ID_QUERY,
} from "../queries/user.query.js";

export async function createUser({ name, email, password, role, restaurant_name, restaurant_id }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const normalizedRole = role?.toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();
    let restaurantId;

    if (normalizedRole === "owner") {
      const restaurantResult = await client.query(INSERT_RESTAURANT_QUERY, [
        restaurant_name,
        normalizedEmail,
      ]);
      restaurantId = restaurantResult.rows[0].restaurant_id;
    }

    if (normalizedRole === "staff") {
      const restaurantResult = await client.query(
        SELECT_RESTAURANT_BY_ID_QUERY,
        [restaurant_id],
      );
      if (!restaurantResult.rows[0]) {
        const err = new Error(
          "Restaurant not found for provided restaurant_id",
        );
        err.status = 404;
        throw err;
      }
      restaurantId = restaurantResult.rows[0].id;
    }

    const passwordHash = await argon2.hash(password);
    const userValues = [
      restaurantId,
      name,
      normalizedEmail,
      passwordHash,
      normalizedRole,
    ];
    const userResult = await client.query(INSERT_USER_QUERY, userValues);
    const createdUser = userResult.rows[0];

    await client.query("COMMIT");
    return {
      ...createdUser, restaurantId, restaurant_name,
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

export async function findUserById(id) {
  const result = await pool.query(SELECT_USER_BY_ID_QUERY, [id]);
  return result.rows[0] || null;
}
