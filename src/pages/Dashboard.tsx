import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, TrendingUp, Users, MapPin, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  user_type: 'individual' | 'business';
  business_name?: string;
  city?: string;
  state_province?: string;
  first_name: string;
  last_name: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({
    activeListings: 0,
    totalBookings: 0,
    pendingBookings: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserStats();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('users')
      .select('user_type, business_name, city, state_province, first_name, last_name')
      .eq('auth_user_id', user.id)
      .single();
    
    if (data) {
      setProfile(data);
    }
  };

  const fetchUserStats = async () => {
    if (!user) return;

    // Get user's internal ID first
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData) return;

    // Fetch listings count
    const { count: listingsCount } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userData.id)
      .eq('is_available', true);

    // Fetch bookings as owner
    const { data: ownerBookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('owner_id', userData.id);

    // Fetch bookings as renter
    const { data: renterBookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('renter_id', userData.id);

    const totalBookings = (ownerBookings?.length || 0) + (renterBookings?.length || 0);
    const pendingBookings = ownerBookings?.filter(b => b.status === 'pending_approval').length || 0;

    // Calculate monthly revenue (simplified)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = ownerBookings?.filter(booking => {
      const bookingDate = new Date(booking.created_at);
      return bookingDate.getMonth() === currentMonth && 
             bookingDate.getFullYear() === currentYear &&
             booking.status === 'confirmed';
    }).reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0;

    setStats({
      activeListings: listingsCount || 0,
      totalBookings,
      pendingBookings,
      monthlyRevenue
    });
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isBusinessUser = profile.user_type === 'business';
  const displayName = isBusinessUser 
    ? profile.business_name || `${profile.first_name} ${profile.last_name}`
    : `${profile.first_name} ${profile.last_name}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Welcome back, {displayName}!
                </h1>
                <div className="flex items-center mt-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{profile.city}, {profile.state_province}</span>
                  <Badge variant="secondary" className="ml-2">
                    {isBusinessUser ? 'Business' : 'Individual'}
                  </Badge>
                </div>
              </div>
              <Button onClick={() => navigate('/list-gear')} className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                List New Gear
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeListings}</div>
                <p className="text-xs text-muted-foreground">
                  Gear items available for rent
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
                <p className="text-xs text-muted-foreground">
                  All-time rental transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingBookings}</div>
                <p className="text-xs text-muted-foreground">
                  Requests waiting for approval
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.monthlyRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Earnings this month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                  onClick={() => navigate('/my-listings')}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Manage Listings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  View and edit your gear listings, update availability, and manage pricing.
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate('/my-rentals')}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Rental History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track your bookings, both as a renter and gear owner.
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate('/browse')}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Browse Gear
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Discover new gear to rent from other members in Vancouver.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;