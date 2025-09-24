-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    auth_user_id,
    email,
    first_name,
    last_name,
    password_hash,
    user_type
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    '', -- We don't store password hash in public.users, it's handled by auth
    COALESCE((NEW.raw_user_meta_data ->> 'user_type')::user_type, 'individual'::user_type)
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Handle existing users who might not have profiles
INSERT INTO public.users (auth_user_id, email, first_name, last_name, password_hash, user_type)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data ->> 'first_name', ''),
  COALESCE(au.raw_user_meta_data ->> 'last_name', ''),
  '',
  'individual'::user_type
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.auth_user_id
WHERE pu.auth_user_id IS NULL;