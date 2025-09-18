import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigate } from "react-router";

import colors from "../theme/colors";

const heroImageUri =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.subtitle}>One codebase. Every adventure.</Text>
        <Text style={styles.title}>Rent premium outdoor gear, anywhere you roam.</Text>
        <Text style={styles.description}>
          Built with React Native, Adventure Ready Rentals delivers a seamless browsing experience across
          native mobile apps and the web. Discover curated collections, explore rich gear details, and book
          with confidence on any device.
        </Text>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigate("/browse")}
            style={({ pressed }) => [styles.primaryAction, pressed && styles.primaryActionPressed]}
          >
            <Text style={styles.primaryActionText}>Browse gear</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigate("/how-it-works")}
            style={({ pressed }) => [styles.secondaryAction, pressed && styles.secondaryActionPressed]}
          >
            <Text style={styles.secondaryActionText}>See how it works</Text>
          </Pressable>
        </View>
      </View>
      <Image source={{ uri: heroImageUri }} style={styles.image} resizeMode="cover" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 28,
    overflow: "hidden",
    flexDirection: "column",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 6,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 30,
    gap: 16,
  },
  subtitle: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.textPrimary,
    lineHeight: 36,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  primaryAction: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 26,
    paddingVertical: 14,
  },
  primaryActionPressed: {
    backgroundColor: colors.primaryLight,
  },
  primaryActionText: {
    color: colors.primaryContrast,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  secondaryAction: {
    borderRadius: 999,
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryActionPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  secondaryActionText: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  image: {
    width: "100%",
    height: 240,
  },
});

export default Hero;
