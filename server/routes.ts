import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema, insertReviewSchema, insertBarbershopSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
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

const normalizeStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeOptionalString = (value: unknown): string | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  return undefined;
};

const normalizeRequiredString = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  return undefined;
};

const normalizeRating = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const parsed = typeof value === "number" ? value : Number(value);

  if (Number.isFinite(parsed)) {
    return parsed;
  }

  return undefined;
};

const barbershopRequestSchema = insertBarbershopSchema.extend({
  name: z.string({ required_error: "Name is required" }),
  address: z.string({ required_error: "Address is required" }),
  phone: z.string({ required_error: "Phone is required" }),
  services: z.array(
    z.string().trim(),
    {
      invalid_type_error: "Services must be an array of strings",
    },
  ),
  images: z.array(
    z.string().trim(),
    {
      invalid_type_error: "Images must be an array of strings",
    },
  ),
  rating: z
    .number()
    .min(0, "Rating cannot be negative")
    .max(5, "Rating must be 5 or less")
    .optional(),
  ownerId: z.string().trim().min(1, "Owner id cannot be empty").optional().nullable(),
});

const DEFAULT_BARBERSHOP_NAME = "Nomlanmagan sartaroshxona";
const DEFAULT_BARBERSHOP_ADDRESS = "Manzil ko'rsatilmagan";
const DEFAULT_BARBERSHOP_PHONE = "Telefon raqami ko'rsatilmagan";

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
      const contentType = req.headers["content-type"] || "unknown";
      console.log("📥 Incoming barbershop payload Content-Type:", contentType);
      console.log("📥 Incoming barbershop payload body:", req.body);

      if (!req.is("application/json")) {
        return res.status(415).json({
          error: "Unsupported Content-Type",
          details: `Expected application/json but received ${contentType}`,
        });
      }

      try {
        const normalizedPayload = {
          name: normalizeRequiredString((req.body as any)?.name),
          address: normalizeRequiredString((req.body as any)?.address),
          phone: normalizeRequiredString((req.body as any)?.phone),
          services: normalizeStringArray((req.body as any)?.services),
          images: normalizeStringArray((req.body as any)?.images),
          ownerId: normalizeOptionalString((req.body as any)?.ownerId) ?? null,
          rating: normalizeRating((req.body as any)?.rating),
        };

        const preparedPayload = {
          name: normalizedPayload.name ?? DEFAULT_BARBERSHOP_NAME,
          address: normalizedPayload.address ?? DEFAULT_BARBERSHOP_ADDRESS,
          phone: normalizedPayload.phone ?? DEFAULT_BARBERSHOP_PHONE,
          services: normalizedPayload.services.length > 0 ? normalizedPayload.services : [],
          images: normalizedPayload.images.length > 0 ? normalizedPayload.images : [],
          ownerId: normalizedPayload.ownerId,
          rating: normalizedPayload.rating,
        };

        console.log("✅ Normalized barbershop payload:", preparedPayload);

        const validationResult = barbershopRequestSchema.safeParse(preparedPayload);

        if (!validationResult.success) {
          const formattedErrors = validationResult.error.issues.map((issue) => ({
            path: issue.path.join(".") || undefined,
            message: issue.message,
          }));

          console.error("❌ Create barbershop validation error:", formattedErrors);

          return res.status(400).json({
            error: "Invalid barbershop data",
            details: formattedErrors,
          });
        }

        const barbershop = await storage.createBarbershop({
          ...validationResult.data,
          rating: validationResult.data.rating ?? 0,
        });
        return res.status(201).json(barbershop);
      } catch (error) {
        console.error("Create barbershop error:", error);
        return res.status(500).json({
          error: "Failed to create barbershop",
          details: error instanceof Error ? error.message : String(error),
        });
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
