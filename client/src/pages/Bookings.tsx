import { useState } from "react";
import BookingCard from "@/components/BookingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type BookingStatus = "pending" | "accepted" | "rejected";

interface Booking {
  id: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  status: BookingStatus;
  barbershopName: string;
}

const initialBookings: Booking[] = [
  {
    id: "1",
    customerName: "Akmal Rahimov",
    service: "Soch olish",
    date: "15 Noyabr, 2025",
    time: "14:00",
    status: "pending",
    barbershopName: "Premium Barber Shop",
  },
  {
    id: "2",
    customerName: "Sardor Karimov",
    service: "Soqol qirish",
    date: "14 Noyabr, 2025",
    time: "16:00",
    status: "accepted",
    barbershopName: "Classic Barber",
  },
  {
    id: "3",
    customerName: "Javohir Alimov",
    service: "Styling",
    date: "13 Noyabr, 2025",
    time: "11:00",
    status: "rejected",
    barbershopName: "Modern Style Barber",
  },
];

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [viewMode, setViewMode] = useState<"customer" | "barber">("customer");

  const handleAccept = (id: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, status: "accepted" as const } : b))
    );
  };

  const handleReject = (id: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, status: "rejected" as const } : b))
    );
  };

  const pendingBookings = bookings.filter(b => b.status === "pending");
  const acceptedBookings = bookings.filter(b => b.status === "accepted");
  const rejectedBookings = bookings.filter(b => b.status === "rejected");

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto">
        <header className="bg-card border-b border-card-border p-4 sticky top-0 z-40">
          <h1 className="text-xl font-bold">Yozilishlar</h1>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setViewMode("customer")}
              className={`px-3 py-1 rounded-md text-sm ${
                viewMode === "customer"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
              data-testid="toggle-customer-view"
            >
              Mijoz
            </button>
            <button
              onClick={() => setViewMode("barber")}
              className={`px-3 py-1 rounded-md text-sm ${
                viewMode === "barber"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
              data-testid="toggle-barber-view"
            >
              Sartarosh
            </button>
          </div>
        </header>

        <div className="p-4">
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending" data-testid="tab-pending">
                Kutilmoqda ({pendingBookings.length})
              </TabsTrigger>
              <TabsTrigger value="accepted" data-testid="tab-accepted">
                Qabul ({acceptedBookings.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" data-testid="tab-rejected">
                Rad ({rejectedBookings.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-4">
              {pendingBookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Kutilayotgan yozilishlar yo'q
                </p>
              ) : (
                pendingBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    {...booking}
                    isBarberView={viewMode === "barber"}
                    onAccept={handleAccept}
                    onReject={handleReject}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="accepted" className="space-y-4 mt-4">
              {acceptedBookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Qabul qilingan yozilishlar yo'q
                </p>
              ) : (
                acceptedBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    {...booking}
                    isBarberView={viewMode === "barber"}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4 mt-4">
              {rejectedBookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Rad etilgan yozilishlar yo'q
                </p>
              ) : (
                rejectedBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    {...booking}
                    isBarberView={viewMode === "barber"}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
