import { describe, expect, it } from "vitest";
import {
  AppliedFilters,
  computeListingDistance,
  filterListings,
  ListingForFilters,
} from "./listing-filters";

const baseFilters: AppliedFilters = {
  searchTerm: "",
  selectedCategory: "all",
  startDate: undefined,
  endDate: undefined,
  location: "",
  priceRange: [0, 500],
  distanceRange: [0, 50],
  useCurrentLocation: false,
  userType: "all",
};

const userLocation = { latitude: 45.5152, longitude: -122.6784 }; // Portland, OR

function buildListing(overrides: Partial<ListingForFilters>): ListingForFilters {
  return {
    id: "listing-id",
    title: "Camp Stove",
    description: "A reliable camping stove.",
    categories: ["camping"],
    price_per_day: 40,
    pickup_addresses: ["Portland, OR"],
    location_lat: 45.5231,
    location_lng: -122.6765,
    owner: { user_type: "individual" },
    distance: null,
    ...overrides,
  };
}

function applyFilters(
  listings: ListingForFilters[],
  overrides: Partial<AppliedFilters>,
  coords: typeof userLocation | null
) {
  const filters = { ...baseFilters, ...overrides };
  const listingsWithDistance = listings.map((listing) => ({
    ...listing,
    distance:
      typeof listing.distance === "number"
        ? listing.distance
        : computeListingDistance(listing, coords),
  }));

  return filterListings(listingsWithDistance, filters, coords);
}

describe("listing filter utilities", () => {
  it("keeps listings within the selected distance range", () => {
    const closeListing = buildListing({ id: "close" });
    const farListing = buildListing({
      id: "far",
      location_lat: 45.9,
      location_lng: -123.3,
    });

    const results = applyFilters(
      [closeListing, farListing],
      { distanceRange: [0, 10] },
      userLocation
    );

    expect(results.map((listing) => listing.id)).toEqual(["close"]);
  });

  it("does not filter by distance when the user location is unknown", () => {
    const closeListing = buildListing({ id: "close" });
    const farListing = buildListing({
      id: "far",
      location_lat: 45.9,
      location_lng: -123.3,
    });

    const results = applyFilters(
      [closeListing, farListing],
      { distanceRange: [0, 5] },
      null
    );

    expect(results).toHaveLength(2);
  });

  it("allows location searches to use computed distances when addresses are hidden", () => {
    const privateListing = buildListing({
      pickup_addresses: null,
    });

    const results = applyFilters(
      [privateListing],
      { location: "Portland" },
      userLocation
    );

    expect(results).toHaveLength(1);
  });

  it("respects precomputed listing distances when filtering", () => {
    const precomputedClose = buildListing({
      id: "precomputed-close",
      distance: 8,
      location_lat: 0,
      location_lng: 0,
    });

    const precomputedFar = buildListing({
      id: "precomputed-far",
      distance: 25,
      location_lat: 0,
      location_lng: 0,
    });

    const results = applyFilters(
      [precomputedClose, precomputedFar],
      { distanceRange: [0, 10] },
      userLocation
    );

    expect(results.map((listing) => listing.id)).toEqual([
      "precomputed-close",
    ]);
  });
});
