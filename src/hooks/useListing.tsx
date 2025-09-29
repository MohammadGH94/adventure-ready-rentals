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
  owner?: {
    id: string;
    first_name: string;
    profile_image_url: string | null;
    created_at: string;
  };
}

export const useListing = (id: string) => {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      // Use the new secure function for detailed listing data (for authenticated users)
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
        owner_id: "hidden", // Not exposed for security reasons  
        owner: undefined, // Will fetch owner details separately when needed
      } as DatabaseListing;
    },
    enabled: !!id,
  });
};