import { useState, useEffect } from "react";
import { getTelegramWebApp, getTelegramWebAppUser } from "@/lib/telegram";
import { useTelegram } from "@/contexts/TelegramContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TelegramDebug() {
  const { user, backendUser, webApp, isAdmin } = useTelegram();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const tg = getTelegramWebApp();
    const tgUser = getTelegramWebAppUser();

    setDebugInfo({
      sdkAvailable: !!tg,
      initDataUnsafe: tg?.initDataUnsafe || null,
      initData: tg?.initData?.substring(0, 100) || null,
      userFromHelper: tgUser,
      sessionStorage: sessionStorage.getItem("tgUser"),
      windowLocation: {
        href: window.location.href,
        hash: window.location.hash,
        search: window.location.search,
      },
    });
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">🐛 Telegram Debug</h1>

        <Card className="p-4">
          <h2 className="font-bold mb-2">Context State:</h2>
          <pre className="text-xs overflow-auto bg-muted p-2 rounded">
            {JSON.stringify({ user, backendUser, isAdmin, webAppAvailable: !!webApp }, null, 2)}
          </pre>
        </Card>

        <Card className="p-4">
          <h2 className="font-bold mb-2">Raw Telegram Data:</h2>
          <pre className="text-xs overflow-auto bg-muted p-2 rounded max-h-96">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </Card>

        <Card className="p-4">
          <h2 className="font-bold mb-2">Actions:</h2>
          <div className="space-y-2">
            <Button
              onClick={() => {
                sessionStorage.clear();
                window.location.reload();
              }}
              variant="outline"
              className="w-full"
            >
              Clear Session & Reload
            </Button>
            <Button
              onClick={() => {
                const tg = getTelegramWebApp();
                tg?.showAlert?.("Test Alert from Debug Page");
              }}
              variant="outline"
              className="w-full"
            >
              Test Telegram Alert
            </Button>
            <Button
              onClick={() => {
                const tg = getTelegramWebApp();
                tg?.close?.();
              }}
              variant="destructive"
              className="w-full"
            >
              Close Mini App
            </Button>
          </div>
        </Card>

        <Card className="p-4 bg-green-50 dark:bg-green-950">
          <h2 className="font-bold mb-2 text-green-800 dark:text-green-200">✅ Expected Values:</h2>
          <ul className="text-sm space-y-1 text-green-700 dark:text-green-300">
            <li>• SDK Available: <strong>true</strong></li>
            <li>• User ID (5928372261 = Admin): <strong>{user?.id || "null"}</strong></li>
            <li>• Backend Role: <strong>{backendUser?.role || "null"}</strong></li>
            <li>• Is Admin: <strong>{isAdmin ? "true" : "false"}</strong></li>
          </ul>
        </Card>

        <Card className="p-4 bg-yellow-50 dark:bg-yellow-950">
          <h2 className="font-bold mb-2 text-yellow-800 dark:text-yellow-200">⚠️ Agar muammo bo'lsa:</h2>
          <ol className="text-sm space-y-1 text-yellow-700 dark:text-yellow-300">
            <li>1. Mini App ni yoping</li>
            <li>2. Bot chatiga qayting</li>
            <li>3. /start yuboring</li>
            <li>4. "🚀 Mini App ni ochish" bosing</li>
            <li>5. Bu sahifaga qaytib debug ma'lumotlarini tekshiring</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}

