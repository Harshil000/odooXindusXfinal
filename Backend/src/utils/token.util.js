import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRY = "15d";

export function issueAccessToken({ id, role, restaurant_id }) {
  return jwt.sign({ id, role, restaurant_id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}