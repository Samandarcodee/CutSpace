import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramContextType {
  user: TelegramUser | null;
  webApp: any;
  isReady: boolean;
}

const TelegramContext = createContext<TelegramContextType>({
  user: null,
  webApp: null,
  isReady: false,
});

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [webApp, setWebApp] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    
    if (tg) {
      tg.ready();
      tg.expand();
      
      // Telegram Web App theme ni qo'llash
      document.body.style.backgroundColor = tg.backgroundColor || '#ffffff';
      
      setWebApp(tg);
      
      // User ma'lumotlarini olish
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
        
        // Backend ga auth request yuborish
        fetch('/api/auth/telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            telegramId: tg.initDataUnsafe.user.id,
            firstName: tg.initDataUnsafe.user.first_name,
            lastName: tg.initDataUnsafe.user.last_name,
            username: tg.initDataUnsafe.user.username,
          }),
        }).catch(console.error);
      } else {
        // Development mode - test user
        console.log("Development mode: using test user");
        setUser({
          id: 123456789,
          first_name: "Test",
          last_name: "User",
          username: "testuser",
        });
      }
      
      setIsReady(true);
    } else {
      // Telegram SDK mavjud emas (development)
      console.log("Telegram WebApp SDK not found - development mode");
      setUser({
        id: 123456789,
        first_name: "Test",
        last_name: "User",
        username: "testuser",
      });
      setIsReady(true);
    }
  }, []);

  return (
    <TelegramContext.Provider value={{ user, webApp, isReady }}>
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

