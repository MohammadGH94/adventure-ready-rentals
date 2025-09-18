import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import Footer from "../components/Footer";
import Header from "../components/Header";
import colors from "../theme/colors";

const SignIn = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const isSignIn = mode === "signin";
  const isFormValid =
    isSignIn
      ? Boolean(email && password)
      : Boolean(email && password && confirmPassword && firstName && lastName);

  return (
    <View style={styles.wrapper}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.overline}>{isSignIn ? "Welcome back" : "Join the community"}</Text>
          <Text style={styles.title}>
            {isSignIn
              ? "Access your adventure hub"
              : "Create an account in minutes"}
          </Text>
          <Text style={styles.subtitle}>
            The authentication flow shares a single React Native implementation across mobile and web, including
            validation states and secure text entry.
          </Text>
        </View>

        <View style={styles.modeToggle}>
          <Pressable
            style={({ pressed }) => [
              styles.toggleButton,
              mode === "signin" && styles.toggleButtonActive,
              pressed && styles.toggleButtonPressed,
            ]}
            onPress={() => setMode("signin")}
          >
            <Text style={[styles.toggleText, mode === "signin" && styles.toggleTextActive]}>Sign in</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.toggleButton,
              mode === "signup" && styles.toggleButtonActive,
              pressed && styles.toggleButtonPressed,
            ]}
            onPress={() => setMode("signup")}
          >
            <Text style={[styles.toggleText, mode === "signup" && styles.toggleTextActive]}>Create account</Text>
          </Pressable>
        </View>

        <View style={styles.form}>
          {!isSignIn && (
            <View style={styles.nameRow}>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.nameInput]}
              />
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.nameInput]}
              />
            </View>
          )}
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            style={styles.input}
          />
          {!isSignIn && (
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              style={styles.input}
            />
          )}
          <Pressable
            accessibilityRole="button"
            disabled={!isFormValid}
            style={({ pressed }) => [
              styles.submit,
              pressed && styles.submitPressed,
              !isFormValid && styles.submitDisabled,
            ]}
          >
            <Text style={styles.submitText}>{isSignIn ? "Sign in" : "Create account"}</Text>
          </Pressable>
          <Text style={styles.legal}>
            By continuing you agree to our Terms of Service and confirm the privacy-first practices outlined in
            the architecture documentation.
          </Text>
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
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontSize: 13,
    fontWeight: "700",
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
  modeToggle: {
    flexDirection: "row",
    marginHorizontal: 24,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleButtonPressed: {
    opacity: 0.8,
  },
  toggleText: {
    color: colors.textSecondary,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: colors.primaryContrast,
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
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
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
  nameRow: {
    flexDirection: "row",
    gap: 12,
  },
  nameInput: {
    flex: 1,
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
  legal: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
});

export default SignIn;
