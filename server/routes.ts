import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema, insertReviewSchema } from "@shared/schema";
import { sendTelegramNotification } from "./telegram.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all barbershops
  app.get("/api/barbershops", async (_req, res) => {
    try {
      const barbershops = await storage.getBarbershops();
      res.json(barbershops);
    } catch (error) {
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
