import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRY = "15m";

export function issueAccessToken({ id, role }) {
  return jwt.sign({ id, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}