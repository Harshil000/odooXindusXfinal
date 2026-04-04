import argon2 from "argon2";
import { findUserByEmail } from "../repository/user.repository.js";

export async function authenticateUser(email, password) {
  const user = await findUserByEmail(email);
  if (!user) {
    const err = new Error("no user found with this email");
    err.status = 404;
    throw err;
  }

  const isPasswordValid = await argon2.verify(user.password_hash, password);
  if (!isPasswordValid) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  return user;
}
