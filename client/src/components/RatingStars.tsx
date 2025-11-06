import { Star } from "lucide-react";
import { useState } from "react";

interface RatingStarsProps {
  rating: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}

export default function RatingStars({
  rating,
  interactive = false,
  onRate,
  size = "md",
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const handleClick = (value: number) => {
    if (interactive && onRate) {
      onRate(value);
    }
  };

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => {
        const filled = value <= (hoverRating || rating);
        
        return (
          <button
            key={value}
            onClick={() => handleClick(value)}
            onMouseEnter={() => interactive && setHoverRating(value)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            disabled={!interactive}
            className={`${interactive ? "cursor-pointer" : "cursor-default"}`}
            data-testid={`star-${value}`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-none text-muted-foreground/30"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
