import { neon } from "@neondatabase/serverless";
import "dotenv/config";

// Create database tables manually
async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  console.log("🔧 Creating database tables...");

  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        telegram_id BIGINT NOT NULL UNIQUE,
        first_name TEXT,
        last_name TEXT,
        username TEXT,
        role TEXT NOT NULL DEFAULT 'customer',
        barbershop_id VARCHAR,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log("✅ Created users table");

    // Create barbershops table
    await sql`
        CREATE TABLE IF NOT EXISTS barbershops (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
          name TEXT NOT NULL,
          description TEXT,
          rating REAL NOT NULL DEFAULT 0,
          address TEXT NOT NULL,
          phone TEXT NOT NULL,
          services TEXT[] NOT NULL,
          images TEXT[] NOT NULL,
          review_count INTEGER NOT NULL DEFAULT 0,
          owner_id VARCHAR REFERENCES users(id),
          created_at TIMESTAMP DEFAULT NOW()
        )
    `;
    console.log("✅ Created barbershops table");

    // Create reviews table
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        barbershop_id VARCHAR NOT NULL REFERENCES barbershops(id),
        author TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log("✅ Created reviews table");

    // Create bookings table
    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        barbershop_id VARCHAR NOT NULL REFERENCES barbershops(id),
        customer_name TEXT NOT NULL,
        service TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log("✅ Created bookings table");

    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();

