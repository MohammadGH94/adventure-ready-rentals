import { ScrollView, StyleSheet, Text, View } from "react-native";

import Footer from "../components/Footer";
import Header from "../components/Header";
import colors from "../theme/colors";

type Service = {
  name: string;
  summary: string;
  responsibilities: string[];
  apis: string[];
};

type Sequence = {
  title: string;
  description: string;
  steps: string[];
};

type Concern = {
  title: string;
  items: string[];
};

const services: Service[] = [
  {
    name: "Booking Service",
    summary:
      "Coordinates availability holds, captures deposits, and governs the lifecycle from request to completion.",
    responsibilities: [
      "Validates renter eligibility and policy windows before confirming a trip.",
      "Publishes Booking.Created/Updated/Cancelled events for downstream services.",
      "Manages refunds and release of insurance and deposit holds when plans change.",
    ],
    apis: ["POST /bookings", "POST /bookings/{id}/cancel", "POST /bookings/{id}/mark-completed"],
  },
  {
    name: "Payments & Payouts",
    summary:
      "Handles deposit pre-authorizations, split payouts, tax boundaries, and KYC workflows for owners.",
    responsibilities: [
      "Stores processor tokens and reconciliation metadata without persisting raw PAN data.",
      "Coordinates deposit capture/release, refunds, and payout schedules with full auditability.",
      "Surfaces compliance holds and KYC states in renter and owner dashboards.",
    ],
    apis: ["POST /payments/intents", "POST /payments/refunds", "POST /payouts/initiate"],
  },
  {
    name: "Listings & Search",
    summary:
      "Maintains owner listings, pricing, media assets, and search indices for responsive discovery.",
    responsibilities: [
      "Versioned pricing and availability calendars optimized for geographic filters.",
      "Image processing pipelines deliver responsive hero and thumbnail assets across platforms.",
      "Feeds analytics, booking, and messaging services with normalized listing metadata.",
    ],
    apis: ["POST /listings", "PATCH /listings/{id}", "GET /search?location=..."],
  },
  {
    name: "Messaging & Reviews",
    summary:
      "Creates trusted connections before and after trips with moderated messaging and structured reviews.",
    responsibilities: [
      "Threads renter-owner conversations with retention policies and reporting flows.",
      "Collects post-trip reviews and sentiment scores consumed by discovery ranking.",
      "Escalates flagged content to Admin/Ops with append-only audit records.",
    ],
    apis: ["POST /messages", "POST /reports", "POST /reviews"],
  },
];

const sequences: Sequence[] = [
  {
    title: "Create booking",
    description:
      "Demonstrates the orchestration between Listings, Booking, Payments, Insurance, and Messaging services.",
    steps: [
      "Renter selects dates and submits a booking request via the React Native interface.",
      "Booking service reserves availability and requests a deposit pre-auth from Payments.",
      "Insurance gateway issues a quote and, if accepted, binds coverage for the trip.",
      "Booking transitions to Confirmed and Messaging notifies both parties with pickup guidance.",
    ],
  },
  {
    title: "Resolve a damage claim",
    description: "Highlights how evidence flows through Insurance, Messaging, and Payments.",
    steps: [
      "Owner files a claim with photos and notes captured directly in the app, even while offline.",
      "Insurance gateway validates coverage, requests additional evidence, and updates claim status events.",
      "Payments holds deposits or issues additional charges, while Booking updates renter visibility.",
      "Admin/Ops reviews the audit trail and coordinates resolution messaging to both parties.",
    ],
  },
];

const concerns: Concern[] = [
  {
    title: "Observability & resilience",
    items: [
      "Structured logs with trace IDs flow into a centralized observability platform.",
      "Synthetic monitoring covers critical renter and owner flows on both mobile and web builds.",
      "Automated retries respect idempotency keys to keep state consistent across services.",
    ],
  },
  {
    title: "Privacy & compliance",
    items: [
      "PII is isolated to a dedicated datastore with per-field encryption and strict access controls.",
      "Right-to-access and right-to-be-forgotten workflows run asynchronously with review checkpoints.",
      "Audit logs capture all sensitive actions, including admin overrides and payout adjustments.",
    ],
  },
  {
    title: "Platform enablement",
    items: [
      "Feature flags orchestrate gradual rollouts of new native capabilities.",
      "Shared React Native component library enforces accessible typography, spacing, and color tokens.",
      "API schemas are versioned with contract tests to protect integrators and partner apps.",
    ],
  },
];

