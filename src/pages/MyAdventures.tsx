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

const getStatusDisplay = (status: string) => {
  const statusMap = {
    'pending_approval': { label: 'Awaiting Approval', color: 'bg-yellow-100 text-yellow-800' },
    'confirmed': { label: 'Adventure Ready', color: 'bg-blue-100 text-blue-800' },
    'active': { label: 'Out Exploring', color: 'bg-green-100 text-green-800' },
    'completed': { label: 'Adventure Complete', color: 'bg-emerald-100 text-emerald-800' },
    'cancelled_by_owner': { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    'cancelled_by_renter': { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    'disputed': { label: 'Help Needed', color: 'bg-orange-100 text-orange-800' }
  };
  return statusMap[status as keyof typeof statusMap] || { label: status, color: 'bg-gray-100 text-gray-800' };
};

const MyAdventures = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [adventures, setAdventures] = useState<Rental[]>([]);
  const [ownedBookings, setOwnedBookings] = useState<OwnedBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAdventures();
    }
  }, [user]);

  const fetchAdventures = async () => {
    if (!user) return;

    try {
      // Get user's internal ID
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userData) return;

      // Fetch adventures where user is the renter
      const { data: adventureData } = await supabase
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

      if (adventureData) setAdventures(adventureData);
      if (ownedData) setOwnedBookings(ownedData);

    } catch (error) {
      console.error('Error fetching adventures:', error);
      toast({
        title: "Error",
        description: "Failed to load adventure data",
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
            <h1 className="text-3xl font-bold text-foreground">My Adventures</h1>
            <p className="text-muted-foreground mt-2">
              Your outdoor experiences and gear sharing journey
            </p>
          </div>

          <Tabs defaultValue="as-renter" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="as-renter">My Adventures</TabsTrigger>
              <TabsTrigger value="as-owner">Gear I Share</TabsTrigger>
            </TabsList>

            <TabsContent value="as-renter" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Adventures</p>
                        <p className="text-2xl font-bold">{adventures.length}</p>
                      </div>
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Currently Exploring</p>
                        <p className="text-2xl font-bold">
                          {adventures.filter(r => ['confirmed', 'active'].includes(r.status)).length}
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
                        <p className="text-sm text-muted-foreground">Adventure Investment</p>
                        <p className="text-2xl font-bold">
                          ${adventures.reduce((sum, r) => sum + r.total_price, 0).toFixed(2)}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {adventures.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Your first adventure awaits!</h3>
                    <p className="text-muted-foreground">
                      Discover amazing gear from fellow adventurers and start exploring
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {adventures.map((adventure) => {
                    const statusInfo = getStatusDisplay(adventure.status);
                    return (
                      <Card key={adventure.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{adventure.listing.title}</CardTitle>
                            <Badge className={statusInfo.color}>
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            From {adventure.owner.first_name} {adventure.owner.last_name}
                          </p>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Adventure Dates:</span>
                              <p className="font-medium">
                                {formatDate(adventure.rental_start_date)} - {formatDate(adventure.rental_end_date)}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total Cost:</span>
                              <p className="font-medium">${adventure.total_price.toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Booked:</span>
                              <p className="font-medium">{formatDate(adventure.requested_at)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="as-owner" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Adventures Enabled</p>
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
                        <p className="text-sm text-muted-foreground">New Requests</p>
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
                        <p className="text-sm text-muted-foreground">Community Earned</p>
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
                    <h3 className="text-lg font-semibold mb-2">Share your gear with the community</h3>
                    <p className="text-muted-foreground">
                      List your outdoor gear to help others explore while earning extra income
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {ownedBookings.map((booking) => {
                    const statusInfo = getStatusDisplay(booking.status);
                    return (
                      <Card key={booking.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{booking.listing.title}</CardTitle>
                            <Badge className={statusInfo.color}>
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Adventurer: {booking.renter.first_name} {booking.renter.last_name}
                          </p>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Adventure Dates:</span>
                              <p className="font-medium">
                                {formatDate(booking.rental_start_date)} - {formatDate(booking.rental_end_date)}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Your Earnings:</span>
                              <p className="font-medium">${booking.total_price.toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Requested:</span>
                              <p className="font-medium">{formatDate(booking.requested_at)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
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

export default MyAdventures;