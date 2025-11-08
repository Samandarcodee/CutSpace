import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getTelegramWebApp, getTelegramWebAppUser, TelegramWebAppUser } from "@/lib/telegram";

interface BackendUser {
  id: string;
  telegramId: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  role: "customer" | "barber" | "admin";
  barbershopId?: string;
}

interface TelegramContextType {
  user: TelegramUser | null;
  backendUser: BackendUser | null;
  webApp: any;
  isReady: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
}

const TelegramContext = createContext<TelegramContextType>({
  user: null,
  backendUser: null,
  webApp: null,
  isReady: false,
  isAdmin: false,
  refreshUser: async () => {},
});

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TelegramWebAppUser | null>(null);
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [webApp, setWebApp] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  const refreshUser = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramId: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setBackendUser(data.user);
          console.log("✅ Backend user loaded:", data.user);
        }
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  useEffect(() => {
    const tg = getTelegramWebApp();

    if (tg) {
      tg.ready();
      tg.expand();
      
      // Telegram Web App theme ni qo'llash
      document.body.style.backgroundColor = tg.backgroundColor || '#ffffff';
      
      setWebApp(tg);
      
      const tgUser = getTelegramWebAppUser();

      if (tgUser) {
        setUser(tgUser);

        fetch("/api/auth/telegram", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            telegramId: tgUser.id,
            firstName: tgUser.first_name,
            lastName: tgUser.last_name,
            username: tgUser.username,
          }),
        })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setBackendUser(data.user);
            console.log("✅ Backend user loaded:", data.user);
            console.log("👑 Is Admin:", data.user.role === "admin");
          }
        })
        .catch(console.error);
      } else {
        console.warn("⚠️ Telegram foydalanuvchi ma'lumoti topilmadi. Iltimos, bot chatidan Mini App ni ishga tushiring.");
        tg.showAlert?.("Mini App foydalanuvchi ma'lumotlarini ololmadi. Iltimos, bot chatidagi \"Mini App\" tugmasidan foydalaning.");
      }
      
      setIsReady(true);
    } else {
      // Telegram SDK mavjud emas - xato
      console.error("❌ Telegram WebApp SDK topilmadi!");
      console.error("❌ Bu ilovani faqat Telegram Mini App orqali ishlating!");
      if (typeof window !== "undefined") {
        alert("Iltimos, ilovani faqat Telegram ichida ishlating.");
      }
      setIsReady(true);
    }
  }, []);

  const isAdmin = backendUser?.role === "admin";
  
  // Debug logging
  useEffect(() => {
    if (backendUser) {
      console.log("🔍 TelegramContext State:", {
        telegramId: user?.id,
        backendUserId: backendUser.id,
        role: backendUser.role,
        isAdmin: isAdmin
      });
    }
  }, [backendUser, isAdmin, user?.id]);

  return (
    <TelegramContext.Provider value={{ 
      user, 
      backendUser, 
      webApp, 
      isReady, 
      isAdmin,
      refreshUser 
    }}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error("useTelegram must be used within TelegramProvider");
  }
  return context;
}

