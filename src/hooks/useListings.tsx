import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Listing {
  id: string;
  title: string;
  description: string;
  photos: string[];
  price_per_day: number;
  pickup_addresses: string[];
  categories: string[];
  is_available: boolean;
  owner_id: string;
  add_ons: any[];
  location_lat: number | null;
  location_lng: number | null;
  owner: {
    user_type: string;
  };
  [key: string]: unknown;
}

export const useListings = () => {
  return useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      // Use the new secure function that only returns safe public data
      const { data, error } = await supabase
        .rpc("get_public_listings");

      if (error) {
        console.error("Error fetching listings:", error);
        throw error;
      }

      // Transform to match the expected Listing interface
      return data?.map((listing: any) => ({
        ...listing,
        photos: listing.photos || [],
        pickup_addresses: [], // Not exposed in public view for security
        add_ons: [], // Not exposed in public view for security
        owner_id: null, // Not exposed in public view for security
        owner: { user_type: 'unknown' }, // Not exposed in public view for security
      })) as Listing[];
    },
  });
};