import { calculateDistance } from "@/lib/distance";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ListingOwner {
  user_type?: string | null;
}

export interface ListingForFilters {
  id: string | number;
  title: string;
  description?: string | null;
  categories: string[];
  price_per_day: number | string;
  pickup_addresses?: string[] | null;
  location_lat?: number | null;
  location_lng?: number | null;
  owner?: ListingOwner | null;
  distance?: number | null;
  [key: string]: unknown;
}

export interface AppliedFilters {
  searchTerm: string;
  selectedCategory: string;
  startDate?: Date;
  endDate?: Date;
  location: string;
  priceRange: [number, number];
  distanceRange: [number, number];
  useCurrentLocation: boolean;
  userType: string;
}

export function computeListingDistance(
  listing: ListingForFilters,
  userLocation: Coordinates | null
): number | null {
  if (!userLocation) {
    return null;
  }

  if (
    typeof listing.location_lat === "number" &&
    typeof listing.location_lng === "number"
  ) {
    return calculateDistance(userLocation, {
      latitude: listing.location_lat,
      longitude: listing.location_lng,
    });
  }

  return null;
}

export function listingMatchesFilters(
  listing: ListingForFilters,
  filters: AppliedFilters,
  userLocation: Coordinates | null
): boolean {
  const matchesSearch =
    !filters.searchTerm ||
    listing.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
    (listing.description || "")
      .toLowerCase()
      .includes(filters.searchTerm.toLowerCase());

  const matchesCategory =
    filters.selectedCategory === "all" ||
    listing.categories.some(
      (cat) => cat.toLowerCase() === filters.selectedCategory.toLowerCase()
    );

  const price = Number(listing.price_per_day);
  const matchesPrice =
    price >= filters.priceRange[0] && price <= filters.priceRange[1];

  const hasLocationQuery = filters.location.trim().length > 0;

  const matchesLocation =
    !hasLocationQuery ||
    (Array.isArray(listing.pickup_addresses) &&
      listing.pickup_addresses.some((addr) =>
        addr.toLowerCase().includes(filters.location.toLowerCase())
      )) ||
    listing.distance !== null;

  const matchesDistance =
    !userLocation ||
    listing.distance === null ||
    (listing.distance >= filters.distanceRange[0] &&
      listing.distance <= filters.distanceRange[1]);

  const matchesUserType =
    filters.userType === "all" ||
    listing.owner?.user_type === filters.userType;

  return (
    matchesSearch &&
    matchesCategory &&
    matchesPrice &&
    matchesLocation &&
    matchesUserType &&
    matchesDistance
  );
}

export function filterListings(
  listings: ListingForFilters[],
  filters: AppliedFilters,
  userLocation: Coordinates | null
): ListingForFilters[] {
  return listings.filter((listing) =>
    listingMatchesFilters(listing, filters, userLocation)
  );
}
