import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

const addOnSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Add-on name is required"),
  description: z.string(),
  price: z.number().min(0, "Add-on price must be 0 or greater"),
  category: z.string(),
  required: z.boolean(),
  available_count: z.number().min(1, "Available count must be at least 1"),
});

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
  add_ons: z.array(addOnSchema).optional().default([]),
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
      add_ons: [],
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
      // Get user profile to get user ID - with automatic creation fallback
      let { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      // If profile doesn't exist, try to create it (fallback for edge cases)
      if (userError || !userProfile) {
        console.log('Profile not found, attempting to create one...');
        
        // Create a basic profile for the user
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            auth_user_id: user.id,
            email: user.email || '',
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || '',
            password_hash: '', // Not used, auth handles this
            user_type: (user.user_metadata?.user_type as any) || 'individual'
          })
          .select('id')
          .single();

        if (createError || !newProfile) {
          console.error('Failed to create user profile:', createError);
          toast({
            title: "Profile error",
            description: "Unable to create user profile. Please try signing out and back in, or contact support.",
            variant: "destructive",
          });
          return;
        }
        
        userProfile = newProfile;
        console.log('Successfully created user profile');
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
        add_ons: data.add_ons || [],
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

  const updateListing = async (id: string, data: ListingFormData, photoPaths: string[]) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to update a listing",
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
          description: "Unable to find user profile. Please try signing out and back in.",
          variant: "destructive",
        });
        return;
      }

      const listingData: Database['public']['Tables']['listings']['Update'] = {
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
        add_ons: data.add_ons || [],
        photos: photoPaths,
        updated_at: new Date().toISOString(),
      };

      const { data: listing, error } = await supabase
        .from('listings')
        .update(listingData)
        .eq('id', id)
        .eq('owner_id', userProfile.id) // Ensure user owns the listing
        .select()
        .single();

      if (error) {
        toast({
          title: "Listing update failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Listing updated successfully!",
        description: "Your listing has been updated.",
      });
      
      return listing;
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: "Unexpected error",
        description: "An error occurred while updating your listing",
        variant: "destructive",
      });
    }
  };

  const deleteListing = async (id: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to delete a listing",
        variant: "destructive",
      });
      return false;
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
          description: "Unable to find user profile. Please try signing out and back in.",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id)
        .eq('owner_id', userProfile.id); // Ensure user owns the listing

      if (error) {
        toast({
          title: "Deletion failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Listing deleted",
        description: "Your listing has been permanently deleted.",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Unexpected error",
        description: "An error occurred while deleting your listing",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    form,
    createListing,
    updateListing,
    deleteListing,
  };
};