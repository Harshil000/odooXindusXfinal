const db = require("../config/db");
const Q = require("../queries/category.query");

// CREATE
exports.createCategory = async (req, res) => {
  try {
    const { restaurant_id, name } = req.body;

    const result = await db.query(Q.CREATE_CATEGORY, [
      restaurant_id,
      name,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create category" });
  }
};

// GET ALL
exports.getCategories = async (req, res) => {
  const result = await db.query(Q.GET_CATEGORIES);
  res.json(result.rows);
};

// GET ONE
exports.getCategoryById = async (req, res) => {
  const result = await db.query(Q.GET_CATEGORY_BY_ID, [
    req.params.id,
  ]);
  res.json(result.rows[0]);
};

// UPDATE
exports.updateCategory = async (req, res) => {
  const result = await db.query(Q.UPDATE_CATEGORY, [
    req.body.name,
    req.params.id,
  ]);
  res.json(result.rows[0]);
};

// DELETE
exports.deleteCategory = async (req, res) => {
  await db.query(Q.DELETE_CATEGORY, [req.params.id]);
  res.json({ message: "Category deleted" });
};