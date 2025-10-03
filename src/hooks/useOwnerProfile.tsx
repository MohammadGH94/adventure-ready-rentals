import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OwnerProfile {
  id: string;
  first_name: string;
  profile_image_url: string | null;
  profile_bio: string | null;
  created_at: string;
  listings: Array<{
    id: string;
    title: string;
    price_per_day: number;
    photos: string[] | null;
    created_at: string;
    booking_count: number;
    view_count: number;
    next_available_date: string | null;
  }>;
  total_bookings: number;
  average_rating: number;
  reviews: Array<{
    id: string;
    comment_owner: string | null;
    owner_rating: number | null;
    submitted_at: string;
    renter_name: string;
  }>;
}

export const useOwnerProfile = (ownerId: string) => {
  return useQuery({
    queryKey: ["owner-profile", ownerId],
    queryFn: async () => {
      // Fetch owner basic info using secure public profile function
      const { data: ownerData, error: ownerError } = await supabase
        .rpc("get_public_user_profile", { user_profile_id: ownerId });

      if (ownerError) {
        console.error("Error fetching owner:", ownerError);
        throw ownerError;
      }

      const owner = ownerData?.[0];
      if (!owner) {
        throw new Error("Owner not found");
      }

      // Fetch owner's listings with booking/view counts
      const { data: listings, error: listingsError } = await supabase
        .from("listings")
        .select(`
          id,
          title,
          price_per_day,
          photos,
          created_at,
          booking_count,
          view_count
        `)
        .eq("owner_id", ownerId)
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      if (listingsError) {
        console.error("Error fetching owner listings:", listingsError);
        throw listingsError;
      }

      // Fetch availability data for next available dates
      const listingIds = listings?.map(l => l.id) || [];
      const { data: availability, error: availabilityError } = await supabase
        .from("availability")
        .select("listing_id, unavailable_dates")
        .in("listing_id", listingIds);

      if (availabilityError) {
        console.error("Error fetching availability:", availabilityError);
      }

      // Calculate next available date for each listing
      const listingsWithAvailability = listings?.map(listing => {
        const listingAvailability = availability?.find(a => a.listing_id === listing.id);
        const unavailableDates = listingAvailability?.unavailable_dates as string[] || [];
        
        // Find next available date (simple logic - first date from tomorrow that's not in unavailable list)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        let nextDate = new Date(tomorrow);
        while (unavailableDates.includes(nextDate.toISOString().split('T')[0])) {
          nextDate.setDate(nextDate.getDate() + 1);
          // Prevent infinite loop
          if (nextDate.getTime() - tomorrow.getTime() > 365 * 24 * 60 * 60 * 1000) {
            nextDate = null;
            break;
          }
        }

        return {
          ...listing,
          next_available_date: nextDate ? nextDate.toISOString().split('T')[0] : null
        };
      }) || [];

      // Fetch total bookings count
      const { count: totalBookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", ownerId);

      if (bookingsError) {
        console.error("Error fetching bookings count:", bookingsError);
      }

      // Fetch reviews and calculate average rating
      const { data: reviews, error: reviewsError } = await supabase
        .from("reviews")
        .select(`
          id,
          comment_owner,
          owner_rating,
          submitted_at,
          booking_id
        `)
        .not("owner_rating", "is", null)
        .order("submitted_at", { ascending: false });

      if (reviewsError) {
        console.error("Error fetching reviews:", reviewsError);
      }

      // Filter reviews for this owner and get renter names
      const ownerReviews = [];
      let totalRating = 0;
      let ratingCount = 0;

      if (reviews) {
        for (const review of reviews) {
          // Get booking to check if it's for this owner
          const { data: booking } = await supabase
            .from("bookings")
            .select("owner_id, renter_id")
            .eq("id", review.booking_id)
            .single();

          if (booking?.owner_id === ownerId && review.owner_rating) {
            // Get renter name using secure public profile function
            const { data: renterData } = await supabase
              .rpc("get_public_user_profile", { user_profile_id: booking.renter_id });

            const renter = renterData?.[0];

            ownerReviews.push({
              ...review,
              renter_name: renter?.first_name || "Anonymous"
            });

            totalRating += review.owner_rating;
            ratingCount++;
          }
        }
      }

      const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

      const profile: OwnerProfile = {
        ...owner,
        listings: listingsWithAvailability,
        total_bookings: totalBookings || 0,
        average_rating: averageRating,
        reviews: ownerReviews
      };

      return profile;
    },
    enabled: !!ownerId,
  });
};