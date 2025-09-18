import CategoryCard from "./CategoryCard";
import climbingGear from "@/assets/climbing-gear.jpg";
import campingGear from "@/assets/camping-gear.jpg";
import waterSportsGear from "@/assets/water-sports-gear.jpg";
import winterSportsGear from "@/assets/winter-sports-gear.jpg";

const categories = [
  {
    title: "Climbing & Mountaineering",
    description: "Ropes, harnesses, helmets, and more for your vertical adventures",
    image: climbingGear,
    itemCount: 245
  },
  {
    title: "Camping & Hiking",
    description: "Tents, sleeping bags, backpacks for the perfect outdoor getaway",
    image: campingGear,
    itemCount: 189
  },
  {
    title: "Water Sports",
    description: "Kayaks, paddleboards, snorkeling gear for aquatic fun",
    image: waterSportsGear,
    itemCount: 156
  },
  {
    title: "Winter Sports",
    description: "Skis, snowboards, boots for powder-perfect adventures",
    image: winterSportsGear,
    itemCount: 203
  }
];

const Categories = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Explore by Category
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find the perfect gear for your next adventure. From mountain peaks to ocean depths.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <CategoryCard
              key={index}
              title={category.title}
              description={category.description}
              image={category.image}
              itemCount={category.itemCount}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;