import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import sessionRoute from "./routes/session.route.js";
import orderRoute from "./routes/order.route.js";
import orderItemRoute from "./routes/orderItem.route.js";
import customerRoute from "./routes/customer.route.js";
import categoryRoute from "./routes/category.route.js";
import floorRoute from "./routes/floor.route.js";
import authRoute from "./routes/auth.route.js";
import paymentRoute from "./payment/payment.route.js";
import { handleError } from "./middleware/error.middleware.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
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
