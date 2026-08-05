import { colors, fontSize, fontWeight, spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenHeaderProps {
  title: string;
  right?: React.ReactNode;
  onBack?: () => void;
}

export default function ScreenHeader({
  title,
  right,
  onBack,
}: ScreenHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack ?? (() => router.back())}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.rightSlot}>
        {right ?? <View style={{ width: 24 }} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 32,
    alignItems: "flex-start",
    paddingVertical: spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    textAlign: "center",
  },
  rightSlot: { width: 32, alignItems: "flex-end", paddingVertical: spacing.xs },
});
