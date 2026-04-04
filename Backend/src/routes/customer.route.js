import express from "express";
import * as ctrl from "../controller/customer.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// CREATE
router.post("/", verifyToken, ctrl.createCustomer);

// READ
router.get("/", verifyToken, ctrl.getCustomers);
router.get("/:id", verifyToken, ctrl.getCustomerById);

// UPDATE
router.put("/:id", verifyToken, ctrl.updateCustomer);

// DELETE
router.delete("/:id", verifyToken, ctrl.deleteCustomer);

export default router;
