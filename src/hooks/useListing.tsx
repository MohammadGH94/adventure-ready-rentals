import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DatabaseListing {
  id: string;
  title: string;
  description: string | null;
  photos: string[] | null;
  price_per_day: number;
  pickup_addresses: string[] | null;
  categories: string[];
  is_available: boolean;
  owner_id: string;
  deposit_amount: number | null;
  insurance_required: boolean;
  pickup_instructions: string | null;
  rules_and_requirements: string | null;
  min_rental_days: number | null;
  max_rental_days: number | null;
  delivery_available: boolean;
  delivery_fee: number | null;
  add_ons: any[] | null;
  listing_status?: string;
  created_at?: string;
  updated_at?: string;
  owner?: {
    id: string;
    first_name: string;
    profile_image_url: string | null;
    created_at: string;
  };
}

export const useListing = (id: string, ownerMode: boolean = false) => {
  return useQuery({
    queryKey: ["listing", id, ownerMode],
    queryFn: async () => {
      if (ownerMode) {
        // Use owner function for editing/managing listings
        const { data, error } = await supabase
          .rpc("get_listing_for_owner", { listing_id: id });

        if (error) {
          console.error("Error fetching listing for owner:", error);
          throw error;
        }

        console.log(`Querying owner listing with ID: ${id}`);
        console.log(`Found owner listing data:`, data);

        // Transform the array result to a single object
        const listing = data?.[0] || null;
        
        if (!listing) return null;

        // Return full data for owner
        return {
          ...listing,
          photos: listing.photos || [],
          pickup_addresses: listing.pickup_addresses || [],
          is_available: listing.is_available,
          owner_id: listing.owner_id,
          owner: undefined, // Will fetch owner details separately when needed
        } as DatabaseListing;
      } else {
        // Use the secure function for public/booking access
        const { data, error } = await supabase
          .rpc("get_listing_for_booking", { listing_id: id });

        if (error) {
          console.error("Error fetching listing:", error);
          throw error;
        }

        console.log(`Querying listing with ID: ${id}`);
        console.log(`Found listing data:`, data);

        // Transform the array result to a single object
        const listing = data?.[0] || null;
        
        if (!listing) return null;

        // Transform to match the expected DatabaseListing interface
        return {
          ...listing,
          photos: listing.photos || [],
          pickup_addresses: [], // Will be available when user initiates booking
          is_available: true, // Function only returns available listings
          owner: listing.owner_id ? {
            id: listing.owner_id,
            first_name: listing.owner_first_name || "Owner",
            profile_image_url: listing.owner_profile_image_url,
            created_at: listing.owner_created_at,
          } : undefined,
        } as DatabaseListing;
      }
    },
    enabled: !!id,
  });
};