import { useState } from "react";
import BarbershopCard from "@/components/BarbershopCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import ReviewCard from "@/components/ReviewCard";
import RatingStars from "@/components/RatingStars";
import TimeSlotPicker from "@/components/TimeSlotPicker";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Barbershop, Review } from "@shared/schema";
import { format } from "date-fns";

import luxuryImage from '@assets/generated_images/Luxury_barbershop_interior_Tashkent_3c957162.png';
import barberWork from '@assets/generated_images/Professional_barber_at_work_76c48d13.png';
import modernExterior from '@assets/generated_images/Modern_barbershop_exterior_Tashkent_5f8e8e03.png';
import classicInterior from '@assets/generated_images/Classic_barbershop_interior_design_9f39c595.png';
import minimalistInterior from '@assets/generated_images/Minimalist_barbershop_interior_d115a3e8.png';
import toolsStation from '@assets/generated_images/Professional_barbershop_tools_station_b59c156b.png';

const imageMap: Record<string, string> = {
  "/images/luxury.png": luxuryImage,
  "/images/barber-work.png": barberWork,
  "/images/modern-exterior.png": modernExterior,
  "/images/classic.png": classicInterior,
  "/images/minimalist.png": minimalistInterior,
  "/images/tools.png": toolsStation,
};

export default function Home() {
  const { data: barbershops = [], isLoading } = useQuery<Barbershop[]>({
    queryKey: ["/api/barbershops"],
  });

  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const selectedShop = barbershops.find(s => s.id === selectedShopId);

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/barbershops", selectedShopId, "reviews"],
    enabled: !!selectedShopId,
  });
  const [showBooking, setShowBooking] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const { toast } = useToast();

  const createBookingMutation = useMutation({
    mutationFn: async (data: { barbershopId: string; customerName: string; service: string; date: string; time: string }) => {
      return await apiRequest("/api/bookings", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Muvaffaqiyatli band qilindi!",
        description: "Sizning arizangiz sartaroshga yuborildi",
      });
      setShowBooking(false);
      setSelectedShopId(null);
      setSelectedService("");
      setSelectedDate(undefined);
      setSelectedTime("");
    },
    onError: () => {
      toast({
        title: "Xatolik",
        description: "Band qilishda muammo yuz berdi",
        variant: "destructive",
      });
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: { barbershopId: string; author: string; rating: number; comment: string; date: string }) => {
      return await apiRequest("/api/reviews", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/barbershops"] });
      queryClient.invalidateQueries({ queryKey: ["/api/barbershops", selectedShopId, "reviews"] });
      toast({
        title: "Sharh qo'shildi!",
        description: "Rahmat, fikringiz biz uchun muhim",
      });
      setReviewRating(0);
      setReviewText("");
    },
    onError: () => {
      toast({
        title: "Xatolik",
        description: "Sharh qo'shishda muammo yuz berdi",
        variant: "destructive",
      });
    },
  });

  const handleBookNow = () => {
    if (!selectedService || !selectedDate || !selectedTime || !selectedShopId) {
      toast({
        title: "Ma'lumot to'liq emas",
        description: "Iltimos, xizmat va vaqtni tanlang",
        variant: "destructive",
      });
      return;
    }

    createBookingMutation.mutate({
      barbershopId: selectedShopId,
      customerName: "Akmal Rahimov",
      service: selectedService,
      date: format(selectedDate, "d MMMM, yyyy"),
      time: selectedTime,
    });
  };

  const handleSubmitReview = () => {
    if (reviewRating === 0 || !reviewText.trim() || !selectedShopId) {
      toast({
        title: "Ma'lumot to'liq emas",
        description: "Iltimos, reyting va sharh matnini kiriting",
        variant: "destructive",
      });
      return;
    }

    createReviewMutation.mutate({
      barbershopId: selectedShopId,
      author: "Akmal Rahimov",
      rating: reviewRating,
      comment: reviewText,
      date: "Hozirgina",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto">
        <header className="bg-card border-b border-card-border p-4 sticky top-0 z-40">
          <h1 className="text-xl font-bold">Sartaroshxonalar</h1>
          <p className="text-sm text-muted-foreground">Toshkent shahri</p>
        </header>

        <div className="p-4 space-y-4">
          {barbershops.map((shop) => (
            <BarbershopCard
              key={shop.id}
              {...shop}
              images={shop.images.map(img => imageMap[img] || img)}
              onViewDetails={(id) => {
                setSelectedShopId(id);
              }}
            />
          ))}
        </div>
      </div>

      <Dialog open={!!selectedShop && !showBooking} onOpenChange={() => setSelectedShopId(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedShop?.name}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="services" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="services" data-testid="tab-services">Xizmatlar</TabsTrigger>
              <TabsTrigger value="reviews" data-testid="tab-reviews">Sharhlar</TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="space-y-4">
              <div className="space-y-3">
                {selectedShop?.services.map((service, idx) => (
                  <Button
                    key={idx}
                    variant={selectedService === service ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedService(service);
                      setShowBooking(true);
                    }}
                    data-testid={`service-${idx}`}
                  >
                    {service}
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <div className="space-y-4">
                <div className="bg-card p-4 rounded-md border border-card-border space-y-3">
                  <h3 className="font-medium">Sharh qoldirish</h3>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Baho bering
                    </label>
                    <RatingStars
                      rating={reviewRating}
                      interactive
                      onRate={setReviewRating}
                      size="lg"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Fikringiz
                    </label>
                    <Textarea
                      placeholder="Xizmat haqida fikringizni yozing..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={3}
                      data-testid="input-review-text"
                    />
                  </div>
                  <Button
                    onClick={handleSubmitReview}
                    className="w-full"
                    disabled={createReviewMutation.isPending}
                    data-testid="button-submit-review"
                  >
                    {createReviewMutation.isPending ? "Yuklanmoqda..." : "Sharh qoldirish"}
                  </Button>
                </div>

                {reviews.map((review) => (
                  <ReviewCard key={review.id} {...review} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={showBooking} onOpenChange={(open) => !open && setShowBooking(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yozilish</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tanlangan xizmat:</p>
              <p className="font-medium">{selectedService}</p>
            </div>

            <TimeSlotPicker
              onSelect={(date, time) => {
                setSelectedDate(date);
                setSelectedTime(time);
              }}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
            />

            <Button
              onClick={handleBookNow}
              className="w-full"
              disabled={createBookingMutation.isPending}
              data-testid="button-book-now"
            >
              {createBookingMutation.isPending ? "Yuklanmoqda..." : "Band qilish"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
