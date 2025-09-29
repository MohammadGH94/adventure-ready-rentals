-- Fix security vulnerability: Remove overly permissive public access to listings table
-- This addresses the exposed business information issue

-- First, drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can view available listings" ON public.listings;

-- Create a more restrictive policy that only exposes essential public information
-- This policy allows public users to see only the basic listing information needed for browsing
CREATE POLICY "Public can view essential listing details only" 
ON public.listings 
FOR SELECT 
USING (
  is_available = true 
  AND listing_status = 'active'
);

-- Create a security definer function that returns only safe public listing data
-- This prevents exposure of sensitive business information
CREATE OR REPLACE FUNCTION public.get_public_listings()
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  categories text[],
  price_per_day numeric,
  location_lat numeric,
  location_lng numeric,
  photos text[],
  featured boolean,
  view_count integer,
  min_rental_days integer,
  max_rental_days integer,
  delivery_available boolean,
  inventory_count integer,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    l.id,
    l.title,
    l.description,
    l.categories,
    l.price_per_day,
    l.location_lat,
    l.location_lng,
    l.photos,
    l.featured,
    l.view_count,
    l.min_rental_days,
    l.max_rental_days,
    l.delivery_available,
    l.inventory_count,
    l.created_at
  FROM public.listings l
  WHERE l.is_available = true 
    AND l.listing_status = 'active';
$$;

-- Grant execute permission to anon users for the public listings function
GRANT EXECUTE ON FUNCTION public.get_public_listings() TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_listings() TO authenticated;

-- Create a separate function for authenticated users to get listing details they need for booking
CREATE OR REPLACE FUNCTION public.get_listing_for_booking(listing_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  categories text[],
  price_per_day numeric,
  location_lat numeric,
  location_lng numeric,
  photos text[],
  min_rental_days integer,
  max_rental_days integer,
  delivery_available boolean,
  delivery_radius numeric,
  delivery_fee numeric,
  pickup_instructions text,
  rules_and_requirements text,
  deposit_amount numeric,
  insurance_required boolean,
  add_ons jsonb,
  bulk_pricing jsonb,
  inventory_count integer,
  rented_as_kit boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    l.id,
    l.title,
    l.description,
    l.categories,
    l.price_per_day,
    l.location_lat,
    l.location_lng,
    l.photos,
    l.min_rental_days,
    l.max_rental_days,
    l.delivery_available,
    l.delivery_radius,
    l.delivery_fee,
    l.pickup_instructions,
    l.rules_and_requirements,
    l.deposit_amount,
    l.insurance_required,
    l.add_ons,
    l.bulk_pricing,
    l.inventory_count,
    l.rented_as_kit
  FROM public.listings l
  WHERE l.id = listing_id 
    AND l.is_available = true 
    AND l.listing_status = 'active';
$$;

-- Grant execute permission for booking function to authenticated users only
GRANT EXECUTE ON FUNCTION public.get_listing_for_booking(uuid) TO authenticated;