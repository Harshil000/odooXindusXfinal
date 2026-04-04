import * as repo from "../repository/order.repository.js";
import * as itemRepo from "../repository/orderItem.repository.js";

export async function createOrder(req, res, next) {
  try {
    const { table_id, session_id } = req.body;
    const restaurant_id = req.user.restaurant_id;
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

export async function getOrderDetails(req, res, next) {
  try {
    const orderId = req.params.id;
    const order = await repo.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const items = await itemRepo.getItemsByOrder(orderId);
    res.json({ order, items });
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
