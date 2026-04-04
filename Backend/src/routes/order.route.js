import express from "express";
import * as ctrl from "../controller/order.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, ctrl.createOrder);
router.get("/", verifyToken, ctrl.getOrders);
router.get("/:id", verifyToken, ctrl.getOrderDetails);
router.put("/:id", verifyToken, ctrl.updateOrder);
router.delete("/:id", verifyToken, ctrl.deleteOrder);

export default router;
