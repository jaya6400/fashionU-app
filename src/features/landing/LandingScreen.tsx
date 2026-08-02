import {
  borderRadius,
  colors,
  fontSize,
  fontWeight,
  shadows,
  spacing,
} from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const FEATURES = [
  {
    icon: "camera-outline" as const,
    text: "See outfits on your own photo",
  },
  {
    icon: "chatbubble-ellipses-outline" as const,
    text: "Get AI reasoning on why it works",
  },
  {
    icon: "heart-outline" as const,
    text: "Save your favorite looks",
  },
];

export default function LandingScreen() {
  const router = useRouter();

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnims = useRef(FEATURES.map(() => new Animated.Value(0))).current;
  const slideAnims = useRef(FEATURES.map(() => new Animated.Value(20))).current;

  useEffect(() => {
    // Continuous subtle pulse for the header icon
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();

    // Staggered fade-in and slide-up for feature rows
    FEATURES.forEach((_, index) => {
      Animated.parallel([
        Animated.timing(fadeAnims[index], {
          toValue: 1,
          duration: 600,
          delay: 300 + index * 100, // 300ms initial delay, then 100ms stagger
          useNativeDriver: true,
        }),
        Animated.timing(slideAnims[index], {
          toValue: 0,
          duration: 600,
          delay: 300 + index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    });

    return () => {
      pulse.stop();
    };
  }, [pulseAnim, fadeAnims, slideAnims]);

  const handleGetStarted = () => {
    router.push("/photo-upload");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Ionicons name="sparkles" size={48} color={colors.primary} />
          </Animated.View>
          <Text style={styles.appName}>FashionU</Text>
          <Text style={styles.tagline}>Styling insight, not just a mirror</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {FEATURES.map((feature, index) => (
            <Animated.View
              key={index}
              style={[
                styles.featureRow,
                {
                  opacity: fadeAnims[index],
                  transform: [{ translateY: slideAnims[index] }],
                },
              ]}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={feature.icon} size={24} color={colors.accent} />
              </View>
              <Text style={styles.featureText}>{feature.text}</Text>
            </Animated.View>
          ))}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleGetStarted}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Get started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: "space-between",
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: "center",
    marginTop: spacing.xxl,
  },
  appName: {
    fontSize: fontSize.h1,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    marginTop: spacing.md,
  },
  tagline: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  featuresContainer: {
    gap: spacing.lg,
    marginVertical: spacing.xl,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  featureText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    color: colors.primaryDark,
    flex: 1,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    ...shadows.md,
  },
  ctaText: {
    color: colors.white,
    fontSize: fontSize.button,
    fontWeight: fontWeight.semibold,
  },
});
