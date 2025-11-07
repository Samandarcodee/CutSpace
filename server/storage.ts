import {
  type Barbershop,
  type InsertBarbershop,
  type Review,
  type InsertReview,
  type Booking,
  type InsertBooking,
  type User,
  type InsertUser,
  barbershops,
  reviews,
  bookings,
  users,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(telegramId: bigint): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRole(id: string, role: string, barbershopId?: string): Promise<User | undefined>;
  
  // Barbershops
  getBarbershops(): Promise<Barbershop[]>;
  getBarbershop(id: string): Promise<Barbershop | undefined>;
  createBarbershop(barbershop: InsertBarbershop): Promise<Barbershop>;
  updateBarbershop(id: string, data: Partial<InsertBarbershop>): Promise<Barbershop | undefined>;
  deleteBarbershop(id: string): Promise<boolean>;

  // Reviews
  getReviewsByBarbershop(barbershopId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Bookings
  getBookings(): Promise<Booking[]>;
  getBookingsByBarbershop(barbershopId: string): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private barbershops: Map<string, Barbershop>;
  private reviews: Map<string, Review>;
  private bookings: Map<string, Booking>;

  constructor() {
    this.users = new Map();
    this.barbershops = new Map();
    this.reviews = new Map();
    this.bookings = new Map();
    this.seedData();
  }

  private seedData() {
    // Demo barbershops
    const shop1: Barbershop = {
      id: "1",
      name: "Premium Barber Shop",
      rating: 4.8,
      address: "Amir Temur ko'chasi 15, Yunusobod tumani",
      phone: "+998 90 123 45 67",
      services: ["Soch olish - 50,000 so'm", "Soqol qirish - 30,000 so'm", "Styling - 40,000 so'm"],
      images: ["/images/luxury.png", "/images/barber-work.png"],
      reviewCount: 3,
      ownerId: null,
      createdAt: new Date(),
    };

    const shop2: Barbershop = {
      id: "2",
      name: "Classic Barber",
      rating: 4.6,
      address: "Mustaqillik ko'chasi 42, Mirobod tumani",
      phone: "+998 90 234 56 78",
      services: ["Soch olish - 45,000 so'm", "Soqol qirish - 25,000 so'm"],
      images: ["/images/classic.png", "/images/modern-exterior.png"],
      reviewCount: 3,
      ownerId: null,
      createdAt: new Date(),
    };

    const shop3: Barbershop = {
      id: "3",
      name: "Modern Style Barber",
      rating: 4.9,
      address: "Buyuk Ipak Yo'li 88, Shayxontohur tumani",
      phone: "+998 90 345 67 89",
      services: ["Soch olish - 60,000 so'm", "Soqol qirish - 35,000 so'm", "Styling - 50,000 so'm"],
      images: ["/images/minimalist.png", "/images/tools.png"],
      reviewCount: 3,
      ownerId: null,
      createdAt: new Date(),
    };

    this.barbershops.set("1", shop1);
    this.barbershops.set("2", shop2);
    this.barbershops.set("3", shop3);

    // Demo reviews
    const reviewsData = [
      { barbershopId: "1", author: "Akmal Rahimov", rating: 5, comment: "Juda zo'r xizmat! Sartaroshlar professional va do'stona.", date: "3 kun oldin" },
      { barbershopId: "1", author: "Sardor Karimov", rating: 4, comment: "Yaxshi joy, sifatli ish. Narxlar ham qulay.", date: "1 hafta oldin" },
      { barbershopId: "1", author: "Bobur Toshmatov", rating: 5, comment: "Eng yaxshi sartaroshxona! Doimo shu yerga kelaman.", date: "2 hafta oldin" },
      { barbershopId: "2", author: "Javohir Alimov", rating: 5, comment: "Klassik uslub va yuqori sifat. Tavsiya qilaman!", date: "5 kun oldin" },
      { barbershopId: "2", author: "Dilshod Ergashev", rating: 4, comment: "Yaxshi xizmat, lekin biroz kutishga to'g'ri keladi.", date: "1 hafta oldin" },
      { barbershopId: "2", author: "Otabek Nazarov", rating: 5, comment: "Professional ustalar. Juda mamnunman!", date: "3 hafta oldin" },
      { barbershopId: "3", author: "Farrux Karimov", rating: 5, comment: "Zamonaviy uslub va eng yaxshi xizmat. 100% tavsiya!", date: "2 kun oldin" },
      { barbershopId: "3", author: "Aziz Mahmudov", rating: 5, comment: "Ustalar o'z ishini yaxshi biladilar. Rahmat!", date: "1 hafta oldin" },
      { barbershopId: "3", author: "Sherzod Yunusov", rating: 4, comment: "Narx biroz yuqori, lekin sifat bunga arziydi.", date: "2 hafta oldin" },
    ];

    reviewsData.forEach((r) => {
      const id = randomUUID();
      this.reviews.set(id, { id, ...r, createdAt: new Date() });
    });
  }

  // Users methods
  async getUser(telegramId: bigint): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.telegramId === telegramId);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = randomUUID();
    const newUser: User = { id, ...user, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUserRole(id: string, role: string, barbershopId?: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      user.role = role;
      if (barbershopId) user.barbershopId = barbershopId;
      this.users.set(id, user);
    }
    return user;
  }

  // Barbershops methods
  async getBarbershops(): Promise<Barbershop[]> {
    return Array.from(this.barbershops.values());
  }

  async getBarbershop(id: string): Promise<Barbershop | undefined> {
    return this.barbershops.get(id);
  }

  async createBarbershop(barbershop: InsertBarbershop): Promise<Barbershop> {
    const id = randomUUID();
    const newShop: Barbershop = { 
      ...barbershop, 
      id, 
      rating: barbershop.rating || 0, 
      reviewCount: 0,
      createdAt: new Date()
    };
    this.barbershops.set(id, newShop);
    return newShop;
  }

  async updateBarbershop(id: string, data: Partial<InsertBarbershop>): Promise<Barbershop | undefined> {
    const shop = this.barbershops.get(id);
    if (shop) {
      const updated = { ...shop, ...data };
      this.barbershops.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteBarbershop(id: string): Promise<boolean> {
    return this.barbershops.delete(id);
  }

  async getReviewsByBarbershop(barbershopId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (r) => r.barbershopId === barbershopId
    );
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = randomUUID();
    const newReview: Review = { id, ...review, createdAt: new Date() };
    this.reviews.set(id, newReview);

    // Update review count
    const shop = this.barbershops.get(review.barbershopId);
    if (shop) {
      shop.reviewCount += 1;
      // Recalculate average rating
      const reviews = await this.getReviewsByBarbershop(review.barbershopId);
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      shop.rating = Math.round(avgRating * 10) / 10;
    }

    return newReview;
  }

  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBookingsByBarbershop(barbershopId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (b) => b.barbershopId === barbershopId
    );
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const newBooking: Booking = { id, ...booking, status: "pending", createdAt: new Date() };
    this.bookings.set(id, newBooking);
    return newBooking;
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (booking) {
      booking.status = status;
      this.bookings.set(id, booking);
    }
    return booking;
  }
}

