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
}

export const useListings = () => {
  return useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select(`
          id,
          title,
          description,
          photos,
          price_per_day,
          pickup_addresses,
          categories,
          is_available,
          owner_id,
          add_ons
        `)
        .eq("is_available", true);

      if (error) {
        console.error("Error fetching listings:", error);
        throw error;
      }

      return data as Listing[];
    },
  });
};