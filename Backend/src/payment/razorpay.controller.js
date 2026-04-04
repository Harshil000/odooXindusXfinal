import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createPaymentRecord,
  updatePaymentStatus,
  getPaymentByOrderId,
  getPaymentByRazorpayId,
  getPaymentByRazorpayOrderId,
  fetchPaymentDetails,
  fetchOrderDetails,
  processRefund,
  getRefundsForPayment,
  fetchAllPayments,
} from "./razorpay.service.js";
import dotenv from "dotenv";
import * as orderRepo from "../repository/order.repository.js";
import * as tableRepo from "../repository/table.repository.js";
import { emitToRestaurant, emitToTable } from "../socket/socket.js";

dotenv.config();

async function settleOrderAndTable(restaurant_id, order_id) {
  if (!restaurant_id || !order_id) return null;

  const existingOrder = await orderRepo.getOrderById(order_id, restaurant_id);
  if (!existingOrder) return null;

  const paidOrder = await orderRepo.updateOrderStatus("paid", order_id, restaurant_id);

  if (paidOrder?.table_id) {
    const unpaidCount = await orderRepo.countUnpaidOrdersByTable(restaurant_id, paidOrder.table_id);
    if (Number(unpaidCount) === 0) {
      await tableRepo.updateTableStatus("available", paidOrder.table_id, restaurant_id);
    }
  }

  const payload = {
    orderId: paidOrder.id,
    tableId: paidOrder.table_id,
    oldStatus: existingOrder.status,
    newStatus: paidOrder.status,
    updatedAt: new Date().toISOString(),
  };
  emitToRestaurant(restaurant_id, "order.status_changed", payload);
  emitToTable(paidOrder.table_id, "order.status_changed", payload);

  return paidOrder;
}

// Create Payment Order
export const createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", order_id, restaurant_id } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid amount provided",
      });
    }

    // Create order in Razorpay
    const razorpayResult = await createRazorpayOrder(amount, currency);

    if (!razorpayResult.success) {
      return res.status(500).json(razorpayResult);
    }

    // Create payment record in database
    const paymentRecord = await createPaymentRecord(
      restaurant_id || 1, // Default restaurant ID
      order_id,
      amount,
      "razorpay",
      "pending",
      razorpayResult.data.id,
      null, // razorpay_payment_id will be set after payment
      null, // razorpay_signature will be set after verification
      null, // paid_at will be set after successful payment
    );

    if (!paymentRecord.success) {
      console.error("Failed to create payment record:", paymentRecord.error);
      return res.status(500).json({
        success: false,
        error: "Failed to create payment record",
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        razorpayOrder: razorpayResult.data,
        paymentRecord: paymentRecord.data,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("Error in createOrder controller:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to create order",
    });
  }
};

// Create Cash Payment
export const createCashPayment = async (req, res) => {
  try {
    const { amount, order_id } = req.body;
    const restaurant_id = req.user?.restaurant_id;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid amount provided",
      });
    }

    const paymentRecord = await createPaymentRecord(
      restaurant_id,
      order_id || null,
      amount,
      "cash",
      "completed",
      null,
      null,
      null,
      new Date(),
    );

    if (!paymentRecord.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to create cash payment record",
      });
    }

    if (order_id) {
      await settleOrderAndTable(restaurant_id, order_id);
    }

    return res.status(201).json({
      success: true,
      data: paymentRecord.data,
    });
  } catch (error) {
    console.error("Error in createCashPayment controller:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to create cash payment",
    });
  }
};

// Get payment history grouped by method
export const getPaymentHistory = async (req, res) => {
  try {
    const result = await fetchAllPayments();

    const payments = result.data.map((payment) => ({
      ...payment,
      payment_method:
        payment.payment_method === "razorpay"
          ? "netbanking"
          : payment.payment_method,
    }));

    const grouped = payments.reduce((acc, payment) => {
      const method = payment.payment_method || "unknown";
      acc[method] = acc[method] || [];
      acc[method].push(payment);
      return acc;
    }, {});

    const totals = Object.fromEntries(
      Object.entries(grouped).map(([method, list]) => [
        method,
        list.reduce((sum, payment) => sum + Number(payment.amount), 0),
      ]),
    );

    return res.status(200).json({
      success: true,
      data: {
        payments,
        grouped,
        totals,
      },
    });
  } catch (error) {
    console.error("Error in getPaymentHistory controller:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch payment history",
    });
  }
};

// Verify Payment
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId, orderId, signature } = req.body;

    if (!paymentId || !orderId || !signature) {
      return res.status(400).json({
        success: false,
        error: "Missing required payment verification details",
      });
    }

    // Verify payment signature
    const verificationResult = verifyRazorpayPayment(
      paymentId,
      orderId,
      signature,
      process.env.RAZORPAY_KEY_SECRET,
    );

    if (!verificationResult.success) {
      return res.status(400).json(verificationResult);
    }

    // Update payment status in database
    const updateResult = await updatePaymentStatus(
      "completed",
      signature,
      paymentId,
    );

    if (!updateResult.success) {
      console.error("Failed to update payment status in database");
      // Don't return error here as Razorpay verification succeeded
    }

    const restaurant_id = req.user?.restaurant_id;
    const paymentRecord = await getPaymentByRazorpayId(paymentId);
    if (paymentRecord?.success && paymentRecord?.data?.order_id && restaurant_id) {
      await settleOrderAndTable(restaurant_id, paymentRecord.data.order_id);
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and recorded successfully",
      verification: verificationResult,
      databaseUpdate: updateResult,
    });
  } catch (error) {
    console.error("Error in verifyPayment controller:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to verify payment",
    });
  }
};

// Get Payment Details from Razorpay
export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        error: "Payment ID is required",
      });
    }

    const result = await fetchPaymentDetails(paymentId);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error("Error in getPaymentDetails controller:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch payment details",
    });
  }
};

// Get Order Details from Razorpay
export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: "Order ID is required",
      });
    }

    const result = await fetchOrderDetails(orderId);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error("Error in getOrderDetails controller:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch order details",
    });
  }
};

// Get Payment Records from Database
export const getPaymentRecords = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: "Order ID is required",
      });
    }

    const result = await getPaymentByOrderId(orderId);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error("Error in getPaymentRecords controller:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch payment records",
    });
  }
};

// Get Payment by Razorpay Payment ID
export const getPaymentById = async (req, res) => {
  try {
    const { razorpayPaymentId } = req.params;

    if (!razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        error: "Razorpay Payment ID is required",
      });
    }

    const result = await getPaymentByRazorpayId(razorpayPaymentId);

    if (result.success && result.data) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json({
        success: false,
        error: "Payment record not found",
      });
    }
  } catch (error) {
    console.error("Error in getPaymentById controller:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch payment record",
    });
  }
};

// Process Refund
export const refundPayment = async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;

    if (!paymentId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid paymentId or amount",
      });
    }

    const result = await processRefund(paymentId, amount, reason);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error) {
    console.error("Error in refundPayment controller:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to process refund",
    });
  }
};

// Get Refunds for Payment
export const getRefunds = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        error: "Payment ID is required",
      });
    }

    const result = await getRefundsForPayment(paymentId);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error("Error in getRefunds controller:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch refunds",
    });
  }
};
