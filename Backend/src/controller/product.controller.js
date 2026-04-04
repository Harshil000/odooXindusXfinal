import * as repo from "../repository/product.repository.js";

export async function createProduct(req, res, next) {
  try {
    const product = await repo.createProduct(...Object.values(req.body));
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

export async function getProducts(req, res, next) {
  try {
    const products = await repo.getAllProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await repo.updateProduct(req.body.price, req.params.id);
    res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    await repo.deleteProduct(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
}
