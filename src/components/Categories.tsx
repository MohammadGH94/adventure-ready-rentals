import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigate } from "react-router";

import colors from "../theme/colors";
import CategoryCard from "./CategoryCard";

const categories = [
  {
    id: "climbing",
    title: "Climbing",
    description:
      "Harnesses, ropes, and protection maintained by local climbers so first-timers and pros feel secure.",
    imageUri: "https://images.unsplash.com/photo-1509644851220-51ebdcca412f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "camping",
    title: "Camping",
    description: "From ultralight shelters to cozy family tents shared by neighbours who love seeing gear reused.",
    imageUri: "https://images.unsplash.com/photo-1525104698733-6d46d76471e6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "water",
    title: "Water sports",
    description: "Kayaks, SUPs, and wetsuits paired with safety gear from paddlers who know the local waters best.",
    imageUri: "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "winter",
    title: "Winter pursuits",
    description: "Skis, boards, and avalanche kits tuned by mountain regulars to keep every glide confident and low impact.",
    imageUri: "https://images.unsplash.com/photo-1454433720423-8246b00b557d?auto=format&fit=crop&w=1200&q=80",
  },
];

const Categories = () => {
  const navigate = useNavigate();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.overline}>Categories</Text>
        <Text style={styles.title}>Choose a path and borrow with confidence</Text>
        <Text style={styles.subtitle}>
          These collections highlight community favourites so you can plan with transparent pricing, trusted
          safety gear, and a lighter footprint.
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
