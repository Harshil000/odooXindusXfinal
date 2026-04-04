import express from "express";
import {
  createCashPayment,
  createOrder,
  verifyPayment,
  getPaymentHistory,
  getPaymentDetails,
  getOrderDetails,
  getPaymentRecords,
  getPaymentById,
  refundPayment,
  getRefunds,
} from "./razorpay.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get payment history grouped by method
router.get("/history", verifyToken, getPaymentHistory);

// Create a new cash payment record
router.post("/cash", verifyToken, createCashPayment);

// Create a new Razorpay order
router.post("/order", verifyToken, createOrder);

// Verify payment after client-side capture
router.post("/verify", verifyToken, verifyPayment);

// Get payment details from Razorpay by payment ID
router.get("/payment/:paymentId", verifyToken, getPaymentDetails);

// Get order details from Razorpay by order ID
router.get("/order/:orderId", verifyToken, getOrderDetails);

// Get payment records from database by order ID
router.get("/records/order/:orderId", verifyToken, getPaymentRecords);

// Get payment record from database by Razorpay payment ID
router.get("/records/payment/:razorpayPaymentId", verifyToken, getPaymentById);

// Process refund for a payment
router.post("/refund", verifyToken, refundPayment);

// Get refunds for a payment
router.get("/refunds/:paymentId", verifyToken, getRefunds);

export default router;
