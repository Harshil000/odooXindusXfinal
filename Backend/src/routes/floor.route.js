import express from "express";
import * as ctrl from "../controller/floor.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, ctrl.createFloor);
router.get("/", ctrl.getFloors);
router.get("/:id", ctrl.getFloorById);
router.put("/:id", verifyToken, ctrl.updateFloor);
router.delete("/:id", verifyToken, ctrl.deleteFloor);

export default router;
