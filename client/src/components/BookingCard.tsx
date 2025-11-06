import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge from "./StatusBadge";
import { Calendar, Clock, User, Scissors } from "lucide-react";

type BookingStatus = "pending" | "accepted" | "rejected";

interface BookingCardProps {
  id: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  status: BookingStatus;
  barbershopName: string;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  isBarberView?: boolean;
}

export default function BookingCard({
  id,
  customerName,
  service,
  date,
  time,
  status,
  barbershopName,
  onAccept,
  onReject,
  isBarberView = false,
}: BookingCardProps) {
  return (
    <Card className="p-4" data-testid={`booking-card-${id}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{customerName}</span>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="space-y-2 text-sm">
        {!isBarberView && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Scissors className="w-4 h-4" />
            <span>{barbershopName}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <Scissors className="w-4 h-4" />
          <span>{service}</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{date}</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{time}</span>
        </div>
      </div>

      {isBarberView && status === "pending" && onAccept && onReject && (
        <div className="flex gap-2 mt-4">
          <Button
            variant="default"
            className="flex-1"
            onClick={() => onAccept(id)}
            data-testid={`button-accept-${id}`}
          >
            ✅ Qabul qilish
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => onReject(id)}
            data-testid={`button-reject-${id}`}
          >
            ❌ Rad etish
          </Button>
        </div>
      )}
    </Card>
  );
}
