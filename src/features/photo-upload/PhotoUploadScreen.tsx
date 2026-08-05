import {
  borderRadius,
  colors,
  fontSize,
  fontWeight,
  shadows,
  spacing,
} from "@/constants/theme";
import ScreenHeader from "@/shared/components/ScreenHeader";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PhotoUploadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Gentle glow pulse once a photo is selected
  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!imageUri) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [imageUri, glow]);

  const glowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.4],
  });
  const glowRadius = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 14],
  });
  const glowBorder = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.secondary, colors.primary],
  });

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to let you upload photos.",
      );
      return false;
    }
    return true;
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera permissions to take a new photo.",
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleContinue = () => {
    if (!imageUri) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      router.push({
        pathname: "/outfit-browse",
        params: { imageUri: encodeURIComponent(imageUri) },
      });
    }, 800);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Upload Photo" />
      <View
        style={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}
      >
        <Animated.View
          style={[
            styles.previewBase,
            imageUri
              ? {
                  borderWidth: 2,
                  borderColor: glowBorder,
                  shadowColor: colors.primary,
                  shadowOpacity: glowOpacity,
                  shadowRadius: glowRadius,
                  shadowOffset: { width: 0, height: 0 },
                  elevation: 6,
                }
              : styles.previewEmpty,
          ]}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="image-outline" size={64} color={colors.accent} />
              <Text style={styles.placeholderText}>No photo selected yet</Text>
              <Text style={styles.placeholderSubtext}>
                Upload a clear, well-lit photo for the best AI results
              </Text>
            </View>
          )}
        </Animated.View>

        <View>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={takePhoto}
            >
              <Ionicons name="camera" size={20} color={colors.primaryDark} />
              <Text style={styles.secondaryButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={pickImage}
            >
              <Ionicons
                name="images"
                size={18}
                color={colors.white}
                style={{ transform: [{ translateX: +6 }] }}
              />
              <Text style={styles.primaryButtonText}>Upload from Device</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.continueButton,
              !imageUri ? styles.disabledButton : null,
            ]}
            onPress={handleContinue}
            disabled={!imageUri || isProcessing}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>
              {isProcessing ? "Preparing..." : "Analyze Outfit"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    justifyContent: "space-between",
  },
  previewBase: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginVertical: spacing.xl,
  },
  previewEmpty: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  previewImage: { width: "100%", height: "100%", resizeMode: "cover" },
  placeholderContainer: { alignItems: "center", paddingHorizontal: spacing.xl },
  placeholderText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.primaryDark,
    marginTop: spacing.md,
  },
  placeholderSubtext: {
    fontSize: fontSize.bodySmall,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    ...shadows.sm,
    borderWidth: 1,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fontSize.button,
    fontWeight: fontWeight.semibold,
    textAlign: "center",
    flexShrink: 1,
    marginRight: 10,
  },
  secondaryButtonText: {
    color: colors.primaryDark,
    fontSize: fontSize.button,
    fontWeight: fontWeight.semibold,
    textAlign: "center",
    flexShrink: 1,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    ...shadows.md,
  },
  disabledButton: { backgroundColor: colors.border, ...shadows.sm },
  continueButtonText: {
    color: colors.white,
    fontSize: fontSize.button,
    fontWeight: fontWeight.bold,
  },
});
