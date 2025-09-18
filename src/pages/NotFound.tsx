import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigate } from "react-router";

import Footer from "../components/Footer";
import Header from "../components/Header";
import colors from "../theme/colors";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <View style={styles.wrapper}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.messageBlock}>
          <Text style={styles.code}>404</Text>
          <Text style={styles.title}>This trail seems to be unmarked</Text>
          <Text style={styles.subtitle}>
            The page you requested doesn’t exist. Use the controls below to return to familiar terrain.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigate("/")}
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          >
            <Text style={styles.ctaText}>Back to home</Text>
          </Pressable>
        </View>
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
    gap: 24,
  },
  messageBlock: {
    paddingHorizontal: 24,
    paddingTop: 48,
    gap: 12,
    alignItems: "center",
  },
  code: {
    fontSize: 64,
    fontWeight: "800",
    color: colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 480,
  },
  cta: {
    marginTop: 16,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  ctaPressed: {
    backgroundColor: colors.primaryLight,
  },
  ctaText: {
    color: colors.primaryContrast,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

export default NotFound;
