import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TelegramProvider, useTelegram } from "@/contexts/TelegramContext";
import BottomNav from "@/components/BottomNav";
import Home from "@/pages/Home";
import Bookings from "@/pages/Bookings";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import TelegramDebug from "@/pages/TelegramDebug";
import NotFound from "@/pages/not-found";
import { AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/bookings" component={Bookings} />
      <Route path="/profile" component={Profile} />
      <Route path="/admin" component={Admin} />
      <Route path="/debug" component={TelegramDebug} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { user, isReady } = useTelegram();
  
  // Show modal if app is ready but no user data
  const showUserDataError = isReady && !user;
  
  return (
    <>
      <div className="min-h-screen bg-background">
        <Router />
        <BottomNav />
      </div>
      <Toaster />
      
      {/* User Data Error Modal */}
      <AlertDialog open={showUserDataError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <AlertDialogTitle>Kirish Xatosi</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-3">
              <p className="text-base">
                Mini App foydalanuvchi ma'lumotlarini ololmadi.
              </p>
              <p className="text-sm text-muted-foreground">
                Iltimos, ushbu ilovani faqat Telegram bot chatidagi <strong>"Mini App"</strong> tugmasi orqali oching.
              </p>
              <div className="bg-muted p-3 rounded-md text-xs space-y-1">
                <p>📱 Qanday ochish kerak:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Telegram botga /start yuboring</li>
                  <li>"🚀 Mini App ni ochish" tugmasini bosing</li>
                  <li>Yoki inline tugmalardan "Mini App" ni tanlang</li>
                </ol>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TelegramProvider>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </TelegramProvider>
    </QueryClientProvider>
  );
}

export default App;
