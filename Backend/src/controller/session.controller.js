const db = require("../config/db");
const Q = require("../queries/session.query");

// CREATE
exports.createSession = async (req, res) => {
  const { restaurant_id, opened_by } = req.body;

  const existing = await db.query(Q.GET_ACTIVE_SESSION, [restaurant_id]);

  if (existing.rows.length > 0) {
    return res.status(400).json({ message: "Session already active" });
  }

  const result = await db.query(Q.CREATE_SESSION, [
    restaurant_id,
    opened_by,
  ]);

  res.status(201).json(result.rows[0]);
};

// GET ACTIVE
exports.getActiveSession = async (req, res) => {
  const result = await db.query(Q.GET_ACTIVE_SESSION, [
    req.params.restaurant_id,
  ]);

  res.json(result.rows[0]);
};

// CLOSE
exports.updateSession = async (req, res) => {
  const result = await db.query(Q.CLOSE_SESSION, [req.params.id]);
  res.json(result.rows[0]);
};

// GET ALL
exports.getAllSessions = async (req, res) => {
  const result = await db.query(Q.GET_ALL_SESSIONS, [
    req.params.restaurant_id,
  ]);
  res.json(result.rows);
};