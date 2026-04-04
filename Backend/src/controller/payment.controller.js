const db = require("../config/db");
const Q = require("../queries/payment.query");

// CREATE PAYMENT (initial - pending)
exports.createPayment = async (req, res) => {
  try {
    const { order_id, amount, payment_method, razorpay_order_id } = req.body;
    const restaurant_id = req.user.restaurant_id;

    const result = await db.query(Q.CREATE_PAYMENT, [
      restaurant_id,
      order_id,
      amount,
      payment_method,
      "pending",
      razorpay_order_id || null,
      null,
      null,
      null,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create payment" });
  }
};

// VERIFY + UPDATE PAYMENT (RAZORPAY)
exports.verifyPayment = async (req, res) => {
  try {
    const {
      payment_id, // our DB id
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const result = await db.query(Q.UPDATE_PAYMENT_STATUS, [
      "success",
      razorpay_payment_id,
      razorpay_signature,
      payment_id,
    ]);

    res.json({
      message: "Payment successful",
      payment: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: "Verification failed" });
  }
};

// GET ALL
exports.getPayments = async (req, res) => {
  const result = await db.query(Q.GET_PAYMENTS);
  res.json(result.rows);
};

// GET BY ORDER
exports.getPaymentByOrder = async (req, res) => {
  const result = await db.query(Q.GET_PAYMENT_BY_ORDER, [req.params.order_id]);
  res.json(result.rows);
};
