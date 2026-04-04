import { Pool } from "pg"
import dotenv from "dotenv"

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is missing in .env");
}

export const pool = new Pool({
    connectionString
})

const connectDB = async () => {
    await pool.query('SELECT 1');
    console.log('PostgreSQL connected');
};

export default connectDB;