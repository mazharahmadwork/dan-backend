import "dotenv/config";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

const pool = new Pool(
  connectionString
    ? {
        connectionString,
        // ssl: { rejectUnauthorized: false },
        ssl: true,
      }
    : {
        host: "localhost",
        port: 5432,
        user: "postgres",
        password: "Mazhar@123",
        database: "danDB",
      }
);

// Test connection on startup
pool.connect()
  .then((client) => {
    console.log('✅ Database connected successfully!');
    client.release();
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err.message);
    console.error('Full error:', err);
  });

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
