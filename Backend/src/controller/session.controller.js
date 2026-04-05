import * as repo from "../repository/session.repository.js";
import * as orderRepo from "../repository/order.repository.js";
import * as tableRepo from "../repository/table.repository.js";
import { findUserById } from "../repository/user.repository.js";

async function resolveRestaurantId(req) {
  if (req.user?.restaurant_id) {
    return req.user.restaurant_id;
  }

  const user = await findUserById(req.user.id);
  return user?.restaurant_id;
}

// CREATE
export async function createSession(req, res, next) {
  try {
    const restaurant_id = await resolveRestaurantId(req);
    if (!restaurant_id) {
      return res.status(400).json({ message: "Restaurant id missing for user" });
    }

    const session = await repo.createSession(restaurant_id, req.user.id);
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
}

// GET ACTIVE
export async function getActiveSession(req, res, next) {
  try {
    const restaurant_id = await resolveRestaurantId(req);
    if (!restaurant_id) {
      return res.status(400).json({ message: "Restaurant id missing for user" });
    }

    const session = await repo.getActiveSession(restaurant_id);
    res.json(session || null);
  } catch (error) {
    next(error);
  }
}

// CLOSE
export async function updateSession(req, res, next) {
  try {
    const restaurant_id = await resolveRestaurantId(req);
    if (!restaurant_id) {
      return res.status(400).json({ message: "Restaurant id missing for user" });
    }

    const unpaidCount = await orderRepo.countUnpaidOrdersBySession(restaurant_id, req.params.id);
    if (Number(unpaidCount) > 0) {
      return res.status(400).json({
        message: "Cannot close session while unpaid orders exist",
        unpaid_orders: Number(unpaidCount),
      });
    }

    const session = await repo.closeSession(req.params.id, restaurant_id);
    await tableRepo.releaseTablesBySession(restaurant_id, req.params.id);
    res.json(session);
  } catch (error) {
    next(error);
  }
}

// GET ALL
export async function getAllSessions(req, res, next) {
  try {
    const restaurant_id = await resolveRestaurantId(req);
    if (!restaurant_id) {
      return res.status(400).json({ message: "Restaurant id missing for user" });
    }

    const sessions = await repo.getAllSessions(restaurant_id);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
}