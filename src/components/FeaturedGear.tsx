import GearCard from "./GearCard";
import climbingGear from "@/assets/climbing-gear.jpg";
import campingGear from "@/assets/camping-gear.jpg";
import waterSportsGear from "@/assets/water-sports-gear.jpg";
import winterSportsGear from "@/assets/winter-sports-gear.jpg";

const featuredGear = [
  {
    title: "Professional Climbing Rope Set",
    description: "Complete dynamic climbing rope with carabiners and safety gear included",
    image: climbingGear,
    price: 45,
    rating: 4.9,
    reviewCount: 127,
    location: "Boulder, CO"
  },
  {
    title: "4-Person Family Camping Kit",
    description: "Everything you need for family camping: tent, sleeping bags, camp chairs",
    image: campingGear,
    price: 85,
    rating: 4.8,
    reviewCount: 89,
    location: "Portland, OR"
  },
  {
    title: "Inflatable Kayak with Paddle",
    description: "2-person inflatable kayak perfect for lakes and calm rivers",
    image: waterSportsGear,
    price: 65,
    rating: 4.7,
    reviewCount: 156,
    location: "Lake Tahoe, CA"
  },
  {
    title: "Premium Ski Equipment Set",
    description: "High-performance skis, boots, and poles for advanced skiers",
    image: winterSportsGear,
    price: 120,
    rating: 4.9,
    reviewCount: 94,
    location: "Aspen, CO"
  },
  {
    title: "Rock Climbing Starter Kit",
    description: "Perfect for beginners: harness, helmet, shoes, and chalk bag",
    image: climbingGear,
    price: 35,
    rating: 4.6,
    reviewCount: 203,
    location: "Joshua Tree, CA"
  },
  {
    title: "Backpacking Essentials",
    description: "Lightweight tent, sleeping system, and cooking gear for multi-day hikes",
    image: campingGear,
    price: 95,
    rating: 4.8,
    reviewCount: 167,
    location: "Yosemite, CA"
  }
];

const FeaturedGear = () => {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Featured Gear
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hand-picked adventure equipment from trusted local owners near you.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredGear.map((gear, index) => (
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
      </div>
    </section>
  );
};

export default FeaturedGear;