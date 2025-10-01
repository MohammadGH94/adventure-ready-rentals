-- Enable pg_net extension for making HTTP requests from the database
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to send approval email when listing status becomes active
CREATE OR REPLACE FUNCTION public.notify_listing_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_email text;
  owner_name text;
  listing_title text;
  request_id bigint;
BEGIN
  -- Only proceed if status changed to 'active'
  IF NEW.listing_status = 'active' AND (OLD.listing_status IS NULL OR OLD.listing_status != 'active') THEN
    
    -- Get owner details
    SELECT u.email, u.first_name, NEW.title
    INTO owner_email, owner_name, listing_title
    FROM public.users u
    WHERE u.id = NEW.owner_id;
    
    -- Call the edge function asynchronously using pg_net
    SELECT net.http_post(
      url := 'https://svdjtixjcghgekaienvt.supabase.co/functions/v1/send-listing-approval-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2ZGp0aXhqY2doZ2VrYWllbnZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNDc1MjIsImV4cCI6MjA3MzgyMzUyMn0.l8FI8o8zPreOLG2ggjLOX8Akbn-pEmJlBRuWT--Vkl8'
      ),
      body := jsonb_build_object(
        'ownerEmail', owner_email,
        'ownerName', COALESCE(owner_name, 'User'),
        'listingTitle', listing_title,
        'listingId', NEW.id::text
      )
    ) INTO request_id;
    
    RAISE NOTICE 'Approval email notification queued (request_id: %) for listing: % to owner: %', request_id, listing_title, owner_email;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on listings table
DROP TRIGGER IF EXISTS trigger_listing_approval_notification ON public.listings;
CREATE TRIGGER trigger_listing_approval_notification
  AFTER UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_listing_approval();