import {
    borderRadius,
    colors,
    fontSize,
    fontWeight,
    spacing,
} from "@/constants/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { GARMENT_CATALOGUE, Garment } from "./garments";

export default function OutfitBrowseScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

  const handleSelect = (garment: Garment) => {
    router.push({
      pathname: "/analysis",
      params: {
        imageUri,
        garmentId: garment.id,
        garmentImageUrl: garment.imageUrl,
        garmentCategory: garment.category,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Choose an Outfit</Text>
        <Text style={styles.subtitle}>Pick a garment to try on</Text>
      </View>

      <FlatList
        data={GARMENT_CATALOGUE}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleSelect(item)}
            activeOpacity={0.85}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
            <Text style={styles.cardLabel}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, alignItems: "center" },
  headerTitle: {
    fontSize: fontSize.h1,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  subtitle: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  grid: { padding: spacing.md },
  card: {
    flex: 1,
    margin: spacing.sm,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbnail: { width: "100%", aspectRatio: 3 / 4 },
  cardLabel: {
    padding: spacing.sm,
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.medium,
    color: colors.primaryDark,
    textAlign: "center",
  },
});
