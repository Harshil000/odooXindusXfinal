import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing in .env");
}

export const pool = new Pool({
  connectionString,
});

const ensurePaymentSchema = async () => {
  await pool.query(`
        CREATE TABLE IF NOT EXISTS payments (
            id SERIAL PRIMARY KEY,
            restaurant_id UUID NOT NULL,
            order_id UUID,
            amount DECIMAL(10,2) NOT NULL,
            payment_method VARCHAR(50) NOT NULL,
            status VARCHAR(50) NOT NULL,
            razorpay_order_id VARCHAR(255),
            razorpay_payment_id VARCHAR(255),
            razorpay_signature TEXT,
            paid_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

  await pool.query(`
        CREATE TABLE IF NOT EXISTS refunds (
            id SERIAL PRIMARY KEY,
            payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
            razorpay_refund_id VARCHAR(255),
            amount DECIMAL(10,2) NOT NULL,
            reason TEXT,
            status VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
};

const ensureRestaurantLayoutSchema = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS floors (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (restaurant_id, name)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS restaurant_tables (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      floor_id UUID NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
      table_number VARCHAR(50) NOT NULL,
      seats INTEGER NOT NULL CHECK (seats > 0),
      status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'occupied', 'inactive')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (restaurant_id, floor_id, table_number)
    );
  `);

  // Repoint orders.table_id FK from legacy tables(id) to restaurant_tables(id).
  await pool.query(`
    ALTER TABLE IF EXISTS orders
    DROP CONSTRAINT IF EXISTS orders_table_id_fkey;
  `);

  await pool.query(`
    ALTER TABLE IF EXISTS orders
    ADD CONSTRAINT orders_table_id_fkey
    FOREIGN KEY (table_id)
    REFERENCES restaurant_tables(id);
  `);
};

const ensureCategorySchema = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      name VARCHAR(120) NOT NULL,
      color VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    ALTER TABLE IF EXISTS categories
    ADD COLUMN IF NOT EXISTS color VARCHAR(50) NOT NULL DEFAULT 'white';
  `);
};

const connectDB = async () => {
  await pool.query("SELECT 1");
  await ensureRestaurantLayoutSchema();
  await ensureCategorySchema();
  await ensurePaymentSchema();
  console.log("PostgreSQL connected");
};

export default connectDB;
