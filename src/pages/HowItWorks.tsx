import { ScrollView, StyleSheet, Text, View } from "react-native";

import Footer from "../components/Footer";
import Header from "../components/Header";
import colors from "../theme/colors";

const steps = [
  {
    title: "Explore local listings",
    summary:
      "Use filters to find gear lovingly maintained by nearby adventurers.",
    details: [
      "Compare daily rates, deposits, and insurance coverage at a glance.",
      "Read friendly tips from owners about sizing, fit, and trail-ready accessories.",
    ],
  },
  {
    title: "Reserve with clarity",
    summary:
      "Lock in your dates knowing exactly how fees, deposits, and insurance support your trip.",
    details: [
      "Verification keeps the community safe while staying quick with reusable profile details.",
      "Secure checkout confirms totals before you pay and emails every policy detail for easy reference.",
    ],
  },
  {
    title: "Pick up and go further",
    summary: "Chat through pickup plans, snap a few photos, and start exploring with confidence.",
    details: [
      "Friendly reminders keep everyone aligned on pickup, return timing, and cleaning expectations.",
      "If something happens, just upload photos within 48 hours—we’ll handle the rest.",
    ],
  },
];

const highlights = [
  {
    title: "Transparent from the first tap",
    description:
      "Upfront totals outline service fees, deposits, and optional insurance so there are no surprises—just clear choices.",
  },
  {
    title: "Built for friends planning trips",
    description:
      "Guided checklists, reminders, and messaging keep renters and owners in sync without corporate jargon.",
  },
  {
    title: "Reuse over replace",
    description:
      "Sharing gear through CiKr keeps quality equipment in play longer, supports locals, and trims your footprint.",
  },
];

const HowItWorks = () => (
  <View style={styles.wrapper}>
    <Header />
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.overline}>How it works</Text>
        <Text style={styles.title}>Borrow gear safely in three easy steps</Text>
        <Text style={styles.subtitle}>
          CiKr combines a single React Native experience with friendly guidance so you can discover new trails,
          understand every fee, and feel good about reusing gear that might otherwise sit idle.
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
