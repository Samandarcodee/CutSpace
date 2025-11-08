import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Phone, MapPin, Calendar, Shield } from "lucide-react";
import { useTelegram } from "@/contexts/TelegramContext";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function Profile() {
  const { user: telegramUser, backendUser, isAdmin, refreshUser } = useTelegram();
  
  // Real bookings statistikasi
  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/bookings"],
  });
  
  const userBookings = bookings.filter((b: any) => 
    b.customerName === `${telegramUser?.first_name} ${telegramUser?.last_name || ''}`.trim() ||
    backendUser?.id === b.customerId
  );
  
  const stats = [
    { label: "Jami yozilishlar", value: userBookings.length.toString() },
    { label: "Faol yozilishlar", value: userBookings.filter((b: any) => b.status === "pending" || b.status === "confirmed").length.toString() },
    { label: "Bajarilgan", value: userBookings.filter((b: any) => b.status === "completed").length.toString() },
  ];
  
  const user = {
    name: backendUser 
      ? `${backendUser.firstName || ''} ${backendUser.lastName || ''}`.trim() || telegramUser?.first_name || "Mehmon"
      : telegramUser 
      ? `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim()
      : "Mehmon",
    phone: "+998 90 123 45 67", // TODO: Add phone to user schema
    address: "Toshkent, Yunusobod tumani", // TODO: Add address to user schema
    memberSince: backendUser?.createdAt 
      ? new Date(backendUser.createdAt).toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })
      : "Yanvar 2024",
    username: backendUser?.username || telegramUser?.username || null,
    role: backendUser?.role || "customer",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20">
      <div className="max-w-md mx-auto">
        <header className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm border-b border-card-border p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Profil
          </h1>
        </header>

        <div className="p-4 space-y-4">
          <Card className="p-6 bg-gradient-to-br from-card to-card/50 backdrop-blur">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-3xl font-bold">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isAdmin && (
                  <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5">
                    <Shield className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                {user.username && (
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                )}
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {user.role === "admin" ? "👑 Admin" : user.role === "barber" ? "✂️ Sartarosh" : "👤 Mijoz"}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{user.address}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>A'zo: {user.memberSince}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-card/50">
            <h3 className="font-bold mb-4 text-lg">📊 Statistika</h3>
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center space-y-1">
                  <div className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-card to-card/50">
            <div className="space-y-2">
              {isAdmin && (
                <Link href="/admin">
                  <Button 
                    variant="default" 
                    className="w-full justify-start bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all"
                    data-testid="button-admin"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Panel
                  </Button>
                </Link>
              )}
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-primary/5 transition-colors" 
                data-testid="button-edit-profile" 
                onClick={refreshUser}
              >
                <User className="w-4 h-4 mr-2" />
                Ma'lumotlarni yangilash
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
