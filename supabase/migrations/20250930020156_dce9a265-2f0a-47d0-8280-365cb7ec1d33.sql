-- Create function for owners to access their listings with full data
CREATE OR REPLACE FUNCTION public.get_listing_for_owner(listing_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  photos text[],
  price_per_day numeric,
  pickup_addresses text[],
  categories text[],
  is_available boolean,
  owner_id uuid,
  deposit_amount numeric,
  insurance_required boolean,
  pickup_instructions text,
  rules_and_requirements text,
  min_rental_days integer,
  max_rental_days integer,
  delivery_available boolean,
  delivery_fee numeric,
  add_ons jsonb,
  listing_status text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    l.id,
    l.title,
    l.description,
    l.photos,
    l.price_per_day,
    l.pickup_addresses,
    l.categories,
    l.is_available,
    l.owner_id,
    l.deposit_amount,
    l.insurance_required,
    l.pickup_instructions,
    l.rules_and_requirements,
    l.min_rental_days,
    l.max_rental_days,
    l.delivery_available,
    l.delivery_fee,
    l.add_ons,
    l.listing_status,
    l.created_at,
    l.updated_at
  FROM public.listings l
  JOIN public.users u ON l.owner_id = u.id
  WHERE l.id = listing_id 
    AND u.auth_user_id = auth.uid();
$$;

-- Create function to handle listing approval and trigger email
CREATE OR REPLACE FUNCTION public.approve_listing(listing_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_email text;
  listing_title text;
BEGIN
  -- Update listing status to active
  UPDATE public.listings 
  SET listing_status = 'active', updated_at = now()
  WHERE id = listing_id;
  
  -- Get owner email and listing title for notification
  SELECT u.email, l.title 
  INTO owner_email, listing_title
  FROM public.listings l
  JOIN public.users u ON l.owner_id = u.id
  WHERE l.id = listing_id;
  
  -- Here we would trigger the email notification
  -- For now, we'll just log it (actual email sending will be done via edge function)
  RAISE NOTICE 'Listing approved: % for owner: %', listing_title, owner_email;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;