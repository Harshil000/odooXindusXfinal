import razorpayInstance from "./razorpay.config.js";
import crypto from "crypto";
import {
  createPayment,
  getPaymentByOrder,
  getPaymentByRazorpayPaymentId,
  getPaymentByRazorpayOrderId as getPaymentByRazorpayOrderIdRepo,
  updatePaymentByRazorpayId,
  createRefund,
  getRefundsByPaymentId,
} from "../repository/payment.repository.js";

// Create Razorpay Order
export const createRazorpayOrder = async (amount, currency = "INR") => {
  try {
    const order = await razorpayInstance.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: `receipt_${Date.now()}`,
    });

    return {
      success: true,
      data: order,
    };
  } catch (error) {
    console.error("Error creating Razorpay order:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Verify Razorpay Payment
export const verifyRazorpayPayment = (
  paymentId,
  orderId,
  signature,
  keySecret,
) => {
  try {
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    const isSignatureValid = expectedSignature === signature;

    return {
      success: isSignatureValid,
      isSignatureValid,
      message: isSignatureValid
        ? "Payment verified successfully"
        : "Invalid payment signature",
    };
  } catch (error) {
    console.error("Error verifying payment:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Create Payment Record in Database
export const createPaymentRecord = async (
  restaurant_id,
  order_id,
  amount,
  payment_method,
  status,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  paid_at,
) => {
  try {
    const payment = await createPayment(
      restaurant_id,
      order_id,
      amount,
      payment_method,
      status,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paid_at,
    );

    return {
      success: true,
      data: payment,
    };
  } catch (error) {
    console.error("Error creating payment record:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Update Payment Status After Verification
export const updatePaymentStatus = async (
  status,
  razorpay_signature,
  razorpay_payment_id,
) => {
  try {
    const payment = await updatePaymentByRazorpayId(
      status,
      razorpay_signature,
      razorpay_payment_id,
    );

    return {
      success: true,
      data: payment,
    };
  } catch (error) {
    console.error("Error updating payment status:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get Payment by Order ID
export const getPaymentByOrderId = async (order_id) => {
  try {
    const payments = await getPaymentByOrder(order_id);

    return {
      success: true,
      data: payments,
    };
  } catch (error) {
    console.error("Error fetching payment by order ID:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get Payment by Razorpay Payment ID
export const getPaymentByRazorpayId = async (razorpay_payment_id) => {
  try {
    const payment = await getPaymentByRazorpayPaymentId(razorpay_payment_id);

    return {
      success: true,
      data: payment,
    };
  } catch (error) {
    console.error("Error fetching payment by Razorpay ID:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get Payment by Razorpay Order ID
export const getPaymentByRazorpayOrderId = async (razorpay_order_id) => {
  try {
    const payment = await getPaymentByRazorpayOrderIdRepo(razorpay_order_id);

    return {
      success: true,
      data: payment,
    };
  } catch (error) {
    console.error(
      "Error fetching payment by Razorpay order ID:",
      error.message,
    );
    return {
      success: false,
      error: error.message,
    };
  }
};

// Fetch Payment Details from Razorpay
export const fetchPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpayInstance.payments.fetch(paymentId);

    return {
      success: true,
      data: payment,
    };
  } catch (error) {
    console.error("Error fetching payment details:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Fetch Order Details from Razorpay
export const fetchOrderDetails = async (orderId) => {
  try {
    const order = await razorpayInstance.orders.fetch(orderId);

    return {
      success: true,
      data: order,
    };
  } catch (error) {
    console.error("Error fetching order details:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Process Refund
export const processRefund = async (
  paymentId,
  amount,
  reason = "Customer request",
) => {
  try {
    // First, create refund in Razorpay
    const refund = await razorpayInstance.payments.refund(paymentId, {
      amount: amount * 100, // Amount in paise
    });

    // Then, store refund record in database
    const refundRecord = await createRefund(
      null, // payment_id - we'll need to get this from payment record
      refund.id,
      amount,
      reason,
      refund.status,
    );

    return {
      success: true,
      data: {
        razorpayRefund: refund,
        databaseRecord: refundRecord,
      },
    };
  } catch (error) {
    console.error("Error processing refund:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get Refunds by Payment ID
export const getRefundsForPayment = async (payment_id) => {
  try {
    const refunds = await getRefundsByPaymentId(payment_id);

    return {
      success: true,
      data: refunds,
    };
  } catch (error) {
    console.error("Error fetching refunds:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};
