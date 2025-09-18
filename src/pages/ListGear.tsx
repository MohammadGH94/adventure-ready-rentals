import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View, Pressable } from "react-native";

import Footer from "../components/Footer";
import Header from "../components/Header";
import colors from "../theme/colors";

const ListGear = () => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [dailyPrice, setDailyPrice] = useState("");
  const [category, setCategory] = useState("");

  const isFormValid = useMemo(
    () => Boolean(title && location && description && dailyPrice && category),
    [category, dailyPrice, description, location, title],
  );

  return (
    <View style={styles.wrapper}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.overline}>List your gear</Text>
          <Text style={styles.title}>Share trusted equipment with the community</Text>
          <Text style={styles.subtitle}>
            Our React Native-powered onboarding guides you through compliant, high-converting listings that
            look fantastic on every screen.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Listing details</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Listing title"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
          <TextInput
            value={category}
            onChangeText={setCategory}
            placeholder="Category (climbing, camping, water, winter)"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Pickup location"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
          <TextInput
            value={dailyPrice}
            onChangeText={setDailyPrice}
            placeholder="Daily price"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Detailed description"
            placeholderTextColor={colors.textMuted}
            multiline
            style={[styles.input, styles.textarea]}
          />
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.submit,
              pressed && styles.submitPressed,
              !isFormValid && styles.submitDisabled,
            ]}
            disabled={!isFormValid}
          >
            <Text style={styles.submitText}>Preview listing</Text>
          </Pressable>
          <Text style={styles.formHint}>
            Publishing connects your listing to pricing, insurance, and payout workflows orchestrated by the
            services outlined in our architecture overview.
          </Text>
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Owner success tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Capture stunning photography</Text>
            <Text style={styles.tipDescription}>
              High-resolution images increase conversion across mobile and desktop. Showcase condition, key
              accessories, and the gear in action.
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Set transparent expectations</Text>
            <Text style={styles.tipDescription}>
              Outline pickup windows, return requirements, and cleaning standards so renters feel confident before
              they book.
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Keep availability current</Text>
            <Text style={styles.tipDescription}>
              Sync calendars frequently—our React Native experience makes managing schedules quick wherever you
              are.
            </Text>
          </View>
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
  form: {
    marginHorizontal: 24,
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  submit: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitPressed: {
    backgroundColor: colors.primaryLight,
  },
  submitDisabled: {
    backgroundColor: colors.border,
  },
  submitText: {
    color: colors.primaryContrast,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  formHint: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  tipsSection: {
    marginHorizontal: 24,
    gap: 16,
  },
  tipCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  tipTitle: {
    fontWeight: "700",
    color: colors.primary,
  },
  tipDescription: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default ListGear;
