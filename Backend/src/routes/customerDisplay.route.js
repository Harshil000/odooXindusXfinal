import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import * as ctrl from "../controller/customerDisplay.controller.js";

const router = express.Router();

router.post("/token", verifyToken, ctrl.generateTrackToken);

export default router;
