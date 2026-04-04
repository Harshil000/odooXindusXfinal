import app from "./src/app.js";
import connectDB from "./src/config/database.js";

try {
    await connectDB();
    app.listen(3000 , () => {
        console.log("server is running on port 3000")
    })
} catch (err) {
    console.error(`Due to error: ${err.message}`);
    process.exit(1);
}