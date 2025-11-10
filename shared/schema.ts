import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, real, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - Telegram foydalanuvchilari
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  telegramId: bigint("telegram_id", { mode: "bigint" }).notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  username: text("username"),
  role: text("role").notNull().default("customer"), // customer, barber, admin
  barbershopId: varchar("barbershop_id"), // faqat barber uchun
  createdAt: timestamp("created_at").defaultNow(),
});

export const barbershops = pgTable("barbershops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  rating: real("rating").notNull().default(0),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  services: text("services").array().notNull(),
  images: text("images").array().notNull(),
  reviewCount: integer("review_count").notNull().default(0),
  ownerId: varchar("owner_id").references(() => users.id), // sartaroshxona egasi
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  barbershopId: varchar("barbershop_id").notNull().references(() => barbershops.id),
  author: text("author").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  barbershopId: varchar("barbershop_id").notNull().references(() => barbershops.id),
  customerName: text("customer_name").notNull(),
  service: text("service").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertBarbershopSchema = createInsertSchema(barbershops, {
  description: z.string().trim().nullish(),
  rating: z
    .number()
    .min(0, "Rating 0 dan kichik bo'lishi mumkin emas")
    .max(5, "Rating 5 dan katta bo'lishi mumkin emas")
    .default(0),
}).omit({
  id: true,
  reviewCount: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  status: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBarbershop = z.infer<typeof insertBarbershopSchema>;
export type Barbershop = typeof barbershops.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

// Role type
export type UserRole = "customer" | "barber" | "admin";
