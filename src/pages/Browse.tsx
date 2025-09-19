import { useState } from "react";
import { Search, Filter, MapPin, Calendar, Map } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GearCard from "@/components/GearCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import climbingGear from "@/assets/climbing-gear.jpg";
import campingGear from "@/assets/camping-gear.jpg";
import waterSportsGear from "@/assets/water-sports-gear.jpg";
import winterSportsGear from "@/assets/winter-sports-gear.jpg";

const allGear = [
  {
    title: "Professional Climbing Rope Set",
    description: "Complete dynamic climbing rope with carabiners and safety gear included",
    image: climbingGear,
    price: 45,
    rating: 4.9,
    reviewCount: 127,
    location: "Boulder, CO",
    category: "climbing"
  },
  {
    title: "4-Person Family Camping Kit",
    description: "Everything you need for family camping: tent, sleeping bags, camp chairs",
    image: campingGear,
    price: 85,
    rating: 4.8,
    reviewCount: 89,
    location: "Portland, OR",
    category: "camping"
  },
  {
    title: "Inflatable Kayak with Paddle",
    description: "2-person inflatable kayak perfect for lakes and calm rivers",
    image: waterSportsGear,
    price: 65,
    rating: 4.7,
    reviewCount: 156,
    location: "Lake Tahoe, CA",
    category: "water-sports"
  },
  {
    title: "Premium Ski Equipment Set",
    description: "High-performance skis, boots, and poles for advanced skiers",
    image: winterSportsGear,
    price: 120,
    rating: 4.9,
    reviewCount: 94,
    location: "Aspen, CO",
    category: "winter-sports"
  },
  {
    title: "Rock Climbing Starter Kit",
    description: "Perfect for beginners: harness, helmet, shoes, and chalk bag",
    image: climbingGear,
    price: 35,
    rating: 4.6,
    reviewCount: 203,
    location: "Joshua Tree, CA",
    category: "climbing"
  },
  {
    title: "Backpacking Essentials",
    description: "Lightweight tent, sleeping system, and cooking gear for multi-day hikes",
    image: campingGear,
    price: 95,
    rating: 4.8,
    reviewCount: 167,
    location: "Yosemite, CA",
    category: "camping"
  },
  {
    title: "Surfboard & Wetsuit Combo",
    description: "Complete surfing setup with board, wetsuit, and accessories",
    image: waterSportsGear,
    price: 55,
    rating: 4.7,
    reviewCount: 89,
    location: "Santa Cruz, CA",
    category: "water-sports"
  },
  {
    title: "Snowboard Complete Package",
    description: "Board, boots, bindings, and helmet for the perfect snow day",
    image: winterSportsGear,
    price: 75,
    rating: 4.8,
    reviewCount: 112,
    location: "Whistler, BC",
    category: "winter-sports"
  }
];

const Browse = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showMap, setShowMap] = useState(false);

  const filteredGear = allGear.filter(gear => {
    const matchesSearch = gear.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gear.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || gear.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "climbing", name: "Climbing" },
    { id: "camping", name: "Camping" },
    { id: "water-sports", name: "Water Sports" },
    { id: "winter-sports", name: "Winter Sports" }
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
                    onClick={() => setSelectedCategory(category.id)}
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
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredGear.map((gear, index) => (
                <GearCard
                  key={index}
                  title={gear.title}
                  description={gear.description}
                  image={gear.image}
                  price={gear.price}
                  rating={gear.rating}
                  reviewCount={gear.reviewCount}
                  location={gear.location}
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

export default Browse;