import { neon } from "@neondatabase/serverless";
import "dotenv/config";

/**
 * Migration: Remove description column from barbershops table
 * Run: npx tsx scripts/remove-description-column.ts
 */
async function removeDescriptionColumn() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  console.log("🔧 Starting migration: Remove description column...");
  console.log("📊 Database:", databaseUrl.split("@")[1]?.split("/")[0] || "unknown");

  try {
    // Check if column exists first
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'barbershops' 
      AND column_name = 'description'
    `;

    if (checkColumn.length === 0) {
      console.log("ℹ️  Description column already removed or doesn't exist");
      return;
    }

    console.log("✅ Found description column, removing...");

    // Remove the column
    await sql`
      ALTER TABLE barbershops 
      DROP COLUMN IF EXISTS description
    `;

    console.log("✅ Successfully removed description column from barbershops table");

    // Verify removal
    const verify = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'barbershops'
    `;

    console.log("\n📋 Current barbershops table columns:");
    verify.forEach((col: any) => {
      console.log(`   - ${col.column_name}`);
    });

    console.log("\n🎉 Migration completed successfully!");
  } catch (error: any) {
    console.error("❌ Migration failed:", error.message);
    console.error("\nError details:", error);
    process.exit(1);
  }
}

removeDescriptionColumn();
