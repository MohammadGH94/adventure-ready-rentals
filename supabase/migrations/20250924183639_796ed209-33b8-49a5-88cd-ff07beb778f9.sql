-- Add add_ons column to listings table to store optional add-ons
ALTER TABLE public.listings 
ADD COLUMN add_ons JSONB DEFAULT '[]'::jsonb;

-- Add comment to document the structure
COMMENT ON COLUMN public.listings.add_ons IS 'Array of add-on objects with structure: [{id: string, name: string, description: string, price: number, category: string, required: boolean, available_count: number}]';