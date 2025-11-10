import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema, insertReviewSchema, insertBarbershopSchema, insertUserSchema } from "@shared/schema";
import { sendTelegramNotification } from "./telegram.js";
import { authenticateUser, requireAdmin, requireBarber } from "./auth";
import type { User } from "@shared/schema";
import { ZodError } from "zod";

// Helper function: BigInt ni string ga o'zgartirish
function serializeUser(user: User) {
  return {
    ...user,
    telegramId: user.telegramId.toString(),
  };
}

function toStringArray(value: unknown): string[] | undefined {
  if (value == null) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item : String(item)))
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return undefined;
}

function sanitizeBarbershopPayload(body: unknown) {
  const source = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const sanitized: Record<string, unknown> = {};

  if (typeof source.name === "string") {
    const trimmed = source.name.trim();
    if (trimmed.length > 0) {
      sanitized.name = trimmed;
    }
  } else if (source.name !== undefined) {
    sanitized.name = source.name;
  }

  if (typeof source.address === "string") {
    const trimmed = source.address.trim();
    if (trimmed.length > 0) {
      sanitized.address = trimmed;
    }
  } else if (source.address !== undefined) {
    sanitized.address = source.address;
  }

  if (typeof source.phone === "string") {
    const trimmed = source.phone.trim();
    if (trimmed.length > 0) {
      sanitized.phone = trimmed;
    }
  } else if (source.phone !== undefined) {
    sanitized.phone = source.phone;
  }

  if (typeof source.description === "string") {
    const trimmed = source.description.trim();
    if (trimmed.length > 0) {
      sanitized.description = trimmed;
    }
  } else if (source.description === null) {
    sanitized.description = null;
  }

  const services = toStringArray(source.services);
  if (services !== undefined) {
    sanitized.services = services;
  }

  const images = toStringArray(source.images);
  if (images !== undefined) {
    sanitized.images = images;
  }

  if (
    source.rating !== undefined &&
    source.rating !== null &&
    !(typeof source.rating === "string" && source.rating.trim() === "")
  ) {
    const numericRating = Number(source.rating);
    sanitized.rating = Number.isNaN(numericRating) ? source.rating : numericRating;
  }

  if (typeof source.ownerId === "string") {
    const trimmed = source.ownerId.trim();
    if (trimmed.length > 0) {
      sanitized.ownerId = trimmed;
    }
  } else if (source.ownerId === null) {
    sanitized.ownerId = null;
  }

  return sanitized;
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
      console.log(`🔐 Auth request - Telegram ID: ${telegramId} (${typeof telegramId})`);
      
      // User borligini tekshirish
      let user = await storage.getUser(telegramIdBigInt);
      
      // Admin ID ni tekshirish
      const isAdmin = telegramId === "5928372261" || 
                      telegramId === 5928372261 || 
                      telegramIdBigInt === BigInt("5928372261");
      
      console.log(`👤 User found: ${!!user}, Is Admin ID: ${isAdmin}`);
      
        // Agar yo'q bo'lsa, yangi user yaratish
        if (!user) {
          console.log(`➕ Creating new user - Role: ${isAdmin ? "admin" : "customer"}`);
          user = await storage.createUser({
            telegramId: BigInt(telegramId),
            firstName,
            lastName,
            username,
            role: isAdmin ? "admin" : "customer",
            barbershopId: null,
          });
          console.log(`✅ User created - ID: ${user.id}, Role: ${user.role}`);
        } else {
          console.log(`👤 Existing user - ID: ${user.id}, Current Role: ${user.role}`);
          // Agar user bor bo'lsa va admin ID bo'lsa, admin qilish
          if (isAdmin && user.role !== "admin") {
            console.log(`🔄 Updating user role to admin`);
            const updatedUser = await storage.updateUserRole(user.id, "admin");
            if (!updatedUser) {
              throw new Error("Failed to update user role to admin");
            }
            user = updatedUser;
            console.log(`✅ User role updated to admin`);
          } else if (isAdmin) {
            console.log(`✅ User already has admin role`);
          }
        }

        if (!user) {
          throw new Error("User entity is undefined after processing");
        }

        console.log(`📤 Sending response - User role: ${user.role}`);
        res.json({ user: serializeUser(user) });
    } catch (error) {
      console.error("❌ Auth error:", error);
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
      const payload = sanitizeBarbershopPayload(req.body);
      const validatedData = insertBarbershopSchema.parse(payload);
      const barbershop = await storage.createBarbershop(validatedData);
      res.json(barbershop);
    } catch (error) {
      console.error("Create barbershop error:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Invalid barbershop data",
          details: error.flatten(),
        });
      }
      res.status(400).json({ error: "Invalid barbershop data" });
    }
  });

  // Admin: Sartaroshxonani yangilash
  app.put("/api/admin/barbershops/:id", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const payload = sanitizeBarbershopPayload(req.body);
      const validatedData = insertBarbershopSchema.partial().parse(payload);
      const barbershop = await storage.updateBarbershop(req.params.id, validatedData);
      if (!barbershop) {
        return res.status(404).json({ error: "Barbershop not found" });
      }
      res.json(barbershop);
    } catch (error) {
      console.error("Update barbershop error:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Invalid barbershop data",
          details: error.flatten(),
        });
      }
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
