import express from "express";
import * as ctrl from "../controller/order.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/orders", verifyToken, ctrl.getKitchenOrders);
router.patch("/orders/:id/status", verifyToken, ctrl.updateKitchenOrderStatus);

export default router;
