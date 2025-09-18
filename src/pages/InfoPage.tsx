import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotFound from "./NotFound";
import { useParams } from "react-router-dom";

type InfoSection = {
  heading: string;
  body: string[];
  bullets?: string[];
};

type InfoPageContent = {
  title: string;
  intro: string;
  lastUpdated?: string;
  sections?: InfoSection[];
};

const infoContent: Record<string, InfoPageContent> = {
  about: {
    title: "About CiKr",
    intro:
      "CiKr connects renters with trusted owners and partners so outdoor experiences are as easy to book as a city stay. Our marketplace is designed around transparent pricing, responsible stewardship, and Canadian-ready compliance from day one.",
    sections: [
      {
        heading: "What we believe",
        body: [
          "We help people explore more while owning less. Listings, insurance, payments, and support are coordinated across the platform so every booking feels confident and fair for renters and owners alike.",
        ],
      },
      {
        heading: "How we operate",
        body: [
          "Our product spans modern web, mobile, and admin experiences backed by clearly scoped services—Identity, Listings, Search & Pricing, Booking, Payments & Payouts, Insurance, Messaging, Reviews, Admin/Ops, and Analytics. Each service enforces the right privacy and tax rules for Canada, including GST/PST handling and BC age-of-majority checks.",
        ],
      },
    ],
  },
  safety: {
    title: "Safety at CiKr",
    intro:
      "Every trip runs on layered trust controls spanning verification, insurance, messaging safeguards, and immutable audit logs.",
    sections: [
      {
        heading: "What renters and owners can expect",
        body: [
          "We verify users through OIDC with MFA options, age-of-majority checks, and KYC for payout eligibility. Bookings run through a refund policy engine with deposit pre-authorizations coordinated through Payments & Payouts.",
          "An Insurance Gateway coordinates quotes, bindings, and claim evidence using signed URLs. Messaging threads and reviews feed light moderation signals routed to Admin/Ops for quick follow-up.",
        ],
      },
      {
        heading: "Compliance",
        body: [
          "We align with PIPEDA and BC PIPA, isolate personal information in a dedicated PII datastore, and maintain an append-only audit log for sensitive actions.",
        ],
      },
    ],
  },
  insurance: {
    title: "Insurance Overview",
    intro:
      "We coordinate per-booking coverage so that approved trips include transparent protection and a clear claim path.",
    sections: [
      {
        heading: "Quotes & binding",
        body: [
          "Insurance quotes surface alongside booking confirmations. Once confirmed, policies are bound through our Insurance Gateway using signed webhooks to keep status synchronized.",
        ],
      },
      {
        heading: "Claims",
        body: [
          "Claim intake supports structured evidence uploads to object storage with short-lived signed URLs. Status updates flow back through the gateway and notify the renter, owner, and Admin/Ops teams.",
        ],
      },
    ],
  },
  careers: {
    title: "Careers",
    intro:
      "We are assembling a team passionate about outdoor access, reliability, and equitable marketplaces.",
    sections: [
      {
        heading: "What we value",
        body: [
          "Customer trust, clear ownership of services, privacy-first design, and resilience in every flow from booking to payout.",
        ],
        bullets: [
          "Product & Design focused on renter and owner journeys",
          "Full-stack engineers with marketplace or payments experience",
          "Ops & Compliance leaders who understand Canadian regulations",
        ],
      },
      {
        heading: "How to connect",
        body: [
          "Email our team at careers@cikr.ca with a short note about the problems you love solving and the outdoor adventures that inspire you.",
        ],
      },
    ],
  },
  "help-center": {
    title: "Help Center",
    intro:
      "Need assistance? We publish how-to guides, policy explainers, and troubleshooting steps across the renter and owner lifecycle.",
    sections: [
      {
        heading: "Popular topics",
        bullets: [
          "Managing your listings, calendars, and blackout dates",
          "Understanding security deposits, GST/PST, and payouts",
          "Preparing your gear for pickup and checking renter IDs",
          "Submitting insurance claims and providing evidence",
        ],
        body: [
          "Still stuck? Reach out at support@cikr.ca and our Ops team will respond within one business day.",
        ],
      },
    ],
  },
  "trust-and-safety": {
    title: "Trust & Safety",
    intro:
      "We monitor the marketplace to keep experiences respectful, insured, and compliant with regional law.",
    sections: [
      {
        heading: "Our approach",
        body: [
          "We run automated checks for suspicious behaviour, provide in-app reporting, and triage escalations through Admin/Ops. Messaging content adheres to retention limits and can be exported or erased per PIPEDA guidelines.",
        ],
      },
      {
        heading: "Report a concern",
        body: [
          "Email trust@cikr.ca or flag content directly in messaging threads. Critical incidents trigger break-glass workflows with full audit trails.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    intro:
      "By using CiKr you agree to these marketplace terms. We keep them concise so you understand your responsibilities before listing or booking gear.",
    lastUpdated: "Updated February 2025",
    sections: [
      {
        heading: "Key points",
        bullets: [
          "Renters must be at least 19 years old in BC and maintain valid payment methods for deposit holds.",
          "Owners and partners confirm they have rights to list gear and will keep listings accurate and safe.",
          "Fees, GST, and PST are disclosed before checkout; payment captures and refunds run through our Payments & Payouts service.",
          "Insurance claims must follow evidence and timelines shared during claim intake.",
        ],
        body: [
          "Breaking these terms may result in suspension or withheld payouts per our trust and compliance policies.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Notice",
    intro:
      "We collect only the personal information required to operate the marketplace responsibly and comply with Canadian law.",
    lastUpdated: "Updated February 2025",
    sections: [
      {
        heading: "Data handling",
        body: [
          "Identity and payment details live inside a dedicated PII boundary accessible only to the Identity and Payments services. Operational data for bookings, listings, and messaging is stored separately with encryption at rest.",
          "We retain data only as long as necessary for legal obligations, dispute resolution, and analytics that exclude direct PII.",
        ],
      },
      {
        heading: "Your choices",
        bullets: [
          "Request data access, updates, or deletion in line with PIPEDA and BC PIPA",
          "Opt out of marketing emails through the preferences center",
          "Reach our privacy team at privacy@cikr.ca",
        ],
        body: [],
      },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    intro:
      "Cookies help us personalize experiences, protect accounts, and understand product performance.",
    sections: [
      {
        heading: "Types of cookies we use",
        bullets: [
          "Essential cookies for authentication and security",
          "Preference cookies to remember search filters and locale",
          "Analytics cookies to measure feature adoption (aggregated and de-identified)",
        ],
        body: [
          "You can adjust preferences in your browser settings. Disabling essential cookies may limit functionality.",
        ],
      },
    ],
  },
};

const InfoPage = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const content = infoContent[slug];

  if (!content) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <header className="space-y-3 text-left">
            <p className="text-sm uppercase tracking-wide text-primary/80">CiKr</p>
            <h1 className="text-4xl font-bold text-foreground">{content.title}</h1>
            {content.lastUpdated ? (
              <p className="text-sm text-muted-foreground">{content.lastUpdated}</p>
            ) : null}
            <p className="text-lg text-muted-foreground">{content.intro}</p>
          </header>

          {content.sections?.map((section) => (
            <section key={section.heading} className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">{section.heading}</h2>
              {section.body.map((paragraph, index) => (
                <p key={index} className="text-muted-foreground leading-relaxed">
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InfoPage;
