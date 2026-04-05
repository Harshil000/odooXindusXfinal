import { signTrackToken, verifyTrackToken } from "../utils/trackToken.util.js";
import * as tableRepo from "../repository/table.repository.js";
import * as orderRepo from "../repository/order.repository.js";

const TRACK_STATUSES = ["to_cook", "preparing", "completed"];
const PUBLIC_TRACK_BASE_URL = process.env.PUBLIC_TRACK_BASE_URL || "http://localhost:5173";

export async function generateTrackToken(req, res, next) {
  try {
    const restaurant_id = req.user.restaurant_id;
    const { table_id, session_id } = req.body;

    if (!table_id) {
      return res.status(400).json({ message: "table_id is required" });
    }

    const table = await tableRepo.getTableById(table_id, restaurant_id);
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    const token = signTrackToken({
      restaurant_id,
      table_id,
      session_id: session_id || null,
      type: "table_track",
    });

    res.json({
      token,
      table,
      track_url: `${PUBLIC_TRACK_BASE_URL}/track/${token}`,
    });
  } catch (error) {
    next(error);
  }
}

export async function trackOrdersByToken(req, res, next) {
  try {
    const token = req.params.token;
    const payload = verifyTrackToken(token);

    if (payload?.type !== "table_track") {
      return res.status(400).json({ message: "Invalid track token type" });
    }

    const table = await tableRepo.getTableById(payload.table_id, payload.restaurant_id);
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    const orders = await orderRepo.getOrdersByTableForTracking(
      payload.restaurant_id,
      payload.table_id,
      payload.session_id,
      TRACK_STATUSES,
    );

    res.json({
      table,
      orders,
      socket_room: `table:${payload.table_id}`,
      restaurant_id: payload.restaurant_id,
      table_id: payload.table_id,
    });
  } catch (error) {
    if (error?.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Track link expired" });
    }

    if (error?.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid track link" });
    }

    next(error);
  }
}
