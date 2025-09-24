-- Drop the existing SELECT policy for users table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;

-- Create a new, more secure SELECT policy that explicitly requires authentication
-- This policy ensures that:
-- 1. The user must be authenticated (auth.uid() IS NOT NULL)
-- 2. The user can only view their own profile (auth.uid() = auth_user_id)
-- 3. No anonymous access is possible
CREATE POLICY "Authenticated users can view their own profile" 
ON public.users 
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = auth_user_id
);

-- Also ensure the INSERT policy is explicit about authentication
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

CREATE POLICY "Authenticated users can insert their own profile" 
ON public.users 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = auth_user_id
);

-- Update the UPDATE policy to be more explicit
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

CREATE POLICY "Authenticated users can update their own profile" 
ON public.users 
FOR UPDATE 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = auth_user_id
);

-- Add a comment explaining the security rationale
COMMENT ON TABLE public.users IS 'Contains sensitive personal information. Access is restricted to authenticated users only, with users able to access only their own data.';