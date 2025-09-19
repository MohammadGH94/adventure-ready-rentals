-- Create enums for various status fields
CREATE TYPE public.user_type AS ENUM ('individual', 'business');
CREATE TYPE public.listing_category AS ENUM ('camping', 'water_sports', 'climbing', 'vehicles', 'winter_sports', 'hiking', 'cycling');
CREATE TYPE public.booking_status AS ENUM ('pending_approval', 'confirmed', 'active', 'completed', 'cancelled_by_renter', 'cancelled_by_owner', 'disputed');
CREATE TYPE public.item_status AS ENUM ('available', 'unavailable');

-- Users table
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type user_type NOT NULL DEFAULT 'individual',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  business_name TEXT,
  business_license TEXT,
  tax_id TEXT,
  password_hash TEXT NOT NULL,
  profile_image_url TEXT,
  profile_bio TEXT,
  location_address TEXT,
  city TEXT,
  state_province TEXT,
  country TEXT,
  postal_code TEXT,
  government_id_image TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  payment_method_ids TEXT[],
  void_cheque TEXT,
  institution_number TEXT,
  transit_number TEXT,
  account_number TEXT,
  payout_method_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listings table
CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  categories listing_category[] NOT NULL,
  photos TEXT[],
  price_per_day DECIMAL(10,2) NOT NULL,
  multiplier DECIMAL(4,2) DEFAULT 1.0,
  discount_rate_week DECIMAL(10,2),
  discount_rate_month DECIMAL(10,2),
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  pickup_addresses TEXT[],
  pickup_instructions TEXT,
  rules_and_requirements TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  rented_as_kit BOOLEAN DEFAULT FALSE,
  block_out_times JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kits table (separate from listings for better normalization)
CREATE TABLE public.kits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  renter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  renter_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  rental_start_date DATE NOT NULL,
  rental_end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  service_fee DECIMAL(10,2) NOT NULL,
  taxes DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status booking_status DEFAULT 'pending_approval',
  item_status item_status DEFAULT 'available',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  listing_rating INTEGER CHECK (listing_rating >= 1 AND listing_rating <= 5),
  owner_rating INTEGER CHECK (owner_rating >= 1 AND owner_rating <= 5),
  renter_rating INTEGER CHECK (renter_rating >= 1 AND renter_rating <= 5),
  comment_listing TEXT,
  comment_renter TEXT,
  comment_owner TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Availability table
CREATE TABLE public.availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  unavailable_dates JSONB,
  booking_ids UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Events table
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  properties JSONB,
  session_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- RLS Policies for listings
CREATE POLICY "Anyone can view available listings" ON public.listings
  FOR SELECT USING (is_available = true);

CREATE POLICY "Owners can manage their listings" ON public.listings
  FOR ALL USING (owner_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- RLS Policies for bookings
CREATE POLICY "Users can view their bookings" ON public.bookings
  FOR SELECT USING (
    renter_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
    owner_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Renters can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (renter_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Owners and renters can update bookings" ON public.bookings
  FOR UPDATE USING (
    renter_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
    owner_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their bookings" ON public.reviews
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- RLS Policies for availability
CREATE POLICY "Anyone can view availability" ON public.availability
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage availability" ON public.availability
  FOR ALL USING (
    listing_id IN (
      SELECT id FROM public.listings 
      WHERE owner_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    )
  );

-- RLS Policies for analytics
CREATE POLICY "Users can insert their own analytics" ON public.analytics_events
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR user_id IS NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_availability_updated_at
  BEFORE UPDATE ON public.availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_listings_owner_id ON public.listings(owner_id);
CREATE INDEX idx_listings_categories ON public.listings USING GIN(categories);
CREATE INDEX idx_listings_location ON public.listings(location_lat, location_lng);
CREATE INDEX idx_bookings_renter_id ON public.bookings(renter_id);
CREATE INDEX idx_bookings_owner_id ON public.bookings(owner_id);
CREATE INDEX idx_bookings_listing_id ON public.bookings(listing_id);
CREATE INDEX idx_bookings_dates ON public.bookings(rental_start_date, rental_end_date);
CREATE INDEX idx_reviews_listing_id ON public.reviews(listing_id);
CREATE INDEX idx_reviews_booking_id ON public.reviews(booking_id);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_name ON public.analytics_events(event_name);
CREATE INDEX idx_analytics_events_timestamp ON public.analytics_events(timestamp);