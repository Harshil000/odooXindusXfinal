import * as repo from "../repository/category.repository.js";

// CREATE
export async function createCategory(req, res, next) {
  try {
    const { restaurant_id, name } = req.body;
    const category = await repo.createCategory(restaurant_id, name);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
}

// GET ALL
export async function getCategories(req, res, next) {
  try {
    const categories = await repo.getAllCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
}

// GET ONE
export async function getCategoryById(req, res, next) {
  try {
    const category = await repo.getCategoryById(req.params.id);
    res.json(category);
  } catch (error) {
    next(error);
  }
}

// UPDATE
export async function updateCategory(req, res, next) {
  try {
    const category = await repo.updateCategory(req.body.name, req.params.id);
    res.json(category);
  } catch (error) {
    next(error);
  }
}

// DELETE
export async function deleteCategory(req, res, next) {
  try {
    await repo.deleteCategory(req.params.id);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    next(error);
  }
}
