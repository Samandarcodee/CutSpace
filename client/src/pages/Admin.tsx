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
import { Trash2, Edit, Plus, Shield } from "lucide-react";
import type { Barbershop } from "@shared/schema";

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
    images: "",
  });

  // Admin tekshirish
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">Admin paneliga kirish huquqi yo'q</p>
        </Card>
      </div>
    );
  }

  const { data: barbershops = [], isLoading } = useQuery<Barbershop[]>({
    queryKey: ["/api/barbershops"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/barbershops", {
        ...data,
        services: data.services.split("\n").filter((s: string) => s.trim()),
        images: data.images.split("\n").filter((s: string) => s.trim()),
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
      return await apiRequest("PUT", `/api/admin/barbershops/${id}`, {
        ...data,
        services: data.services.split("\n").filter((s: string) => s.trim()),
        images: data.images.split("\n").filter((s: string) => s.trim()),
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
      address: shop.address,
      phone: shop.phone || "",
      services: shop.services.join("\n"),
      images: shop.images.join("\n"),
    });
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (editingShop) {
      updateMutation.mutate({ id: editingShop.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
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
      <div className="max-w-4xl mx-auto p-4">
        <header className="bg-card border-b border-card-border p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
            <Button onClick={() => { resetForm(); setShowDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Qo'shish
            </Button>
          </div>
        </header>

        <div className="space-y-4">
          {barbershops.map((shop) => (
            <Card key={shop.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{shop.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{shop.address}</p>
                  {shop.phone && (
                    <p className="text-sm text-muted-foreground">📞 {shop.phone}</p>
                  )}
                  <p className="text-sm mt-2">⭐ {shop.rating.toFixed(1)}</p>
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">Xizmatlar:</p>
                    <ul className="text-sm">
                      {shop.services.slice(0, 3).map((service, idx) => (
                        <li key={idx}>• {service}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(shop)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm(`"${shop.name}" ni o'chirishni xohlaysizmi?`)) {
                        deleteMutation.mutate(shop.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
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
                <label className="text-sm font-medium">Rasmlar (har birini yangi qatorda)</label>
                <Textarea
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="/images/luxury.png&#10;/images/barber-work.png"
                  rows={3}
                />
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

