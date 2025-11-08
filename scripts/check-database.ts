import { neon } from "@neondatabase/serverless";
import "dotenv/config";

// Database health check script
async function checkDatabase() {
  console.log("🔍 Toshkent Sartarosh - Database Health Check");
  console.log("=============================================");
  console.log("");

  // Check environment variables
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.RENDER_DATABASE_URL;
  
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL o'rnatilmagan!");
    console.log("");
    console.log("📝 .env faylida DATABASE_URL ni o'rnating:");
    console.log("DATABASE_URL=postgresql://user:password@host/database?sslmode=require");
    console.log("");
    console.log("⚠️  OGOHLANTIRISH: Memory storage ishlatilmoqda!");
    console.log("   Bu faqat development uchun. Production'da real database kerak!");
    process.exit(1);
  }

  console.log("✅ DATABASE_URL topildi");
  console.log(`📦 Connection: ${databaseUrl.substring(0, 40)}...`);
  console.log("");

  try {
    const sql = neon(databaseUrl);

    // Test connection
    console.log("🔌 Database'ga ulanish tekshirilmoqda...");
    await sql`SELECT 1 as test`;
    console.log("✅ Database connection muvaffaqiyatli!");
    console.log("");

    // Check tables
    console.log("📋 Jadvallar tekshirilmoqda...");
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    if (tables.length === 0) {
      console.log("⚠️  Hech qanday jadval topilmadi!");
      console.log("💡 Migration'ni ishga tushiring: npm run db:migrate");
      console.log("");
    } else {
      console.log(`✅ ${tables.length} ta jadval topildi:`);
      tables.forEach((table: any) => {
        console.log(`   - ${table.table_name}`);
      });
      console.log("");
    }

    // Check data counts
    console.log("📊 Ma'lumotlar statistikasi:");
    
    try {
      const usersCount = await sql`SELECT COUNT(*) as count FROM users`;
      console.log(`   - Users: ${usersCount[0].count}`);

      const barbershopsCount = await sql`SELECT COUNT(*) as count FROM barbershops`;
      console.log(`   - Barbershops: ${barbershopsCount[0].count}`);

      const reviewsCount = await sql`SELECT COUNT(*) as count FROM reviews`;
      console.log(`   - Reviews: ${reviewsCount[0].count}`);

      const bookingsCount = await sql`SELECT COUNT(*) as count FROM bookings`;
      console.log(`   - Bookings: ${bookingsCount[0].count}`);
      console.log("");
    } catch (e) {
      console.log("   ⚠️  Ba'zi jadvallar mavjud emas");
      console.log("");
    }

    // Check admin user
    console.log("👑 Admin user tekshirilmoqda...");
    try {
      const adminCheck = await sql`
        SELECT id, telegram_id, first_name, role 
        FROM users 
        WHERE telegram_id = 5928372261 
        LIMIT 1
      `;

      if (adminCheck.length > 0) {
        console.log("✅ Admin user topildi:");
        console.log(`   - ID: ${adminCheck[0].id}`);
        console.log(`   - Telegram ID: ${adminCheck[0].telegram_id}`);
        console.log(`   - Name: ${adminCheck[0].first_name}`);
        console.log(`   - Role: ${adminCheck[0].role}`);
      } else {
        console.log("⚠️  Admin user topilmadi!");
        console.log("💡 Seed'ni ishga tushiring: npm run db:seed");
      }
      console.log("");
    } catch (e) {
      console.log("   ⚠️  Users jadvali mavjud emas");
      console.log("");
    }

    console.log("🎉 Health check yakunlandi!");
    console.log("");
    console.log("✅ Database to'liq sozlangan va ishga tayyor!");
    
  } catch (error: any) {
    console.error("❌ Database xatosi!");
    console.error("");
    console.error("Xato:", error?.message || error);
    console.error("");
    console.error("💡 Tekshirish kerak:");
    console.error("   1. DATABASE_URL to'g'ri formatda");
    console.error("   2. Database mavjud va active");
    console.error("   3. Internet aloqa ishlayapti");
    console.error("   4. Firewall/VPN muammolari yo'q");
    console.error("");
    process.exit(1);
  }
}

checkDatabase();
