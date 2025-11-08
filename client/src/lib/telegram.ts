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
    return unsafeUser;
  }

  return parseTelegramInitData(tg.initData);
}

