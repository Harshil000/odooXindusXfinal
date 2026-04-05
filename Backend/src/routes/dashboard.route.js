import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import * as dashboardController from "../controller/dashboard.controller.js";

const router = express.Router();

router.get("/categories/orders", verifyToken, dashboardController.getCategoryOrderAnalytics);
router.get("/overview", verifyToken, dashboardController.getDashboardOverview);

export default router;
