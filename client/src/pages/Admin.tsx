import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTelegram } from "@/contexts/TelegramContext";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, Shield, MapPin } from "lucide-react";
import type { Barbershop } from "@shared/schema";

export default function Admin() {
  const { isAdmin, backendUser } = useTelegram();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingShop, setEditingShop] = useState<Barbershop | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    services: "",
    images: "",
  });

  const { data: barbershops = [], isLoading } = useQuery<Barbershop[]>({
    queryKey: ["/api/barbershops"],
  });

  // Admin tekshirish
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold mb-2">Kirish taqiqlangan</h2>
          <p className="text-muted-foreground">Admin paneliga kirish huquqi yo'q</p>
        </Card>
      </div>
    );
  }

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Bo'sh qatorlarni olib tashlash
      const processArray = (arr: any) => {
        if (Array.isArray(arr)) {
          return arr.filter((item) => item && item.trim().length > 0);
        }
        if (typeof arr === "string") {
          return arr.split("\n")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
        }
        return [];
      };

      return await apiRequest("POST", "/api/admin/barbershops", {
        name: data.name,
        description: data.description || undefined,
        address: data.address,
        phone: data.phone,
        rating: data.rating || 0,
        services: processArray(data.services),
        images: processArray(data.images),
        ownerId: data.ownerId || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/barbershops"] });
      toast({ title: "Muvaffaqiyatli qo'shildi!" });
      setShowDialog(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik",
        description: error?.message || "Qo'shishda muammo yuz berdi",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // Bo'sh qatorlarni olib tashlash
      const processArray = (arr: any) => {
        if (Array.isArray(arr)) {
          return arr.filter((item) => item && item.trim().length > 0);
        }
        if (typeof arr === "string") {
          return arr.split("\n")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
        }
        return [];
      };

      return await apiRequest("PUT", `/api/admin/barbershops/${id}`, {
        name: data.name,
        description: data.description || undefined,
        address: data.address,
        phone: data.phone,
        rating: data.rating,
        services: processArray(data.services),
        images: processArray(data.images),
        ownerId: data.ownerId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/barbershops"] });
      toast({ title: "Muvaffaqiyatli yangilandi!" });
      setShowDialog(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik",
        description: error?.message || "Yangilashda muammo yuz berdi",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/barbershops/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/barbershops"] });
      toast({ title: "Muvaffaqiyatli o'chirildi!" });
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik",
        description: error?.message || "O'chirishda muammo yuz berdi",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      address: "",
      phone: "",
      services: "",
      images: "",
    });
    setEditingShop(null);
  };

  const handleEdit = (shop: Barbershop) => {
    setEditingShop(shop);
    setFormData({
      name: shop.name,
      description: shop.description || "",
      address: shop.address,
      phone: shop.phone || "",
      services: shop.services.join("\n"),
      images: shop.images.join("\n"),
    });
    setShowDialog(true);
  };

  const handleSubmit = () => {
    const trimmedName = formData.name.trim();
    const trimmedAddress = formData.address.trim();
    const trimmedPhone = formData.phone.trim();
    
    // Bo'sh qatorlarni o'tkazib yuborish - faqat to'ldirilganlarni olish
    const servicesList = formData.services
      .split("\n")
      .map((service) => service.trim())
      .filter((service) => service.length > 0); // Bo'sh stringlarni olib tashlash
    
    const imagesList = formData.images
      .split("\n")
      .map((image) => image.trim())
      .filter((image) => image.length > 0); // Bo'sh stringlarni olib tashlash

    if (!trimmedName || !trimmedAddress || !trimmedPhone) {
      toast({
        title: "Majburiy maydonlar bo'sh",
        description: "Nomi, manzil va telefon raqami to'ldirilishi kerak.",
        variant: "destructive",
      });
      return;
    }

    if (servicesList.length === 0) {
      toast({
        title: "Xizmatlar kiritilmagan",
        description: "Kamida bitta xizmatni kiriting (bo'sh qatorlar hisobga olinmaydi).",
        variant: "destructive",
      });
      return;
    }

    if (imagesList.length === 0) {
      toast({
        title: "Rasm havolalari kiritilmagan",
        description: "Kamida bitta rasm manzilini kiriting (bo'sh qatorlar hisobga olinmaydi).",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name: trimmedName,
      address: trimmedAddress,
      phone: trimmedPhone,
      description: formData.description.trim() || undefined,
      services: servicesList, // Bo'sh qatorlar olib tashlangan
      images: imagesList, // Bo'sh qatorlar olib tashlangan
      rating: 0,
    };

    if (editingShop) {
      updateMutation.mutate({ id: editingShop.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isLoading) {
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
      <div className="max-w-6xl mx-auto p-4">
        <header className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm border-b border-card-border p-6 mb-6 rounded-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
                <p className="text-sm text-muted-foreground">Sartaroshxonalarni boshqarish</p>
              </div>
            </div>
            <Button 
              onClick={() => { resetForm(); setShowDialog(true); }}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yangi qo'shish
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {barbershops.map((shop) => (
            <Card key={shop.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/50">
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{shop.name}</h3>
                    {shop.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {shop.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-sm mb-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-semibold">{shop.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground text-xs">({shop.reviewCount})</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                      onClick={() => handleEdit(shop)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        if (confirm(`"${shop.name}" ni o'chirishni xohlaysizmi?`)) {
                          deleteMutation.mutate(shop.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{shop.address}</span>
                  </div>
                  {shop.phone && (
                    <div className="text-muted-foreground">📞 {shop.phone}</div>
                  )}
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Xizmatlar:</p>
                  <div className="flex flex-wrap gap-1">
                    {shop.services.slice(0, 2).map((service, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {service.split(' - ')[0]}
                      </Badge>
                    ))}
                    {shop.services.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{shop.services.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {barbershops.length === 0 && (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">Hozircha sartaroshxona yo'q</p>
            </Card>
          )}
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingShop ? "Sartaroshxonani tahrirlash" : "Yangi sartaroshxona qo'shish"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Nomi</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Premium Barber Shop"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Izoh</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Masalan: Zamonaviy interyer va premium xizmatlar."
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Manzil</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Amir Temur ko'chasi 15"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Telefon</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+998 90 123 45 67"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Xizmatlar (har birini yangi qatorda)</label>
                <Textarea
                  value={formData.services}
                  onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                  placeholder="Soch olish - 50,000 so'm&#10;Soqol qirish - 30,000 so'm&#10;&#10;(Bo'sh qatorlar avtomatik olib tashlanadi)"
                  rows={5}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Bo'sh qatorlar e'tiborga olinmaydi
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Rasmlar (har birini yangi qatorda)</label>
                <Textarea
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="/images/luxury.png&#10;/images/barber-work.png&#10;&#10;(Bo'sh qatorlar avtomatik olib tashlanadi)"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Bo'sh qatorlar e'tiborga olinmaydi
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1"
                >
                  {editingShop ? "Yangilash" : "Qo'shish"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setShowDialog(false); resetForm(); }}
                >
                  Bekor qilish
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

