import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getTelegramWebApp, getTelegramWebAppUser, type TelegramWebAppUser } from "@/lib/telegram";

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
  user: TelegramWebAppUser | null;
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
    
    const tg = getTelegramWebApp();
    
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
          initData: tg?.initData, // Send initData for HMAC validation
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
    // Telegram SDK yuklanishini kutish
    const initTelegramApp = () => {
      console.log("🔄 Telegram Mini App ishga tushmoqda...");
      
      const tg = getTelegramWebApp();

      if (!tg) {
        console.error("❌ Telegram WebApp SDK topilmadi!");
        console.error("❌ Bu ilovani faqat Telegram Mini App orqali ishlating!");
        setIsReady(true);
        return;
      }

      console.log("✅ Telegram SDK topildi");
      
      // Telegram Web App ni tayyorlash
      try {
        tg.ready();
        tg.expand();
        
        // Theme qo'llash
        if (tg.backgroundColor) {
          document.body.style.backgroundColor = tg.backgroundColor;
        }
        
        setWebApp(tg);
        console.log("✅ Telegram WebApp initialized");
      } catch (error) {
        console.error("❌ Telegram WebApp initialization error:", error);
      }
      
      // User ma'lumotlarini olish (kechikish bilan)
      setTimeout(() => {
        const tgUser = getTelegramWebAppUser();

        if (tgUser) {
          console.log("✅ Telegram user topildi:", tgUser);
          setUser(tgUser);

          // Backend ga auth request with initData for validation
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
              initData: tg.initData, // Send initData for HMAC validation
            }),
          })
          .then(res => {
            if (!res.ok) {
              throw new Error(`Backend auth failed: ${res.status}`);
            }
            return res.json();
          })
          .then(data => {
            if (data.user) {
              setBackendUser(data.user);
              console.log("✅ Backend user loaded:", data.user);
              console.log("👑 Role:", data.user.role);
              console.log("👑 Is Admin:", data.user.role === "admin");
            } else {
              console.error("❌ Backend response has no user");
            }
          })
          .catch(error => {
            console.error("❌ Backend auth error:", error);
            // User'ga xabar berish (showAlert eski versiyalar bilan compatible)
            if (tg.showAlert) {
              tg.showAlert("Backend bilan bog'lanishda xatolik. Iltimos, qayta urinib ko'ring.");
            }
          });
        } else {
          console.error("❌ Telegram user ma'lumoti topilmadi");
          console.error("Telegram Web App Data:", {
            initDataUnsafe: tg.initDataUnsafe,
            initData: tg.initData?.substring(0, 50),
          });
          
          // User'ga tushunarli xabar (showAlert eski versiyalar bilan compatible)
          if (tg.showAlert) {
            tg.showAlert("Mini App foydalanuvchi ma'lumotlarini ololmadi. Iltimos, bot chatidagi \"Mini App\" tugmasidan foydalaning.");
          }
        }
        
        setIsReady(true);
      }, 500); // 500ms kechikish - SDK to'liq yuklanishi uchun
    };

    // SDK yuklanishini kutish
    if (typeof window !== "undefined") {
      if ((window as any).Telegram?.WebApp) {
        initTelegramApp();
      } else {
        // SDK hali yuklanmagan bo'lsa, kutish
        console.log("⏳ Telegram SDK yuklanishini kutmoqda...");
        const checkSDK = setInterval(() => {
          if ((window as any).Telegram?.WebApp) {
            console.log("✅ Telegram SDK yuklandi");
            clearInterval(checkSDK);
            initTelegramApp();
          }
        }, 100);
        
        // 5 soniyadan keyin to'xtatish
        setTimeout(() => {
          clearInterval(checkSDK);
          if (!(window as any).Telegram?.WebApp) {
            console.error("❌ Telegram SDK yuklanmadi (timeout)");
            setIsReady(true);
          }
        }, 5000);
      }
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

