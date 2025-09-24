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
}

export const useListing = (id: string) => {
  return useQuery({
    queryKey: ["listing", id],
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
          deposit_amount,
          insurance_required,
          pickup_instructions,
          rules_and_requirements,
          min_rental_days,
          max_rental_days,
          delivery_available,
          delivery_fee
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching listing:", error);
        throw error;
      }

      return data as DatabaseListing | null;
    },
    enabled: !!id,
  });
};