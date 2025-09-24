import { useEffect, useReducer, useState, useMemo, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { MapPin, Star, Clock, ShieldCheck, Wallet, FileText, RefreshCcw, CheckCircle2, AlertTriangle, MessageSquare, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GearListing, ProtectionChoice } from "@/lib/gear";
import { useListing, DatabaseListing } from "@/hooks/useListing";
import { useAuth } from "@/hooks/useAuth";
import { DateRangePicker } from "@/components/DatePicker";
import { differenceInDays } from "date-fns";
import { getStorageImageUrl, isDateAvailable } from "@/lib/utils";
import { useAvailability } from "@/hooks/useAvailability";
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});
const formatCurrency = (value: number | undefined) => typeof value === "number" ? currencyFormatter.format(value) : undefined;
type Stage = "details" | "payment" | "confirmed" | "cancelled" | "pickup" | "dropoff" | "evidence" | "resolution" | "review" | "completed";
type ClaimStatus = "none" | "pending" | "approved" | "rejected";
type StepId = "details" | "protection" | "confirmation" | "pickup" | "dropoff" | "evidence" | "resolution" | "review" | "browse";
type StepStatus = "complete" | "current" | "upcoming" | "cancelled";
interface JourneyStep {
  id: StepId;
  title: string;
  description: string;
  status: StepStatus;
}
interface BookingState {
  stage: Stage;
  protectionChoice: ProtectionChoice;
  refundIssued: boolean;
  depositReturned: boolean;
  claimStatus: ClaimStatus;
  reviewSubmitted: boolean;
  history: string[];
  startDate?: Date;
  endDate?: Date;
}
type BookingAction = {
  type: "START_BOOKING";
  requiresProtection: boolean;
} | {
  type: "PAY_DEPOSIT";
} | {
  type: "BUY_INSURANCE";
} | {
  type: "DECLINE_PROTECTION";
} | {
  type: "CANCEL_BOOKING";
} | {
  type: "ARRANGE_PICKUP";
} | {
  type: "ARRANGE_DROPOFF";
} | {
  type: "UPLOAD_EVIDENCE";
} | {
  type: "RETURN_DEPOSIT";
} | {
  type: "OPEN_CLAIM";
} | {
  type: "RESOLVE_CLAIM";
  outcome: "approved" | "rejected";
} | {
  type: "WRITE_REVIEW";
} | {
  type: "RESET";
  title: string;
} | {
  type: "SET_DATES";
  startDate?: Date;
  endDate?: Date;
} | {
  type: "REQUIRE_AUTH";
};
const createInitialState = (title: string): BookingState => ({
  stage: "details",
  protectionChoice: null,
  refundIssued: false,
  depositReturned: false,
  claimStatus: "none",
  reviewSubmitted: false,
  history: [`Reviewing ${title} before booking.`],
  startDate: undefined,
  endDate: undefined
});
const stageRank: Record<Stage, number> = {
  details: 0,
  payment: 1,
  confirmed: 2,
  pickup: 3,
  dropoff: 4,
  evidence: 5,
  resolution: 6,
  review: 7,
  completed: 8,
  cancelled: 9
};
const stepRank: Record<StepId, number> = {
  details: 0,
  protection: 1,
  confirmation: 2,
  pickup: 3,
  dropoff: 4,
  evidence: 5,
  resolution: 6,
  review: 7,
  browse: 8
};
const bookingReducer = (state: BookingState, action: BookingAction): BookingState => {
  switch (action.type) {
    case "START_BOOKING":
      {
        if (state.stage !== "details") return state;
        const historyEntry = action.requiresProtection ? "Started checkout. Protection is required before pickup." : "Booking confirmed instantly—no deposit required.";
        return {
          ...state,
          stage: action.requiresProtection ? "payment" : "confirmed",
          history: [...state.history, historyEntry],
          refundIssued: false
        };
      }
    case "PAY_DEPOSIT":
      {
        if (state.stage !== "payment") return state;
        return {
          ...state,
          stage: "confirmed",
          protectionChoice: "deposit",
          history: [...state.history, "Refundable security deposit authorized. Booking confirmed."],
          refundIssued: false
        };
      }
    case "BUY_INSURANCE":
      {
        if (state.stage !== "payment") return state;
        return {
          ...state,
          stage: "confirmed",
          protectionChoice: "insurance",
          history: [...state.history, "Damage insurance purchased. Booking confirmed."],
          refundIssued: false
        };
      }
    case "DECLINE_PROTECTION":
      {
        if (state.stage !== "payment") return state;
        return {
          ...state,
          stage: "details",
          protectionChoice: null,
          history: [...state.history, "Protection declined. Returned to browsing."]
        };
      }
    case "CANCEL_BOOKING":
      {
        if (state.stage !== "confirmed" && state.stage !== "pickup") return state;
        const message = state.stage === "pickup" ? "Booking cancelled after pickup arrangements. Refund review started." : "Booking cancelled before pickup. Full refund initiated.";
        return {
          ...state,
          stage: "cancelled",
          refundIssued: true,
          history: [...state.history, message]
        };
      }
    case "ARRANGE_PICKUP":
      {
        if (state.stage !== "confirmed") return state;
        return {
          ...state,
          stage: "pickup",
          history: [...state.history, "Pickup window confirmed with the owner."]
        };
      }
    case "ARRANGE_DROPOFF":
      {
        if (state.stage !== "pickup") return state;
        return {
          ...state,
          stage: "dropoff",
          history: [...state.history, "Pickup completed. Dropoff planning started."]
        };
      }
    case "UPLOAD_EVIDENCE":
      {
        if (state.stage !== "dropoff") return state;
        return {
          ...state,
          stage: "evidence",
          history: [...state.history, "Condition photos uploaded for the return checklist."]
        };
      }
    case "RETURN_DEPOSIT":
      {
        if (state.stage !== "evidence" && state.stage !== "resolution") return state;
        const depositReleased = state.protectionChoice === "deposit";
        return {
          ...state,
          stage: "review",
          depositReturned: depositReleased ? true : state.depositReturned,
          claimStatus: state.claimStatus === "pending" ? "approved" : state.claimStatus,
          history: [...state.history, depositReleased ? "Deposit released back to your card." : "Return completed—no deposit was held."]
        };
      }
    case "OPEN_CLAIM":
      {
        if (state.stage !== "evidence") return state;
        return {
          ...state,
          stage: "resolution",
          claimStatus: "pending",
          history: [...state.history, "Claim opened with supporting evidence. Awaiting outcome."]
        };
      }
    case "RESOLVE_CLAIM":
      {
        if (state.stage !== "resolution" || state.claimStatus !== "pending") return state;
        const approved = action.outcome === "approved";
        return {
          ...state,
          stage: "review",
          claimStatus: action.outcome,
          depositReturned: approved ? true : state.depositReturned,
          history: [...state.history, approved ? "Claim approved. Insurance refund released." : "Claim rejected. Support will follow up with next steps."]
        };
      }
    case "WRITE_REVIEW":
      {
        if (state.stage !== "review") return state;
        return {
          ...state,
          stage: "completed",
          reviewSubmitted: true,
          history: [...state.history, "Review submitted. Thanks for the feedback!"]
        };
      }
    case "RESET":
      {
        return createInitialState(action.title);
      }
    case "SET_DATES":
      {
        return {
          ...state,
          startDate: action.startDate,
          endDate: action.endDate,
          history: action.startDate && action.endDate 
            ? [...state.history, `Dates selected: ${action.startDate.toLocaleDateString()} - ${action.endDate.toLocaleDateString()}`]
            : state.history
        };
      }
    case "REQUIRE_AUTH":
      {
        return {
          ...state,
          history: [...state.history, "Sign in required to complete booking."]
        };
      }
    default:
      return state;
  }
};
const baseStepStatus = (state: BookingState, step: StepId): StepStatus => {
  if (state.stage === "cancelled") {
    if (step === "confirmation") return "cancelled";
    if (["pickup", "dropoff", "evidence", "resolution", "review"].includes(step)) {
      return "upcoming";
    }
    if (step === "browse") {
      return "current";
    }
    return "complete";
  }
  if (state.stage === "completed" && step === "browse") {
    return "current";
  }
  const currentRank = stageRank[state.stage];
  const position = stepRank[step];
  if (currentRank > position) return "complete";
  if (currentRank === position) return "current";
  return "upcoming";
};
const computeJourneySteps = (listing: GearListing, state: BookingState): JourneyStep[] => {
  const requiresProtection = listing.protection.requiresProtection;
  const depositAmount = formatCurrency(listing.protection.depositAmount);
  const insurancePrice = formatCurrency(listing.protection.insuranceDailyPrice);
  const steps: JourneyStep[] = [{
    id: "details",
    title: "Review listing details",
    description: "Look through highlights, what's included, and pickup notes so you know exactly what will be waiting for you.",
    status: baseStepStatus(state, "details")
  }, {
    id: "protection",
    title: "Secure protection",
    description: (() => {
      if (!requiresProtection) {
        return "No mandatory deposit for this listing—confirm when you're ready. Optional coverage is still available.";
      }
      if (state.stage === "payment") {
        return depositAmount ? `Choose a ${depositAmount} refundable deposit or add insurance before confirmation.` : "Pick the insurance option to move forward.";
      }
      if (state.protectionChoice === "deposit" && depositAmount) {
        return `${depositAmount} deposit authorized and ready for release after dropoff.`;
      }
      if (state.protectionChoice === "insurance" && insurancePrice) {
        return `Insurance active from ${insurancePrice} per day for accidental damage coverage.`;
      }
      return "Protection requirement satisfied—you're ready for confirmation.";
    })(),
    status: baseStepStatus(state, "protection")
  }, {
    id: "confirmation",
    title: "Receive confirmation",
    description: state.stage === "cancelled" && state.refundIssued ? "Booking cancelled and refund initiated to your original payment method." : "Booking confirmation includes calendar reminders and owner contact details.",
    status: baseStepStatus(state, "confirmation")
  }, {
    id: "pickup",
    title: "Arrange pickup",
    description: (() => {
      if (state.stage === "pickup") {
        return "Pickup window locked in. Bring ID and arrive a few minutes early for gear checks.";
      }
      if (state.stage === "dropoff" || stageRank[state.stage] > stageRank.pickup) {
        return "Pickup completed—you're out on your adventure!";
      }
      if (state.stage === "cancelled") {
        return "Pickup skipped because the booking was cancelled.";
      }
      return "Coordinate the meetup location and time with the owner before your trip.";
    })(),
    status: baseStepStatus(state, "pickup")
  }, {
    id: "dropoff",
    title: "Arrange dropoff",
    description: (() => {
      if (state.stage === "dropoff") {
        return "Dropoff window scheduled. Keep the gear clean and dry before returning.";
      }
      if (stageRank[state.stage] > stageRank.dropoff) {
        return "Dropoff complete—time to document the gear condition.";
      }
      if (state.stage === "cancelled") {
        return "No dropoff needed due to cancellation.";
      }
      return "Confirm where and when you'll return the gear to the owner.";
    })(),
    status: baseStepStatus(state, "dropoff")
  }, {
    id: "evidence",
    title: "Upload return evidence",
    description: (() => {
      if (state.stage === "evidence") {
        return "Snap a few photos or a short video so there's a clear record of the gear's condition.";
      }
      if (stageRank[state.stage] > stageRank.evidence) {
        return "Return evidence captured—owner can now review and release protection.";
      }
      if (state.stage === "cancelled") {
        return "No evidence needed because the trip didn't take place.";
      }
      return "Once you're back, record the gear condition before closing out the trip.";
    })(),
    status: baseStepStatus(state, "evidence")
  }, {
    id: "resolution",
    title: "Deposits & claims",
    description: (() => {
      if (state.claimStatus === "pending") {
        return "Claim submitted. Sit tight while insurance reviews your evidence.";
      }
      if (state.claimStatus === "approved") {
        return "Claim approved and refunds are on their way.";
      }
      if (state.claimStatus === "rejected") {
        return "Claim rejected. Support will follow up with additional guidance.";
      }
      if (state.depositReturned) {
        return "Deposit released back to your card within 1–3 business days.";
      }
      return "Return the deposit or start a claim if something wasn't quite right.";
    })(),
    status: baseStepStatus(state, "resolution")
  }, {
    id: "review",
    title: "Share a review",
    description: (() => {
      if (state.stage === "completed" || state.reviewSubmitted) {
        return "Thanks for sharing feedback—it helps other renters know what to expect.";
      }
      if (state.stage === "cancelled") {
        return "Trip ended early—feel free to leave feedback for the owner.";
      }
      return "Wrap up the trip by rating the gear and the handoff experience.";
    })(),
    status: baseStepStatus(state, "review")
  }, {
    id: "browse",
    title: "Browse more gear",
    description: state.stage === "cancelled" ? "Head back to Browse to find another adventure when you're ready." : "All wrapped! Explore new listings for your next outing.",
    status: baseStepStatus(state, "browse")
  }];
  return steps;
};
const mapDatabaseToGearListing = (dbListing: DatabaseListing): GearListing => {
  return {
    id: dbListing.id,
    title: dbListing.title,
    description: dbListing.description || "",
    image: getStorageImageUrl(dbListing.photos?.[0]),
    price: Number(dbListing.price_per_day),
    rating: 4.5, // Default rating - in future could be calculated from reviews
    reviewCount: 0, // Default - in future could be calculated from reviews
    location: dbListing.pickup_addresses?.[0] || "Location TBD",
    category: dbListing.categories?.[0] || "general",
    protection: {
      requiresProtection: !!dbListing.deposit_amount || dbListing.insurance_required,
      depositAmount: dbListing.deposit_amount ? Number(dbListing.deposit_amount) : undefined,
      depositDescription: dbListing.deposit_amount ? "Refundable deposit held until return" : undefined,
      insuranceDailyPrice: dbListing.insurance_required ? 10 : undefined, // Default insurance price
      insuranceDescription: dbListing.insurance_required ? "Optional damage protection coverage" : undefined,
    },
    cancellationPolicy: {
      headline: "Standard cancellation policy",
      details: [
        "Full refund up to 24h before pickup",
        "50% refund for cancellations within 24h",
        "After pickup, refunds subject to inspection"
      ]
    },
    pickupNotes: dbListing.pickup_instructions ? [dbListing.pickup_instructions] : ["Pickup details will be provided upon booking"],
    highlights: [
      "Quality gear maintained to high standards",
      "Detailed inspection before each rental",
      "Owner support throughout your adventure"
    ],
    gearIncludes: ["Complete gear package as described"],
    owner: {
      name: "Gear Owner", // In future, join with users table
      responseTime: "Usually responds quickly",
      tripsHosted: 1,
      rating: 4.8
    }
  };
};

const ListingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: dbListing, isLoading, error } = useListing(id ?? "");
  const { data: availabilityData, isLoading: availabilityLoading } = useAvailability(id ?? "");
  
  console.log("ListingDetails render:", { id, user: user?.id, authLoading, isLoading, error });
  
  const listing = dbListing ? mapDatabaseToGearListing(dbListing) : null;

  // Cache current date to avoid creating new objects on every render
  const today = useMemo(() => new Date(), []);

  // Memoize the disabled function to prevent flickering
  const isDateDisabled = useCallback((date: Date) => {
    // Always disable past dates
    if (date < today) return true;
    
    // If availability data is still loading, allow all future dates to be selectable
    if (availabilityLoading || !availabilityData) {
      console.log("Date picker: availability loading, allowing all future dates", { 
        availabilityLoading, 
        hasData: !!availabilityData,
        date: date.toISOString().split('T')[0]
      });
      return false;
    }
    
    // Simple availability check with detailed logging
    try {
      const isAvailable = isDateAvailable(
        date,
        availabilityData.unavailable_dates,
        availabilityData.block_out_times,
        availabilityData.existing_bookings
      );
      
      console.log("Date availability check:", {
        date: date.toISOString().split('T')[0],
        isAvailable,
        unavailableDates: availabilityData.unavailable_dates?.length || 0,
        existingBookings: availabilityData.existing_bookings?.length || 0
      });
      
      return !isAvailable;
    } catch (error) {
      console.error("Error checking date availability:", error);
      return false; // Allow the date if there's an error
    }
  }, [today, availabilityLoading, availabilityData]);
  const [bookingState, dispatch] = useReducer(bookingReducer, listing?.title ?? "this gear", createInitialState);
  
  // State for preventing multiple rapid clicks
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);
  
  useEffect(() => {
    if (listing) {
      dispatch({
        type: "RESET",
        title: listing.title
      });
    }
  }, [listing]);

  // Handle stored booking data on component mount and auth changes
  useEffect(() => {
    console.log("Auth state changed:", { user: user?.id, authLoading });
    
    if (!authLoading && user) {
      // Check for stored booking data when user becomes available
      const storedBookingData = sessionStorage.getItem(`booking_${id}`);
      if (storedBookingData) {
        try {
          const bookingData = JSON.parse(storedBookingData);
          console.log("Found stored booking data:", bookingData);
          
          // Restore dates with proper conversion from string to Date
          if (bookingData.startDate && bookingData.endDate) {
            const startDate = new Date(bookingData.startDate);
            const endDate = new Date(bookingData.endDate);
            
            // Validate dates are valid
            if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
              dispatch({
                type: "SET_DATES",
                startDate,
                endDate
              });
              console.log("Restored booking dates:", { startDate, endDate });
            } else {
              console.warn("Invalid stored dates found, clearing storage");
              sessionStorage.removeItem(`booking_${id}`);
            }
          }
          
          // Clear stored data after restoration
          sessionStorage.removeItem(`booking_${id}`);
        } catch (error) {
          console.error("Error parsing stored booking data:", error);
          sessionStorage.removeItem(`booking_${id}`);
        }
      }
    }
  }, [user, authLoading, id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-24">
          <div className="mx-auto max-w-xl px-4 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !listing) {
    return <div className="min-h-screen bg-background">
        <Header />
        <main className="py-24">
          <div className="mx-auto max-w-xl px-4 text-center">
            <Card>
              <CardHeader>
                <CardTitle>Listing not found</CardTitle>
                <CardDescription>
                  The gear you're looking for has moved or no longer exists. Browse the catalog to find a similar setup.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <Button asChild variant="action">
                  <Link to="/browse">Explore gear</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/">Return home</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>;
  }
  const steps = computeJourneySteps(listing, bookingState);
  const depositAmount = formatCurrency(listing.protection.depositAmount);
  const insurancePrice = formatCurrency(listing.protection.insuranceDailyPrice);
  const requiresProtection = listing.protection.requiresProtection;

  // Calculate quote
  const calculateQuote = () => {
    if (!bookingState.startDate || !bookingState.endDate) return null;
    
    const days = differenceInDays(bookingState.endDate, bookingState.startDate);
    if (days <= 0) return null;
    
    const subtotal = days * listing.price;
    const serviceFee = Math.round(subtotal * 0.1); // 10% service fee
    const taxes = Math.round(subtotal * 0.08); // 8% taxes
    const insurance = bookingState.protectionChoice === "insurance" && listing.protection.insuranceDailyPrice 
      ? days * listing.protection.insuranceDailyPrice 
      : 0;
    const total = subtotal + serviceFee + taxes + insurance;
    
    return {
      days,
      subtotal,
      serviceFee,
      taxes,
      insurance,
      total,
      deposit: listing.protection.depositAmount || 0
    };
  };

  const quote = calculateQuote();

  const handleBookingStart = () => {
    console.log("handleBookingStart called:", { 
      user: user?.id, 
      authLoading, 
      isProcessingBooking,
      hasValidDates: !!bookingState.startDate && !!bookingState.endDate 
    });

    // Prevent multiple rapid clicks
    if (isProcessingBooking) {
      console.log("Booking already in progress, ignoring click");
      return;
    }

    // Validate dates are selected
    if (!bookingState.startDate || !bookingState.endDate) {
      console.warn("Attempted booking without valid dates");
      return;
    }

    // Show loading state during auth check and navigation
    setIsProcessingBooking(true);

    try {
      if (!user) {
        console.log("User not authenticated, storing booking data and redirecting");
        
        // Store booking state in sessionStorage with proper date serialization
        const bookingData = {
          listingId: id,
          startDate: bookingState.startDate.toISOString(),
          endDate: bookingState.endDate.toISOString(),
          protectionChoice: bookingState.protectionChoice
        };
        
        sessionStorage.setItem(`booking_${id}`, JSON.stringify(bookingData));
        dispatch({ type: "REQUIRE_AUTH" });
        
        // Use setTimeout to ensure state updates before navigation
        setTimeout(() => {
          navigate('/signin');
          setIsProcessingBooking(false);
        }, 100);
        return;
      }
      
      console.log("User authenticated, starting booking");
      dispatch({
        type: "START_BOOKING",
        requiresProtection
      });
    } catch (error) {
      console.error("Error in handleBookingStart:", error);
    } finally {
      // Reset processing state after a short delay to prevent rapid clicks
      setTimeout(() => {
        setIsProcessingBooking(false);
      }, 500);
    }
  };

  // Add loading state for auth and prevent blank pages
  if (authLoading) {
    console.log("Auth loading, showing spinner");
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-24">
          <div className="mx-auto max-w-xl px-4 text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  const renderActionCard = () => {
    switch (bookingState.stage) {
      case "details":
        return <div className="space-y-4">
            <div className="space-y-3">
              <div className="text-sm font-medium">Select your dates</div>
              <DateRangePicker
                startDate={bookingState.startDate}
                endDate={bookingState.endDate}
                onStartDateSelect={(date) => dispatch({ type: "SET_DATES", startDate: date, endDate: bookingState.endDate })}
                onEndDateSelect={(date) => dispatch({ type: "SET_DATES", startDate: bookingState.startDate, endDate: date })}
                placeholder="Choose rental dates"
                disabled={isDateDisabled}
              />
            </div>
            
            {quote && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Your Quote</CardTitle>
                  <CardDescription>{quote.days} day{quote.days !== 1 ? 's' : ''} rental</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{formatCurrency(listing.price)} × {quote.days} day{quote.days !== 1 ? 's' : ''}</span>
                    <span>{formatCurrency(quote.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service fee</span>
                    <span>{formatCurrency(quote.serviceFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes</span>
                    <span>{formatCurrency(quote.taxes)}</span>
                  </div>
                  {quote.insurance > 0 && (
                    <div className="flex justify-between">
                      <span>Insurance</span>
                      <span>{formatCurrency(quote.insurance)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatCurrency(quote.total)}</span>
                  </div>
                  {quote.deposit > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Plus {formatCurrency(quote.deposit)} refundable deposit
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            <p className="text-sm text-muted-foreground">
              {!user ? "Get an instant quote above, then sign in to book." : 
               requiresProtection ? "A refundable deposit or insurance is required before pickup." : 
               listing.protection.insuranceDailyPrice ? "Insurance is optional for this listing—book instantly when you're ready." : 
               "Book instantly with no additional protection requirements."}
            </p>
            
            <Button 
              variant="action" 
              className="w-full" 
              onClick={handleBookingStart}
              disabled={!bookingState.startDate || !bookingState.endDate || isProcessingBooking || authLoading}
            >
              {isProcessingBooking ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {!user ? "Redirecting to sign in..." : "Starting booking..."}
                </div>
              ) : (
                !user ? "Sign In to Book" : "Rent Now"
              )}
            </Button>
            
            {!user && (
              <Button asChild variant="outline" className="w-full">
                <Link to="/signin">Sign in to save trip details</Link>
              </Button>
            )}
          </div>;
      case "payment":
        return <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose how you want to protect the trip. You can come back to this step anytime before confirming.
            </p>
            {depositAmount && <Button variant="action" className="w-full" onClick={() => dispatch({
            type: "PAY_DEPOSIT"
          })}>
                Pay {depositAmount} refundable deposit
              </Button>}
            {insurancePrice && <Button variant="secondary" className="w-full" onClick={() => dispatch({
            type: "BUY_INSURANCE"
          })}>
                Buy insurance from {insurancePrice}/day
              </Button>}
            <Button asChild variant="outline" className="w-full">
              <Link to="/browse">Keep browsing gear</Link>
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => dispatch({
            type: "DECLINE_PROTECTION"
          })}>
              Decide later
            </Button>
            {listing.protection.depositDescription && <p className="text-xs text-muted-foreground">
                {listing.protection.depositDescription}
              </p>}
            {listing.protection.insuranceDescription && <p className="text-xs text-muted-foreground">
                {listing.protection.insuranceDescription}
              </p>}
          </div>;
      case "confirmed":
        return <div className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Booking confirmed!</p>
              <p className="mt-1">
                We'll send reminders as you approach your pickup window. You can manage the trip from this page anytime.
              </p>
            </div>
            <Button variant="action" className="w-full" onClick={() => dispatch({
            type: "ARRANGE_PICKUP"
          })}>
              Arrange pickup
            </Button>
            <Button variant="outline" className="w-full" onClick={() => dispatch({
            type: "CANCEL_BOOKING"
          })}>
              Cancel booking
            </Button>
          </div>;
      case "pickup":
        return <div className="space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              {listing.pickupNotes.map(note => <li key={note} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{note}</span>
                </li>)}
            </ul>
            <Button variant="action" className="w-full" onClick={() => dispatch({
            type: "ARRANGE_DROPOFF"
          })}>
              Pickup completed
            </Button>
            <Button variant="outline" className="w-full" onClick={() => dispatch({
            type: "CANCEL_BOOKING"
          })}>
              Cancel booking
            </Button>
          </div>;
      case "dropoff":
        return <div className="space-y-4 text-sm text-muted-foreground">
            <p>You're all set for the return. Confirm the dropoff time with the owner and bring the gear clean and dry.</p>
            <Button variant="action" className="w-full" onClick={() => dispatch({
            type: "UPLOAD_EVIDENCE"
          })}>
              Upload return photos
            </Button>
          </div>;
      case "evidence":
        return <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              Thanks for uploading the condition report. If everything looks good, you can finalize the return or open a claim
              if something isn't right.
            </p>
            <div className="grid gap-3">
              <Button variant="action" className="w-full" onClick={() => dispatch({
              type: "RETURN_DEPOSIT"
            })}>
                {bookingState.protectionChoice === "deposit" ? "Release deposit" : "Mark return complete"}
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => dispatch({
              type: "OPEN_CLAIM"
            })}>
                Open a claim
              </Button>
            </div>
          </div>;
      case "resolution":
        return <div className="space-y-4 text-sm text-muted-foreground">
            <p>Your claim is under review. Update the outcome below when support or the insurer responds.</p>
            <div className="grid gap-3">
              <Button variant="action" className="w-full" onClick={() => dispatch({
              type: "RESOLVE_CLAIM",
              outcome: "approved"
            })}>
                Mark claim approved
              </Button>
              <Button variant="outline" className="w-full" onClick={() => dispatch({
              type: "RESOLVE_CLAIM",
              outcome: "rejected"
            })}>
                Mark claim rejected
              </Button>
            </div>
          </div>;
      case "review":
        return <div className="space-y-4 text-sm text-muted-foreground">
            <p>Tell the community how the gear and owner performed. Reviews keep the marketplace trustworthy.</p>
            <Button variant="action" className="w-full" onClick={() => dispatch({
            type: "WRITE_REVIEW"
          })}>
              Write review
            </Button>
          </div>;
      case "completed":
        return <div className="space-y-4 text-sm text-muted-foreground">
            <p>Thanks for closing the loop! Ready for another outing?</p>
            <Button asChild variant="action" className="w-full">
              <Link to="/browse">Browse more gear</Link>
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => dispatch({
            type: "RESET",
            title: listing.title
          })}>
              Plan another trip with this gear
            </Button>
          </div>;
      case "cancelled":
        return <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              The booking was cancelled. Your refund is on the way. Browse the catalog whenever you're ready to try again.
            </p>
            <Button asChild variant="action" className="w-full">
              <Link to="/browse">Find different gear</Link>
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => dispatch({
            type: "RESET",
            title: listing.title
          })}>
              Start over with this listing
            </Button>
          </div>;
      default:
        return null;
    }
  };
  return <div className="min-h-screen bg-background">
      <Header />
      <main className="py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link to="/browse" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to browse
              </Link>
            </Button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <div className="overflow-hidden rounded-2xl border border-border shadow-soft">
                <img src={listing.image} alt={listing.title} className="h-full w-full object-cover" />
              </div>

              <Card>
                <CardHeader className="space-y-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-3xl text-foreground">{listing.title}</CardTitle>
                      <CardDescription>{listing.description}</CardDescription>
                    </div>
                    <div className="rounded-xl bg-muted/40 px-4 py-3 text-right">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">From</p>
                      <p className="text-3xl font-semibold text-foreground">
                        {formatCurrency(listing.price)}
                        <span className="ml-1 text-base font-normal text-muted-foreground">/day</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {listing.location}
                    </span>
                    <span className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-action text-action" />
                      {listing.rating} ({listing.reviewCount} reviews)
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Host responds {listing.owner.responseTime}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Highlights</h3>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {listing.highlights.map(item => <li key={item} className="flex gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                          <span>{item}</span>
                        </li>)}
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">What's included</h3>
                    <ul className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                      {listing.gearIncludes.map(item => <li key={item} className="flex gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                          <span>{item}</span>
                        </li>)}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Protection & policies</CardTitle>
                  <CardDescription>Understand deposits, insurance, and cancellation rules before you confirm.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
                    <ShieldCheck className="mt-1 h-5 w-5 text-primary" />
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-foreground">Deposit & insurance</p>
                      <p className="text-muted-foreground">
                        {requiresProtection ? "This trip requires a refundable deposit or active insurance before pickup." : "Deposits are optional—book instantly or add coverage for extra peace of mind."}
                      </p>
                      <ul className="text-muted-foreground">
                        {depositAmount && <li>Deposit: {depositAmount} — {listing.protection.depositDescription}</li>}
                        {insurancePrice && <li>Insurance: {insurancePrice}/day — {listing.protection.insuranceDescription}</li>}
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
                    <FileText className="mt-1 h-5 w-5 text-primary" />
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-foreground">Cancellation policy</p>
                      <p className="text-muted-foreground">{listing.cancellationPolicy.headline}</p>
                      <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                        {listing.cancellationPolicy.details.map(detail => <li key={detail}>{detail}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
                    <Wallet className="mt-1 h-5 w-5 text-primary" />
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-foreground">Pickup notes</p>
                      <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                        {listing.pickupNotes.map(note => <li key={note}>{note}</li>)}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

            {/* Show different content based on booking stage */}
              {bookingState.stage === "details" ?
            // Simple "How it works" for browsing users
            <Card>
                  <CardHeader>
                    <CardTitle>How renting works</CardTitle>
                    <CardDescription>
                      Three simple steps to your next outdoor adventure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                          1
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Book your adventure</p>
                          <p className="text-sm text-muted-foreground">
                            Choose your dates, add protection if needed, and confirm your trip
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                          2
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Pick up & explore</p>
                          <p className="text-sm text-muted-foreground">
                            Meet your host, get the gear, and head out on your adventure
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                          3
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Return & review</p>
                          <p className="text-sm text-muted-foreground">
                            Bring the gear back clean, take a quick photo, and share your experience
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 rounded-xl bg-primary/5 border border-primary/20 p-4">
                        <div className="flex items-start gap-3">
                          <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-foreground">You're protected</p>
                            <p className="text-muted-foreground">
                              Every rental includes community trust, host verification, and optional protection coverage
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card> :
            // Progressive journey tracking for active bookings
            <Card>
                  <CardHeader>
                    <CardTitle>Your trip progress</CardTitle>
                    <CardDescription>
                      {bookingState.stage === "cancelled" ? "Your booking was cancelled - here's what happened" : "Track your adventure from booking to return"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {steps.filter(step => {
                    // Show only relevant steps based on current stage
                    if (bookingState.stage === "cancelled") {
                      return ["details", "protection", "confirmation", "browse"].includes(step.id);
                    }
                    if (bookingState.stage === "completed") {
                      return true; // Show all steps when completed
                    }

                    // For active bookings, show current step + 1-2 upcoming steps
                    const currentRank = stepRank[step.id];
                    const stageStepRank = stepRank[bookingState.stage as keyof typeof stepRank] || 0;
                    return currentRank <= stageStepRank + 2;
                  }).map(step => <li key={step.id} className="rounded-xl border border-border p-4">
                          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                            <div>
                              <p className="font-semibold text-foreground">{step.title}</p>
                              <p className="text-sm text-muted-foreground">{step.description}</p>
                            </div>
                            <Badge variant={step.status === "complete" ? "secondary" : step.status === "current" ? "default" : step.status === "cancelled" ? "destructive" : "outline"} className="self-start">
                              {step.status === "complete" ? "Done" : step.status === "current" ? "Current" : step.status === "cancelled" ? "Cancelled" : "Upcoming"}
                            </Badge>
                          </div>
                        </li>)}
                    </ul>
                  </CardContent>
                </Card>}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {bookingState.stage === "details" ? "Ready to book?" : "Next steps"}
                  </CardTitle>
                  <CardDescription>
                    {bookingState.stage === "details" ? "Start your adventure with this gear" : "Keep your trip moving forward"}
                  </CardDescription>
                </CardHeader>
                <CardContent>{renderActionCard()}</CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Meet the owner</CardTitle>
                  <CardDescription>Verified host with quick response times.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs">
                      {listing.owner.rating.toFixed(2)} ★
                    </Badge>
                    <span>{listing.owner.tripsHosted} trips hosted</span>
                  </div>
                  <p className="text-foreground font-medium">{listing.owner.name}</p>
                  
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity log</CardTitle>
                  <CardDescription>Every action in the renter flow is tracked here.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    {bookingState.history.map((entry, index) => <li key={`${entry}-${index}`} className="flex gap-2">
                        <RefreshCcw className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{entry}</span>
                      </li>)}
                  </ol>
                </CardContent>
              </Card>

              {bookingState.stage === "cancelled" && <Card className="border-destructive/40 bg-destructive/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" /> Trip cancelled
                    </CardTitle>
                    <CardDescription className="text-destructive">
                      A refund has been queued. You can start a new booking anytime from this page.
                    </CardDescription>
                  </CardHeader>
                </Card>}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>;
};
export default ListingDetails;