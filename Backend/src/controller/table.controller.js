import * as repo from "../repository/table.repository.js";
import * as orderRepo from "../repository/order.repository.js";

const VALID_STATUSES = ["available", "reserved", "occupied", "inactive"];

function normalizeStatus(status) {
  const nextStatus = String(status || "available").toLowerCase();
  return VALID_STATUSES.includes(nextStatus) ? nextStatus : "available";
}

// CREATE
export async function createTable(req, res, next) {
  try {
    const restaurant_id = req.user.restaurant_id;
    const { floor_id, table_number, seats, status } = req.body;

    const table = await repo.createTable(
      restaurant_id,
      floor_id,
      table_number,
      Number(seats),
      normalizeStatus(status),
    );
    res.status(201).json(table);
  } catch (error) {
    next(error);
  }
}

// GET ALL
export async function getTables(req, res, next) {
  try {
    const restaurant_id = req.user.restaurant_id;
    const { floor_id } = req.query;

    const tables = floor_id
      ? await repo.getTablesByFloor(restaurant_id, floor_id)
      : await repo.getAllTables(restaurant_id);

    res.json(tables);
  } catch (error) {
    next(error);
  }
}

// GET ONE
export async function getTableById(req, res, next) {
  try {
    const restaurant_id = req.user.restaurant_id;
    const table = await repo.getTableById(req.params.id, restaurant_id);
    res.json(table);
  } catch (error) {
    next(error);
  }
}

// UPDATE
export async function updateTable(req, res, next) {
  try {
    const restaurant_id = req.user.restaurant_id;
    const { floor_id, table_number, seats, status } = req.body;

    const table = await repo.updateTable(
      floor_id,
      table_number,
      Number(seats),
      normalizeStatus(status),
      req.params.id,
      restaurant_id,
    );

    res.json(table);
  } catch (error) {
    next(error);
  }
}

// DELETE
export async function deleteTable(req, res, next) {
  try {
    const restaurant_id = req.user.restaurant_id;
    await repo.deleteTable(req.params.id, restaurant_id);
    res.json({ message: "Table deleted successfully" });
  } catch (error) {
    next(error);
  }
}

// RELEASE (manual release when guests leave)
export async function releaseTable(req, res, next) {
  try {
    const restaurant_id = req.user.restaurant_id;
    const tableId = req.params.id;

    const unpaidCount = await orderRepo.countUnpaidOrdersByTable(restaurant_id, tableId);
    if (Number(unpaidCount) > 0) {
      return res.status(400).json({
        message: "Cannot release table with unpaid orders",
        unpaid_orders: Number(unpaidCount),
      });
    }

    const table = await repo.updateTableStatus("available", tableId, restaurant_id);
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    res.json(table);
  } catch (error) {
    next(error);
  }
}
