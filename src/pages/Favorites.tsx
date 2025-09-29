import { useState, useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GearCard from "@/components/GearCard";
import { useFavorites } from "@/hooks/useFavorites";
import { useListings } from "@/hooks/useListings";
import { getStorageImageUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const Favorites = () => {
  const { getFavoriteIds } = useFavorites();
  const { data: listings = [], isLoading, error } = useListings();
  const [favoriteListings, setFavoriteListings] = useState<any[]>([]);
  
  const favoriteIds = getFavoriteIds();

  useEffect(() => {
    if (listings.length > 0 && favoriteIds.length > 0) {
      const favoritesData = listings.filter(listing => 
        favoriteIds.includes(listing.id)
      );
      setFavoriteListings(favoritesData);
    } else {
      setFavoriteListings([]);
    }
  }, [listings, favoriteIds]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                My Favorite Gear
              </h1>
              <p className="text-lg text-muted-foreground">
                Items you've saved for later
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="gear-card">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                My Favorite Gear
              </h1>
            </div>
            <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-border bg-muted/40 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">Unable to load favorites</h3>
              <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              My Favorite Gear
            </h1>
            <p className="text-lg text-muted-foreground">
              Items you've saved for later
            </p>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              {favoriteListings.length === 0 
                ? "No favorites yet" 
                : `${favoriteListings.length} favorite${favoriteListings.length === 1 ? '' : 's'}`}
            </p>
          </div>

          {/* Favorites Grid */}
          {favoriteListings.length === 0 ? (
            <div className="flex h-96 flex-col items-center justify-center rounded-xl border border-border bg-muted/40 text-center">
              <Heart className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No favorites yet</h3>
              <p className="max-w-md text-sm text-muted-foreground mb-4">
                Start browsing gear and click the heart icon to save items you're interested in.
              </p>
              <a 
                href="/browse" 
                className="text-primary hover:text-primary/80 font-medium underline"
              >
                Browse Gear
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {favoriteListings.map((listing) => (
                <GearCard
                  key={listing.id}
                  id={listing.id}
                  title={listing.title}
                  description={listing.description || ""}
                  images={listing.photos?.map(photo => getStorageImageUrl(photo)) || ["/placeholder.svg"]}
                  price={Number(listing.price_per_day)}
                  rating={4.5}
                  reviewCount={0}
                  location={listing.pickup_addresses?.[0] || "Location not specified"}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;