import { useState, useEffect } from "react";
import { Search, Filter, MapPin, Map, Target, RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GearCard from "@/components/GearCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/DatePicker";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { useListings } from "@/hooks/useListings";
import { useLocation } from "@/hooks/useLocation";
import { getStorageImageUrl } from "@/lib/utils";
import { MapView } from "@/components/MapView";
import { formatDistance } from "@/lib/distance";
import {
  computeListingDistance,
  filterListings,
} from "@/lib/listing-filters";
import { LocationInput } from "@/components/LocationInput";

const Browse = () => {
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showMap, setShowMap] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [location, setLocation] = useState("");
  const [locationCoordinates, setLocationCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [distanceRange, setDistanceRange] = useState([0, 50]);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [userType, setUserType] = useState("all");
  
  // Applied filters (for "Apply Filters" button functionality)
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: "",
    selectedCategory: "all",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    location: "",
    priceRange: [0, 500] as [number, number],
    distanceRange: [0, 50] as [number, number],
    useCurrentLocation: false,
    userType: "all",
  });

  const { data: listings = [], isLoading, error } = useListings();
  const { coordinates, address, loading: locationLoading, getCurrentLocation } = useLocation();

  // Update location input when address is obtained
  useEffect(() => {
    if (address && useCurrentLocation) {
      setLocation(address);
    }
  }, [address, useCurrentLocation]);
  
  // Convert coordinates to user location format - prioritize manually entered location
  const userLocation = locationCoordinates || (coordinates ? { latitude: coordinates.latitude, longitude: coordinates.longitude } : null);

  const handleApplyFilters = () => {
    setAppliedFilters({
      searchTerm,
      selectedCategory,
      startDate,
      endDate,
      location,
      priceRange: priceRange as [number, number],
      distanceRange: distanceRange as [number, number],
      useCurrentLocation,
      userType,
    });
  };

  const handleGetCurrentLocation = () => {
    setUseCurrentLocation(true);
    getCurrentLocation();
  };

  const listingsWithDistance = listings.map((listing) => ({
    ...listing,
    distance: computeListingDistance(listing, userLocation),
  }));

  const filteredGear = filterListings(
    listingsWithDistance,
    appliedFilters,
    userLocation
  );

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "climbing", name: "Climbing" },
    { id: "camping", name: "Camping" },
    { id: "water_sports", name: "Water Sports" },
    { id: "winter_sports", name: "Winter Sports" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Browse Adventure Gear
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover amazing gear from local owners near you
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-adventure p-6 md:p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-foreground mb-2">
                  What gear?
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Climbing, camping..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
              
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Location
                </label>
                <LocationInput
                  value={location}
                  onChange={(address, coords) => {
                    setLocation(address);
                    if (coords) {
                      setLocationCoordinates(coords);
                    }
                  }}
                  placeholder="San Francisco, CA"
                  className="h-12"
                />
              </div>
              
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Pick-up</label>
                  <DatePicker 
                    date={startDate} 
                    onSelect={setStartDate} 
                    placeholder="Pick-up date" 
                    className="h-12" 
                    disabled={date => date < new Date()} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Return</label>
                  <DatePicker 
                    date={endDate} 
                    onSelect={setEndDate} 
                    placeholder="Return date" 
                    className="h-12" 
                    disabled={date => date < new Date()} 
                  />
                </div>
              </div>
            </div>

            {/* Additional Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 pt-4 border-t border-border">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Price Range: ${priceRange[0]} - ${priceRange[1]} per day
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={500}
                  min={0}
                  step={25}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Distance: {distanceRange[0]} - {distanceRange[1]} km
                  {userLocation && " (from your location)"}
                </label>
                <Slider
                  value={distanceRange}
                  onValueChange={setDistanceRange}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
                {!userLocation && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Enable location for distance filtering
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Owner Type
                </label>
                <div className="flex gap-2">
                  {[
                    { id: "all", name: "All" },
                    { id: "individual", name: "Individual" },
                    { id: "business", name: "Business" }
                  ].map((type) => (
                    <Button
                      key={type.id}
                      variant={userType === type.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUserType(type.id)}
                      className="flex-1"
                    >
                      {type.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Filter and Apply Button */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  onClick={handleApplyFilters}
                  variant="action"
                  size="sm"
                  className="h-10"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
                
                <Switch
                  id="map-toggle"
                  checked={showMap}
                  onCheckedChange={setShowMap}
                  aria-label="Toggle map view"
                />
                <label htmlFor="map-toggle" className="text-sm font-medium text-foreground">
                  Map view
                </label>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              {showMap
                ? `Viewing ${filteredGear.length} matching gear on the map`
                : `${filteredGear.length} gear items available`}
            </p>
          </div>

          {/* Gear Grid / Map View */}
          {showMap ? (
            <MapView
              listings={filteredGear.map(listing => ({
                id: String(listing.id),
                title: listing.title,
                description: listing.description || undefined,
                location_lat: listing.location_lat || 0,
                location_lng: listing.location_lng || 0,
                price_per_day: Number(listing.price_per_day),
                photos: Array.isArray(listing.photos) ? listing.photos : [],
                categories: listing.categories,
                min_rental_days: undefined,
                delivery_available: undefined,
              }))}
              userLocation={userLocation}
              onListingClick={(id) => window.open(`/gear/${id}`, '_blank')}
              className="h-96"
            />
          ) : isLoading ? (
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
          ) : error ? (
            <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-border bg-muted/40 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">Unable to load listings</h3>
              <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredGear.map((listing) => (
                <GearCard
                  key={String(listing.id)}
                  id={String(listing.id)}
                  title={listing.title}
                  description={listing.description || ""}
                  images={Array.isArray(listing.photos) ? listing.photos.map(photo => getStorageImageUrl(photo)) : ["/placeholder.svg"]}
                  price={Number(listing.price_per_day)}
                  rating={4.5}
                  reviewCount={0}
                  location={Array.isArray(listing.pickup_addresses) && listing.pickup_addresses.length > 0 ? listing.pickup_addresses[0] : "Location not specified"}
                  distance={
                    listing.distance ? formatDistance(listing.distance) : undefined
                  }
                  hasAddOns={Array.isArray(listing.add_ons) && listing.add_ons.length > 0}
                />
              ))}
              {filteredGear.length === 0 && !isLoading && (
                <div className="col-span-full flex h-48 flex-col items-center justify-center rounded-xl border border-border bg-muted/40 text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2">No gear found</h3>
                  <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Browse;