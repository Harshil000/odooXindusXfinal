const express = require("express");
const cors = require("cors");

const app = express();

// =========================
// MIDDLEWARE
// =========================
app.use(cors());
app.use(express.json());

// =========================
// HEALTH CHECK
// =========================
app.get("/", (req, res) => {
  res.send("🚀 POS Backend Running");
});

// =========================
// ROUTES
// =========================

// Sessions
app.use("/api/sessions", require("./routes/session.routes"));

// Orders
app.use("/api/orders", require("./routes/order.routes"));

// Order Items
app.use("/api/order-items", require("./routes/orderItem.routes"));

// POS (FINAL BOSS API)
app.use("/api/pos", require("./routes/pos.routes"));

// Customers
app.use("/api/customers", require("./routes/customer.routes"));

// Products
app.use("/api/products", require("./routes/product.routes"));

// Categories
app.use("/api/categories", require("./routes/category.routes"));

// Floors
app.use("/api/floors", require("./routes/floor.routes"));

// =========================
// 404 HANDLER
// =========================
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// =========================
// GLOBAL ERROR HANDLER
// =========================
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err);

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

module.exports = app;