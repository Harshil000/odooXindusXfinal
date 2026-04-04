import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import { createServer } from "http";
import { initializeSocket } from "./src/socket/socket.js";

try {
    await connectDB();
    const httpServer = createServer(app);
    initializeSocket(httpServer);

    httpServer.listen(3000, () => {
        console.log("server is running on port 3000");
    });
} catch (err) {
    console.error(`Due to error: ${err.message}`);
    process.exit(1);
}