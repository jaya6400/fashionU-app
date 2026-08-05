// src/features/body-shape-quiz/BodyShapeQuizScreen.tsx
import {
  borderRadius,
  colors,
  fontSize,
  fontWeight,
  spacing,
} from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type BodyShape =
  | "hourglass"
  | "rectangle"
  | "triangle"
  | "inverted_triangle"
  | "oval";

const BODY_SHAPES: { value: BodyShape; label: string; description: string }[] =
  [
    {
      value: "hourglass",
      label: "Hourglass",
      description:
        "Shoulders and hips are roughly equal, with a defined waist.",
    },
    {
      value: "rectangle",
      label: "Rectangle",
      description: "Shoulders, waist, and hips are roughly the same width.",
    },
    {
      value: "triangle",
      label: "Triangle (Pear)",
      description: "Hips are wider than shoulders, with a defined waist.",
    },
    {
      value: "inverted_triangle",
      label: "Inverted Triangle",
      description: "Shoulders are wider than hips, with a less defined waist.",
    },
    {
      value: "oval",
      label: "Oval (Apple)",
      description:
        "Weight is carried around the midsection, with slimmer legs.",
    },
  ];

export default function BodyShapeQuizScreen() {
  const router = useRouter();
  const [selectedShape, setSelectedShape] = useState<BodyShape | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleContinue = async () => {
    if (!selectedShape) {
      Alert.alert(
        "Selection Required",
        "Please select a body shape to continue.",
      );
      return;
    }
    setIsSaving(true);
    try {
      await AsyncStorage.setItem("userBodyShape", selectedShape);
      router.push("/occasion-selection");
    } catch (err) {
      Alert.alert(
        "Save Failed",
        "Could not save your selection. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.titleRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { transform: [{ translateX: 6 }] }]}>
            What is your body shape?
          </Text>
        </View>
        <Text style={styles.subtitle}>
          This helps our AI provide personalized silhouette recommendations.
          (This is self-reported and never inferred from your photo).
        </Text>

        <View style={styles.optionsContainer}>
          {BODY_SHAPES.map((shape) => {
            const isSelected = selectedShape === shape.value;
            return (
              <TouchableOpacity
                key={shape.value}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedShape(shape.value)}
                activeOpacity={0.8}
              >
                <View
                  style={[styles.radio, isSelected && styles.radioSelected]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <View style={styles.optionTextContainer}>
                  <Text
                    style={[
                      styles.optionLabel,
                      isSelected && styles.optionLabelSelected,
                    ]}
                  >
                    {shape.label}
                  </Text>
                  <Text style={styles.optionDescription}>
                    {shape.description}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedShape || isSaving) && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedShape || isSaving}
          activeOpacity={0.85}
        >
          <Text style={styles.continueButtonText}>
            {isSaving ? "Saving..." : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.lg, paddingTop: spacing.xl },
  titleRow: {
    position: "relative",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    padding: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primaryDark,
    textAlign: "center",
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: "center",
    lineHeight: 20,
  },
  optionsContainer: { gap: spacing.md, marginBottom: spacing.xl },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.secondary,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  radioSelected: { borderColor: colors.primary },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  optionTextContainer: { flex: 1 },
  optionLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primaryDark,
    marginBottom: 2,
  },
  optionLabelSelected: { color: colors.primary },
  optionDescription: { fontSize: fontSize.sm, color: colors.textSecondary },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: spacing.xxl,
  },
  continueButtonDisabled: { backgroundColor: colors.border },
  continueButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
