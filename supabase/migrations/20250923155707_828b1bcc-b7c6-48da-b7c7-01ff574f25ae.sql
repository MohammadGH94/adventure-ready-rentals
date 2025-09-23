-- Fix security issue: Restrict review access to only involved parties
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;

-- Create a new secure policy that only allows access to involved parties
CREATE POLICY "Only involved parties can view reviews" 
ON public.reviews 
FOR SELECT 
USING (
  -- User who wrote the review can see it
  user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  OR
  -- Renter involved in the booking can see it
  booking_id IN (
    SELECT id FROM public.bookings 
    WHERE renter_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  )
  OR
  -- Owner involved in the booking can see it
  booking_id IN (
    SELECT id FROM public.bookings 
    WHERE owner_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  )
);