import { Star } from 'lucide-react';


type StarRatingProps = {
  rating: number;
  setRating?: (rating: number) => void;
};

const StarRating = ({ rating, setRating }: StarRatingProps) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          onClick={() => setRating?.(star)}
          className={`w-5 h-5 transition-colors duration-200 ${
            rating >= star ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
          } ${setRating ? 'cursor-pointer' : ''}`}
        />
      ))}
    </div>
  );
};

export default StarRating;