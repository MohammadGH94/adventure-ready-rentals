import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import colors from "../theme/colors";

type Props = {
  title: string;
  description: string;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  location: string;
  imageUri: string;
};

const GearCard = ({ title, description, pricePerDay, rating, reviewCount, location, imageUri }: Props) => (
  <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
    <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
    <View style={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.price}>${pricePerDay}/day</Text>
      </View>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{location}</Text>
        <Text style={styles.metaText}>
          {rating.toFixed(1)} · {reviewCount} reviews
        </Text>
      </View>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  cardPressed: {
    transform: [{ translateY: 2 }],
  },
  image: {
    width: "100%",
    height: 180,
  },
  content: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.action,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
});

export default GearCard;
