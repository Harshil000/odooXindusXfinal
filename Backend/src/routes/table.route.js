import express from "express";
import * as ctrl from "../controller/table.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, ctrl.createTable);
router.get("/", verifyToken, ctrl.getTables);
router.get("/:id", verifyToken, ctrl.getTableById);
router.put("/:id", verifyToken, ctrl.updateTable);
router.patch("/:id/release", verifyToken, ctrl.releaseTable);
router.delete("/:id", verifyToken, ctrl.deleteTable);

export default router;
