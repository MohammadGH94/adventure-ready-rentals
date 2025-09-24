import CategoryCard from "./CategoryCard";
import IllustratedSection from "./IllustratedSection";
import climbingGear from "@/assets/climbing-gear.jpg";
import campingGear from "@/assets/camping-gear.jpg";
import waterSportsGear from "@/assets/water-sports-gear.jpg";
import winterSportsGear from "@/assets/winter-sports-gear.jpg";

const categories = [
  {
    title: "Climbing & Mountaineering",
    description: "Borrow trusted ropes, harnesses, and helmets from local climbers who know the routes",
    image: climbingGear,
    itemCount: 245
  },
  {
    title: "Camping & Hiking",
    description: "Share tents, sleeping bags, and backpacks with fellow outdoor enthusiasts nearby",
    image: campingGear,
    itemCount: 189
  },
  {
    title: "Water Sports",
    description: "Rent kayaks and paddleboards from locals who'll share their favorite spots",
    image: waterSportsGear,
    itemCount: 156
  },
  {
    title: "Winter Sports",
    description: "Try before you buy - rent skis and snowboards from passionate winter athletes",
    image: winterSportsGear,
    itemCount: 203
  }
];

const Categories = () => {
  return (
    <IllustratedSection variant="mountain" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Discover Your Next Trail
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with fellow adventurers and explore sustainably. From mountain peaks to ocean depths, your community has the gear.
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
    </IllustratedSection>
  );
};

export default Categories;