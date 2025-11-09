import { useState, useRef, type ChangeEvent } from "react";
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
import { Trash2, Edit, Plus, Shield, MapPin, UploadCloud, Link2, X, Loader2 } from "lucide-react";
import type { Barbershop } from "@shared/schema";
import { getTelegramWebAppUser } from "@/lib/telegram";

export default function Admin() {
  const { isAdmin, backendUser } = useTelegram();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingShop, setEditingShop] = useState<Barbershop | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    services: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      const res = await apiRequest("POST", "/api/admin/barbershops", data);
      return await res.json();
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
      const res = await apiRequest("PUT", `/api/admin/barbershops/${id}`, data);
      return await res.json();
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
      address: "",
      phone: "",
      services: "",
    });
    setImages([]);
    setNewImageUrl("");
    setImageUploadError(null);
    setIsUploadingImages(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setEditingShop(null);
  };

  const handleEdit = (shop: Barbershop) => {
    setEditingShop(shop);
    setFormData({
      name: shop.name,
      address: shop.address,
      phone: shop.phone || "",
      services: shop.services.join("\n"),
    });
    setImages(shop.images || []);
    setNewImageUrl("");
    setImageUploadError(null);
    setShowDialog(true);
  };

  const handleSubmit = () => {
    const name = formData.name.trim();
    const address = formData.address.trim();
    const phone = formData.phone.trim();
    const servicesList = formData.services
      .split("\n")
      .map((service) => service.trim())
      .filter(Boolean);

    if (!name || !address || !phone) {
      toast({
        title: "Majburiy maydonlar to'ldirilmagan",
        description: "Nom, manzil va telefon raqamini to'ldiring.",
        variant: "destructive",
      });
      return;
    }

    if (servicesList.length === 0) {
      toast({
        title: "Xizmatlar ro'yxati bo'sh",
        description: "Hech bo'lmaganda bitta xizmat qo'shing.",
        variant: "destructive",
      });
      return;
    }

    if (images.length === 0) {
      toast({
        title: "Rasmlar kerak",
        description: "Kamida bitta rasm yuklang yoki URL qo'shing.",
        variant: "destructive",
      });
      return;
    }

    if (isUploadingImages) {
      toast({
        title: "Rasm yuklanmoqda",
        description: "Barcha rasm yuklashlari tugashini kuting.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name,
      address,
      phone,
      services: servicesList,
      images,
    };

    if (editingShop) {
      updateMutation.mutate({ id: editingShop.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const getAuthHeaders = (): HeadersInit => {
    const headers: HeadersInit = {};
    const explicitTelegramId = backendUser?.telegramId;
    const fallbackTelegramId =
      typeof window !== "undefined" ? getTelegramWebAppUser()?.id?.toString() : null;
    const telegramId = explicitTelegramId || fallbackTelegramId;
    if (telegramId) {
      headers["x-telegram-id"] = telegramId;
    }
    return headers;
  };

  const handleImageFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files || files.length === 0) {
      return;
    }

    setImageUploadError(null);
    setIsUploadingImages(true);

    const headers = getAuthHeaders();
    let uploadedCount = 0;

    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("image", file);

        const response = await fetch("/api/admin/uploads/image", {
          method: "POST",
          body,
          headers,
          credentials: "include",
        });

        if (!response.ok) {
          const errorText = await response.text();
          let parsedError = errorText;
          try {
            const json = JSON.parse(errorText);
            parsedError = json?.error || json?.message || errorText;
          } catch {
            // ignore
          }
          throw new Error(parsedError || "Rasm yuklashda xatolik yuz berdi");
        }

        const data = (await response.json()) as { url?: string | null };
        const imageUrl = typeof data?.url === "string" ? data.url : null;
        if (imageUrl) {
          setImages((prev) =>
            prev.includes(imageUrl) ? prev : [...prev, imageUrl],
          );
          uploadedCount += 1;
        }
      }

      if (uploadedCount > 0) {
        toast({
          title: uploadedCount > 1 ? "Rasmlar qo'shildi" : "Rasm qo'shildi",
          description: `${uploadedCount} ta rasm muvaffaqiyatli yuklandi.`,
        });
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Rasm yuklashda xatolik yuz berdi";
      setImageUploadError(message);
      toast({
        title: "Rasm yuklanmadi",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddImageUrl = () => {
    const url = newImageUrl.trim();
    if (!url) {
      return;
    }

    const isValidUrl = /^https?:\/\//i.test(url) || url.startsWith("/uploads/");
    if (!isValidUrl) {
      toast({
        title: "URL noto'g'ri",
        description: "To'g'ri to'liq URL yoki /uploads/ bilan boshlanadigan yo'l kiriting.",
        variant: "destructive",
      });
      return;
    }

    if (images.includes(url)) {
      toast({
        title: "Rasm allaqachon mavjud",
        description: "Bu rasm ro'yxatda bor.",
        variant: "destructive",
      });
      return;
    }

    setImages((prev) => [...prev, url]);
    setNewImageUrl("");
    setImageUploadError(null);
    toast({
      title: "URL qo'shildi",
      description: "Rasm ro'yxatga qo'shildi.",
    });
  };

  const handleRemoveImage = (imageUrl: string) => {
    setImages((prev) => prev.filter((img) => img !== imageUrl));
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

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
                  placeholder="Soch olish - 50,000 so'm&#10;Soqol qirish - 30,000 so'm"
                  rows={4}
                />
              </div>
                <div>
                  <label className="text-sm font-medium">Rasmlar</label>
                  <div className="mt-2 space-y-3">
                    <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/20 p-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <UploadCloud className="w-6 h-6 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          5MB gacha bo'lgan rasm fayllarini yuklang.
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingImages}
                          >
                            <UploadCloud className="w-4 h-4 mr-2" />
                            Fayl tanlash
                          </Button>
                          <Input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageFileChange}
                          />
                        </div>
                        {isUploadingImages && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Rasmlar yuklanmoqda...</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://example.com/image.png yoki /uploads/..."
                        disabled={isUploadingImages}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleAddImageUrl}
                        disabled={isUploadingImages || !newImageUrl.trim()}
                      >
                        <Link2 className="w-4 h-4 mr-2" />
                        URL qo'shish
                      </Button>
                    </div>

                    {imageUploadError && (
                      <p className="text-xs text-destructive">{imageUploadError}</p>
                    )}

                    {images.length > 0 && (
                      <div className="grid grid-cols-2 gap-3">
                        {images.map((image) => (
                          <div
                            key={image}
                            className="group relative overflow-hidden rounded-lg border bg-background"
                          >
                            <img
                              src={image}
                              alt="Sartaroshxona rasmi"
                              className="h-24 w-full object-cover"
                            />
                            <button
                              type="button"
                              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                              onClick={() => handleRemoveImage(image)}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || isUploadingImages}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {editingShop ? "Yangilanmoqda..." : "Qo'shilmoqda..."}
                      </span>
                    ) : (
                      editingShop ? "Yangilash" : "Qo'shish"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDialog(false);
                      resetForm();
                    }}
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

