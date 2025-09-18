import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigate } from "react-router";

import colors from "../theme/colors";
import CategoryCard from "./CategoryCard";

const categories = [
  {
    id: "climbing",
    title: "Climbing",
    description: "Harnesses, ropes, and protection curated for alpine legends and boulder newcomers alike.",
    imageUri: "https://images.unsplash.com/photo-1509644851220-51ebdcca412f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "camping",
    title: "Camping",
    description: "From ultralight shelters to luxe family glamping setups ready for every trailhead.",
    imageUri: "https://images.unsplash.com/photo-1525104698733-6d46d76471e6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "water",
    title: "Water sports",
    description: "Kayaks, SUPs, and wetsuits designed for lakeside dawn patrols and coastal escapes.",
    imageUri: "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "winter",
    title: "Winter pursuits",
    description: "Skis, boards, and avalanche safety kits to chase powder days across every summit.",
    imageUri: "https://images.unsplash.com/photo-1454433720423-8246b00b557d?auto=format&fit=crop&w=1200&q=80",
  },
];

const Categories = () => {
  const navigate = useNavigate();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.overline}>Categories</Text>
        <Text style={styles.title}>Find the right gear faster</Text>
        <Text style={styles.subtitle}>
          Browse expertly curated collections that highlight our most popular adventures, all optimized for
          touch-friendly mobile and responsive web layouts.
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            title={category.title}
            description={category.description}
            imageUri={category.imageUri}
            onPress={() => navigate("/browse", { state: { category: category.id } })}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    gap: 24,
  },
  header: {
    paddingHorizontal: 24,
    gap: 8,
  },
  overline: {
    textTransform: "uppercase",
    color: colors.accent,
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
  scrollContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
});

export default Categories;
