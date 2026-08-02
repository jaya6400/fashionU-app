import {
  borderRadius,
  colors,
  fontSize,
  fontWeight,
  shadows,
  spacing,
} from "@/constants/theme";
import { AnalysisResult, analyzeOutfit } from "@/services/aiService";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AnalysisScreen() {
  const router = useRouter();
  const { imageUri, bodyShape, occasion } = useLocalSearchParams<{
    imageUri: string;
    bodyShape?: string;
    occasion?: string;
  }>();

  const decodedImageUri = imageUri ? decodeURIComponent(imageUri) : null;

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Body shape isn't passed as a route param anywhere in the flow —
  // it's set once in the quiz and persisted to AsyncStorage. Read it
  // back here so it actually reaches the AI call and the Supabase save.
  const [storedBodyShape, setStoredBodyShape] = useState<string | null>(null);
  const [storedOccasion, setStoredOccasion] = useState<string | null>(null);
  const [hasLoadedStoredShape, setHasLoadedStoredShape] = useState(false);

  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem("userBodyShape")
      .then((value) => {
        if (isMounted) setStoredBodyShape(value);
      })
      .catch((err) => {
        console.warn("Failed to read stored body shape:", err);
      })
      .finally(() => {
        if (isMounted) setHasLoadedStoredShape(true);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // Wait for the AsyncStorage read to finish before firing analysis,
    // otherwise this races and bodyShape ends up undefined on first run.
    if (!hasLoadedStoredShape) return;

    const runAnalysis = async () => {
      if (!decodedImageUri) {
        setError("No image provided");
        setIsAnalyzing(false);
        return;
      }

      const effectiveBodyShape = bodyShape ?? storedBodyShape ?? undefined;
      const effectiveOccasion = occasion ?? storedOccasion ?? undefined;

      try {
        const analysisResult = await analyzeOutfit(decodedImageUri, {
          bodyShape: effectiveBodyShape,
          occasion: effectiveOccasion,
          saveToDatabase: true,
        });
        setResult(analysisResult);
      } catch (err) {
        console.error("Analysis error:", err);
        setError("Failed to analyze outfit. Please try again.");
      } finally {
        setIsAnalyzing(false);
      }
    };

    runAnalysis();
  }, [
    decodedImageUri,
    bodyShape,
    occasion,
    storedBodyShape,
    hasLoadedStoredShape,
  ]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      AsyncStorage.getItem("userBodyShape"),
      AsyncStorage.getItem("userOccasion"),
    ])
      .then(([shape, occ]) => {
        console.log("Read from storage — bodyShape:", shape, "occasion:", occ);
        if (isMounted) {
          setStoredBodyShape(shape);
          setStoredOccasion(occ);
        }
      })
      .catch((err) => console.warn("Failed to read stored preferences:", err))
      .finally(() => {
        if (isMounted) setHasLoadedStoredShape(true);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleTryAnother = () => {
    router.replace("/photo-upload");
  };

  const toggleSave = () => {
    setIsSaved((prev) => !prev);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Analysis</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={toggleSave}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={isSaved ? "heart" : "heart-outline"}
            size={24}
            color={isSaved ? colors.accent : colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Preview */}
        {decodedImageUri && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: decodedImageUri }}
              style={styles.previewImage}
            />
          </View>
        )}

        {/* Analysis Content */}
        {isAnalyzing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Analyzing your style...</Text>
            <Text style={styles.loadingSubtext}>
              Gemini Vision + Groq AI are working on it
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color={colors.error}
            />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => router.replace("/photo-upload")}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : result ? (
          <View style={styles.resultContainer}>
            <Text style={styles.verdict}>{result.styleVerdict}</Text>

            {/* Color tags */}
            {result.colors && result.colors.length > 0 && (
              <View style={styles.colorsContainer}>
                {result.colors.slice(0, 4).map((color, index) => (
                  <View key={index} style={styles.colorPill}>
                    <Text style={styles.colorText}>{color}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.tagsContainer}>
              {result.tags.map((tag, index) => (
                <View key={index} style={styles.tagPill}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Why it works</Text>
              <Text style={styles.cardBody}>{result.reasoning}</Text>
            </View>

            <View style={[styles.card, styles.suggestionCard]}>
              <Text style={styles.cardTitle}>Stylist Tip</Text>
              <Text style={styles.cardBody}>{result.suggestion}</Text>
            </View>

            {result.bodyShapeAdvice && (
              <View style={[styles.card, styles.bodyShapeCard]}>
                <Text style={styles.cardTitle}>For Your Body Shape</Text>
                <Text style={styles.cardBody}>{result.bodyShapeAdvice}</Text>
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>

      {/* Bottom CTA */}
      {!isAnalyzing && !error && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.tryAnotherButton}
            onPress={handleTryAnother}
            activeOpacity={0.85}
          >
            <Text style={styles.tryAnotherText}>Try Another Look</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  saveButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  loadingSubtext: {
    marginTop: spacing.sm,
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.regular,
    color: colors.accent,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
  errorText: {
    marginTop: spacing.md,
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    color: colors.error,
    textAlign: "center",
  },
  retryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: fontSize.button,
    fontWeight: fontWeight.semibold,
  },
  resultContainer: {
    marginTop: spacing.lg,
  },
  verdict: {
    fontSize: fontSize.h1,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  colorsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  colorPill: {
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorText: {
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  tagPill: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  tagText: {
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.medium,
    color: colors.primaryDark,
  },
  card: {
    backgroundColor: colors.backgroundAlt,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  suggestionCard: {
    backgroundColor: colors.secondary,
    borderColor: colors.accent,
    borderLeftWidth: 4,
  },
  bodyShapeCard: {
    backgroundColor: colors.background,
    borderColor: colors.primary,
    borderLeftWidth: 4,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.primaryDark,
    marginBottom: spacing.sm,
  },
  cardBody: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  tryAnotherButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    ...shadows.md,
  },
  tryAnotherText: {
    color: colors.white,
    fontSize: fontSize.button,
    fontWeight: fontWeight.bold,
  },
});
