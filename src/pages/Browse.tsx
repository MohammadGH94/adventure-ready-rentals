import { useState } from "react";
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

const Browse = () => {
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showMap, setShowMap] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [distanceRange, setDistanceRange] = useState([0, 50]);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  
  // Applied filters (for "Apply Filters" button functionality)
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: "",
    selectedCategory: "all",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    location: "",
    priceRange: [0, 500],
    distanceRange: [0, 50],
    useCurrentLocation: false,
  });

  const { data: listings = [], isLoading, error } = useListings();
  const { coordinates, loading: locationLoading, getCurrentLocation } = useLocation();

  const handleApplyFilters = () => {
    setAppliedFilters({
      searchTerm,
      selectedCategory,
      startDate,
      endDate,
      location,
      priceRange,
      distanceRange,
      useCurrentLocation,
    });
  };

  const handleGetCurrentLocation = () => {
    setUseCurrentLocation(true);
    getCurrentLocation();
  };

  const filteredGear = listings.filter(listing => {
    const filters = appliedFilters;
    
    // Search filter
    const matchesSearch = !filters.searchTerm || 
      listing.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      (listing.description || "").toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = filters.selectedCategory === "all" || 
      listing.categories.some(cat => cat.toLowerCase() === filters.selectedCategory.toLowerCase());
    
    // Price filter
    const matchesPrice = Number(listing.price_per_day) >= filters.priceRange[0] && 
      Number(listing.price_per_day) <= filters.priceRange[1];
    
    // Location/distance filter (simplified - in real app would use actual geolocation)
    const matchesLocation = !filters.location || 
      (listing.pickup_addresses && listing.pickup_addresses.some(addr => 
        addr.toLowerCase().includes(filters.location.toLowerCase())
      ));
    
    return matchesSearch && matchesCategory && matchesPrice && matchesLocation;
  });

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
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="San Francisco, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10 h-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleGetCurrentLocation}
                    disabled={locationLoading}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  >
                    {locationLoading ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Target className="h-3 w-3" />
                    )}
                  </Button>
                </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pt-4 border-t border-border">
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
                  Distance: {distanceRange[0]} - {distanceRange[1]} miles
                </label>
                <Slider
                  value={distanceRange}
                  onValueChange={setDistanceRange}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
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
            <div className="flex h-96 flex-col items-center justify-center rounded-xl border border-border bg-muted/40 text-center">
              <Map className="mb-3 h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">Map view coming soon</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Use the filters to find the perfect gear near you. Map results will appear here with locations and
                availability details.
              </p>
            </div>
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
                  key={listing.id}
                  id={listing.id}
                  title={listing.title}
                  description={listing.description || ""}
                  image={getStorageImageUrl(listing.photos?.[0])}
                  price={Number(listing.price_per_day)}
                  rating={4.5}
                  reviewCount={0}
                  location={listing.pickup_addresses?.[0] || "Location not specified"}
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