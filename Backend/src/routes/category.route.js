import express from "express";
import * as ctrl from "../controller/category.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, ctrl.createCategory);
router.get("/", verifyToken, ctrl.getCategories);
router.get("/:id", verifyToken, ctrl.getCategoryById);
router.put("/:id", verifyToken, ctrl.updateCategory);
router.delete("/:id", verifyToken, ctrl.deleteCategory);

export default router;
