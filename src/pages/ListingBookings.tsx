import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Calendar, 
  User, 
  DollarSign, 
  Check, 
  X, 
  Upload, 
  Camera,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  rental_start_date: string;
  rental_end_date: string;
  total_price: number;
  status: string;
  item_status: string;
  renter_id: string;
  requested_at: string;
  confirmed_at: string;
  renter?: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
  };
}

interface Listing {
  id: string;
  title: string;
  photos: string[];
}

const statusColors = {
  'pending_approval': 'bg-yellow-100 text-yellow-800',
  'confirmed': 'bg-blue-100 text-blue-800',
  'picked_up': 'bg-green-100 text-green-800',
  'completed': 'bg-emerald-100 text-emerald-800',
  'cancelled_by_owner': 'bg-red-100 text-red-800',
  'cancelled_by_renter': 'bg-red-100 text-red-800',
  'disputed': 'bg-orange-100 text-orange-800',
  'active': 'bg-green-100 text-green-800'
};

const ListingBookings = () => {
  const { listingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [pickupPin, setPickupPin] = useState("");
  const [dropoffPin, setDropoffPin] = useState("");
  const [itemPhotos, setItemPhotos] = useState<File[]>([]);

  useEffect(() => {
    if (user && listingId) {
      fetchListingAndBookings();
    }
  }, [user, listingId]);

  const fetchListingAndBookings = async () => {
    if (!user || !listingId) return;

    try {
      // Get user's internal ID
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userData) return;

      // Fetch listing details
      const { data: listingData } = await supabase
        .from('listings')
        .select('id, title, photos')
        .eq('id', listingId)
        .eq('owner_id', userData.id)
        .single();

      if (!listingData) {
        toast({
          title: "Error",
          description: "Listing not found or access denied",
          variant: "destructive",
        });
        navigate('/my-listings');
        return;
      }

      setListing(listingData);

      // Fetch bookings for this listing
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          renter:users!bookings_renter_id_fkey(
            first_name,
            last_name,
            email,
            phone_number
          )
        `)
        .eq('listing_id', listingId)
        .order('requested_at', { ascending: false });

      if (bookingsData) {
        setBookings(bookingsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load booking data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'accept' | 'reject' | 'cancel') => {
    try {
      let newStatus: 'confirmed' | 'cancelled_by_owner' = action === 'accept' ? 'confirmed' : 'cancelled_by_owner';
      
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: newStatus,
          ...(action === 'accept' && { confirmed_at: new Date().toISOString() })
        })
        .eq('id', bookingId);

      if (error) throw error;

      // Refresh bookings
      await fetchListingAndBookings();

      toast({
        title: "Booking Updated",
        description: `Booking ${action}ed successfully`,
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive",
      });
    }
  };

  const handlePickupConfirmation = async (bookingId: string) => {
    if (!pickupPin || pickupPin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "Please enter a 4-digit PIN",
        variant: "destructive",
      });
      return;
    }

    try {
      // In a real app, you'd verify the PIN against the one given to the renter
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'active',
          item_status: 'unavailable'
        })
        .eq('id', bookingId);

      if (error) throw error;

      await fetchListingAndBookings();
      setPickupPin("");
      setSelectedBooking(null);

      toast({
        title: "Pickup Confirmed",
        description: "Item has been picked up successfully",
      });
    } catch (error) {
      console.error('Error confirming pickup:', error);
      toast({
        title: "Error",
        description: "Failed to confirm pickup",
        variant: "destructive",
      });
    }
  };

  const handleDropoffConfirmation = async (bookingId: string) => {
    if (!dropoffPin || dropoffPin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "Please enter a 4-digit PIN",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'completed',
          item_status: 'available'
        })
        .eq('id', bookingId);

      if (error) throw error;

      await fetchListingAndBookings();
      setDropoffPin("");
      setSelectedBooking(null);

      toast({
        title: "Dropoff Confirmed",
        description: "Rental completed successfully",
      });
    } catch (error) {
      console.error('Error confirming dropoff:', error);
      toast({
        title: "Error",
        description: "Failed to confirm dropoff",
        variant: "destructive",
      });
    }
  };

  const openClaim = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'disputed' })
        .eq('id', bookingId);

      if (error) throw error;

      await fetchListingAndBookings();

      toast({
        title: "Claim Opened",
        description: "A claim has been opened for this booking",
      });
    } catch (error) {
      console.error('Error opening claim:', error);
      toast({
        title: "Error",
        description: "Failed to open claim",
        variant: "destructive",
      });
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
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => navigate('/my-listings')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Listings
            </Button>
            <h1 className="text-3xl font-bold text-foreground">
              Bookings for {listing?.title}
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage booking requests and track rental progress
            </p>
          </div>

          {/* Bookings List */}
          {bookings.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground">
                  Bookings will appear here once renters request your gear
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-lg">
                            {booking.renter?.first_name} {booking.renter?.last_name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {booking.renter?.email}
                          </p>
                        </div>
                      </div>
                      <Badge className={statusColors[booking.status as keyof typeof statusColors]}>
                        {booking.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Rental Period:</span>
                        <p className="font-medium">
                          {formatDate(booking.rental_start_date)} - {formatDate(booking.rental_end_date)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Amount:</span>
                        <p className="font-medium">${booking.total_price.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Requested:</span>
                        <p className="font-medium">{formatDate(booking.requested_at)}</p>
                      </div>
                    </div>

                    {/* Action Buttons based on status */}
                    <div className="flex space-x-2">
                      {booking.status === 'pending_approval' && (
                        <>
                          <Button 
                            onClick={() => handleBookingAction(booking.id, 'accept')}
                            className="flex items-center"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => handleBookingAction(booking.id, 'reject')}
                            className="flex items-center"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}

                      {booking.status === 'confirmed' && (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button className="flex items-center">
                                <Check className="h-4 w-4 mr-2" />
                                Confirm Pickup
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirm Pickup</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    Enter Renter's PIN
                                  </label>
                                  <Input
                                    type="text"
                                    placeholder="4-digit PIN"
                                    maxLength={4}
                                    value={pickupPin}
                                    onChange={(e) => setPickupPin(e.target.value)}
                                  />
                                </div>
                                <Button 
                                  onClick={() => handlePickupConfirmation(booking.id)}
                                  className="w-full"
                                >
                                  Confirm Pickup
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="outline"
                            onClick={() => handleBookingAction(booking.id, 'cancel')}
                          >
                            Cancel Booking
                          </Button>
                        </>
                      )}

                      {booking.status === 'active' && (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button className="flex items-center">
                                <Check className="h-4 w-4 mr-2" />
                                Confirm Dropoff
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirm Dropoff</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    Enter Owner's PIN
                                  </label>
                                  <Input
                                    type="text"
                                    placeholder="4-digit PIN"
                                    maxLength={4}
                                    value={dropoffPin}
                                    onChange={(e) => setDropoffPin(e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    Upload Item Condition Photos
                                  </label>
                                  <input
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    onChange={(e) => setItemPhotos(Array.from(e.target.files || []))}
                                    className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                  />
                                </div>
                                <Button 
                                  onClick={() => handleDropoffConfirmation(booking.id)}
                                  className="w-full"
                                >
                                  Confirm Dropoff
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="destructive"
                            onClick={() => openClaim(booking.id)}
                            className="flex items-center"
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Open Claim
                          </Button>
                        </>
                      )}

                      {booking.status === 'completed' && (
                        <Button 
                          variant="outline"
                          onClick={() => openClaim(booking.id)}
                          className="flex items-center"
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Open Claim
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ListingBookings;