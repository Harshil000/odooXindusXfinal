import * as repo from "../repository/category.repository.js";

// CREATE
export async function createCategory(req, res, next) {
  try {
    const { name, color } = req.body;
    const restaurant_id = req.user.restaurant_id;
    const category = await repo.createCategory(
      restaurant_id,
      name,
      color || "white",
    );
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
}

// GET ALL
export async function getCategories(req, res, next) {
  try {
    const restaurant_id = req.user.restaurant_id;
    const categories = await repo.getAllCategories(restaurant_id);
    res.json(categories);
  } catch (error) {
    next(error);
  }
}

// GET ONE
export async function getCategoryById(req, res, next) {
  try {
    const restaurant_id = req.user.restaurant_id;
    const category = await repo.getCategoryById(req.params.id, restaurant_id);
    res.json(category);
  } catch (error) {
    next(error);
  }
}

// UPDATE
export async function updateCategory(req, res, next) {
  try {
    const restaurant_id = req.user.restaurant_id;
    const category = await repo.updateCategory(
      req.body.name,
      req.body.color || "white",
      req.params.id,
      restaurant_id,
    );
    res.json(category);
  } catch (error) {
    next(error);
  }
}

// DELETE
export async function deleteCategory(req, res, next) {
  try {
    const restaurant_id = req.user.restaurant_id;
    await repo.deleteCategory(req.params.id, restaurant_id);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    next(error);
  }
}
