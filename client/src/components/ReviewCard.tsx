import RatingStars from "./RatingStars";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ReviewCardProps {
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export default function ReviewCard({ author, rating, comment, date }: ReviewCardProps) {
  const initials = author
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex gap-3" data-testid={`review-${author.toLowerCase().replace(/\s+/g, '-')}`}>
      <Avatar className="w-10 h-10 shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary text-sm">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{author}</span>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
        <RatingStars rating={rating} size="sm" />
        <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{comment}</p>
      </div>
    </div>
  );
}
