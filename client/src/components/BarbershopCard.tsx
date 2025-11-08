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
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group" 
      data-testid={`barbershop-card-${id}`}
      onClick={() => onViewDetails(id)}
    >
      <div className="relative">
        <div className="grid grid-cols-2 gap-1">
          {images.slice(0, 2).map((img, idx) => (
            <div key={idx} className="aspect-[4/3] overflow-hidden bg-muted">
              <img
                src={img}
                alt={`${name} ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full flex items-center gap-1 text-sm font-semibold">
          ⭐ {rating.toFixed(1)}
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <RatingStars rating={rating} size="sm" />
            <span>({reviewCount} sharh)</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{address}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {services.slice(0, 2).map((service, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs font-normal">
              {service.split(' - ')[0]}
            </Badge>
          ))}
          {services.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{services.length - 2}
            </Badge>
          )}
        </div>

        <Button
          className="w-full group-hover:bg-primary/90"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(id);
          }}
          data-testid={`button-view-${id}`}
        >
          Batafsil ma'lumot
        </Button>
      </div>
    </Card>
  );
}
