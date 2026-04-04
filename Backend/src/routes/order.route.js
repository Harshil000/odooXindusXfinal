const router = require("express").Router();
const ctrl = require("../controllers/order.controller");

router.post("/", ctrl.createOrder);
router.get("/", ctrl.getOrders);
router.put("/:id", ctrl.updateOrder);
router.delete("/:id", ctrl.deleteOrder);

module.exports = router;