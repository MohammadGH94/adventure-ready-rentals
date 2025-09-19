import climbingGear from "@/assets/climbing-gear.jpg";
import campingGear from "@/assets/camping-gear.jpg";
import waterSportsGear from "@/assets/water-sports-gear.jpg";
import winterSportsGear from "@/assets/winter-sports-gear.jpg";

export type ProtectionChoice = "deposit" | "insurance" | null;

export interface GearListing {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  rating: number;
  reviewCount: number;
  location: string;
  category: string;
  protection: {
    requiresProtection: boolean;
    depositAmount?: number;
    depositDescription?: string;
    insuranceDailyPrice?: number;
    insuranceDescription?: string;
  };
  cancellationPolicy: {
    headline: string;
    details: string[];
  };
  pickupNotes: string[];
  highlights: string[];
  gearIncludes: string[];
  owner: {
    name: string;
    responseTime: string;
    tripsHosted: number;
    rating: number;
  };
}

export const gearListings: GearListing[] = [
  {
    id: "pro-climbing-rope-set",
    title: "Professional Climbing Rope Set",
    description:
      "Complete dynamic climbing rope with carabiners, belay device, helmet, and chalk bag included for multi-pitch adventures.",
    image: climbingGear,
    price: 45,
    rating: 4.9,
    reviewCount: 127,
    location: "Boulder, CO",
    category: "climbing",
    protection: {
      requiresProtection: true,
      depositAmount: 150,
      depositDescription: "Refundable hold released within 24h of dropoff after inspection.",
      insuranceDailyPrice: 12,
      insuranceDescription: "Covers accidental damage up to $2,000 with $0 deductible.",
    },
    cancellationPolicy: {
      headline: "Free cancellation up to 48h before pickup",
      details: [
        "Full refund for cancellations made 48h before the pickup window.",
        "50% refund if you cancel within 48h of pickup.",
        "After pickup, refunds are only issued when a claim is approved.",
      ],
    },
    pickupNotes: [
      "Pickup at Movement Climbing Gym lobby—government ID required.",
      "Camille will review wear points and knot safety before handoff.",
    ],
    highlights: [
      "UIAA-certified 9.8mm dynamic rope with triple sheath treatment.",
      "Includes 6 locking carabiners, ATC belay device, and adjustable helmet.",
      "Sanitized and inspected between rentals with documented wear tracking.",
    ],
    gearIncludes: [
      "60m dynamic rope",
      "Belay device + 6 locking carabiners",
      "Adjustable helmet",
      "Chalk bag with refill",
    ],
    owner: {
      name: "Camille A.",
      responseTime: "Under 1 hour",
      tripsHosted: 212,
      rating: 4.95,
    },
  },
  {
    id: "family-camping-kit",
    title: "4-Person Family Camping Kit",
    description:
      "All-in-one camping setup: spacious tent, sleeping systems, camp kitchen, and lighting for family getaways.",
    image: campingGear,
    price: 85,
    rating: 4.8,
    reviewCount: 89,
    location: "Portland, OR",
    category: "camping",
    protection: {
      requiresProtection: false,
      depositAmount: 100,
      depositDescription: "Optional deposit covers missing cookware or lantern glass.",
      insuranceDailyPrice: 8,
      insuranceDescription: "Optional trail protection covers accidental damage to the tent or stove.",
    },
    cancellationPolicy: {
      headline: "Flexible weekend cancellation",
      details: [
        "Full refund up to 24h before pickup.",
        "75% refund if cancelled on the day of pickup before noon.",
        "After pickup, refunds require an approved claim or owner agreement.",
      ],
    },
    pickupNotes: [
      "Pickup in inner Southeast Portland—driveway handoff with loading help.",
      "Bring vehicle space for two large storage totes.",
    ],
    highlights: [
      "Weatherproof tent with blackout bedrooms and fast setup poles.",
      "4 insulated sleeping pads, temperature-rated bags, and kid-sized camp chairs.",
      "Camp kitchen tub with stove, cookware, utensils, and rechargeable lanterns.",
    ],
    gearIncludes: [
      "4-person tent with rainfly",
      "4 sleeping bags + insulated pads",
      "Camp stove & cookware kit",
      "Lighting + power bank",
    ],
    owner: {
      name: "Jamie L.",
      responseTime: "About 2 hours",
      tripsHosted: 163,
      rating: 4.87,
    },
  },
  {
    id: "inflatable-kayak",
    title: "Inflatable Kayak with Paddle",
    description:
      "Stable 2-person inflatable kayak perfect for alpine lakes and calm rivers with pump and safety gear included.",
    image: waterSportsGear,
    price: 65,
    rating: 4.7,
    reviewCount: 156,
    location: "Lake Tahoe, CA",
    category: "water-sports",
    protection: {
      requiresProtection: true,
      depositAmount: 200,
      depositDescription: "Deposit covers punctures or missing paddles—released after inspection.",
      insuranceDailyPrice: 15,
      insuranceDescription: "On-water protection covers accidental damage and lost pump/vests.",
    },
    cancellationPolicy: {
      headline: "Weather-friendly policy",
      details: [
        "Full refund for cancellations 24h before pickup or unsafe weather warnings.",
        "60% refund for day-of cancellations (weather not included).",
        "Post-pickup cancellations require returning within 2h and inspection.",
      ],
    },
    pickupNotes: [
      "Pickup near Tahoe City public dock—owner provides loading straps.",
      "Check local water advisories; owner will review launch best practices.",
    ],
    highlights: [
      "High-pressure drop-stitch floor for rigid feel and responsive paddling.",
      "Includes two adjustable paddles, hand pump, and 2 PFDs (S-XL).",
      "Rapid-dry carrying bag fits in most sedans or SUVs.",
    ],
    gearIncludes: [
      "2-person inflatable kayak",
      "2 adjustable paddles",
      "Dual-action pump + pressure gauge",
      "2 PFDs + repair kit",
    ],
    owner: {
      name: "Ryan T.",
      responseTime: "Within 30 minutes",
      tripsHosted: 198,
      rating: 4.93,
    },
  },
  {
    id: "premium-ski-set",
    title: "Premium Ski Equipment Set",
    description:
      "Advanced skis, precision boots, and tuned bindings for high-performance resort days or big mountain conditions.",
    image: winterSportsGear,
    price: 120,
    rating: 4.9,
    reviewCount: 94,
    location: "Aspen, CO",
    category: "winter-sports",
    protection: {
      requiresProtection: true,
      depositAmount: 300,
      depositDescription: "Deposit ensures coverage for edge damage or base repairs.",
      insuranceDailyPrice: 18,
      insuranceDescription: "Optional damage waiver covers base grinds and binding re-calibration.",
    },
    cancellationPolicy: {
      headline: "Snow guarantee",
      details: [
        "Full refund up to 72h before pickup.",
        "80% refund if resort closes lifts or storms prevent travel.",
        "After pickup, refunds require approved claim or verified lift closure.",
      ],
    },
    pickupNotes: [
      "Pickup at Aspen Highlands base village locker room.",
      "Bring socks for boot fitting—owner will heat mold liners if needed.",
    ],
    highlights: [
      "Freshly tuned skis with premium wax for Rocky Mountain conditions.",
      "Performance boots sized 26-28 with heat-molded liners included.",
      "Avalanche safety briefing and local terrain tips included.",
    ],
    gearIncludes: [
      "All-mountain skis + tuned bindings",
      "Performance boots (sizes 26-28)",
      "Adjustable carbon poles",
      "Helmet + transceiver on request",
    ],
    owner: {
      name: "Noah G.",
      responseTime: "Under 45 minutes",
      tripsHosted: 144,
      rating: 4.98,
    },
  },
  {
    id: "climbing-starter-kit",
    title: "Rock Climbing Starter Kit",
    description:
      "Beginner-friendly harness, shoes, helmet, and chalk—everything needed for a guided outdoor session or gym intro.",
    image: climbingGear,
    price: 35,
    rating: 4.6,
    reviewCount: 203,
    location: "Joshua Tree, CA",
    category: "climbing",
    protection: {
      requiresProtection: false,
      depositAmount: 75,
      depositDescription: "Optional deposit for shoe resole or lost chalk bag.",
      insuranceDailyPrice: 5,
      insuranceDescription: "Optional coverage for harness wear or buckle replacement.",
    },
    cancellationPolicy: {
      headline: "Flexible learning policy",
      details: [
        "Full refund up to 12h before pickup.",
        "50% refund for same-day cancellations.",
        "Rescheduling is free if arranged 4h before the time slot.",
      ],
    },
    pickupNotes: [
      "Meet at Joshua Tree Visitor Center—owner provides quick fit check.",
      "Option to add on beginner belay lesson during pickup.",
    ],
    highlights: [
      "Harness with dual auto-locking buckles for fast adjustment.",
      "Neutral climbing shoes in sizes 36-45 (EU) cleaned after each rental.",
      "Includes chalk bag, chalk refill, and instructional safety card.",
    ],
    gearIncludes: [
      "Beginner harness",
      "Climbing shoes (range of sizes)",
      "Helmet",
      "Chalk bag + chalk",
    ],
    owner: {
      name: "Jess M.",
      responseTime: "About 3 hours",
      tripsHosted: 98,
      rating: 4.74,
    },
  },
  {
    id: "backpacking-essentials",
    title: "Backpacking Essentials",
    description:
      "Lightweight multi-day backpacking kit with premium tent, sleep system, bear hang kit, and water filtration.",
    image: campingGear,
    price: 95,
    rating: 4.8,
    reviewCount: 167,
    location: "Yosemite, CA",
    category: "camping",
    protection: {
      requiresProtection: true,
      depositAmount: 180,
      depositDescription: "Deposit covers tent pole repairs or stove replacement.",
      insuranceDailyPrice: 14,
      insuranceDescription: "Trail protection covers accidental tears or lost filter cartridges.",
    },
    cancellationPolicy: {
      headline: "Trailhead friendly",
      details: [
        "Full refund up to 48h before pickup.",
        "50% refund inside 48h. Free reschedule if a wildfire warning is issued.",
        "After pickup, refunds depend on timely return and inspection.",
      ],
    },
    pickupNotes: [
      "Pickup near Yosemite West gate—trailhead drop-off available for a fee.",
      "Owner shares latest trail conditions and bear-canister checklist.",
    ],
    highlights: [
      "Sub-3lb tent and quilt system tuned for Sierra weather.",
      "Bear hang kit, food storage, and water filtration ready to go.",
      "Detailed packing list and meal planner provided digitally.",
    ],
    gearIncludes: [
      "Ultralight tent + footprint",
      "Quilt + insulated pad",
      "Bear hang kit + canister",
      "Water filter + cook set",
    ],
    owner: {
      name: "Eli K.",
      responseTime: "Under 90 minutes",
      tripsHosted: 188,
      rating: 4.91,
    },
  },
  {
    id: "surfboard-wetsuit-combo",
    title: "Surfboard & Wetsuit Combo",
    description:
      "Daily surf bundle with 7'6\" funboard, 4/3 wetsuit, leash, and roof straps—perfect for Santa Cruz breaks.",
    image: waterSportsGear,
    price: 55,
    rating: 4.7,
    reviewCount: 89,
    location: "Santa Cruz, CA",
    category: "water-sports",
    protection: {
      requiresProtection: false,
      depositAmount: 120,
      depositDescription: "Optional ding repair deposit for board and fins.",
      insuranceDailyPrice: 10,
      insuranceDescription: "Optional saltwater coverage for fin box or leash plug repairs.",
    },
    cancellationPolicy: {
      headline: "Swell-flex cancellation",
      details: [
        "Full refund up to 12h before pickup.",
        "Storm/wind advisories allow free same-day cancellation.",
        "After pickup, refunds require claim approval or owner inspection.",
      ],
    },
    pickupNotes: [
      "Pickup at Pleasure Point—roof straps and soft racks provided.",
      "Owner shares surf forecast tips and waxes board before each rental.",
    ],
    highlights: [
      "Epoxy funboard stable enough for progressing surfers.",
      "Warm 4/3 wetsuit with taped seams and fresh sanitization.",
      "Includes soft racks and tie-down straps for quick transport.",
    ],
    gearIncludes: [
      "7'6\" epoxy funboard",
      "4/3 wetsuit (sizes S-XL)",
      "Leash + fins installed",
      "Soft racks + straps",
    ],
    owner: {
      name: "Maya P.",
      responseTime: "Within 2 hours",
      tripsHosted: 121,
      rating: 4.82,
    },
  },
  {
    id: "snowboard-complete-package",
    title: "Snowboard Complete Package",
    description:
      "All-mountain snowboard, boots, bindings, helmet, and protective gear for confident resort riding.",
    image: winterSportsGear,
    price: 75,
    rating: 4.8,
    reviewCount: 112,
    location: "Whistler, BC",
    category: "winter-sports",
    protection: {
      requiresProtection: true,
      depositAmount: 250,
      depositDescription: "Deposit covers edge tuning and binding hardware replacement.",
      insuranceDailyPrice: 16,
      insuranceDescription: "Optional damage waiver covers board repairs and lost helmet.",
    },
    cancellationPolicy: {
      headline: "Powder promise",
      details: [
        "Full refund up to 48h before pickup.",
        "70% refund inside 48h if lifts are open.",
        "Storm closures or illness with doctor's note allow full credit.",
      ],
    },
    pickupNotes: [
      "Pickup at Creekside Village locker bay—contactless option available.",
      "Owner tunes board and sanitizes helmet between rentals.",
    ],
    highlights: [
      "Directional twin board waxed for coastal snow conditions.",
      "Boa boots sized 7-12 with quick micro-adjustments.",
      "Includes impact shorts and wrist guards for added protection.",
    ],
    gearIncludes: [
      "Snowboard + bindings",
      "Boa boots (sizes 7-12)",
      "Helmet + impact protection",
      "Board lock + stomp pad",
    ],
    owner: {
      name: "Sasha W.",
      responseTime: "Under 1 hour",
      tripsHosted: 176,
      rating: 4.89,
    },
  },
];

export const getGearById = (id: string) => gearListings.find((gear) => gear.id === id);
