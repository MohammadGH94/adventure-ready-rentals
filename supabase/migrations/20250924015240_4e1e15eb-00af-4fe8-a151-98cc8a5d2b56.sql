-- Create a separate table for sensitive financial information
CREATE TABLE public.user_financial_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  account_number TEXT,
  institution_number TEXT,
  transit_number TEXT,
  tax_id TEXT,
  government_id_image TEXT,
  void_cheque TEXT,
  payment_method_ids TEXT[],
  payout_method_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_user_financial_data_user_id 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Enable RLS on the financial data table
ALTER TABLE public.user_financial_data ENABLE ROW LEVEL SECURITY;

-- Create strict RLS policies for financial data
CREATE POLICY "Users can only view their own financial data" 
ON public.user_financial_data 
FOR SELECT 
USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can only insert their own financial data" 
ON public.user_financial_data 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can only update their own financial data" 
ON public.user_financial_data 
FOR UPDATE 
USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can only delete their own financial data" 
ON public.user_financial_data 
FOR DELETE 
USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Create trigger for updating timestamps
CREATE TRIGGER update_user_financial_data_updated_at
BEFORE UPDATE ON public.user_financial_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing financial data to the new table
INSERT INTO public.user_financial_data (
  user_id, account_number, institution_number, transit_number, 
  tax_id, government_id_image, void_cheque, payment_method_ids, payout_method_id
)
SELECT 
  id, account_number, institution_number, transit_number,
  tax_id, government_id_image, void_cheque, payment_method_ids, payout_method_id
FROM public.users 
WHERE account_number IS NOT NULL 
   OR institution_number IS NOT NULL 
   OR transit_number IS NOT NULL
   OR tax_id IS NOT NULL
   OR government_id_image IS NOT NULL
   OR void_cheque IS NOT NULL
   OR payment_method_ids IS NOT NULL
   OR payout_method_id IS NOT NULL;

-- Remove financial data columns from users table
ALTER TABLE public.users 
DROP COLUMN IF EXISTS account_number,
DROP COLUMN IF EXISTS institution_number,
DROP COLUMN IF EXISTS transit_number,
DROP COLUMN IF EXISTS tax_id,
DROP COLUMN IF EXISTS government_id_image,
DROP COLUMN IF EXISTS void_cheque,
DROP COLUMN IF EXISTS payment_method_ids,
DROP COLUMN IF EXISTS payout_method_id;