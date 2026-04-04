const router = require("express").Router();
const ctrl = require("../controllers/customer.controller");

// CREATE
router.post("/", ctrl.createCustomer);

// READ
router.get("/", ctrl.getCustomers);
router.get("/:id", ctrl.getCustomerById);

// UPDATE
router.put("/:id", ctrl.updateCustomer);

// DELETE
router.delete("/:id", ctrl.deleteCustomer);

module.exports = router;