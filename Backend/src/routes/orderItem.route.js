const router = require("express").Router();
const ctrl = require("../controllers/orderItem.controller");

router.post("/", ctrl.createOrderItem);
router.get("/", ctrl.getOrderItems);
router.get("/order/:order_id", ctrl.getItemsByOrder);
router.put("/:id", ctrl.updateOrderItem);
router.delete("/:id", ctrl.deleteOrderItem);

module.exports = router;