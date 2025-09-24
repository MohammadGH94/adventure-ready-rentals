import { Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useFavorites";

interface GearCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  rating: number;
  reviewCount: number;
  location: string;
}

const GearCard = ({ id, title, description, image, price, rating, reviewCount, location }: GearCardProps) => {
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();
  const { toggleFavorite, isFavorited } = useFavorites();

  const isCurrentlyFavorited = isFavorited(id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      toggleFavorite(id);
      toast({
        description: isCurrentlyFavorited ? "Removed from favorites" : "Added to favorites",
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast({
        description: "Failed to update favorites",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="gear-card group cursor-pointer overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageError ? "/placeholder.svg" : image}
          alt={title}
          className="h-full w-full object-cover transition-adventure group-hover:scale-105"
          onError={() => setImageError(true)}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 z-20 bg-white/80 backdrop-blur-sm hover:bg-white/90"
          aria-label={isCurrentlyFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`h-4 w-4 transition-all duration-200 ${isCurrentlyFavorited ? "fill-red-500 text-red-500 scale-110" : "text-gray-600 hover:text-red-400"}`} />
        </Button>
        <Link
          to={`/gear/${id}`}
          className="absolute inset-0 z-10"
          aria-label={`View ${title}`}
        >
          <span className="sr-only">View {title}</span>
        </Link>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-card-foreground line-clamp-1">
            <Link to={`/gear/${id}`} className="transition-adventure hover:text-primary">
              {title}
            </Link>
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
          <Button variant="action" size="sm" asChild>
            <Link to={`/gear/${id}`}>
              Rent Now
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GearCard;