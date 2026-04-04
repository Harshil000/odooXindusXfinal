import express from "express";
import * as ctrl from "../controller/orderItem.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, ctrl.createOrderItem);
router.get("/", verifyToken, ctrl.getOrderItems);
router.get("/order/:order_id", verifyToken, ctrl.getItemsByOrder);
router.put("/:id", verifyToken, ctrl.updateOrderItem);
router.delete("/:id", verifyToken, ctrl.deleteOrderItem);

export default router;
