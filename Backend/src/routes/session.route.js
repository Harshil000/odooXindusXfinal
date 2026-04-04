import express from "express";
import * as ctrl from "../controller/session.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, ctrl.createSession);
router.get("/active", verifyToken, ctrl.getActiveSession);
router.put("/:id", verifyToken, ctrl.updateSession);
router.get("/", verifyToken, ctrl.getAllSessions);

export default router;