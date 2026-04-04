import * as repo from "../repository/orderItem.repository.js";

// CREATE
export async function createOrderItem(req, res, next) {
  try {
    const { order_id, product_id, quantity, price } = req.body;
    const subtotal = quantity * price;
    const item = await repo.createOrderItem(
      order_id,
      product_id,
      quantity,
      price,
      subtotal,
    );
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
}

// GET ALL
export async function getOrderItems(req, res, next) {
  try {
    const items = await repo.getAllOrderItems();
    res.json(items);
  } catch (error) {
    next(error);
  }
}

// GET BY ORDER
export async function getItemsByOrder(req, res, next) {
  try {
    const items = await repo.getItemsByOrder(req.params.order_id);
    res.json(items);
  } catch (error) {
    next(error);
  }
}

// UPDATE
export async function updateOrderItem(req, res, next) {
  try {
    const { quantity, price } = req.body;
    const subtotal = quantity * price;
    const item = await repo.updateOrderItem(quantity, subtotal, req.params.id);
    res.json(item);
  } catch (error) {
    next(error);
  }
}

// DELETE
export async function deleteOrderItem(req, res, next) {
  try {
    await repo.deleteOrderItem(req.params.id);
    res.json({ message: "Order item deleted successfully" });
  } catch (error) {
    next(error);
  }
}
