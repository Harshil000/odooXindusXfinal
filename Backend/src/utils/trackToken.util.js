import jwt from "jsonwebtoken";

const TRACK_SECRET = process.env.JWT_ACCESS_SECRET;

export function signTrackToken(payload, expiresIn = "12h") {
  return jwt.sign(payload, TRACK_SECRET, { expiresIn });
}

export function verifyTrackToken(token) {
  return jwt.verify(token, TRACK_SECRET);
}
