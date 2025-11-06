import RatingStars from '../RatingStars';
import { useState } from 'react';

export default function RatingStarsExample() {
  const [rating, setRating] = useState(3);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm">Ko'rsatish:</span>
        <RatingStars rating={4.5} size="md" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Interaktiv:</span>
        <RatingStars rating={rating} interactive onRate={setRating} size="lg" />
      </div>
    </div>
  );
}
