import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import colors from "../theme/colors";

type Props = {
  title: string;
  description: string;
  imageUri: string;
  onPress?: () => void;
};

const CategoryCard = ({ title, description, imageUri, onPress }: Props) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
  >
    <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
    <View style={styles.content}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    overflow: "hidden",
    width: 260,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  image: {
    width: "100%",
    height: 140,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default CategoryCard;
