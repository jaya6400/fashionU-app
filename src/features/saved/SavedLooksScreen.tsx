import {
  borderRadius,
  colors,
  fontSize,
  fontWeight,
  shadows,
  spacing,
} from "@/constants/theme";
import { supabase } from "@/shared/api/supabase";
import ScreenHeader from "@/shared/components/ScreenHeader";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SavedLook {
  id: string;
  outfit_id: string;
  body_shape: string | null;
  occasion: string | null;
  vto_image_url: string | null;
  styling_insight: string | null;
  created_at: string;
}

export default function SavedLooksScreen() {
  const router = useRouter();
  const [looks, setLooks] = useState<SavedLook[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLooks = useCallback(async () => {
    setLoading(true);
    // Select explicit columns — never pull the 3072-dim embedding over the wire
    const { data, error } = await supabase
      .from("saved_looks")
      .select(
        "id, outfit_id, body_shape, occasion, vto_image_url, styling_insight, created_at",
      )
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to load saved looks:", error);
    } else {
      setLooks((data as SavedLook[]) ?? []);
    }
    setLoading(false);
  }, []);

  // Refetch on every focus so a fresh save appears immediately
  useFocusEffect(
    useCallback(() => {
      fetchLooks();
    }, [fetchLooks]),
  );

  const renderItem = ({ item }: { item: SavedLook }) => (
    <View style={styles.card}>
      {item.vto_image_url ? (
        <Image source={{ uri: item.vto_image_url }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
          <Ionicons name="image-outline" size={40} color={colors.border} />
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardVerdict} numberOfLines={3}>
          {item.styling_insight || "Saved look"}
        </Text>
        <View style={styles.cardMeta}>
          {item.occasion ? (
            <View style={styles.metaPill}>
              <Text style={styles.metaText}>{item.occasion}</Text>
            </View>
          ) : null}
          {item.body_shape ? (
            <View style={styles.metaPill}>
              <Text style={styles.metaText}>{item.body_shape}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.cardDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Saved Looks" />
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : looks.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="heart-outline" size={56} color={colors.border} />
          <Text style={styles.emptyTitle}>No saved looks yet</Text>
          <Text style={styles.emptyBody}>
            Analyze an outfit and it will appear here automatically.
          </Text>
          <TouchableOpacity
            style={styles.emptyCta}
            onPress={() => router.push("/photo-upload")}
          >
            <Text style={styles.emptyCtaText}>Try a Look</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={looks}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  listContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  cardImage: { width: "100%", aspectRatio: 3 / 4 },
  cardImagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundAlt,
  },
  cardBody: { padding: spacing.md },
  cardVerdict: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  cardMeta: { flexDirection: "row", flexWrap: "wrap", marginTop: spacing.sm },
  metaPill: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  metaText: {
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.medium,
    color: colors.primaryDark,
  },
  cardDate: {
    marginTop: spacing.sm,
    fontSize: fontSize.bodySmall,
    color: colors.textSecondary,
  },
  emptyTitle: {
    marginTop: spacing.md,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  emptyBody: {
    marginTop: spacing.sm,
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
  emptyCta: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  emptyCtaText: {
    color: colors.white,
    fontSize: fontSize.button,
    fontWeight: fontWeight.semibold,
  },
});
