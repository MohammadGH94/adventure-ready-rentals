import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useParams } from "react-router";

import Footer from "../components/Footer";
import Header from "../components/Header";
import colors from "../theme/colors";
import NotFound from "./NotFound";

type InfoSection = {
  heading: string;
  body?: string[];
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
    title: "About AdventureRent",
    intro:
      "AdventureRent connects renters with trusted owners and partners so outdoor experiences are as easy to book as a city stay. Our marketplace is designed around transparent pricing, responsible stewardship, and Canadian-ready compliance from day one.",
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
    title: "Safety at AdventureRent",
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
          "Email our team at careers@adventurerent.ca with a short note about the problems you love solving and the outdoor adventures that inspire you.",
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
          "Still stuck? Reach out at support@adventurerent.ca and our Ops team will respond within one business day.",
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
          "Email trust@adventurerent.ca or flag content directly in messaging threads. Critical incidents trigger break-glass workflows with full audit trails.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    intro:
      "By using AdventureRent you agree to these marketplace terms. We keep them concise so you understand your responsibilities before listing or booking gear.",
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
    title: "Privacy Policy",
    intro:
      "We take privacy seriously by isolating personal data, limiting retention, and providing full export and deletion workflows.",
    sections: [
      {
        heading: "Data handling",
        body: [
          "Identity and PII data are stored in dedicated services with column-level encryption. Operational data that references PII uses scoped identifiers only.",
        ],
      },
      {
        heading: "Your choices",
        bullets: [
          "Download your data via our privacy portal",
          "Request deletion of personal data subject to booking retention requirements",
          "Opt in to marketing communications separately from transaction notifications",
        ],
      },
    ],
  },
};

const InfoPage = () => {
  const { slug } = useParams();
  if (!slug) {
    return <NotFound />;
  }

  const page = infoContent[slug];

  if (!page) {
    return <NotFound />;
  }

  return (
    <View style={styles.wrapper}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.overline}>Knowledge base</Text>
          <Text style={styles.title}>{page.title}</Text>
          <Text style={styles.subtitle}>{page.intro}</Text>
          {page.lastUpdated && <Text style={styles.updated}>{page.lastUpdated}</Text>}
        </View>

        {page.sections?.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.heading}</Text>
            {section.body?.map((paragraph) => (
              <Text key={paragraph} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}
            {section.bullets && (
              <View style={styles.bulletList}>
                {section.bullets.map((bullet) => (
                  <Text key={bullet} style={styles.bulletItem}>
                    • {bullet}
                  </Text>
                ))}
              </View>
            )}
          </View>
        ))}

        <Footer />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 40,
    gap: 28,
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 12,
  },
  overline: {
    color: colors.accent,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontSize: 13,
    fontWeight: "700",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  updated: {
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: "italic",
  },
  section: {
    marginHorizontal: 24,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  paragraph: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bulletList: {
    gap: 6,
  },
  bulletItem: {
    color: colors.textMuted,
    fontSize: 13,
  },
});

export default InfoPage;
