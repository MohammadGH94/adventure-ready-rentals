import { useEffect, useReducer, useState, useMemo, useCallback, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { MapPin, Star, Clock, ShieldCheck, Wallet, FileText, RefreshCcw, CheckCircle2, AlertTriangle, MessageSquare, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { GearListing, ProtectionChoice } from "@/lib/gear";
import { useListing, DatabaseListing } from "@/hooks/useListing";
import { useAuth } from "@/hooks/useAuth";
import { TripDateTimeSelector } from "@/components/TripDateTimeSelector";
import { differenceInDays, startOfDay } from "date-fns";
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
  startTime: string;
  endTime: string;
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
  type: "SET_TIMES";
  startTime: string;
  endTime: string;
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
  endDate: undefined,
  startTime: "10:00",
  endTime: "10:00"
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
          history: action.startDate && action.endDate ? [...state.history, `Dates selected: ${action.startDate.toLocaleDateString()} - ${action.endDate.toLocaleDateString()}`] : state.history
        };
      }
    case "SET_TIMES":
      {
        return {
          ...state,
          startTime: action.startTime,
          endTime: action.endTime
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
  const photos = dbListing.photos?.map(getStorageImageUrl).filter(Boolean) || [];
  
  return {
    id: dbListing.id,
    title: dbListing.title,
    description: dbListing.description || "",
    image: photos[0] || "/placeholder.svg",
    photos: photos,
    price: Number(dbListing.price_per_day),
    rating: 4.5,
    // Default rating - in future could be calculated from reviews
    reviewCount: 0,
    // Default - in future could be calculated from reviews
    location: dbListing.pickup_addresses?.[0] || "Location TBD",
    category: dbListing.categories?.[0] || "general",
    protection: {
      requiresProtection: !!dbListing.deposit_amount || dbListing.insurance_required,
      depositAmount: dbListing.deposit_amount ? Number(dbListing.deposit_amount) : undefined,
      depositDescription: dbListing.deposit_amount ? "Refundable deposit held until return" : undefined,
      insuranceDailyPrice: dbListing.insurance_required ? 10 : undefined,
      // Default insurance price
      insuranceDescription: dbListing.insurance_required ? "Optional damage protection coverage" : undefined
    },
    cancellationPolicy: {
      headline: "Standard cancellation policy",
      details: ["Full refund up to 24h before pickup", "50% refund for cancellations within 24h", "After pickup, refunds subject to inspection"]
    },
    pickupNotes: dbListing.pickup_instructions ? [dbListing.pickup_instructions] : ["Pickup details will be provided upon booking"],
    highlights: ["Quality gear maintained to high standards", "Detailed inspection before each rental", "Owner support throughout your adventure"],
    gearIncludes: ["Complete gear package as described"],
    owner: {
      name: "Gear Owner",
      // In future, join with users table
      responseTime: "Usually responds quickly",
      tripsHosted: 1,
      rating: 4.8
    }
  };
};
const ListingDetails = () => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    user,
    loading: authLoading
  } = useAuth();
  const {
    data: dbListing,
    isLoading,
    error
  } = useListing(id ?? "");
  const {
    data: availabilityData,
    isLoading: availabilityLoading
  } = useAvailability(id ?? "");
  console.log("ListingDetails render:", {
    id,
    user: user?.id,
    authLoading,
    isLoading,
    error
  });
  const listing = useMemo(() => dbListing ? mapDatabaseToGearListing(dbListing) : null, [dbListing]);

  // Cache current date to avoid creating new objects on every render
  const today = useMemo(() => startOfDay(new Date()), []);

  // Memoize the disabled function to prevent flickering
  const isDateDisabled = useCallback((date: Date) => {
    const normalizedDate = startOfDay(date);
    // Always disable past dates
    if (normalizedDate < today) return true;

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
      const isAvailable = isDateAvailable(normalizedDate, availabilityData.unavailable_dates, availabilityData.block_out_times, availabilityData.existing_bookings);
      console.log("Date availability check:", {
        date: normalizedDate.toISOString().split('T')[0],
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

  // Calculate total days for rental
  const totalDays = useMemo(() => {
    if (!bookingState.startDate || !bookingState.endDate) return 0;
    const timeDiff = bookingState.endDate.getTime() - bookingState.startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }, [bookingState.startDate, bookingState.endDate]);

  // State for preventing multiple rapid clicks
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);
  const lastInitializedListingId = useRef<string | null>(null);
  useEffect(() => {
    if (!listing) return;
    if (lastInitializedListingId.current === listing.id) return;
    lastInitializedListingId.current = listing.id;
    dispatch({
      type: "RESET",
      title: listing.title
    });
  }, [listing]);

  // Handle stored booking data on component mount and auth changes
  useEffect(() => {
    console.log("Auth state changed:", {
      user: user?.id,
      authLoading
    });
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
              console.log("Restored booking dates:", {
                startDate,
                endDate
              });
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
    return <div className="min-h-screen bg-background">
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
      </div>;
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
    const insurance = bookingState.protectionChoice === "insurance" && listing.protection.insuranceDailyPrice ? days * listing.protection.insuranceDailyPrice : 0;
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
        dispatch({
          type: "REQUIRE_AUTH"
        });

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
    return <div className="min-h-screen bg-background">
        <Header />
        <main className="py-24">
          <div className="mx-auto max-w-xl px-4 text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>;
  }
  const renderActionCard = () => {
    switch (bookingState.stage) {
      case "details":
        return <div className="space-y-4">
            <div className="space-y-3">
              
              <TripDateTimeSelector 
                startDate={bookingState.startDate} 
                endDate={bookingState.endDate}
                startTime={bookingState.startTime}
                endTime={bookingState.endTime}
                onStartDateSelect={date => dispatch({
                  type: "SET_DATES",
                  startDate: date,
                  endDate: bookingState.endDate
                })} 
                onEndDateSelect={date => dispatch({
                  type: "SET_DATES",
                  startDate: bookingState.startDate,
                  endDate: date
                })}
                onStartTimeSelect={time => dispatch({
                  type: "SET_TIMES",
                  startTime: time,
                  endTime: bookingState.endTime
                })}
                onEndTimeSelect={time => dispatch({
                  type: "SET_TIMES",
                  startTime: bookingState.startTime,
                  endTime: time
                })}
                disabled={isDateDisabled} 
              />
            </div>
            
            {quote && <Card className="border-primary/20 bg-primary/5">
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
                  {quote.insurance > 0 && <div className="flex justify-between">
                      <span>Insurance</span>
                      <span>{formatCurrency(quote.insurance)}</span>
                    </div>}
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatCurrency(quote.total)}</span>
                  </div>
                  {quote.deposit > 0 && <div className="text-xs text-muted-foreground">
                      Plus {formatCurrency(quote.deposit)} refundable deposit
                    </div>}
                </CardContent>
              </Card>}
            
            <p className="text-sm text-muted-foreground">
              {!user ? "Get an instant quote above, then sign in to book." : requiresProtection ? "A refundable deposit or insurance is required before pickup." : listing.protection.insuranceDailyPrice ? "Insurance is optional for this listing—book instantly when you're ready." : "Book instantly with no additional protection requirements."}
            </p>
            
            <Button variant="action" className="w-full" onClick={handleBookingStart} disabled={!bookingState.startDate || !bookingState.endDate || isProcessingBooking || authLoading}>
              {isProcessingBooking ? <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {!user ? "Redirecting to sign in..." : "Starting booking..."}
                </div> : !user ? "Sign In to Book" : "Rent Now"}
            </Button>
            
            {!user && <Button asChild variant="outline" className="w-full">
                <Link to="/signin">Sign in to save trip details</Link>
              </Button>}
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
      <main className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header with back button */}
          <div className="mb-6">
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link to="/browse" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to browse
              </Link>
            </Button>
          </div>

          {/* Main content grid */}
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* Left column - Images and details */}
            <div className="space-y-6">
              {/* Image gallery */}
              <div className="grid gap-2 lg:grid-cols-[2fr_1fr]">
                <div className="overflow-hidden rounded-2xl">
                  <img src={listing.photos?.[0] || listing.image} alt={listing.title} className="h-[400px] w-full object-cover" />
                </div>
                <div className="hidden lg:block space-y-2">
                  <div className="overflow-hidden rounded-2xl">
                      <img src={listing.photos?.[1] || listing.image} alt={listing.title} className="h-[196px] w-full object-cover" />
                  </div>
                  <div className="relative overflow-hidden rounded-2xl">
                    <img src={listing.photos?.[2] || listing.photos?.[1] || listing.image} alt={listing.title} className="h-[196px] w-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="secondary" size="sm" className="gap-2">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {listing.photos && listing.photos.length > 3 ? `+${listing.photos.length - 3} more` : 'View photos'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                          <div className="relative">
                            <div className="flex items-center justify-between p-4 border-b">
                              <h2 className="text-lg font-semibold">{listing.title} Photos</h2>
                              {listing.photos && (
                                <span className="text-sm text-muted-foreground">
                                  {selectedPhotoIndex + 1} of {listing.photos.length}
                                </span>
                              )}
                            </div>
                            <div className="relative">
                              <img 
                                src={listing.photos?.[selectedPhotoIndex] || listing.image} 
                                alt={`${listing.title} - Photo ${selectedPhotoIndex + 1}`}
                                className="w-full h-[60vh] object-cover"
                              />
                              {listing.photos && listing.photos.length > 1 && (
                                <>
                                  <button
                                    onClick={() => setSelectedPhotoIndex(prev => prev > 0 ? prev - 1 : listing.photos!.length - 1)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                                  >
                                    <ArrowLeft className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => setSelectedPhotoIndex(prev => prev < listing.photos!.length - 1 ? prev + 1 : 0)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                                  >
                                    <ArrowLeft className="h-5 w-5 rotate-180" />
                                  </button>
                                </>
                              )}
                            </div>
                            {listing.photos && listing.photos.length > 1 && (
                              <div className="p-4 border-t">
                                <div className="flex gap-2 overflow-x-auto">
                                  {listing.photos.map((photo, index) => (
                                    <button
                                      key={index}
                                      onClick={() => setSelectedPhotoIndex(index)}
                                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                                        selectedPhotoIndex === index ? 'border-primary' : 'border-transparent'
                                      }`}
                                    >
                                      <img 
                                        src={photo} 
                                        alt={`${listing.title} thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title and basic info */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{listing.title}</h1>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{listing.rating}</span>
                      <span>({listing.reviewCount} trips)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{listing.location}</span>
                    </div>
                  </div>
                </div>

                {/* Quick specs */}
                <div className="flex gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                      <Clock className="h-3 w-3" />
                    </div>
                    <span>Daily rental</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3" />
                    </div>
                    <span>Available</span>
                  </div>
                </div>
              </div>

              {/* Hosted by */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Hosted by</h3>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-lg font-semibold">{listing.owner.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{listing.owner.rating.toFixed(1)}</span>
                      </div>
                      <p className="font-medium">{listing.owner.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {listing.owner.tripsHosted} trips • Joined {new Date().getFullYear() - 1}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Gear features</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Highlights</h4>
                      <ul className="space-y-2">
                        {listing.highlights.map(item => <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">What's included</h4>
                      <ul className="space-y-2">
                        {listing.gearIncludes.map(item => <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>)}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Included in the price */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Included in the price</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Convenience
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>Skip the rental counter</li>
                        <li>Use the app for pickup and return instructions</li>
                        <li>30-minute return grace period</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                        Peace of mind
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>No need to wash before returning</li>
                        <li>Access to basic roadside assistance</li>
                        <li>24/7 customer support</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column - Booking card */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  {/* Pricing */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{formatCurrency(listing.price)}</span>
                      <span className="text-muted-foreground">total</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Before taxes</p>
                  </div>

                  {/* Your trip section */}
                  <div className="space-y-4 mb-6">
                    <h3 className="font-semibold">Your trip</h3>
                    
                    {/* Trip dates */}
                    <div className="space-y-3">
                      <div>
                        
                        
                      </div>
                    </div>

                    {/* Pickup & return location */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Pickup & return location</label>
                      <div className="mt-1 p-3 border rounded-lg bg-muted/20">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{listing.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Trip Savings */}
                    {totalDays >= 3 && <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <h4 className="font-medium text-green-800">Trip Savings</h4>
                        <div className="flex justify-between text-sm text-green-700">
                          <span>3-day discount</span>
                          <span>$15</span>
                        </div>
                      </div>}
                  </div>

                  {/* Booking actions */}
                  <div className="space-y-3">
                    {renderActionCard()}
                  </div>

                  {/* Quote breakdown */}
                  {quote && <div className="mt-6 pt-4 border-t space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{formatCurrency(listing.price)} × {totalDays} days</span>
                        <span>{formatCurrency(quote.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Service fee</span>
                        <span>{formatCurrency(quote.serviceFee)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Taxes</span>
                        <span>{formatCurrency(quote.taxes)}</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-2 border-t">
                        <span>Total</span>
                        <span>{formatCurrency(quote.total)}</span>
                      </div>
                    </div>}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>;
};
export default ListingDetails;