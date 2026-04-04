import express from "express";
import * as ctrl from "../controller/product.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, ctrl.createProduct);
router.get("/", verifyToken, ctrl.getProducts);
router.put("/:id", verifyToken, ctrl.updateProduct);
router.delete("/:id", verifyToken, ctrl.deleteProduct);

export default router;
