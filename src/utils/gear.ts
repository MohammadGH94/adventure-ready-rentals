import placeholderImage from "@/assets/hero-adventure-gear.jpg";
import type { EquipmentRecord } from "@/services/firestore";

export type GearCardData = {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  rating: number;
  reviewCount: number;
  location: string;
  category?: string;
};

export const normalizeEquipmentToGearCard = (
  equipment: EquipmentRecord,
): GearCardData => {
  return {
    id: equipment.id,
    title: equipment.title || "Untitled gear",
    description: equipment.description || "",
    image: equipment.imageUrls?.[0] ?? placeholderImage,
    price: Number.isFinite(equipment.pricePerDay) ? equipment.pricePerDay : 0,
    rating: Number.isFinite(equipment.rating) ? equipment.rating : 0,
    reviewCount: Number.isFinite(equipment.reviewCount) ? equipment.reviewCount : 0,
    location: equipment.location || "Unknown location",
    category: equipment.category ?? undefined,
  };
};
