import { Server } from "socket.io";

let ioInstance;

const configuredOrigins = String(process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (configuredOrigins.length === 0) return true;
  if (configuredOrigins.includes(origin)) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return true;
  if (/^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/i.test(origin)) return true;
  return false;
};

export function initializeSocket(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    },
  });

  ioInstance.on("connection", (socket) => {
    socket.on("join.restaurant", ({ restaurantId } = {}) => {
      if (!restaurantId) return;
      socket.join(`restaurant:${restaurantId}`);
    });

    socket.on("join.table", ({ tableId } = {}) => {
      if (!tableId) return;
      socket.join(`table:${tableId}`);
    });
  });

  return ioInstance;
}

export function emitToRestaurant(restaurantId, eventName, payload) {
  if (!ioInstance || !restaurantId) return;
  ioInstance.to(`restaurant:${restaurantId}`).emit(eventName, payload);
}

export function emitToTable(tableId, eventName, payload) {
  if (!ioInstance || !tableId) return;
  ioInstance.to(`table:${tableId}`).emit(eventName, payload);
}

export function emitToRestaurantAndTable(restaurantId, tableId, eventName, payload) {
  if (!ioInstance || !restaurantId) return;

  const target = ioInstance.to(`restaurant:${restaurantId}`);
  if (tableId) {
    target.to(`table:${tableId}`);
  }

  target.emit(eventName, payload);
}
