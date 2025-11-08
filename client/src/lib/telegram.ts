export interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

function getTelegramWebApp(): any | null {
  if (typeof window === "undefined") return null;
  return (window as any).Telegram?.WebApp ?? null;
}

function parseUserFromInitData(initData: string | undefined | null): TelegramWebAppUser | null {
  if (!initData) return null;

  try {
    const params = new URLSearchParams(initData);
    const userParam = params.get("user");
    if (!userParam) return null;

    const parsed = JSON.parse(userParam);
    if (parsed && typeof parsed === "object" && "id" in parsed) {
      return parsed as TelegramWebAppUser;
    }
  } catch (error) {
    console.error("Failed to parse Telegram initData user:", error);
  }

  return null;
}

export function getTelegramWebAppUser(): TelegramWebAppUser | null {
  const tg = getTelegramWebApp();
  if (!tg) return null;

  if (tg.initDataUnsafe?.user) {
    return tg.initDataUnsafe.user as TelegramWebAppUser;
  }

  return parseUserFromInitData(tg.initData);
}

export function getTelegramId(): string | null {
  const user = getTelegramWebAppUser();
  return user ? String(user.id) : null;
}
