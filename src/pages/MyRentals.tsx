import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Package, DollarSign, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Rental {
  id: string;
  rental_start_date: string;
  rental_end_date: string;
  total_price: number;
  status: string;
  item_status: string;
  requested_at: string;
  listing: {
    id: string;
    title: string;
    photos: string[];
  };
  owner: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface OwnedBooking {
  id: string;
  rental_start_date: string;
  rental_end_date: string;
  total_price: number;
  status: string;
  item_status: string;
  requested_at: string;
  listing: {
    id: string;
    title: string;
  };
  renter: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const statusColors = {
  'pending_approval': 'bg-yellow-100 text-yellow-800',
  'confirmed': 'bg-blue-100 text-blue-800',
  'active': 'bg-green-100 text-green-800',
  'completed': 'bg-emerald-100 text-emerald-800',
  'cancelled_by_owner': 'bg-red-100 text-red-800',
  'cancelled_by_renter': 'bg-red-100 text-red-800',
  'disputed': 'bg-orange-100 text-orange-800'
};

const MyRentals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [ownedBookings, setOwnedBookings] = useState<OwnedBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRentals();
    }
  }, [user]);

  const fetchRentals = async () => {
    if (!user) return;

    try {
      // Get user's internal ID
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userData) return;

      // Fetch rentals where user is the renter
      const { data: rentalData } = await supabase
        .from('bookings')
        .select(`
          *,
          listing:listings!bookings_listing_id_fkey(
            id,
            title,
            photos
          ),
          owner:users!bookings_owner_id_fkey(
            first_name,
            last_name,
            email
          )
        `)
        .eq('renter_id', userData.id)
        .order('requested_at', { ascending: false });

      // Fetch bookings where user is the owner
      const { data: ownedData } = await supabase
        .from('bookings')
        .select(`
          *,
          listing:listings!bookings_listing_id_fkey(
            id,
            title
          ),
          renter:users!bookings_renter_id_fkey(
            first_name,
            last_name,
            email
          )
        `)
        .eq('owner_id', userData.id)
        .order('requested_at', { ascending: false });

      if (rentalData) setRentals(rentalData);
      if (ownedData) setOwnedBookings(ownedData);

    } catch (error) {
      console.error('Error fetching rentals:', error);
      toast({
        title: "Error",
        description: "Failed to load rental data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Rentals</h1>
            <p className="text-muted-foreground mt-2">
              Track your gear rentals and earnings
            </p>
          </div>

          <Tabs defaultValue="as-renter" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="as-renter">As Renter</TabsTrigger>
              <TabsTrigger value="as-owner">As Owner</TabsTrigger>
            </TabsList>

            <TabsContent value="as-renter" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Rentals</p>
                        <p className="text-2xl font-bold">{rentals.length}</p>
                      </div>
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Rentals</p>
                        <p className="text-2xl font-bold">
                          {rentals.filter(r => ['confirmed', 'active'].includes(r.status)).length}
                        </p>
                      </div>
                      <Calendar className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Spent</p>
                        <p className="text-2xl font-bold">
                          ${rentals.reduce((sum, r) => sum + r.total_price, 0).toFixed(2)}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {rentals.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No rentals yet</h3>
                    <p className="text-muted-foreground">
                      Start exploring gear available for rent in Vancouver
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {rentals.map((rental) => (
                    <Card key={rental.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{rental.listing.title}</CardTitle>
                          <Badge className={statusColors[rental.status as keyof typeof statusColors]}>
                            {rental.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Owner: {rental.owner.first_name} {rental.owner.last_name}
                        </p>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Rental Period:</span>
                            <p className="font-medium">
                              {formatDate(rental.rental_start_date)} - {formatDate(rental.rental_end_date)}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total Paid:</span>
                            <p className="font-medium">${rental.total_price.toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Booked:</span>
                            <p className="font-medium">{formatDate(rental.requested_at)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="as-owner" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Bookings</p>
                        <p className="text-2xl font-bold">{ownedBookings.length}</p>
                      </div>
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Pending Approval</p>
                        <p className="text-2xl font-bold">
                          {ownedBookings.filter(b => b.status === 'pending_approval').length}
                        </p>
                      </div>
                      <Calendar className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Earned</p>
                        <p className="text-2xl font-bold">
                          ${ownedBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.total_price, 0).toFixed(2)}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {ownedBookings.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                    <p className="text-muted-foreground">
                      List your gear to start receiving booking requests
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {ownedBookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{booking.listing.title}</CardTitle>
                          <Badge className={statusColors[booking.status as keyof typeof statusColors]}>
                            {booking.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Renter: {booking.renter.first_name} {booking.renter.last_name}
                        </p>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Rental Period:</span>
                            <p className="font-medium">
                              {formatDate(booking.rental_start_date)} - {formatDate(booking.rental_end_date)}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Earnings:</span>
                            <p className="font-medium">${booking.total_price.toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Requested:</span>
                            <p className="font-medium">{formatDate(booking.requested_at)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyRentals;