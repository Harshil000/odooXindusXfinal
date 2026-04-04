import * as repo from "../repository/floor.repository.js";

// CREATE
export async function createFloor(req, res, next) {
  try {
    const { name } = req.body;
    const restaurant_id = req.user.restaurant_id;
    const floor = await repo.createFloor(restaurant_id, name);
    res.status(201).json(floor);
  } catch (error) {
    next(error);
  }
}

// GET ALL
export async function getFloors(req, res, next) {
  try {
    const floors = await repo.getAllFloors();
    res.json(floors);
  } catch (error) {
    next(error);
  }
}

// GET ONE
export async function getFloorById(req, res, next) {
  try {
    const floor = await repo.getFloorById(req.params.id);
    res.json(floor);
  } catch (error) {
    next(error);
  }
}

// UPDATE
export async function updateFloor(req, res, next) {
  try {
    const floor = await repo.updateFloor(req.body.name, req.params.id);
    res.json(floor);
  } catch (error) {
    next(error);
  }
}

// DELETE
export async function deleteFloor(req, res, next) {
  try {
    await repo.deleteFloor(req.params.id);
    res.json({ message: "Floor deleted successfully" });
  } catch (error) {
    next(error);
  }
}
