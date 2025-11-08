export interface TelegramWebAppUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export function parseTelegramInitData(initData: string | undefined): TelegramWebAppUser | null {
  if (!initData) {
    console.log("parseTelegramInitData: initData is empty");
    return null;
  }
  
  console.log("parseTelegramInitData: Parsing initData (length:", initData.length, ")");
  console.log("parseTelegramInitData: First 100 chars:", initData.substring(0, 100));
  
  try {
    const params = new URLSearchParams(initData);
    const userStr = params.get("user");
    
    console.log("parseTelegramInitData: user param:", userStr?.substring(0, 100));
    
    if (!userStr) {
      console.warn("parseTelegramInitData: 'user' parameter not found in initData");
      console.log("parseTelegramInitData: Available params:", Array.from(params.keys()));
      return null;
    }
    
    const user = JSON.parse(userStr) as TelegramWebAppUser;
    console.log("parseTelegramInitData: Parsed user:", user);
    return user;
  } catch (error) {
    console.error("parseTelegramInitData: Parse error:", error);
    console.error("parseTelegramInitData: initData value:", initData.substring(0, 200));
    return null;
  }
}

export function getTelegramWebApp() {
  if (typeof window === "undefined") return null;
  return (window as any).Telegram?.WebApp ?? null;
}

export function getTelegramWebAppUser(): TelegramWebAppUser | null {
  const tg = getTelegramWebApp();
  if (!tg) {
    console.error("getTelegramWebAppUser: WebApp not available");
    return null;
  }

  // 1. Try initDataUnsafe.user first
  const unsafeUser = tg.initDataUnsafe?.user as TelegramWebAppUser | undefined;
  console.log("1️⃣ initDataUnsafe.user:", unsafeUser);
  if (unsafeUser?.id) {
    sessionStorage.setItem("tgUser", JSON.stringify(unsafeUser));
    console.log("✅ User from initDataUnsafe:", unsafeUser);
    return unsafeUser;
  }

  // 2. Try parsing initData string
  const parsedFromInit = parseTelegramInitData(tg.initData);
  console.log("2️⃣ Parsed from initData:", parsedFromInit);
  if (parsedFromInit?.id) {
    sessionStorage.setItem("tgUser", JSON.stringify(parsedFromInit));
    console.log("✅ User from initData:", parsedFromInit);
    return parsedFromInit;
  }

  // 3. Try URL hash
  if (typeof window !== "undefined") {
    const hash = window.location.hash;
    console.log("3️⃣ Checking URL hash:", hash.substring(0, 50));
    
    if (hash.includes("tgWebAppData=")) {
      const data = decodeURIComponent(hash.split("tgWebAppData=")[1]);
      const parsed = parseTelegramInitData(data);
      console.log("3️⃣ Parsed from hash:", parsed);
      if (parsed?.id) {
        sessionStorage.setItem("tgUser", JSON.stringify(parsed));
        console.log("✅ User from URL hash:", parsed);
        return parsed;
      }
    }

    // 4. Try URL query params
    const searchParams = new URLSearchParams(window.location.search);
    console.log("4️⃣ Checking URL query:", window.location.search.substring(0, 50));
    
    if (searchParams.has("tgWebAppData")) {
      const data = searchParams.get("tgWebAppData") || undefined;
      const parsed = parseTelegramInitData(data);
      console.log("4️⃣ Parsed from query:", parsed);
      if (parsed?.id) {
        sessionStorage.setItem("tgUser", JSON.stringify(parsed));
        console.log("✅ User from URL query:", parsed);
        return parsed;
      }
    }

    // 5. Try sessionStorage cache
    const cached = sessionStorage.getItem("tgUser");
    console.log("5️⃣ Checking sessionStorage:", cached?.substring(0, 50));
    if (cached) {
      try {
        const user = JSON.parse(cached) as TelegramWebAppUser;
        if (user?.id) {
          console.log("✅ User from cache:", user);
          return user;
        }
      } catch (error) {
        console.error("5️⃣ Cache parse error:", error);
        sessionStorage.removeItem("tgUser");
      }
    }
  }

  // 6. Debug full Telegram object
  console.error("❌ User not found. Full Telegram data:");
  console.error({
    initDataUnsafe: tg.initDataUnsafe,
    initData: tg.initData?.substring(0, 100),
    version: tg.version,
    platform: tg.platform,
  });

  return null;
}

