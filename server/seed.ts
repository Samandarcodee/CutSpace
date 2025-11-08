import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { barbershops, reviews, users } from "@shared/schema";
import { getAdminIdBigIntList } from "./admin-config";

// Seed database with initial data
async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  console.log("🌱 Seeding database...");

  // Create admin user(s)
  const adminTelegramIds = getAdminIdBigIntList();
  if (adminTelegramIds.length === 0) {
    console.warn("⚠️ No admin Telegram IDs configured. Skipping admin seeding.");
  } else {
    for (const adminTelegramId of adminTelegramIds) {
      const existingAdmin = await db
        .select()
        .from(users)
        .where(eq(users.telegramId, adminTelegramId))
        .limit(1);

      if (existingAdmin.length === 0) {
        await db.insert(users).values({
          telegramId: adminTelegramId,
          firstName: "Admin",
          lastName: "User",
          username: "admin",
          role: "admin",
        });
        console.log(`✅ Created admin user (ID: ${adminTelegramId.toString()})`);
      } else {
        // Update existing user to admin
        await db
          .update(users)
          .set({ role: "admin" })
          .where(eq(users.telegramId, adminTelegramId));
        console.log(`✅ Updated user to admin (ID: ${adminTelegramId.toString()})`);
      }
    }
  }

  // Insert barbershops
  const insertedShops = await db
    .insert(barbershops)
    .values([
      {
        name: "Premium Barber Shop",
        rating: 4.8,
        address: "Amir Temur ko'chasi 15, Yunusobod tumani",
        services: ["Soch olish - 50,000 so'm", "Soqol qirish - 30,000 so'm", "Styling - 40,000 so'm"],
        images: ["/images/luxury.png", "/images/barber-work.png"],
        reviewCount: 3,
      },
      {
        name: "Classic Barber",
        rating: 4.6,
        address: "Mustaqillik ko'chasi 42, Mirobod tumani",
        services: ["Soch olish - 45,000 so'm", "Soqol qirish - 25,000 so'm"],
        images: ["/images/classic.png", "/images/modern-exterior.png"],
        reviewCount: 3,
      },
      {
        name: "Modern Style Barber",
        rating: 4.9,
        address: "Buyuk Ipak Yo'li 88, Shayxontohur tumani",
        services: ["Soch olish - 60,000 so'm", "Soqol qirish - 35,000 so'm", "Styling - 50,000 so'm"],
        images: ["/images/minimalist.png", "/images/tools.png"],
        reviewCount: 3,
      },
    ])
    .returning();

  console.log(`✅ Added ${insertedShops.length} barbershops`);

  // Insert reviews for each barbershop
  const reviewsData = [
    { 
      barbershopId: insertedShops[0].id, 
      author: "Akmal Rahimov", 
      rating: 5, 
      comment: "Juda zo'r xizmat! Sartaroshlar professional va do'stona.", 
      date: "3 kun oldin" 
    },
    { 
      barbershopId: insertedShops[0].id, 
      author: "Sardor Karimov", 
      rating: 4, 
      comment: "Yaxshi joy, sifatli ish. Narxlar ham qulay.", 
      date: "1 hafta oldin" 
    },
    { 
      barbershopId: insertedShops[0].id, 
      author: "Bobur Toshmatov", 
      rating: 5, 
      comment: "Eng yaxshi sartaroshxona! Doimo shu yerga kelaman.", 
      date: "2 hafta oldin" 
    },
    { 
      barbershopId: insertedShops[1].id, 
      author: "Javohir Alimov", 
      rating: 5, 
      comment: "Klassik uslub va yuqori sifat. Tavsiya qilaman!", 
      date: "5 kun oldin" 
    },
    { 
      barbershopId: insertedShops[1].id, 
      author: "Dilshod Ergashev", 
      rating: 4, 
      comment: "Yaxshi xizmat, lekin biroz kutishga to'g'ri keladi.", 
      date: "1 hafta oldin" 
    },
    { 
      barbershopId: insertedShops[1].id, 
      author: "Otabek Nazarov", 
      rating: 5, 
      comment: "Professional ustalar. Juda mamnunman!", 
      date: "3 hafta oldin" 
    },
    { 
      barbershopId: insertedShops[2].id, 
      author: "Farrux Karimov", 
      rating: 5, 
      comment: "Zamonaviy uslub va eng yaxshi xizmat. 100% tavsiya!", 
      date: "2 kun oldin" 
    },
    { 
      barbershopId: insertedShops[2].id, 
      author: "Aziz Mahmudov", 
      rating: 5, 
      comment: "Ustalar o'z ishini yaxshi biladilar. Rahmat!", 
      date: "1 hafta oldin" 
    },
    { 
      barbershopId: insertedShops[2].id, 
      author: "Sherzod Yunusov", 
      rating: 4, 
      comment: "Narx biroz yuqori, lekin sifat bunga arziydi.", 
      date: "2 hafta oldin" 
    },
  ];

  const insertedReviews = await db
    .insert(reviews)
    .values(reviewsData)
    .returning();

  console.log(`✅ Added ${insertedReviews.length} reviews`);
  console.log("🎉 Seed completed successfully!");
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});

