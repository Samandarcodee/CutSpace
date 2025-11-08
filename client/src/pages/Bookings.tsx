import { useState } from "react";
import BookingCard from "@/components/BookingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Booking, Barbershop } from "@shared/schema";

type BookingWithShop = Booking & { barbershopName: string };

export default function Bookings() {
  const [viewMode, setViewMode] = useState<"customer" | "barber">("customer");

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: barbershops = [] } = useQuery<Barbershop[]>({
    queryKey: ["/api/barbershops"],
  });

  const acceptMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("POST", `/api/bookings/${id}/accept`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("POST", `/api/bookings/${id}/reject`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
  });

  const handleAccept = (id: string) => {
    acceptMutation.mutate(id);
  };

  const handleReject = (id: string) => {
    rejectMutation.mutate(id);
  };

  const bookingsWithShop: BookingWithShop[] = bookings.map(booking => {
    const shop = barbershops.find(s => s.id === booking.barbershopId);
    return {
      ...booking,
      barbershopName: shop?.name || "Noma'lum",
    };
  });

  const pendingBookings = bookingsWithShop.filter(b => b.status === "pending");
  const acceptedBookings = bookingsWithShop.filter(b => b.status === "accepted");
  const rejectedBookings = bookingsWithShop.filter(b => b.status === "rejected");

  if (bookingsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20">
      <div className="max-w-md mx-auto">
        <header className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm border-b border-card-border p-6 sticky top-0 z-40 shadow-sm">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-3">
            Yozilishlar
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("customer")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === "customer"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
              data-testid="toggle-customer-view"
            >
              👤 Mijoz
            </button>
            <button
              onClick={() => setViewMode("barber")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === "barber"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
              data-testid="toggle-barber-view"
            >
              ✂️ Sartarosh
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
