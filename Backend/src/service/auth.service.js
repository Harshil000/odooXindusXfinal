import argon2 from "argon2";
import { findUserByEmail } from "../repository/user.repository.js";

export async function authenticateUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);
  if (!user) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  let isPasswordValid =  user.password_hash == password
  if (!isPasswordValid) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  return user;
}
