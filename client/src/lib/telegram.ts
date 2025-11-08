export interface TelegramWebAppUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export function parseTelegramInitData(initData: string | undefined): TelegramWebAppUser | null {
  if (!initData) return null;
  try {
    const params = new URLSearchParams(initData);
    const userStr = params.get("user");
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Telegram initData parse error:", error);
    return null;
  }
}

export function getTelegramWebApp() {
  if (typeof window === "undefined") return null;
  return (window as any).Telegram?.WebApp ?? null;
}

export function getTelegramWebAppUser(): TelegramWebAppUser | null {
  const tg = getTelegramWebApp();
  if (!tg) return null;

  const unsafeUser = tg.initDataUnsafe?.user as TelegramWebAppUser | undefined;
  if (unsafeUser?.id) {
    sessionStorage.setItem("tgUser", JSON.stringify(unsafeUser));
    return unsafeUser;
  }

  const parsedFromInit = parseTelegramInitData(tg.initData);
  if (parsedFromInit?.id) {
    sessionStorage.setItem("tgUser", JSON.stringify(parsedFromInit));
    return parsedFromInit;
  }

  if (typeof window !== "undefined") {
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);

    if (hash.includes("tgWebAppData=")) {
      const data = decodeURIComponent(hash.split("tgWebAppData=")[1]);
      const parsed = parseTelegramInitData(data);
      if (parsed?.id) {
        sessionStorage.setItem("tgUser", JSON.stringify(parsed));
        return parsed;
      }
    }

    if (searchParams.has("tgWebAppData")) {
      const data = searchParams.get("tgWebAppData") || undefined;
      const parsed = parseTelegramInitData(data);
      if (parsed?.id) {
        sessionStorage.setItem("tgUser", JSON.stringify(parsed));
        return parsed;
      }
    }

    const cached = sessionStorage.getItem("tgUser");
    if (cached) {
      try {
        const user = JSON.parse(cached) as TelegramWebAppUser;
        if (user?.id) {
          return user;
        }
      } catch {
        sessionStorage.removeItem("tgUser");
      }
    }
  }

  return null;
}

