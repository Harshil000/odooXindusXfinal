import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import { createServer } from "http";
import { initializeSocket } from "./src/socket/socket.js";

const PORT = Number(process.env.PORT || 3000);

try {
    await connectDB();
    const httpServer = createServer(app);
    initializeSocket(httpServer);

    httpServer.listen(PORT, () => {
        console.log(`server is running on port ${PORT}`);
    });
} catch (err) {
    console.error(`Due to error: ${err.message}`);
    process.exit(1);
}