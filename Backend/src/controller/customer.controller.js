import * as repo from "../repository/customer.repository.js";

// CREATE CUSTOMER
export async function createCustomer(req, res, next) {
  try {
    const { name, email, phone } = req.body;
    const restaurant_id = req.user.restaurant_id;
    const customer = await repo.createCustomer(
      restaurant_id,
      name,
      email,
      phone,
    );
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
}

// GET ALL CUSTOMERS
export async function getCustomers(req, res, next) {
  try {
    const customers = await repo.getAllCustomers();
    res.json(customers);
  } catch (error) {
    next(error);
  }
}

// GET CUSTOMER BY ID
export async function getCustomerById(req, res, next) {
  try {
    const customer = await repo.getCustomerById(req.params.id);
    res.json(customer);
  } catch (error) {
    next(error);
  }
}

// UPDATE CUSTOMER
export async function updateCustomer(req, res, next) {
  try {
    const { name, email, phone } = req.body;
    const customer = await repo.updateCustomer(
      name,
      email,
      phone,
      req.params.id,
    );
    res.json(customer);
  } catch (error) {
    next(error);
  }
}

// DELETE CUSTOMER
export async function deleteCustomer(req, res, next) {
  try {
    await repo.deleteCustomer(req.params.id);
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    next(error);
  }
}