const dataHighlights = [
  {
    title: "Data domains",
    items: [
      "Bookings, Availability, Listings, Messaging, Reviews, Payments, Insurance, and Identity services own their respective aggregates.",
      "Cross-service references rely on immutable identifiers with lookup APIs rather than direct foreign keys.",
      "Analytics pipelines consume event streams and anonymized snapshots for decision-making.",
    ],
  },
  {
    title: "Storage strategy",
    items: [
      "Transactional services use managed relational databases with strict backup policies.",
      "Search and discovery leverage managed Elasticsearch with automated index tuning.",
      "Large media assets, signed evidence, and logs land in regional object storage buckets.",
    ],
  },
];

const Architecture = () => (
  <View style={styles.wrapper}>
    <Header />
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.overline}>System architecture</Text>
        <Text style={styles.title}>Service boundaries built for marketplace reliability</Text>
        <Text style={styles.subtitle}>
          The Adventure Ready Rentals platform runs on a modular service ecosystem with React Native powering the
          renter and owner experience across mobile and web. Each domain focuses on clear responsibilities while
          sharing cross-cutting observability, privacy, and compliance tooling.
        </Text>
      </View>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionHeading}>Core services</Text>
        <Text style={styles.sectionDescription}>
          Services follow single-responsibility boundaries and communicate through idempotent APIs and domain events.
        </Text>
        <View style={styles.cardGrid}>
          {services.map((service) => (
            <View key={service.name} style={styles.card}>
              <Text style={styles.cardTitle}>{service.name}</Text>
              <Text style={styles.cardSummary}>{service.summary}</Text>
              <View style={styles.cardList}>
                {service.responsibilities.map((item) => (
                  <Text key={item} style={styles.cardListItem}>
                    • {item}
                  </Text>
                ))}
              </View>
              <Text style={styles.cardSubtitle}>Key APIs</Text>
              <View style={styles.cardList}>
                {service.apis.map((api) => (
                  <Text key={api} style={styles.cardListItem}>
                    {api}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionHeading}>Sequences</Text>
        <Text style={styles.sectionDescription}>
          Step-by-step flows illustrate how services collaborate with strong observability and failure handling.
        </Text>
        <View style={styles.cardGrid}>
          {sequences.map((sequence) => (
            <View key={sequence.title} style={styles.card}>
              <Text style={styles.cardTitle}>{sequence.title}</Text>
              <Text style={styles.cardSummary}>{sequence.description}</Text>
              <View style={styles.cardList}>
                {sequence.steps.map((step) => (
                  <Text key={step} style={styles.cardListItem}>
                    {step}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionHeading}>Cross-cutting concerns</Text>
        <View style={styles.cardGrid}>
          {concerns.map((concern) => (
            <View key={concern.title} style={styles.card}>
              <Text style={styles.cardTitle}>{concern.title}</Text>
              <View style={styles.cardList}>
                {concern.items.map((item) => (
                  <Text key={item} style={styles.cardListItem}>
                    • {item}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionHeading}>Data highlights</Text>
        <View style={styles.cardGrid}>
          {dataHighlights.map((highlight) => (
            <View key={highlight.title} style={styles.card}>
              <Text style={styles.cardTitle}>{highlight.title}</Text>
              <View style={styles.cardList}>
                {highlight.items.map((item) => (
                  <Text key={item} style={styles.cardListItem}>
                    • {item}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>

      <Footer />
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 40,
    gap: 32,
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
    fontWeight: "700",
    fontSize: 13,
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
  sectionBlock: {
    paddingHorizontal: 24,
    gap: 16,
  },
  sectionHeading: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  sectionDescription: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  card: {
    flexBasis: "48%",
    minWidth: 260,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  cardSummary: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  cardSubtitle: {
    marginTop: 4,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  cardList: {
    gap: 6,
  },
  cardListItem: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default Architecture;
