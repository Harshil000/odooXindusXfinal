import * as repo from "../repository/order.repository.js";

export async function createOrder(req, res, next) {
  try {
    const { restaurant_id, table_id, session_id } = req.body;
    const order = await repo.createOrder(restaurant_id, table_id, session_id);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}

export async function getOrders(req, res, next) {
  try {
    const orders = await repo.getAllOrders();
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

export async function updateOrder(req, res, next) {
  try {
    const order = await repo.updateOrderStatus(req.body.status, req.params.id);
    res.json(order);
  } catch (error) {
    next(error);
  }
}

export async function deleteOrder(req, res, next) {
  try {
    await repo.deleteOrder(req.params.id);
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    next(error);
  }
}
