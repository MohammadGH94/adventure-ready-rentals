import GearCard from "./GearCard";
import IllustratedSection from "./IllustratedSection";
import { gearListings } from "@/lib/gear";

const FeaturedGear = () => {
  return (
    <IllustratedSection variant="sunset" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Loved by Adventurers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Quality gear shared by passionate locals who know their equipment inside and out.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gearListings.slice(0, 6).map((gear) => (
            <GearCard
              key={gear.id}
              id={gear.id}
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
    </IllustratedSection>
  );
};

export default FeaturedGear;