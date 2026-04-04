import * as repo from "../repository/category.repository.js";

// CREATE
export async function createCategory(req, res, next) {
  try {
    const { name, color } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }
    if (!color?.trim()) {
      return res.status(400).json({ message: "Category color is required" });
    }
    const restaurant_id = req.user.restaurant_id;
    const category = await repo.createCategory(
      restaurant_id,
      name,
      color.trim(),
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
    const { name, color } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }
    if (!color?.trim()) {
      return res.status(400).json({ message: "Category color is required" });
    }
    const restaurant_id = req.user.restaurant_id;
    const category = await repo.updateCategory(
      name,
      color.trim(),
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
