import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getTelegramWebAppUser, type TelegramWebAppUser } from "@/lib/telegram";

type TelegramUser = TelegramWebAppUser;

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
  const [user, setUser] = useState<TelegramUser | null>(null);
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
    const authenticate = (userData: TelegramUser) => {
      fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramId: userData.id,
          firstName: userData.first_name,
          lastName: userData.last_name,
          username: userData.username,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setBackendUser(data.user);
            console.log("✅ Backend user loaded:", data.user);
          }
        })
        .catch(console.error);
    };

    const bootstrapUser = (userData: TelegramUser) => {
      setUser(userData);
      authenticate(userData);
    };

    const testUser: TelegramUser = {
      id: 123456789, // Test customer ID
      first_name: "Test",
      last_name: "User",
      username: "testuser",
    };

    const tg = (window as any).Telegram?.WebApp;
    
    if (tg) {
      tg.ready();
      tg.expand();
      
      // Telegram Web App theme ni qo'llash
      document.body.style.backgroundColor = tg.backgroundColor || '#ffffff';
      
      setWebApp(tg);

      const webAppUser = getTelegramWebAppUser();
      if (webAppUser) {
        bootstrapUser(webAppUser);
      } else {
        console.log("Telegram WebApp user not found, falling back to development test user");
        bootstrapUser(testUser);
      }
      
      setIsReady(true);
    } else {
      // Telegram SDK mavjud emas (development)
      console.log("Telegram WebApp SDK not found - development mode");
      bootstrapUser(testUser);
      setIsReady(true);
    }
  }, []);

  const isAdmin = backendUser?.role === "admin";

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

