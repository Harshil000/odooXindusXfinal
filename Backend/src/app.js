import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoute from "./routes/auth.route.js";
import handleError from "./middleware/error.middleware.js";

dotenv.config();
export const app = express();

app.use(express.json())
app.use(cors({
    origin : "http://localhost:5173",
    credentials : true,
}))
app.use('/api/auth' , authRoute)

app.get("/" , (req , res) => {
    res.send("Hello");
})

app.use(handleError)
export default app;