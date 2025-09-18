import { ScrollView, StyleSheet, Text, View } from "react-native";

import Footer from "../components/Footer";
import Header from "../components/Header";
import colors from "../theme/colors";

const steps = [
  {
    title: "Explore premium listings",
    summary:
      "Use the browse and filter tools to pinpoint the perfect equipment for your next outing.",
    details: [
      "Rich imagery, ratings, and pricing information render consistently across platforms.",
      "React Query powers fast, cached data fetching for responsive list updates.",
    ],
  },
  {
    title: "Reserve with confidence",
    summary:
      "Tap into a listing to view availability, insurance options, and owner requirements.",
    details: [
      "Interactive flows stay responsive thanks to shared React Native form logic.",
      "Secure checkout integrates with the Payments service described in the architecture view.",
    ],
  },
  {
    title: "Pick up and adventure",
    summary: "Coordinated messaging ensures smooth hand-offs and dependable return experiences.",
    details: [
      "Owners manage bookings from the same React Native experience as renters.",
      "Real-time updates keep both parties aligned on timing and condition reports.",
    ],
  },
];

const highlights = [
  {
    title: "Unified design system",
    description:
      "Typography, spacing, and color tokens are shared between native and web builds, delivering a cohesive brand across every touchpoint.",
  },
  {
    title: "Offline ready",
    description:
      "Critical screens cache data locally, allowing users to review details and prepare trips even when the signal drops in remote areas.",
  },
  {
    title: "Accessibility first",
    description:
      "Semantic roles, high contrast palettes, and large tap targets ensure the experience works for all explorers.",
  },
];

const HowItWorks = () => (
  <View style={styles.wrapper}>
    <Header />
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.overline}>How it works</Text>
        <Text style={styles.title}>Plan adventures without swapping codebases</Text>
        <Text style={styles.subtitle}>
          Adventure Ready Rentals now runs on a unified React Native foundation that renders beautifully on both
          native and web platforms, helping teams iterate faster while customers enjoy a polished experience
          everywhere.
        </Text>
      </View>

      <View style={styles.stepGrid}>
        {steps.map((step) => (
          <View key={step.title} style={styles.stepCard}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepSummary}>{step.summary}</Text>
            <View style={styles.stepDetails}>
              {step.details.map((detail) => (
                <Text key={detail} style={styles.stepDetailText}>
                  • {detail}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.highlights}> 
        {highlights.map((highlight) => (
          <View key={highlight.title} style={styles.highlightCard}>
            <Text style={styles.highlightTitle}>{highlight.title}</Text>
            <Text style={styles.highlightDescription}>{highlight.description}</Text>
          </View>
        ))}
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
  stepGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    paddingHorizontal: 24,
  },
  stepCard: {
    flexBasis: "48%",
    minWidth: 260,
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
  stepTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  stepSummary: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  stepDetails: {
    gap: 6,
  },
  stepDetailText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  highlights: {
    paddingHorizontal: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  highlightCard: {
    flexBasis: "30%",
    minWidth: 220,
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  highlightTitle: {
    fontWeight: "700",
    color: colors.primary,
  },
  highlightDescription: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default HowItWorks;
