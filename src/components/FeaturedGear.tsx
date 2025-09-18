import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigate } from "react-router";

import colors from "../theme/colors";
import GearCard from "./GearCard";

const featuredGear = [
  {
    title: "Summit Series Mountaineering Kit",
    description: "Technical outerwear, crampons, and glacier travel essentials ready for expedition season.",
    pricePerDay: 128,
    rating: 4.9,
    reviewCount: 184,
    location: "Banff, Alberta",
    imageUri: "https://images.unsplash.com/photo-1526481280695-3c46917e5943?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Family Basecamp Bundle",
    description: "Spacious 6-person tent, cozy sleep system, and camp kitchen built for week-long escapes.",
    pricePerDay: 92,
    rating: 4.8,
    reviewCount: 136,
    location: "Moab, Utah",
    imageUri: "https://images.unsplash.com/photo-1523419409543-0c1df022bdd1?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Coastal Paddle Adventure Pack",
    description: "Premium touring kayak, dry storage, and navigation tools to explore rugged shorelines.",
    pricePerDay: 78,
    rating: 4.7,
    reviewCount: 98,
    location: "Tofino, British Columbia",
    imageUri: "https://images.unsplash.com/photo-1508264165352-258a6c48f473?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Backcountry Powder Setup",
    description: "Carbon touring skis, avalanche kit, and beacon for safe dawn patrol missions.",
    pricePerDay: 110,
    rating: 4.9,
    reviewCount: 153,
    location: "Jackson Hole, Wyoming",
    imageUri: "https://images.unsplash.com/photo-1465397793485-d99b1f168f84?auto=format&fit=crop&w=1600&q=80",
  },
];

const FeaturedGear = () => {
  const navigate = useNavigate();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.overline}>Featured gear</Text>
          <Text style={styles.title}>Outdoor essentials loved by our community</Text>
          <Text style={styles.subtitle}>
            Curated listings highlight how the new React Native experience balances immersive visuals with
            performant cross-platform rendering.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigate("/browse")}
          style={({ pressed }) => [styles.viewAll, pressed && styles.viewAllPressed]}
        >
          <Text style={styles.viewAllText}>View all gear</Text>
        </Pressable>
      </View>
      <View style={styles.grid}>
        {featuredGear.map((gear) => (
          <View key={gear.title} style={styles.cardWrapper}>
            <GearCard {...gear} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 48,
    paddingHorizontal: 24,
    gap: 24,
  },
  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  headerText: {
    flex: 1,
    minWidth: 240,
    gap: 8,
  },
  overline: {
    color: colors.accent,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 1.5,
    fontSize: 13,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  viewAll: {
    alignSelf: "center",
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  viewAllPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  viewAllText: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    justifyContent: "center",
  },
  cardWrapper: {
    flexBasis: "48%",
    minWidth: 280,
    maxWidth: 360,
  },
});

export default FeaturedGear;
