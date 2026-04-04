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
} from "./razorpay.service.js";
import dotenv from "dotenv";

dotenv.config();

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
