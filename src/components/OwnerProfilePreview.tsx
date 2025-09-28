import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star, Calendar, Package, TrendingUp } from "lucide-react";
import { useOwnerProfile, OwnerProfile } from "@/hooks/useOwnerProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { getStorageImageUrl } from "@/lib/utils";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface OwnerProfilePreviewProps {
  ownerId: string;
  ownerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OwnerProfilePreview = ({ ownerId, ownerName, open, onOpenChange }: OwnerProfilePreviewProps) => {
  const { data: profile, isLoading, error } = useOwnerProfile(ownerId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(amount);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profile Unavailable</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Unable to load profile information.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Renter Profile</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.profile_image_url || undefined} />
                <AvatarFallback className="text-lg">
                  {profile.first_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{profile.first_name}</h3>
                <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {format(new Date(profile.created_at), "MMMM yyyy")}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Package className="h-4 w-4" />
                    <span>{profile.listings.length} listings</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{profile.total_bookings} bookings</span>
                  </div>
                </div>
                
                {/* Rating */}
                {profile.average_rating > 0 && (
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex">{renderStars(profile.average_rating)}</div>
                    <span className="text-sm font-medium">{profile.average_rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">
                      ({profile.reviews.length} review{profile.reviews.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.profile_bio && (
              <div>
                <h4 className="font-medium mb-2">About</h4>
                <p className="text-sm text-muted-foreground">{profile.profile_bio}</p>
              </div>
            )}

            <Separator />

            {/* Listings */}
            <div>
              <h4 className="font-medium mb-4">Items Available for Rent</h4>
              {profile.listings.length > 0 ? (
                <div className="grid gap-4">
                  {profile.listings.slice(0, 3).map((listing) => (
                    <Link
                      key={listing.id}
                      to={`/listing/${listing.id}`}
                      onClick={() => onOpenChange(false)}
                    >
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="flex items-center space-x-4 p-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {listing.photos?.[0] ? (
                              <img
                                src={getStorageImageUrl(listing.photos[0])}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium truncate">{listing.title}</h5>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-lg font-semibold">{formatCurrency(listing.price_per_day)}/day</span>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <span>{listing.booking_count} rentals</span>
                                <span>•</span>
                                <span>{listing.view_count} views</span>
                              </div>
                            </div>
                            {listing.next_available_date && (
                              <div className="text-xs text-green-600 mt-1">
                                Next available: {format(new Date(listing.next_available_date), "MMM d, yyyy")}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                  {profile.listings.length > 3 && (
                    <p className="text-sm text-muted-foreground text-center">
                      And {profile.listings.length - 3} more listings...
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No listings available</p>
              )}
            </div>

            {/* Reviews */}
            {profile.reviews.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-4">Reviews</h4>
                  <div className="space-y-4">
                    {profile.reviews.slice(0, 3).map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm">{review.renter_name}</span>
                              <div className="flex">{renderStars(review.owner_rating || 0)}</div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(review.submitted_at), "MMM d, yyyy")}
                            </span>
                          </div>
                          {review.comment_owner && (
                            <p className="text-sm text-muted-foreground">{review.comment_owner}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {profile.reviews.length > 3 && (
                      <p className="text-sm text-muted-foreground text-center">
                        And {profile.reviews.length - 3} more reviews...
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};