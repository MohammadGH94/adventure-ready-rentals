import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

const listingSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  categories: z.array(z.enum(["camping", "water_sports", "climbing", "vehicles", "winter_sports", "hiking", "cycling"])).min(1, "At least one category is required"),
  price_per_day: z.number().min(1, "Price must be at least $1"),
  location_address: z.string().min(1, "Location is required"),
  pickup_instructions: z.string().optional(),
  rules_and_requirements: z.string().optional(),
  min_rental_days: z.number().min(1).default(1),
  max_rental_days: z.number().optional(),
  deposit_amount: z.number().min(0).optional(),
  insurance_required: z.boolean().default(false),
  delivery_available: z.boolean().default(false),
  delivery_radius: z.number().optional(),
  delivery_fee: z.number().optional(),
  inventory_count: z.number().min(1).default(1),
  business_license_verified: z.boolean().default(false),
  bulk_pricing: z.record(z.number()).optional(),
});

export type ListingFormData = z.infer<typeof listingSchema>;

export const useListingForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      min_rental_days: 1,
      inventory_count: 1,
      insurance_required: false,
      delivery_available: false,
      business_license_verified: false,
    },
  });

  const createListing = async (data: ListingFormData, photoPaths: string[]) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a listing",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get user profile to get user ID
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userError || !userProfile) {
        toast({
          title: "Profile error",
          description: "Unable to find user profile",
          variant: "destructive",
        });
        return;
      }

      const listingData: Database['public']['Tables']['listings']['Insert'] = {
        title: data.title,
        description: data.description,
        categories: data.categories,
        price_per_day: data.price_per_day,
        pickup_addresses: data.location_address ? [data.location_address] : [],
        pickup_instructions: data.pickup_instructions,
        rules_and_requirements: data.rules_and_requirements,
        min_rental_days: data.min_rental_days,
        max_rental_days: data.max_rental_days,
        deposit_amount: data.deposit_amount,
        insurance_required: data.insurance_required,
        delivery_available: data.delivery_available,
        delivery_radius: data.delivery_radius,
        delivery_fee: data.delivery_fee,
        inventory_count: data.inventory_count,
        business_license_verified: data.business_license_verified,
        bulk_pricing: data.bulk_pricing || null,
        owner_id: userProfile.id,
        photos: photoPaths,
        listing_status: 'pending_review',
        is_available: false,
      };

      const { data: listing, error } = await supabase
        .from('listings')
        .insert(listingData)
        .select()
        .single();

      if (error) {
        toast({
          title: "Listing creation failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Create initial availability record
      const { error: availabilityError } = await supabase
        .from('availability')
        .insert([{
          listing_id: listing.id,
          unavailable_dates: [],
          booking_ids: [],
        }]);

      if (availabilityError) {
        console.error('Failed to create availability record:', availabilityError);
      }

      toast({
        title: "Listing created successfully!",
        description: "Your listing is pending review and will be available soon.",
      });

      // Navigate to user listings page
      navigate('/my-listings');
      
      return listing;
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: "Unexpected error",
        description: "An error occurred while creating your listing",
        variant: "destructive",
      });
    }
  };

  return {
    form,
    createListing,
  };
};