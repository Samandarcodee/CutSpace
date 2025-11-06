import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RatingStars from "./RatingStars";
import { MapPin } from "lucide-react";

interface BarbershopCardProps {
  id: string;
  name: string;
  rating: number;
  address: string;
  services: string[];
  images: string[];
  reviewCount: number;
  onViewDetails: (id: string) => void;
}

export default function BarbershopCard({
  id,
  name,
  rating,
  address,
  services,
  images,
  reviewCount,
  onViewDetails,
}: BarbershopCardProps) {
  return (
    <Card className="overflow-hidden" data-testid={`barbershop-card-${id}`}>
      <div className="grid grid-cols-2 gap-2 p-2">
        {images.slice(0, 2).map((img, idx) => (
          <div key={idx} className="aspect-[4/3] rounded-md overflow-hidden bg-muted">
            <img
              src={img}
              alt={`${name} ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-bold mb-1">{name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <RatingStars rating={rating} size="sm" />
            <span className="text-sm text-muted-foreground">
              {rating.toFixed(1)} ({reviewCount} sharh)
            </span>
          </div>
          <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{address}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {services.slice(0, 3).map((service, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {service}
            </Badge>
          ))}
        </div>

        <Button
          className="w-full"
          onClick={() => onViewDetails(id)}
          data-testid={`button-view-${id}`}
        >
          Ko'proq ko'rish
        </Button>
      </div>
    </Card>
  );
}
