-- Create storage bucket for gear photos
INSERT INTO storage.buckets (id, name, public) VALUES ('gear-photos', 'gear-photos', true);

-- Create storage policies for gear photos
CREATE POLICY "Anyone can view gear photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'gear-photos');

CREATE POLICY "Authenticated users can upload gear photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'gear-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own gear photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'gear-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own gear photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'gear-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enhance listings table for business features
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS business_license_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bulk_pricing JSONB,
ADD COLUMN IF NOT EXISTS inventory_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS min_rental_days INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_rental_days INTEGER,
ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC,
ADD COLUMN IF NOT EXISTS insurance_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS delivery_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS delivery_radius NUMERIC,
ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC,
ADD COLUMN IF NOT EXISTS listing_status TEXT DEFAULT 'draft' CHECK (listing_status IN ('draft', 'pending_review', 'active', 'inactive', 'rejected')),
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS booking_count INTEGER DEFAULT 0;