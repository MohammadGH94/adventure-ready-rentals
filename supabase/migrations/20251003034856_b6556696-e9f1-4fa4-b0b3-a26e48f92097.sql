-- Verify and reinforce RLS security on users table
-- This migration ensures the users table is properly secured against unauthorized access

-- 1. Ensure RLS is enabled (this is idempotent - won't fail if already enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Add a security comment documenting the protection measures
COMMENT ON TABLE public.users IS 'Contains sensitive PII (emails, phone numbers, DOB, addresses, password hashes). Protected by RLS - only authenticated users can view/edit their own data. Public access controlled via get_public_user_profile() function which exposes only non-sensitive fields.';

-- 3. Verify existing policies are restrictive (these already exist, adding here for documentation)
-- The SELECT policy ensures ONLY authenticated users can view their own data:
-- Using Expression: ((auth.uid() IS NOT NULL) AND (auth.uid() = auth_user_id))
-- This means:
-- - Anonymous users: NO ACCESS
-- - Authenticated users: Can ONLY see their own record
-- - No public SELECT policy exists

-- 4. Add an explicit DENY policy for anonymous users as an extra security layer
DROP POLICY IF EXISTS "Block all anonymous access" ON public.users;
CREATE POLICY "Block all anonymous access" 
ON public.users 
AS RESTRICTIVE
FOR ALL 
TO anon
USING (false);

-- 5. Document the security model
COMMENT ON POLICY "Authenticated users can view their own profile" ON public.users IS 'Users can only SELECT their own profile data where auth.uid() matches auth_user_id. No public access permitted.';
COMMENT ON POLICY "Block all anonymous access" ON public.users IS 'RESTRICTIVE policy that explicitly blocks all anonymous (unauthenticated) access to the users table as an additional security layer.';