import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTelegram } from "@/contexts/TelegramContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Edit, Plus, Shield, MapPin, Phone, Star, ImageIcon, Scissors, X, AlertCircle, Save, Loader2, Calendar, Clock, User, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import type { Barbershop, Booking } from "@shared/schema";

interface FormData {
  name: string;
  address: string;
  phone: string;
  services: Array<{ name: string; price: string }>;
  images: string[];
}

interface FormErrors {
  name?: string;
  address?: string;
  phone?: string;
  services?: string;
  images?: string;
}

export default function Admin() {
  const { isAdmin, backendUser } = useTelegram();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingShop, setEditingShop] = useState<Barbershop | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [currentImageInput, setCurrentImageInput] = useState("");
  const [currentServiceName, setCurrentServiceName] = useState("");
  const [currentServicePrice, setCurrentServicePrice] = useState("");
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    address: "",
    phone: "",
    services: [],
    images: [],
  });

  const { data: barbershops = [], isLoading } = useQuery<Barbershop[]>({
    queryKey: ["/api/barbershops"],
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  // Admin tekshirish
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Kirish taqiqlangan</h2>
              <p className="text-muted-foreground">Admin paneliga kirish huquqi yo'q</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Sartaroshxona nomi kiritilishi shart";
    }

    if (!formData.address.trim()) {
      errors.address = "Manzil kiritilishi shart";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Telefon raqami kiritilishi shart";
    } else if (!/^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/.test(formData.phone.trim())) {
      errors.phone = "Telefon raqami formati: +998 90 123 45 67";
    }

    if (formData.services.length === 0) {
      errors.services = "Kamida bitta xizmat qo'shilishi kerak";
    }

    if (formData.images.length === 0) {
      errors.images = "Kamida bitta rasm qo'shilishi kerak";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const servicesFormatted = data.services.map(
        (s) => `${s.name} - ${s.price} so'm`
      );

      return await apiRequest("POST", "/api/admin/barbershops", {
        name: data.name.trim(),
        address: data.address.trim(),
        phone: data.phone.trim(),
        services: servicesFormatted,
        images: data.images,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/barbershops"] });
      toast({ 
        title: "✅ Muvaffaqiyatli!", 
        description: "Sartaroshxona qo'shildi",
      });
      setShowDialog(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error("Create error:", error);
      toast({
        title: "❌ Xatolik",
        description: error?.message || "Qo'shishda muammo yuz berdi",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const servicesFormatted = data.services.map(
        (s) => `${s.name} - ${s.price} so'm`
      );

      return await apiRequest("PUT", `/api/admin/barbershops/${id}`, {
        name: data.name.trim(),
        address: data.address.trim(),
        phone: data.phone.trim(),
        services: servicesFormatted,
        images: data.images,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/barbershops"] });
      toast({ 
        title: "✅ Muvaffaqiyatli!", 
        description: "Sartaroshxona yangilandi",
      });
      setShowDialog(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      toast({
        title: "❌ Xatolik",
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
      toast({ 
        title: "✅ Muvaffaqiyatli!", 
        description: "Sartaroshxona o'chirildi",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Xatolik",
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
      services: [],
      images: [],
    });
    setFormErrors({});
    setEditingShop(null);
    setCurrentImageInput("");
    setCurrentServiceName("");
    setCurrentServicePrice("");
  };

  const handleEdit = (shop: Barbershop) => {
    setEditingShop(shop);
    
    // Parse services from "Name - Price so'm" format
    const parsedServices = shop.services.map((service) => {
      const parts = service.split(" - ");
      const name = parts[0] || "";
      const price = parts[1]?.replace(" so'm", "").replace(/,/g, "") || "";
      return { name, price };
    });

    setFormData({
      name: shop.name,
      address: shop.address,
      phone: shop.phone || "",
      services: parsedServices,
      images: shop.images,
    });
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast({
        title: "⚠️ Majburiy maydonlar bo'sh",
        description: "Iltimos, barcha majburiy maydonlarni to'ldiring",
        variant: "destructive",
      });
      return;
    }

    if (editingShop) {
      updateMutation.mutate({ id: editingShop.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const addService = () => {
    if (!currentServiceName.trim() || !currentServicePrice.trim()) {
      toast({
        title: "⚠️ Ma'lumot to'liq emas",
        description: "Xizmat nomi va narxini kiriting",
        variant: "destructive",
      });
      return;
    }

    const price = currentServicePrice.replace(/\D/g, "");
    if (!price) {
      toast({
        title: "⚠️ Noto'g'ri narx",
        description: "Narx faqat raqamlardan iborat bo'lishi kerak",
        variant: "destructive",
      });
      return;
    }

    setFormData({
      ...formData,
      services: [...formData.services, { name: currentServiceName.trim(), price }],
    });
    setCurrentServiceName("");
    setCurrentServicePrice("");
    setFormErrors({ ...formErrors, services: undefined });
  };

  const removeService = (index: number) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index),
    });
  };

  const addImage = () => {
    if (!currentImageInput.trim()) {
      toast({
        title: "⚠️ Rasm manzili bo'sh",
        description: "Rasm manzilini kiriting",
        variant: "destructive",
      });
      return;
    }

    if (!currentImageInput.startsWith("/") && !currentImageInput.startsWith("http")) {
      toast({
        title: "⚠️ Noto'g'ri format",
        description: "Rasm manzili / yoki http bilan boshlanishi kerak",
        variant: "destructive",
      });
      return;
    }

    setFormData({
      ...formData,
      images: [...formData.images, currentImageInput.trim()],
    });
    setCurrentImageInput("");
    setFormErrors({ ...formErrors, images: undefined });
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const formatPrice = (price: string): string => {
    const num = parseInt(price.replace(/\D/g, ""));
    return isNaN(num) ? "" : num.toLocaleString("en-US");
  };

  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "accepted" | "rejected" }) => {
      return await apiRequest("POST", `/api/bookings/${id}/${status === "accepted" ? "accept" : "reject"}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ 
        title: "✅ Muvaffaqiyatli!", 
        description: "Buyurtma holati yangilandi",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Xatolik",
        description: error?.message || "Holatni yangilashda xatolik",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Qabul qilindi</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Rad etildi</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Kutilmoqda</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBarbershopName = (barbershopId: string) => {
    const barbershop = barbershops.find(b => b.id === barbershopId);
    return barbershop?.name || "Noma'lum";
  };

  if (isLoading || bookingsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground font-medium">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  const pendingBookings = bookings.filter(b => b.status === "pending");
  const acceptedBookings = bookings.filter(b => b.status === "accepted");
  const rejectedBookings = bookings.filter(b => b.status === "rejected");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-24">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background backdrop-blur-sm border border-primary/10 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-xl">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Sartaroshxonalarni boshqarish va nazorat qilish
                </p>
              </div>
            </div>
            <Button 
              onClick={() => { resetForm(); setShowDialog(true); }}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Yangi qo'shish
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card className="bg-gradient-to-br from-primary/5 to-background border-primary/10">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Sartaroshxonalar</p>
                  <p className="text-2xl sm:text-3xl font-bold text-primary">{barbershops.length}</p>
                </div>
                <Scissors className="w-8 h-8 sm:w-10 sm:h-10 text-primary/30" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-500/5 to-background border-yellow-500/10">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Kutilayotgan</p>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{pendingBookings.length}</p>
                </div>
                <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/5 to-background border-green-500/10">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Qabul qilindi</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">{acceptedBookings.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-500/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/5 to-background border-red-500/10">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Jami buyurtma</p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-600">{bookings.length}</p>
                </div>
                <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-red-500/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="barbershops" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="barbershops" className="flex items-center gap-2">
              <Scissors className="w-4 h-4" />
              <span className="hidden sm:inline">Sartaroshxonalar</span>
              <span className="sm:hidden">Bizneslar</span>
              <Badge variant="secondary" className="ml-1">{barbershops.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Buyurtmalar</span>
              <span className="sm:hidden">Yozuvlar</span>
              <Badge variant="secondary" className="ml-1">{bookings.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Barbershops Tab */}
          <TabsContent value="barbershops" className="space-y-4">
        {barbershops.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <Scissors className="w-10 h-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Hozircha sartaroshxona yo'q</h3>
                <p className="text-muted-foreground mb-4">
                  Birinchi sartaroshxonani qo'shish uchun yuqoridagi tugmani bosing
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {barbershops.map((shop) => (
              <Card 
                key={shop.id} 
                className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/50 border-border/50 group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors truncate">
                        {shop.name}
                      </CardTitle>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => handleEdit(shop)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive transition-colors"
                        onClick={() => {
                          if (confirm(`"${shop.name}" sartaroshxonasini o'chirishni xohlaysizmi?`)) {
                            deleteMutation.mutate(shop.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Rating */}
                  <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-transparent p-2 rounded-lg">
                    <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                    <span className="font-bold text-lg">{shop.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">
                      ({shop.reviewCount} sharh)
                    </span>
                  </div>

                  <Separator />

                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                      <span className="text-muted-foreground line-clamp-2">{shop.address}</span>
                    </div>
                    {shop.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{shop.phone}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Services */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <Scissors className="w-3 h-3" />
                      Xizmatlar ({shop.services.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {shop.services.slice(0, 3).map((service, idx) => (
                        <Badge 
                          key={idx} 
                          variant="secondary" 
                          className="text-xs bg-primary/5 hover:bg-primary/10 transition-colors"
                        >
                          {service.split(' - ')[0]}
                        </Badge>
                      ))}
                      {shop.services.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{shop.services.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      Rasmlar ({shop.images.length})
                    </p>
                    <div className="flex gap-1">
                      {shop.images.slice(0, 3).map((_, idx) => (
                        <div key={idx} className="w-8 h-8 bg-muted rounded border flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                      ))}
                      {shop.images.length > 3 && (
                        <div className="w-8 h-8 bg-muted rounded border flex items-center justify-center text-xs">
                          +{shop.images.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            {bookings.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                    <Calendar className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Hozircha buyurtma yo'q</h3>
                    <p className="text-muted-foreground">
                      Mijozlar buyurtma berganlarida bu yerda ko'rinadi
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {/* Pending Bookings */}
                {pendingBookings.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      Kutilayotgan buyurtmalar
                      <Badge variant="secondary">{pendingBookings.length}</Badge>
                    </h3>
                    <div className="space-y-2">
                      {pendingBookings.map((booking) => (
                        <Card key={booking.id} className="border-l-4 border-l-yellow-500">
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-semibold flex items-center gap-2">
                                      <User className="w-4 h-4 text-primary" />
                                      {booking.customerName}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {getBarbershopName(booking.barbershopId)}
                                    </p>
                                  </div>
                                  {getStatusBadge(booking.status)}
                                </div>
                                <div className="flex flex-wrap gap-3 text-sm">
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Scissors className="w-4 h-4" />
                                    <span>{booking.service}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    <span>{booking.date}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span>{booking.time}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                                  onClick={() => updateBookingStatusMutation.mutate({ id: booking.id, status: "accepted" })}
                                  disabled={updateBookingStatusMutation.isPending}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Qabul qilish
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => updateBookingStatusMutation.mutate({ id: booking.id, status: "rejected" })}
                                  disabled={updateBookingStatusMutation.isPending}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Rad etish
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accepted Bookings */}
                {acceptedBookings.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 mt-6">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Qabul qilingan buyurtmalar
                      <Badge variant="secondary">{acceptedBookings.length}</Badge>
                    </h3>
                    <div className="space-y-2">
                      {acceptedBookings.map((booking) => (
                        <Card key={booking.id} className="border-l-4 border-l-green-500 bg-green-500/5">
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-semibold flex items-center gap-2">
                                      <User className="w-4 h-4 text-primary" />
                                      {booking.customerName}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {getBarbershopName(booking.barbershopId)}
                                    </p>
                                  </div>
                                  {getStatusBadge(booking.status)}
                                </div>
                                <div className="flex flex-wrap gap-3 text-sm">
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Scissors className="w-4 h-4" />
                                    <span>{booking.service}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    <span>{booking.date}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span>{booking.time}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejected Bookings */}
                {rejectedBookings.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 mt-6">
                      <XCircle className="w-5 h-5 text-red-600" />
                      Rad etilgan buyurtmalar
                      <Badge variant="secondary">{rejectedBookings.length}</Badge>
                    </h3>
                    <div className="space-y-2">
                      {rejectedBookings.map((booking) => (
                        <Card key={booking.id} className="border-l-4 border-l-red-500 bg-red-500/5 opacity-75">
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-semibold flex items-center gap-2">
                                      <User className="w-4 h-4 text-primary" />
                                      {booking.customerName}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {getBarbershopName(booking.barbershopId)}
                                    </p>
                                  </div>
                                  {getStatusBadge(booking.status)}
                                </div>
                                <div className="flex flex-wrap gap-3 text-sm">
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Scissors className="w-4 h-4" />
                                    <span>{booking.service}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    <span>{booking.date}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span>{booking.time}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Add/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={(open) => {
          if (!open) resetForm();
          setShowDialog(open);
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                {editingShop ? (
                  <>
                    <Edit className="w-6 h-6 text-primary" />
                    Sartaroshxonani tahrirlash
                  </>
                ) : (
                  <>
                    <Plus className="w-6 h-6 text-primary" />
                    Yangi sartaroshxona qo'shish
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                Barcha majburiy maydonlarni to'ldiring va ma'lumotlarni saqlang
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium flex items-center gap-1 mb-2">
                    Nomi <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setFormErrors({ ...formErrors, name: undefined });
                    }}
                    placeholder="Masalan: DemoBarber"
                    className={formErrors.name ? "border-destructive" : ""}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center gap-1 mb-2">
                    Manzil <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) => {
                      setFormData({ ...formData, address: e.target.value });
                      setFormErrors({ ...formErrors, address: undefined });
                    }}
                    placeholder="Masalan: Amir Temur ko'chasi 15, Toshkent"
                    className={formErrors.address ? "border-destructive" : ""}
                  />
                  {formErrors.address && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.address}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center gap-1 mb-2">
                    Telefon <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      setFormErrors({ ...formErrors, phone: undefined });
                    }}
                    placeholder="+998 90 123 45 67"
                    className={formErrors.phone ? "border-destructive" : ""}
                  />
                  {formErrors.phone && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Services */}
              <div>
                <label className="text-sm font-medium flex items-center gap-1 mb-3">
                  <Scissors className="w-4 h-4" />
                  Xizmatlar <span className="text-destructive">*</span>
                </label>
                
                {formData.services.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {formData.services.map((service, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between p-3 bg-muted rounded-lg group hover:bg-muted/80 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{service.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(service.price)} so'm
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => removeService(idx)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Card className="bg-muted/30">
                  <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Input
                          value={currentServiceName}
                          onChange={(e) => setCurrentServiceName(e.target.value)}
                          placeholder="Xizmat nomi"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addService();
                            }
                          }}
                        />
                      </div>
                      <div>
                        <Input
                          value={currentServicePrice}
                          onChange={(e) => {
                            const nums = e.target.value.replace(/\D/g, "");
                            setCurrentServicePrice(nums);
                          }}
                          placeholder="Narx (so'm)"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addService();
                            }
                          }}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={addService}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Xizmat qo'shish
                    </Button>
                  </CardContent>
                </Card>
                
                {formErrors.services && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formErrors.services}</AlertDescription>
                  </Alert>
                )}
              </div>

              <Separator />

              {/* Images */}
              <div>
                <label className="text-sm font-medium flex items-center gap-1 mb-3">
                  <ImageIcon className="w-4 h-4" />
                  Rasmlar <span className="text-destructive">*</span>
                </label>
                
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {formData.images.map((image, idx) => (
                      <div 
                        key={idx} 
                        className="relative p-3 bg-muted rounded-lg group hover:bg-muted/80 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <ImageIcon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          <p className="text-xs break-all flex-1">{image}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => removeImage(idx)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Card className="bg-muted/30">
                  <CardContent className="pt-4 space-y-3">
                    <Input
                      value={currentImageInput}
                      onChange={(e) => setCurrentImageInput(e.target.value)}
                      placeholder="/images/luxury.png yoki https://example.com/image.jpg"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addImage();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={addImage}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Rasm qo'shish
                    </Button>
                  </CardContent>
                </Card>
                
                {formErrors.images && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formErrors.images}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => { setShowDialog(false); resetForm(); }}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Bekor qilish
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editingShop ? "Yangilash" : "Qo'shish"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
