import {
  borderRadius,
  colors,
  fontSize,
  fontWeight,
  spacing,
} from "@/constants/theme";
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

type Occasion =
  | "casual"
  | "work"
  | "formal"
  | "date_night"
  | "party"
  | "vacation";

const OCCASIONS: { value: Occasion; label: string; description: string }[] = [
  {
    value: "casual",
    label: "Casual",
    description: "Everyday wear, running errands, hanging out.",
  },
  {
    value: "work",
    label: "Work",
    description: "Office, meetings, professional settings.",
  },
  {
    value: "formal",
    label: "Formal",
    description: "Weddings, galas, black-tie events.",
  },
  {
    value: "date_night",
    label: "Date Night",
    description: "Dinner dates, romantic evenings out.",
  },
  {
    value: "party",
    label: "Party",
    description: "Celebrations, cocktail parties, nights out.",
  },
  {
    value: "vacation",
    label: "Vacation",
    description: "Travel, beach days, resort wear.",
  },
];

export default function OccasionSelectionScreen() {
  const router = useRouter();
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleContinue = async () => {
    if (!selectedOccasion) {
      Alert.alert(
        "Selection Required",
        "Please select an occasion to continue.",
      );
      return;
    }

    setIsSaving(true);
    try {
      await AsyncStorage.setItem("userOccasion", selectedOccasion);
      router.push("/photo-upload");
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
        <Text style={styles.title}>What's the occasion?</Text>
        <Text style={styles.subtitle}>
          This helps our AI tailor styling insights to where you're wearing the
          look.
        </Text>

        <View style={styles.optionsContainer}>
          {OCCASIONS.map((occasion) => {
            const isSelected = selectedOccasion === occasion.value;
            return (
              <TouchableOpacity
                key={occasion.value}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedOccasion(occasion.value)}
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
                    {occasion.label}
                  </Text>
                  <Text style={styles.optionDescription}>
                    {occasion.description}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedOccasion || isSaving) && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedOccasion || isSaving}
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
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: fontSize.xl ?? 24,
    fontWeight: fontWeight.bold ?? "700",
    color: colors.primaryDark ?? colors.primary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: fontSize.sm ?? 14,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: "center",
    lineHeight: 20,
  },
  optionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.md ?? 12,
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
  radioSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: fontSize.md ?? 16,
    fontWeight: fontWeight.semibold ?? "600",
    color: colors.primaryDark,
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: colors.primary,
  },
  optionDescription: {
    fontSize: fontSize.sm ?? 14,
    color: colors.textSecondary,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md ?? 12,
    alignItems: "center",
    marginTop: "auto",
  },
  continueButtonDisabled: {
    backgroundColor: colors.border,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: fontSize.md ?? 16,
    fontWeight: fontWeight.semibold ?? "600",
  },
});
