import * as repo from "../repository/session.repository.js";

// CREATE
export async function createSession(req, res, next) {
  try {
    const { opened_by } = req.body;
    const restaurant_id = req.user.restaurant_id;
    const session = await repo.createSession(restaurant_id, opened_by);
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
}

// GET ACTIVE
export async function getActiveSession(req, res, next) {
  try {
    const restaurant_id = req.user.restaurant_id;
    const session = await repo.getActiveSession(restaurant_id);
    res.json(session);
  } catch (error) {
    next(error);
  }
}

// CLOSE
export async function updateSession(req, res, next) {
  try {
    const session = await repo.closeSession(req.params.id);
    res.json(session);
  } catch (error) {
    next(error);
  }
}

// GET ALL
export async function getAllSessions(req, res, next) {
  try {
    const restaurant_id = req.user.restaurant_id;
    const sessions = await repo.getAllSessions(restaurant_id);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
}