// PostgreSQL Storage with Drizzle ORM
export class DbStorage implements IStorage {
  private db;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.error("DATABASE_URL environment variable is not set");
      throw new Error("DATABASE_URL not set");
    }

    const sql = neon(databaseUrl);
    this.db = drizzle(sql);
    console.log("✅ Database connection initialized");
  }

  // Users methods
  async getUser(telegramId: bigint): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.telegramId, telegramId));
    return result[0];
  }

  async getUserById(id: string): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db
      .insert(users)
      .values(user)
      .returning();
    return result[0];
  }

  async updateUserRole(id: string, role: string, barbershopId?: string): Promise<User | undefined> {
    const updateData: any = { role };
    if (barbershopId) updateData.barbershopId = barbershopId;
    
    const result = await this.db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  // Barbershops methods
  async getBarbershops(): Promise<Barbershop[]> {
    return await this.db.select().from(barbershops);
  }

  async getBarbershop(id: string): Promise<Barbershop | undefined> {
    const result = await this.db
      .select()
      .from(barbershops)
      .where(eq(barbershops.id, id));
    return result[0];
  }

  async createBarbershop(barbershop: InsertBarbershop): Promise<Barbershop> {
    const result = await this.db
      .insert(barbershops)
      .values(barbershop)
      .returning();
    return result[0];
  }

  async updateBarbershop(id: string, data: Partial<InsertBarbershop>): Promise<Barbershop | undefined> {
    const result = await this.db
      .update(barbershops)
      .set(data)
      .where(eq(barbershops.id, id))
      .returning();
    return result[0];
  }

  async deleteBarbershop(id: string): Promise<boolean> {
    const result = await this.db
      .delete(barbershops)
      .where(eq(barbershops.id, id))
      .returning();
    return result.length > 0;
  }

  async getReviewsByBarbershop(barbershopId: string): Promise<Review[]> {
    return await this.db
      .select()
      .from(reviews)
      .where(eq(reviews.barbershopId, barbershopId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const result = await this.db
      .insert(reviews)
      .values(review)
      .returning();

    // Update review count and average rating
    const shop = await this.getBarbershop(review.barbershopId);
    if (shop) {
      const allReviews = await this.getReviewsByBarbershop(review.barbershopId);
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      
      await this.db
        .update(barbershops)
        .set({
          reviewCount: allReviews.length,
          rating: Math.round(avgRating * 10) / 10,
        })
        .where(eq(barbershops.id, review.barbershopId));
    }

    return result[0];
  }

  async getBookings(): Promise<Booking[]> {
    return await this.db
      .select()
      .from(bookings)
      .orderBy(desc(bookings.createdAt));
  }

  async getBookingsByBarbershop(barbershopId: string): Promise<Booking[]> {
    return await this.db
      .select()
      .from(bookings)
      .where(eq(bookings.barbershopId, barbershopId))
      .orderBy(desc(bookings.createdAt));
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const result = await this.db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id));
    return result[0];
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const result = await this.db
      .insert(bookings)
      .values(booking)
      .returning();
    return result[0];
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const result = await this.db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return result[0];
  }
}

// Initialize storage - try database first, fall back to in-memory
function initializeStorage(): IStorage {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.RENDER_DATABASE_URL;
  
  if (databaseUrl) {
    try {
      console.log("📦 Attempting to connect to database...");
      console.log(`📦 Database URL: ${databaseUrl.substring(0, 20)}...`);
      const dbStorage = new DbStorage();
      console.log("✅ Connected to PostgreSQL database!");
      return dbStorage;
    } catch (error: any) {
      console.warn("⚠️ Database connection failed, using in-memory storage");
      console.warn("Error:", error?.message || error);
      return new MemStorage();
    }
  }
  
  console.log("📦 Using in-memory storage (demo mode)");
  console.log("⚠️ DATABASE_URL not set - using demo data");
  return new MemStorage();
}

export const storage = initializeStorage();
