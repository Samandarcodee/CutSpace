import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import type { User, UserRole } from "@shared/schema";

// Telegram Web App Data ni tekshirish
export function parseTelegramWebAppData(initData: string): any {
  try {
    const params = new URLSearchParams(initData);
    const userStr = params.get("user");
    if (!userStr) return null;
    
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Error parsing Telegram data:", error);
    return null;
  }
}

// Authentication middleware
export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const telegramId = req.headers["x-telegram-id"];
    
    if (!telegramId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = await storage.getUser(BigInt(telegramId as string));
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // User ni request ga qo'shamiz
    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
}

// Role check middleware
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as User | undefined;
    
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(user.role as UserRole)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
}

// Admin check
export const requireAdmin = requireRole("admin");

// Barber check  
export const requireBarber = requireRole("barber", "admin");

