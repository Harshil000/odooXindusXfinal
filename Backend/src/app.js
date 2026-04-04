import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import sessionRoute from "./routes/session.route.js";
import orderRoute from "./routes/order.route.js";
import orderItemRoute from "./routes/orderItem.route.js";
import customerRoute from "./routes/customer.route.js";
import categoryRoute from "./routes/category.route.js";
import floorRoute from "./routes/floor.route.js";
import tableRoute from "./routes/table.route.js";
import productRoute from "./routes/product.route.js";
import kitchenRoute from "./routes/kitchen.route.js";
import authRoute from "./routes/auth.route.js";
import customerDisplayRoute from "./routes/customerDisplay.route.js";
import publicRoute from "./routes/public.route.js";
import paymentRoute from "./payment/payment.route.js";
import { handleError } from "./middleware/error.middleware.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }),
);
// =========================
// HEALTH CHECK
// =========================
app.get("/", (req, res) => {
  res.send("🚀 POS Backend Running");
});

// =========================
// ROUTES
// =========================

// Authentication
app.use("/api/auth", authRoute);

// Sessions
app.use("/api/sessions", sessionRoute);

// Orders
app.use("/api/orders", orderRoute);

// Order Items
app.use("/api/order-items", orderItemRoute);

// Customers
app.use("/api/customers", customerRoute);

// Categories
app.use("/api/categories", categoryRoute);

// Floors
app.use("/api/floors", floorRoute);

// Tables
app.use("/api/tables", tableRoute);

// Products
app.use("/api/products", productRoute);

// Kitchen
app.use("/api/kitchen", kitchenRoute);

// Customer Display (staff-side helpers like token generation)
app.use("/api/customer-display", customerDisplayRoute);

// Public tracking endpoints
app.use("/api/public", publicRoute);

// Payments
app.use("/api/payments", paymentRoute);
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
app.use(handleError);

export default app;
