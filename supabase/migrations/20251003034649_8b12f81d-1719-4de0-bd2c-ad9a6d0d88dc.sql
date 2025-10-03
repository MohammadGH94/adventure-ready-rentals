-- Create a secure function to get public user profile information
-- This function only returns non-sensitive profile data that should be publicly visible
CREATE OR REPLACE FUNCTION public.get_public_user_profile(user_profile_id uuid)
RETURNS TABLE(
  id uuid,
  first_name text,
  profile_image_url text,
  profile_bio text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- Only return public, non-sensitive profile information
  -- Explicitly excludes: email, phone_number, date_of_birth, password_hash,
  -- location_address, business_license, and other PII
  SELECT 
    id,
    first_name,
    profile_image_url,
    profile_bio,
    created_at
  FROM public.users
  WHERE id = user_profile_id;
$$;

-- Add comment explaining the security considerations
COMMENT ON FUNCTION public.get_public_user_profile IS 'Returns only publicly safe user profile information. Excludes all PII such as email, phone, address, DOB, password hash, etc. Used for displaying owner profiles to potential renters.';