import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  Pressable,
} from "react-native";

import Footer from "../components/Footer";
import GearCard from "../components/GearCard";
import Header from "../components/Header";
import colors from "../theme/colors";

type GearRecord = {
  title: string;
  description: string;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  location: string;
  category: string;
  imageUri: string;
};

const gear: GearRecord[] = [
  {
    title: "Professional Climbing Rope Set",
    description: "Dynamic rope with locking carabiners and belay device for high-alpine missions.",
    pricePerDay: 45,
    rating: 4.9,
    reviewCount: 127,
    location: "Boulder, Colorado",
    category: "climbing",
    imageUri: "https://images.unsplash.com/photo-1525104698733-6d46d76471e6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "4-Person Family Camping Kit",
    description: "Tent, sleeping systems, camp furniture, and lantern bundle for comfortable weekends.",
    pricePerDay: 85,
    rating: 4.8,
    reviewCount: 89,
    location: "Portland, Oregon",
    category: "camping",
    imageUri: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Inflatable Kayak with Paddle",
    description: "Stable tandem kayak with pump, paddles, and PFDs for lake adventures.",
    pricePerDay: 65,
    rating: 4.7,
    reviewCount: 156,
    location: "Lake Tahoe, California",
    category: "water",
    imageUri: "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Premium Ski Equipment Set",
    description: "High-performance skis, boots, and poles tuned for fresh powder days.",
    pricePerDay: 120,
    rating: 4.9,
    reviewCount: 94,
    location: "Aspen, Colorado",
    category: "winter",
    imageUri: "https://images.unsplash.com/photo-1464219222984-216ebffaaf85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Rock Climbing Starter Kit",
    description: "Harness, helmet, shoes, and chalk bag sized for first send sessions.",
    pricePerDay: 35,
    rating: 4.6,
    reviewCount: 203,
    location: "Joshua Tree, California",
    category: "climbing",
    imageUri: "https://images.unsplash.com/photo-1523419409543-0c1df022bdd1?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Backpacking Essentials",
    description: "Ultralight tent, sleeping quilt, and bear canister for multi-day treks.",
    pricePerDay: 95,
    rating: 4.8,
    reviewCount: 167,
    location: "Yosemite, California",
    category: "camping",
    imageUri: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Surfboard & Wetsuit Combo",
    description: "Performance shortboard paired with 4/3 wetsuit for chilled Pacific sessions.",
    pricePerDay: 55,
    rating: 4.7,
    reviewCount: 89,
    location: "Santa Cruz, California",
    category: "water",
    imageUri: "https://images.unsplash.com/photo-1545145617-96ef14041ca3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Snowboard Complete Package",
    description: "Directional board, bindings, boots, and helmet dialed for freeride terrain.",
    pricePerDay: 75,
    rating: 4.8,
    reviewCount: 112,
    location: "Whistler, British Columbia",
    category: "winter",
    imageUri: "https://images.unsplash.com/photo-1453743327117-664e2bf4e951?auto=format&fit=crop&w=1200&q=80",
  },
];

const categoryFilters = [
  { id: "all", label: "All" },
  { id: "climbing", label: "Climbing" },
  { id: "camping", label: "Camping" },
  { id: "water", label: "Water" },
  { id: "winter", label: "Winter" },
];

const Browse = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState("");
  const [dates, setDates] = useState("");

  const filteredGear = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return gear.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch =
        !normalizedSearch ||
        item.title.toLowerCase().includes(normalizedSearch) ||
        item.description.toLowerCase().includes(normalizedSearch) ||
        item.location.toLowerCase().includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <View style={styles.wrapper}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.pageHeader}>
          <Text style={styles.title}>Browse community gear near you</Text>
          <Text style={styles.subtitle}>
            Filter by location, dates, and categories to find trusted local gear with upfront fees, deposit
            holds, and insurance details before you book.
          </Text>
        </View>

        <View style={styles.filters}>
          <View style={styles.inputRow}>
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Search gear"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Location"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
            <TextInput
              value={dates}
              onChangeText={setDates}
              placeholder="Dates"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {categoryFilters.map((category) => {
              const isActive = selectedCategory === category.id;
              return (
                <Pressable
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  style={({ pressed }) => [
                    styles.categoryPill,
                    isActive && styles.categoryPillActive,
                    pressed && styles.categoryPillPressed,
                  ]}
                >
                  <Text
                    style={[styles.categoryText, isActive && styles.categoryTextActive]}
                  >
                    {category.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.mapToggleRow}>
            <Text style={styles.mapToggleLabel}>Map view</Text>
            <Switch value={showMap} onValueChange={setShowMap} trackColor={{ false: colors.border, true: colors.primary }} />
          </View>
        </View>

        {showMap && (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>
              Map preview coming soon. We’ll highlight nearby pickup points while keeping the experience
              accessible on web and native.
            </Text>
          </View>
        )}

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>{filteredGear.length} listings</Text>
          <Text style={styles.resultsHint}>
            Tap a card for transparent pricing, insurance choices, and pickup tips from the owner community.
          </Text>
        </View>

        <View style={styles.grid}>
          {filteredGear.map((item) => (
            <View key={item.title} style={styles.cardWrapper}>
              <GearCard {...item} />
            </View>
          ))}
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
  pageHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  filters: {
    backgroundColor: colors.surface,
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 20,
    gap: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  inputRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  input: {
    flexGrow: 1,
    flexBasis: "30%",
    minWidth: 160,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  categoryRow: {
    flexDirection: "row",
    gap: 10,
  },
  categoryPill: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryPillPressed: {
    opacity: 0.7,
  },
  categoryText: {
    color: colors.textSecondary,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: colors.primaryContrast,
  },
  mapToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mapToggleLabel: {
    color: colors.textSecondary,
    fontWeight: "600",
  },
  mapPlaceholder: {
    marginHorizontal: 24,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mapPlaceholderText: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
  resultsHeader: {
    paddingHorizontal: 24,
    gap: 6,
  },
  resultsCount: {
    fontWeight: "700",
    color: colors.textPrimary,
  },
  resultsHint: {
    color: colors.textMuted,
    fontSize: 12,
  },
  grid: {
    paddingHorizontal: 24,
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

export default Browse;
