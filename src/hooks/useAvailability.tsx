import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AvailabilityData {
  unavailable_dates: string[];
  block_out_times: any;
  existing_bookings: Array<{
    rental_start_date: string;
    rental_end_date: string;
    status: string;
  }>;
  min_rental_days: number;
  max_rental_days: number;
}

export const useAvailability = (listingId: string) => {
  return useQuery({
    queryKey: ["availability", listingId],
    queryFn: async () => {
      if (!listingId) return null;

      // Fetch availability data
      const { data: availability, error: availError } = await supabase
        .from("availability")
        .select("unavailable_dates, booking_ids")
        .eq("listing_id", listingId)
        .maybeSingle();

      if (availError) {
        console.error("Error fetching availability:", availError);
      }

      // Fetch listing constraints and block-out times
      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .select("block_out_times, min_rental_days, max_rental_days")
        .eq("id", listingId)
        .maybeSingle();

      if (listingError) {
        console.error("Error fetching listing:", listingError);
      }

      // Fetch existing bookings that overlap with potential dates
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("rental_start_date, rental_end_date, status")
        .eq("listing_id", listingId)
        .not("status", "in", "(cancelled_by_renter,cancelled_by_owner)");

      if (bookingsError) {
        console.error("Error fetching bookings:", bookingsError);
      }

      const result = {
        unavailable_dates: availability?.unavailable_dates || [],
        block_out_times: listing?.block_out_times || null,
        existing_bookings: bookings || [],
        min_rental_days: listing?.min_rental_days || 1,
        max_rental_days: listing?.max_rental_days || null,
      } as AvailabilityData;

      console.log("Availability data loaded:", {
        listingId,
        unavailable_dates: result.unavailable_dates,
        block_out_times: result.block_out_times,
        existing_bookings: result.existing_bookings,
        min_rental_days: result.min_rental_days,
        max_rental_days: result.max_rental_days
      });

      return result;
    },
    enabled: !!listingId,
  });
};