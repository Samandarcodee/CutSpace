import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import type { User, UserRole } from "@shared/schema";
import crypto from "crypto";

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

// Telegram initData ni HMAC SHA-256 bilan validatsiya qilish
export function validateTelegramWebAppData(initData: string, botToken: string): boolean {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      console.error('❌ Hash not found in initData');
      return false;
    }
    
    // Hash ni olib tashlab, qolgan parametrlarni tartiblash
    urlParams.delete('hash');
    
    // Parametrlarni tartiblab data_check_string yaratish
    const dataCheckArray: string[] = [];
    for (const [key, value] of Array.from(urlParams.entries()).sort()) {
      dataCheckArray.push(`${key}=${value}`);
    }
    const dataCheckString = dataCheckArray.join('\n');
    
    // Bot token dan secret key yaratish
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    
    // Data check string dan hash yaratish
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    // Hisoblangan hash bilan kelgan hash ni solishtirish
    const isValid = calculatedHash === hash;
    
    if (!isValid) {
      console.error('❌ Telegram initData validation failed');
      console.error('Received hash:', hash);
      console.error('Calculated hash:', calculatedHash);
    }
    
    return isValid;
  } catch (error) {
    console.error('❌ Error validating Telegram data:', error);
    return false;
  }
}

// Auth timestamp ni tekshirish (1 soat ichida bo'lishi kerak)
export function checkAuthTimestamp(initData: string): boolean {
  try {
    const urlParams = new URLSearchParams(initData);
    const authDate = urlParams.get('auth_date');
    
    if (!authDate) {
      console.error('❌ auth_date not found in initData');
      return false;
    }
    
    const authTimestamp = parseInt(authDate, 10);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timeDiff = currentTimestamp - authTimestamp;
    
    // 1 soat = 3600 soniya
    const isValid = timeDiff < 3600;
    
    if (!isValid) {
      console.error('❌ Auth data is too old:', timeDiff, 'seconds');
    }
    
    return isValid;
  } catch (error) {
    console.error('❌ Error checking auth timestamp:', error);
    return false;
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

