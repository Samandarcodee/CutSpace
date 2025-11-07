import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Phone, MapPin, Calendar } from "lucide-react";
import { useTelegram } from "@/contexts/TelegramContext";

export default function Profile() {
  const { user: telegramUser, webApp } = useTelegram();
  
  const user = {
    name: telegramUser 
      ? `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim()
      : "Mehmon",
    phone: "+998 90 123 45 67",
    address: "Toshkent, Yunusobod tumani",
    memberSince: "Yanvar 2024",
    username: telegramUser?.username || null,
  };

  const stats = [
    { label: "Jami yozilishlar", value: "12" },
    { label: "Faol yozilishlar", value: "2" },
    { label: "Bajarilgan", value: "10" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto">
        <header className="bg-card border-b border-card-border p-4">
          <h1 className="text-xl font-bold">Profil</h1>
        </header>

        <div className="p-4 space-y-4">
          <Card className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                {user.username && (
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">Mijoz</p>
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

          <Card className="p-6">
            <h3 className="font-bold mb-4">Statistika</h3>
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" data-testid="button-edit-profile">
                <User className="w-4 h-4 mr-2" />
                Profilni tahrirlash
              </Button>
              <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" data-testid="button-logout">
                Chiqish
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
