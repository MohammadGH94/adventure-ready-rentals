import { useEffect, useMemo, useState } from "react";
import { Search, Filter, MapPin, Calendar, Map } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GearCard from "@/components/GearCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { getEquipmentList } from "@/services/firestore";
import { normalizeEquipmentToGearCard, type GearCardData } from "@/utils/gear";
import { useSearchParams } from "react-router-dom";

const Browse = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showMap, setShowMap] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    data: equipment,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["equipment", "list"],
    queryFn: getEquipmentList,
  });

  const allGear = useMemo(() => {
    if (!equipment) {
      return [] as GearCardData[];
    }

    return equipment.map(normalizeEquipmentToGearCard);
  }, [equipment]);

  const filteredGear = useMemo(() => {
    return allGear.filter((gear) => {
      const normalizedSearch = searchTerm.trim().toLowerCase();
      const matchesSearch =
        normalizedSearch.length === 0 ||
        gear.title.toLowerCase().includes(normalizedSearch) ||
        gear.description.toLowerCase().includes(normalizedSearch);
      const matchesCategory =
        selectedCategory === "all" ||
        (gear.category ? gear.category === selectedCategory : false);

      return matchesSearch && matchesCategory;
    });
  }, [allGear, searchTerm, selectedCategory]);

  const categories = useMemo(() => {
    const dynamicCategories = Array.from(
      new Set(
        allGear
          .map((gear) => gear.category)
          .filter((category): category is string => Boolean(category)),
      ),
    );

    if (dynamicCategories.length === 0) {
      return [{ id: "all", name: "All Categories" }];
    }

    const formatCategoryLabel = (value: string) =>
      value
        .split(/[-_\s]+/)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" ");

    return [
      { id: "all", name: "All Categories" },
      ...dynamicCategories
        .sort((a, b) => a.localeCompare(b))
        .map((category) => ({ id: category, name: formatCategoryLabel(category) })),
    ];
  }, [allGear]);

  useEffect(() => {
    const categoryParam = searchParams.get("category");

    if (!categoryParam) {
      if (selectedCategory !== "all") {
        setSelectedCategory("all");
      }
      return;
    }

    const normalizedCategory = categoryParam.trim().toLowerCase();
    const isValidCategory = categories.some(
      (category) => category.id === normalizedCategory,
    );

    if (isValidCategory && normalizedCategory !== selectedCategory) {
      setSelectedCategory(normalizedCategory);
    }
  }, [categories, searchParams, selectedCategory]);

  useEffect(() => {
    if (!categories.some((category) => category.id === selectedCategory)) {
      setSelectedCategory("all");
    }
  }, [categories, selectedCategory]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);

    const nextSearchParams = new URLSearchParams(searchParams);

    if (categoryId === "all") {
      nextSearchParams.delete("category");
    } else {
      nextSearchParams.set("category", categoryId);
    }

    setSearchParams(nextSearchParams, { replace: true });
  };

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
          <div className="bg-card rounded-xl shadow-soft p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search gear..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Location"
                    className="pl-10 h-11"
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Dates"
                    className="pl-10 h-11"
                  />
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
                <Button variant="ghost" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
              <div className="flex items-center gap-3">
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
              {isLoading
                ? "Loading gear listings..."
                : isError
                ? "We couldn't load gear listings right now."
                : showMap
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
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                <div className="col-span-full text-center text-muted-foreground">Loading gear...</div>
              ) : isError ? (
                <div className="col-span-full rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
                  Something went wrong while fetching gear. Please try again later.
                </div>
              ) : filteredGear.length === 0 ? (
                <div className="col-span-full rounded-lg border border-border bg-muted/40 p-6 text-center text-muted-foreground">
                  No gear matches your current filters. Try adjusting your search or filters.
                </div>
              ) : (
                filteredGear.map((gear) => (
                  <GearCard
                    key={gear.id}
                    title={gear.title}
                    description={gear.description}
                    image={gear.image}
                    price={gear.price}
                    rating={gear.rating}
                    reviewCount={gear.reviewCount}
                    location={gear.location}
                  />
                ))
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
