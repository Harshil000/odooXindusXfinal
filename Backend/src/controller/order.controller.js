import * as repo from "../repository/order.repository.js";
import * as itemRepo from "../repository/orderItem.repository.js";
import * as tableRepo from "../repository/table.repository.js";
import { emitToRestaurantAndTable } from "../socket/socket.js";
import { buildReceiptWithItemTax, sendReceiptEmail } from "../service/receipt.service.js";

const KITCHEN_STATUSES = ["to_cook", "preparing", "completed"];

export async function createOrder(req, res, next) {
  try {
    const { table_id, session_id } = req.body;
    const restaurant_id = req.user.restaurant_id;
    const order = await repo.createOrder(restaurant_id, table_id, session_id);

    if (order?.table_id) {
      await tableRepo.updateTableStatus("occupied", order.table_id, restaurant_id);
    }

    const payload = {
      orderId: order.id,
      tableId: order.table_id,
      status: order.status,
      createdAt: order.created_at,
      sessionId: order.session_id,
    };
    emitToRestaurantAndTable(restaurant_id, order.table_id, "order.created", payload);

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}

export async function getOrders(req, res, next) {
  try {
    const restaurant_id = req.user.restaurant_id;
    const orders = await repo.getAllOrders(restaurant_id);
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

export async function getOrderDetails(req, res, next) {
  try {
    const orderId = req.params.id;
    const restaurant_id = req.user.restaurant_id;
    const order = await repo.getOrderById(orderId, restaurant_id);
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
    const restaurant_id = req.user.restaurant_id;
    const existing = await repo.getOrderById(req.params.id, restaurant_id);
    if (!existing) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = await repo.updateOrderStatus(req.body.status, req.params.id, restaurant_id);

    if (order?.status === "paid" && order?.table_id) {
      const unpaidCount = await repo.countUnpaidOrdersByTable(restaurant_id, order.table_id);
      if (Number(unpaidCount) === 0) {
        await tableRepo.updateTableStatus("available", order.table_id, restaurant_id);
      }
    }

    const payload = {
      orderId: order.id,
      tableId: order.table_id,
      oldStatus: existing.status,
      newStatus: order.status,
      updatedAt: new Date().toISOString(),
    };
    emitToRestaurantAndTable(restaurant_id, order.table_id, "order.status_changed", payload);

    res.json(order);
  } catch (error) {
    next(error);
  }
}

export async function deleteOrder(req, res, next) {
  try {
    const restaurant_id = req.user.restaurant_id;
    await repo.deleteOrder(req.params.id, restaurant_id);
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export async function getKitchenOrders(req, res, next) {
  try {
    const restaurant_id = req.user.restaurant_id;
    const statusQuery = String(req.query.status || "").trim();
    const statuses = statusQuery
      ? statusQuery.split(",").map((s) => s.trim()).filter(Boolean)
      : KITCHEN_STATUSES;

    const orders = await repo.getKitchenOrders(restaurant_id, statuses);
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

export async function updateKitchenOrderStatus(req, res, next) {
  try {
    const restaurant_id = req.user.restaurant_id;
    const { status } = req.body;

    if (!KITCHEN_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid kitchen status" });
    }

    const existing = await repo.getOrderById(req.params.id, restaurant_id);
    if (!existing) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = await repo.updateOrderStatus(status, req.params.id, restaurant_id);
    const payload = {
      orderId: order.id,
      tableId: order.table_id,
      oldStatus: existing.status,
      newStatus: order.status,
      updatedAt: new Date().toISOString(),
    };

    emitToRestaurantAndTable(restaurant_id, order.table_id, "order.status_changed", payload);

    res.json(order);
  } catch (error) {
    next(error);
  }
}

export async function sendReceipt(req, res, next) {
  try {
    const restaurant_id = req.user?.restaurant_id;
    const { orderId, userEmail, itemTaxes } = req.body;

    if (!restaurant_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!orderId || !userEmail) {
      return res.status(400).json({ message: "orderId and userEmail are required in req.body" });
    }

    const order = await repo.getOrderById(orderId, restaurant_id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const items = await itemRepo.getItemsByOrder(orderId);
    const restaurant = await repo.getRestaurantById(restaurant_id);

    const receipt = buildReceiptWithItemTax({
      order,
      restaurantName: restaurant?.name,
      items,
      itemTaxes,
    });

    await sendReceiptEmail({
      toEmail: userEmail,
      restaurantName: receipt.restaurantName,
      receipt,
    });

    res.status(200).json({
      message: "Bill generated and emailed successfully",
      receipt,
    });
  } catch (error) {
    next(error);
  }
}