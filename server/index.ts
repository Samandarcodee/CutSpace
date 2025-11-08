import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeTelegramBot } from "./telegram";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  console.log("🚀 Starting server...");
  
  // Database migration va seed (agar database bor bo'lsa)
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.RENDER_DATABASE_URL;
  if (databaseUrl) {
    try {
      console.log("📦 Running database migrations...");
      const { neon } = await import("@neondatabase/serverless");
      const sql = neon(databaseUrl);
      
      // Migration - jadvallarni yaratish
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
      
      await sql`
        CREATE TABLE IF NOT EXISTS barbershops (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
          name TEXT NOT NULL,
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
      
      console.log("✅ Database tables created/verified");
      
      // ALTER TABLE - eski jadvalga yangi ustunlar qo'shish
      try {
        await sql`ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS phone TEXT`;
        await sql`ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS owner_id VARCHAR REFERENCES users(id)`;
        await sql`ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()`;
        console.log("✅ Barbershops table updated with phone, owner_id, created_at");
      } catch (e) {
        console.log("ℹ️ Columns already exist or error:", (e as any)?.message);
      }
      
      // Seed - admin user va demo data
      const adminCheck = await sql`SELECT * FROM users WHERE telegram_id = 5928372261 LIMIT 1`;
      if (adminCheck.length === 0) {
        await sql`
          INSERT INTO users (telegram_id, first_name, last_name, username, role)
          VALUES (5928372261, 'Admin', 'User', 'admin', 'admin')
          ON CONFLICT (telegram_id) DO NOTHING
        `;
        console.log("✅ Admin user created (ID: 5928372261)");
      }
      
      // Demo barbershops (agar yo'q bo'lsa)
      const shopsCheck = await sql`SELECT COUNT(*) as count FROM barbershops`;
      if (shopsCheck[0]?.count === 0) {
        console.log("📦 Seeding demo data...");
        // Seed script ni ishga tushirish
        const { exec } = await import("child_process");
        exec("npm run db:seed", (error) => {
          if (error) {
            console.warn("⚠️ Seed script failed, continuing anyway");
          }
        });
      }
    } catch (error: any) {
      console.warn("⚠️ Database migration/seed failed:", error?.message);
      console.warn("Continuing with existing data...");
    }
  }
  
  // Telegram Bot ni ishga tushirish
  initializeTelegramBot();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
