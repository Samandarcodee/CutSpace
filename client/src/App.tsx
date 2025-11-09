import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TelegramProvider } from "@/contexts/TelegramContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import BottomNav from "@/components/BottomNav";
import Home from "@/pages/Home";
import Bookings from "@/pages/Bookings";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import TelegramDebug from "@/pages/TelegramDebug";
import NotFound from "@/pages/not-found";

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TelegramProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-background">
              <Router />
              <BottomNav />
            </div>
            <Toaster />
          </TooltipProvider>
        </TelegramProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
