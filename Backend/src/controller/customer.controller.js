const db = require("../config/db");
const Q = require("../queries/customer.query");

// CREATE CUSTOMER
exports.createCustomer = async (req, res) => {
  try {
    const { restaurant_id, name, email, phone } = req.body;

    const result = await db.query(Q.CREATE_CUSTOMER, [
      restaurant_id,
      name,
      email,
      phone,
    ]);

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create customer" });
  }
};

// GET ALL CUSTOMERS
exports.getCustomers = async (req, res) => {
  try {
    const result = await db.query(Q.GET_CUSTOMERS);
    res.json(result.rows);

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customers" });
  }
};

// GET CUSTOMER BY ID
exports.getCustomerById = async (req, res) => {
  try {
    const result = await db.query(Q.GET_CUSTOMER_BY_ID, [
      req.params.id,
    ]);

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customer" });
  }
};

// UPDATE CUSTOMER
exports.updateCustomer = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const result = await db.query(Q.UPDATE_CUSTOMER, [
      name,
      email,
      phone,
      req.params.id,
    ]);

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ error: "Failed to update customer" });
  }
};

// DELETE CUSTOMER
exports.deleteCustomer = async (req, res) => {
  try {
    await db.query(Q.DELETE_CUSTOMER, [req.params.id]);

    res.json({ message: "Customer deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: "Failed to delete customer" });
  }
};