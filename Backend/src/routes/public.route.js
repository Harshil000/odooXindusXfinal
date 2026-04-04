import express from "express";
import * as ctrl from "../controller/customerDisplay.controller.js";

const router = express.Router();

router.get("/track/:token", ctrl.trackOrdersByToken);

export default router;
