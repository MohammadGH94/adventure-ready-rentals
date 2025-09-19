-- Add missing RLS policies for kits table
CREATE POLICY "Users can view kits they own or rent" ON public.kits
  FOR SELECT USING (
    renter_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
    owner_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Owners can create kits" ON public.kits
  FOR INSERT WITH CHECK (owner_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Owners can update their kits" ON public.kits
  FOR UPDATE USING (owner_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Owners can delete their kits" ON public.kits
  FOR DELETE USING (owner_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));