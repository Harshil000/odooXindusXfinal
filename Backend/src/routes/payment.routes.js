const router = require("express").Router();
const ctrl = require("../controllers/payment.controller");

// CREATE (pending)
router.post("/", ctrl.createPayment);

// VERIFY (success)
router.post("/verify", ctrl.verifyPayment);

// GET
router.get("/", ctrl.getPayments);
router.get("/order/:order_id", ctrl.getPaymentByOrder);

module.exports = router;