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

import luxuryImage from '@assets/generated_images/Luxury_barbershop_interior_Tashkent_3c957162.png';
import barberWork from '@assets/generated_images/Professional_barber_at_work_76c48d13.png';
import modernExterior from '@assets/generated_images/Modern_barbershop_exterior_Tashkent_5f8e8e03.png';
import classicInterior from '@assets/generated_images/Classic_barbershop_interior_design_9f39c595.png';
import minimalistInterior from '@assets/generated_images/Minimalist_barbershop_interior_d115a3e8.png';
import toolsStation from '@assets/generated_images/Professional_barbershop_tools_station_b59c156b.png';

const barbershops = [
  {
    id: "1",
    name: "Premium Barber Shop",
    rating: 4.8,
    address: "Amir Temur ko'chasi 15, Yunusobod tumani",
    services: ["Soch olish - 50,000 so'm", "Soqol qirish - 30,000 so'm", "Styling - 40,000 so'm"],
    images: [luxuryImage, barberWork],
    reviewCount: 127,
    reviews: [
      { author: "Akmal Rahimov", rating: 5, comment: "Juda zo'r xizmat! Sartaroshlar professional va do'stona.", date: "3 kun oldin" },
      { author: "Sardor Karimov", rating: 4, comment: "Yaxshi joy, sifatli ish. Narxlar ham qulay.", date: "1 hafta oldin" },
      { author: "Bobur Toshmatov", rating: 5, comment: "Eng yaxshi sartaroshxona! Doimo shu yerga kelaman.", date: "2 hafta oldin" },
    ],
  },
  {
    id: "2",
    name: "Classic Barber",
    rating: 4.6,
    address: "Mustaqillik ko'chasi 42, Mirobod tumani",
    services: ["Soch olish - 45,000 so'm", "Soqol qirish - 25,000 so'm"],
    images: [classicInterior, modernExterior],
    reviewCount: 98,
    reviews: [
      { author: "Javohir Alimov", rating: 5, comment: "Klassik uslub va yuqori sifat. Tavsiya qilaman!", date: "5 kun oldin" },
      { author: "Dilshod Ergashev", rating: 4, comment: "Yaxshi xizmat, lekin biroz kutishga to'g'ri keladi.", date: "1 hafta oldin" },
      { author: "Otabek Nazarov", rating: 5, comment: "Professional ustalar. Juda mamnunman!", date: "3 hafta oldin" },
    ],
  },
  {
    id: "3",
    name: "Modern Style Barber",
    rating: 4.9,
    address: "Buyuk Ipak Yo'li 88, Shayxontohur tumani",
    services: ["Soch olish - 60,000 so'm", "Soqol qirish - 35,000 so'm", "Styling - 50,000 so'm"],
    images: [minimalistInterior, toolsStation],
    reviewCount: 156,
    reviews: [
      { author: "Farrux Karimov", rating: 5, comment: "Zamonaviy uslub va eng yaxshi xizmat. 100% tavsiya!", date: "2 kun oldin" },
      { author: "Aziz Mahmudov", rating: 5, comment: "Ustalar o'z ishini yaxshi biladilar. Rahmat!", date: "1 hafta oldin" },
      { author: "Sherzod Yunusov", rating: 4, comment: "Narx biroz yuqori, lekin sifat bunga arziydi.", date: "2 hafta oldin" },
    ],
  },
];

export default function Home() {
  const [selectedShop, setSelectedShop] = useState<typeof barbershops[0] | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const { toast } = useToast();

  const handleBookNow = () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      toast({
        title: "Ma'lumot to'liq emas",
        description: "Iltimos, xizmat va vaqtni tanlang",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Muvaffaqiyatli band qilindi!",
      description: "Sizning arizangiz sartaroshga yuborildi",
    });

    setShowBooking(false);
    setSelectedShop(null);
    setSelectedService("");
    setSelectedDate(undefined);
    setSelectedTime("");
  };

  const handleSubmitReview = () => {
    if (reviewRating === 0 || !reviewText.trim()) {
      toast({
        title: "Ma'lumot to'liq emas",
        description: "Iltimos, reyting va sharh matnini kiriting",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sharh qo'shildi!",
      description: "Rahmat, fikringiz biz uchun muhim",
    });

    setReviewRating(0);
    setReviewText("");
  };

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
              onViewDetails={(id) => {
                setSelectedShop(barbershops.find((s) => s.id === id) || null);
              }}
            />
          ))}
        </div>
      </div>

      <Dialog open={!!selectedShop && !showBooking} onOpenChange={() => setSelectedShop(null)}>
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
                    data-testid="button-submit-review"
                  >
                    Sharh qoldirish
                  </Button>
                </div>

                {selectedShop?.reviews.map((review, idx) => (
                  <ReviewCard key={idx} {...review} />
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
              data-testid="button-book-now"
            >
              Band qilish
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
