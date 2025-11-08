import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema, insertReviewSchema, insertBarbershopSchema, insertUserSchema } from "@shared/schema";
import { sendTelegramNotification } from "./telegram.js";
import { authenticateUser, requireAdmin, requireBarber, parseTelegramWebAppData } from "./auth";
import type { User } from "@shared/schema";

// Helper function: BigInt ni string ga o'zgartirish
function serializeUser(user: User) {
  return {
    ...user,
    telegramId: user.telegramId.toString(),
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ==================== AUTH ROUTES ====================
  
  // Telegram orqali kirish / ro'yxatdan o'tish
  app.post("/api/auth/telegram", async (req, res) => {
    try {
      const { telegramId, firstName, lastName, username } = req.body;
      
      if (!telegramId) {
        return res.status(400).json({ error: "Telegram ID required" });
      }

      // Telegram ID ni BigInt ga o'zgartirish
      const telegramIdBigInt = BigInt(telegramId);
      
      // User borligini tekshirish
      let user = await storage.getUser(telegramIdBigInt);
      
      // Admin ID ni tekshirish (barcha formatlarni qo'llab-quvvatlash)
      const adminId = "5928372261";
      const isAdmin = String(telegramId) === adminId || 
                     Number(telegramId) === Number(adminId) || 
                     telegramIdBigInt === BigInt(adminId);
      
      console.log(`[AUTH] Telegram ID: ${telegramId}, Admin check: ${isAdmin}`);
      
      // Agar yo'q bo'lsa, yangi user yaratish
      if (!user) {
        const role = isAdmin ? "admin" : "customer";
        console.log(`[AUTH] Creating new user with role: ${role}`);
        user = await storage.createUser({
          telegramId: BigInt(telegramId),
          firstName,
          lastName,
          username,
          role,
          barbershopId: null,
        });
      } else {
        // Agar user bor bo'lsa va admin ID bo'lsa, admin qilish
        if (isAdmin && user.role !== "admin") {
          console.log(`[AUTH] Updating user ${user.id} to admin role`);
          const updatedUser = await storage.updateUserRole(user.id, "admin");
          if (updatedUser) {
            user = updatedUser;
          }
        }
        console.log(`[AUTH] User found with role: ${user.role}`);
      }

      console.log(`[AUTH] Returning user with role: ${user.role}`);
      res.json({ user: serializeUser(user) });
    } catch (error) {
      console.error("Auth error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // Current user ma'lumotlari
  app.get("/api/auth/me", authenticateUser, async (req, res) => {
    const user = (req as any).user;
    res.json({ user: serializeUser(user) });
  });

  // ==================== ADMIN ROUTES ====================
  
  // Admin: Yangi sartaroshxona qo'shish
  app.post("/api/admin/barbershops", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const validatedData = insertBarbershopSchema.parse(req.body);
      const barbershop = await storage.createBarbershop(validatedData);
      res.json(barbershop);
    } catch (error) {
      console.error("Create barbershop error:", error);
      res.status(400).json({ error: "Invalid barbershop data" });
    }
  });

  // Admin: Sartaroshxonani yangilash
  app.put("/api/admin/barbershops/:id", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const barbershop = await storage.updateBarbershop(req.params.id, req.body);
      if (!barbershop) {
        return res.status(404).json({ error: "Barbershop not found" });
      }
      res.json(barbershop);
    } catch (error) {
      console.error("Update barbershop error:", error);
      res.status(500).json({ error: "Failed to update barbershop" });
    }
  });

  // Admin: Sartaroshxonani o'chirish
  app.delete("/api/admin/barbershops/:id", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteBarbershop(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Barbershop not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete barbershop error:", error);
      res.status(500).json({ error: "Failed to delete barbershop" });
    }
  });

  // Admin: User role ni o'zgartirish
  app.put("/api/admin/users/:id/role", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const { role, barbershopId } = req.body;
      const user = await storage.updateUserRole(req.params.id, role, barbershopId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(serializeUser(user));
    } catch (error) {
      console.error("Update user role error:", error);
      res.status(500).json({ error: "Failed to update user role" });
    }
  });

  // ==================== BARBER ROUTES ====================
  
  // Barber: O'z sartaroshxonasining bookinglarini ko'rish
  app.get("/api/barber/bookings", authenticateUser, requireBarber, async (req, res) => {
    try {
      const user = (req as any).user;
      
      // Agar barber bo'lsa, faqat o'z sartaroshxonasining bookinglarini ko'rsatish
      if (user.role === "barber" && user.barbershopId) {
        const bookings = await storage.getBookingsByBarbershop(user.barbershopId);
        return res.json(bookings);
      }
      
      // Admin bo'lsa, barcha bookinglarni ko'rsatish
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Get barber bookings error:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // ==================== PUBLIC ROUTES ====================

  // Get all barbershops
  app.get("/api/barbershops", async (_req, res) => {
    try {
      const barbershops = await storage.getBarbershops();
      res.json(barbershops);
    } catch (error) {
      console.error("Error fetching barbershops:", error);
      res.status(500).json({ error: "Failed to fetch barbershops" });
    }
  });

  // Get single barbershop
  app.get("/api/barbershops/:id", async (req, res) => {
    try {
      const barbershop = await storage.getBarbershop(req.params.id);
      if (!barbershop) {
        return res.status(404).json({ error: "Barbershop not found" });
      }
      res.json(barbershop);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch barbershop" });
    }
  });

  // Get reviews for a barbershop
  app.get("/api/barbershops/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByBarbershop(req.params.id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // Create a review
  app.post("/api/reviews", async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(validatedData);
      res.json(review);
    } catch (error) {
      res.status(400).json({ error: "Invalid review data" });
    }
  });

  // Get all bookings
  app.get("/api/bookings", async (_req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // Create a booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);
      
      // Send Telegram notification
      const barbershop = await storage.getBarbershop(booking.barbershopId);
      if (barbershop) {
        await sendTelegramNotification(booking, barbershop);
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Booking error:", error);
      res.status(400).json({ error: "Invalid booking data" });
    }
  });

  // Accept booking
  app.post("/api/bookings/:id/accept", async (req, res) => {
    try {
      const booking = await storage.updateBookingStatus(req.params.id, "accepted");
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to accept booking" });
    }
  });

  // Reject booking
  app.post("/api/bookings/:id/reject", async (req, res) => {
    try {
      const booking = await storage.updateBookingStatus(req.params.id, "rejected");
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject booking" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
