import * as repo from "../repository/product.repository.js";

export async function createProduct(req, res, next) {
  try {
    const {
      category_id,
      name,
      description,
      price,
      tax_percent,
      variants,
      is_active,
    } = req.body;
    const restaurant_id = req.user.restaurant_id;
    const product = await repo.createProduct(
      restaurant_id,
      category_id || null,
      name,
      description || "",
      price,
      tax_percent || 0,
      variants || [],
      is_active === undefined ? true : is_active,
    );
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

export async function getProducts(req, res, next) {
  try {
    const restaurant_id = req.user.restaurant_id;
    const products = await repo.getAllProducts(restaurant_id);
    res.json(products);
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const {
      category_id,
      name,
      description,
      price,
      tax_percent,
      variants,
      is_active,
    } = req.body;
    const restaurant_id = req.user.restaurant_id;
    const product = await repo.updateProduct(
      category_id || null,
      name,
      description || "",
      price,
      tax_percent || 0,
      variants || [],
      is_active === undefined ? true : is_active,
      req.params.id,
      restaurant_id,
    );
    res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const restaurant_id = req.user.restaurant_id;
    await repo.deleteProduct(req.params.id, restaurant_id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
}
