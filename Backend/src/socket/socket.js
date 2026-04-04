import { Server } from "socket.io";

let ioInstance;

export function initializeSocket(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
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
