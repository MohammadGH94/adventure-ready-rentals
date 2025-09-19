import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import GearCard from "./GearCard";
import { getFeaturedEquipment, type EquipmentRecord } from "@/services/firestore";
import { normalizeEquipmentToGearCard } from "@/utils/gear";

type FeaturedGearProps = {
  equipment?: EquipmentRecord[];
};

const FeaturedGear = ({ equipment }: FeaturedGearProps) => {
  const {
    data: featuredEquipment,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["equipment", "featured"],
    queryFn: getFeaturedEquipment,
    enabled: !equipment,
  });

  const gearItems = useMemo(() => {
    const currentEquipment = equipment ?? featuredEquipment ?? [];

    if (currentEquipment.length === 0) {
      return [];
    }

    return currentEquipment
      .map(normalizeEquipmentToGearCard)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
  }, [equipment, featuredEquipment]);

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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full text-center text-muted-foreground">Loading featured gear...</div>
          ) : isError ? (
            <div className="col-span-full rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
              We couldn't load featured gear at the moment. Please check back later.
            </div>
          ) : gearItems.length === 0 ? (
            <div className="col-span-full rounded-lg border border-border bg-muted/40 p-6 text-center text-muted-foreground">
              Gear listings will appear here as soon as items are available.
            </div>
          ) : (
            gearItems.map((gear) => (
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
      </div>
    </section>
  );
};

export default FeaturedGear;