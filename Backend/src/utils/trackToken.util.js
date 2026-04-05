import crypto from "crypto";

const TRACK_STORE = new Map();
const DEFAULT_EXPIRY_MS = 12 * 60 * 60 * 1000;

function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [key, value] of TRACK_STORE.entries()) {
    if (!value?.expiresAt || value.expiresAt <= now) {
      TRACK_STORE.delete(key);
    }
  }
}

export function signTrackToken(payload, expiresInMs = DEFAULT_EXPIRY_MS) {
  cleanupExpiredTokens();
  const token = crypto.randomBytes(32).toString("hex");
  TRACK_STORE.set(token, {
    payload,
    expiresAt: Date.now() + Number(expiresInMs || DEFAULT_EXPIRY_MS),
  });
  return token;
}

export function verifyTrackToken(token) {
  cleanupExpiredTokens();

  const record = TRACK_STORE.get(token);
  if (!record) {
    const error = new Error("Invalid track link");
    error.name = "JsonWebTokenError";
    throw error;
  }

  if (record.expiresAt <= Date.now()) {
    TRACK_STORE.delete(token);
    const error = new Error("Track link expired");
    error.name = "TokenExpiredError";
    throw error;
  }

  return record.payload;
}
