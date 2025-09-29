import { Star, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useFavorites";

interface GearCardProps {
  id: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  rating: number;
  reviewCount: number;
  location: string;
  distance?: string;
  hasAddOns?: boolean;
}

const GearCard = ({ id, title, description, images, price, rating, reviewCount, location, distance, hasAddOns }: GearCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();
  const { toggleFavorite, isFavorited } = useFavorites();

  const isCurrentlyFavorited = isFavorited(id);
  const hasMultipleImages = images.length > 1;
  const currentImage = images[currentImageIndex] || "/placeholder.svg";

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

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="gear-card group cursor-pointer overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageError ? "/placeholder.svg" : currentImage}
          alt={title}
          className="h-full w-full object-cover transition-adventure group-hover:scale-105"
          onError={() => setImageError(true)}
        />
        
        {/* Image Navigation */}
        {hasMultipleImages && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextImage}
              className="absolute right-12 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            {/* Image Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
        
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
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center">
            <span>📍 {location}</span>
            {distance && (
              <span className="text-primary font-medium ml-2">• {distance} away</span>
            )}
          </div>
          {hasAddOns && (
            <span className="bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-medium">
              Extras Available
            </span>
          )}
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