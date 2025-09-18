import { Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GearCardProps {
  title: string;
  description: string;
  image: string;
  price: number;
  rating: number;
  reviewCount: number;
  location: string;
}

const GearCard = ({ title, description, image, price, rating, reviewCount, location }: GearCardProps) => {
  return (
    <div className="gear-card group cursor-pointer overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-adventure"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-white/80 hover:bg-white/90 backdrop-blur-sm"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-card-foreground line-clamp-1">
            {title}
          </h3>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-3 w-3 fill-action text-action" />
            <span className="text-foreground font-medium">{rating}</span>
            <span className="text-muted-foreground">({reviewCount})</span>
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {description}
        </p>
        
        <div className="text-xs text-muted-foreground mb-3">
          📍 {location}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-foreground">
              ${price}
            </span>
            <span className="text-muted-foreground text-sm ml-1">
              /day
            </span>
          </div>
          <Button variant="action" size="sm">
            Rent Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GearCard;