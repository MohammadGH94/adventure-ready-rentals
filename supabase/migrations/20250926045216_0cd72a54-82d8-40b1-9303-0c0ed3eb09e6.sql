-- Create user_favorites table for storing favorites in database
CREATE TABLE public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  listing_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Add unique constraint to prevent duplicate favorites
  UNIQUE(user_id, listing_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own favorites" 
ON public.user_favorites 
FOR SELECT 
USING (user_id IN (
  SELECT id FROM public.users WHERE auth_user_id = auth.uid()
));

CREATE POLICY "Users can add their own favorites" 
ON public.user_favorites 
FOR INSERT 
WITH CHECK (user_id IN (
  SELECT id FROM public.users WHERE auth_user_id = auth.uid()
));

CREATE POLICY "Users can remove their own favorites" 
ON public.user_favorites 
FOR DELETE 
USING (user_id IN (
  SELECT id FROM public.users WHERE auth_user_id = auth.uid()
));

-- Add foreign key constraints
ALTER TABLE public.user_favorites 
ADD CONSTRAINT fk_user_favorites_user_id 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_favorites 
ADD CONSTRAINT fk_user_favorites_listing_id 
FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;