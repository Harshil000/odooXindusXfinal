const db = require("../config/db");
const Q = require("../queries/floor.query");

// CREATE
exports.createFloor = async (req, res) => {
  const { restaurant_id, name } = req.body;

  const result = await db.query(Q.CREATE_FLOOR, [
    restaurant_id,
    name,
  ]);

  res.status(201).json(result.rows[0]);
};

// GET ALL
exports.getFloors = async (req, res) => {
  const result = await db.query(Q.GET_FLOORS);
  res.json(result.rows);
};

// GET ONE
exports.getFloorById = async (req, res) => {
  const result = await db.query(Q.GET_FLOOR_BY_ID, [
    req.params.id,
  ]);
  res.json(result.rows[0]);
};

// UPDATE
exports.updateFloor = async (req, res) => {
  const result = await db.query(Q.UPDATE_FLOOR, [
    req.body.name,
    req.params.id,
  ]);
  res.json(result.rows[0]);
};

// DELETE
exports.deleteFloor = async (req, res) => {
  await db.query(Q.DELETE_FLOOR, [req.params.id]);
  res.json({ message: "Floor deleted" });
};