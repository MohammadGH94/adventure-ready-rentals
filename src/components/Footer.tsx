import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigate } from "react-router";

import colors from "../theme/colors";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <View style={styles.container}>
      <View style={styles.brandBlock}>
        <Text style={styles.brand}>Adventure Ready Rentals</Text>
        <Text style={styles.summary}>
          A single React Native codebase delivering immersive outdoor gear browsing experiences
          across web and mobile.
        </Text>
      </View>

      <View style={styles.linksRow}>
        <FooterLink label="Browse gear" onPress={() => navigate("/browse")} />
        <FooterLink label="How it works" onPress={() => navigate("/how-it-works")} />
        <FooterLink label="List your gear" onPress={() => navigate("/list-gear")} />
        <FooterLink label="Architecture" onPress={() => navigate("/architecture")} />
      </View>

      <Text style={styles.copyright}>
        © {new Date().getFullYear()} Adventure Ready Rentals. Built with React Native for every platform.
      </Text>
    </View>
  );
};

const FooterLink = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable
    accessibilityRole="link"
    onPress={onPress}
    style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}
  >
    <Text style={styles.linkText}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: 20,
  },
  brandBlock: {
    gap: 8,
  },
  brand: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  summary: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  linksRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  link: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  linkPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  linkText: {
    color: colors.textMuted,
    fontWeight: "600",
  },
  copyright: {
    color: colors.textMuted,
    fontSize: 12,
  },
});

export default Footer;
