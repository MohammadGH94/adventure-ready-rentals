import { useState, useCallback } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useLocation, useNavigate } from "react-router";

import colors from "../theme/colors";

const navigationItems = [
  { label: "Home", path: "/" },
  { label: "Browse", path: "/browse" },
  { label: "How it works", path: "/how-it-works" },
  { label: "List your gear", path: "/list-gear" },
  { label: "Architecture", path: "/architecture" },
];

const Header = () => {
  const { width } = useWindowDimensions();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isCompact = width < 900;

  const handleNavigate = useCallback(
    (path: string) => {
      setMenuOpen(false);
      if (location.pathname !== path) {
        navigate(path);
      }
    },
    [location.pathname, navigate],
  );

  const renderNavItems = () => (
    <View style={[styles.linksContainer, isCompact && styles.linksContainerCompact]}>
      {navigationItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Pressable
            key={item.path}
            accessibilityRole="link"
            onPress={() => handleNavigate(item.path)}
            style={({ pressed }) => [
              styles.link,
              isActive && styles.linkActive,
              pressed && styles.linkPressed,
            ]}
          >
            <Text style={[styles.linkText, isActive && styles.linkTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.inner}>
        <Pressable
          onPress={() => handleNavigate("/")}
          accessibilityRole="link"
          style={({ pressed }) => [styles.brandWrapper, pressed && styles.linkPressed]}
        >
          <Text style={styles.brand}>Adventure Ready Rentals</Text>
          <Text style={styles.subtitle}>Gear up for unforgettable outdoor experiences</Text>
        </Pressable>

        {isCompact ? (
          <View style={styles.menuContainer}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setMenuOpen((value) => !value)}
              style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}
            >
              <Text style={styles.menuButtonText}>{isMenuOpen ? "Close" : "Menu"}</Text>
            </Pressable>
            {isMenuOpen && <View style={styles.dropdown}>{renderNavItems()}</View>}
          </View>
        ) : (
          renderNavItems()
        )}

        <Pressable
          onPress={() => handleNavigate("/signin")}
          accessibilityRole="link"
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        >
          <Text style={styles.ctaText}>Sign in</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
  },
  brandWrapper: {
    flexShrink: 1,
  },
  brand: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primary,
  },
  subtitle: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 13,
  },
  linksContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
  },
  linksContainerCompact: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  link: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  linkActive: {
    backgroundColor: colors.surfaceMuted,
  },
  linkPressed: {
    opacity: 0.6,
  },
  linkText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "500",
  },
  linkTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  menuContainer: {
    position: "relative",
  },
  menuButton: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: colors.surfaceMuted,
  },
  menuButtonPressed: {
    opacity: 0.7,
  },
  menuButtonText: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  dropdown: {
    position: "absolute",
    top: 48,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
    gap: 8,
  },
  cta: {
    backgroundColor: colors.action,
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  ctaPressed: {
    backgroundColor: colors.actionDark,
  },
  ctaText: {
    color: colors.primaryContrast,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

export default Header;
