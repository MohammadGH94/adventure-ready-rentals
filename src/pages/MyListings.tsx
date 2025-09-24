import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Package, Plus, Edit, Eye, Calendar, DollarSign, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useListingForm } from "@/hooks/useListingForm";
import { getStorageImageUrl } from "@/lib/utils";

interface Listing {
  id: string;
  title: string;
  price_per_day: number;
  is_available: boolean;
  categories: string[];
  photos: string[];
  created_at: string;
  bookings_count?: number;
  monthly_revenue?: number;
}

const MyListings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { deleteListing } = useListingForm();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchListings();
    }
  }, [user]);

  const fetchListings = async () => {
    if (!user) return;

    try {
      // Get user's internal ID
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userData) return;

      // Fetch listings with booking stats
      const { data: listingsData } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          price_per_day,
          is_available,
          categories,
          photos,
          created_at
        `)
        .eq('owner_id', userData.id)
        .order('created_at', { ascending: false });

      if (listingsData) {
        // Fetch booking stats for each listing
        const listingsWithStats = await Promise.all(
          listingsData.map(async (listing) => {
            const { count: bookingsCount } = await supabase
              .from('bookings')
              .select('*', { count: 'exact', head: true })
              .eq('listing_id', listing.id);

            const { data: confirmedBookings } = await supabase
              .from('bookings')
              .select('total_price')
              .eq('listing_id', listing.id)
              .eq('status', 'confirmed');

            const monthlyRevenue = confirmedBookings?.reduce(
              (sum, booking) => sum + (booking.total_price || 0), 0
            ) || 0;

            return {
              ...listing,
              bookings_count: bookingsCount || 0,
              monthly_revenue: monthlyRevenue
            };
          })
        );

        setListings(listingsWithStats);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: "Error",
        description: "Failed to load your listings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleListingAvailability = async (listingId: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ is_available: !isAvailable })
        .eq('id', listingId);

      if (error) throw error;

      setListings(prev => prev.map(listing => 
        listing.id === listingId 
          ? { ...listing, is_available: !isAvailable }
          : listing
      ));

      toast({
        title: "Listing Updated",
        description: `Listing ${!isAvailable ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: "Error",
        description: "Failed to update listing",
        variant: "destructive",
      });
    }
  };

  const handleDeleteListing = async (listingId: string, listingTitle: string) => {
    setDeletingId(listingId);
    
    try {
      const success = await deleteListing(listingId);
      if (success) {
        // Remove the listing from local state
        setListings(prev => prev.filter(listing => listing.id !== listingId));
      }
    } finally {
      setDeletingId(null);
    }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
                <p className="text-muted-foreground mt-2">
                  Manage your gear listings and track their performance
                </p>
              </div>
              <Button onClick={() => navigate('/list-gear')} className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add New Listing
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          {listings.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Listings</p>
                      <p className="text-2xl font-bold">{listings.length}</p>
                    </div>
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Listings</p>
                      <p className="text-2xl font-bold">
                        {listings.filter(l => l.is_available).length}
                      </p>
                    </div>
                    <Eye className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">
                        ${listings.reduce((sum, l) => sum + (l.monthly_revenue || 0), 0).toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Listings Grid */}
          {listings.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start earning by listing your first piece of gear
                </p>
                <Button onClick={() => navigate('/list-gear')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Listing
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {listing.photos && listing.photos[0] ? (
                      <img
                        src={getStorageImageUrl(listing.photos[0])}
                        alt={listing.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={listing.is_available ? "default" : "secondary"}>
                        {listing.is_available ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-lg truncate">{listing.title}</CardTitle>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        ${listing.price_per_day}/day
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Active</span>
                        <Switch
                          checked={listing.is_available}
                          onCheckedChange={() => toggleListingAvailability(listing.id, listing.is_available)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Bookings:</span>
                      <span>{listing.bookings_count || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Revenue:</span>
                      <span className="font-medium">${listing.monthly_revenue?.toFixed(2) || '0.00'}</span>
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/gear/${listing.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/edit-listing/${listing.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/listing-bookings/${listing.id}`)}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Bookings
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 text-destructive hover:text-destructive"
                            disabled={deletingId === listing.id}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{listing.title}"? This action cannot be undone and will permanently remove the listing from your account.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteListing(listing.id, listing.title)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deletingId === listing.id ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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

export default MyListings;