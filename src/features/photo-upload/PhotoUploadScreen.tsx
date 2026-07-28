import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  borderRadius,
  colors,
  fontSize,
  fontWeight,
  spacing,
} from "../../constants/theme";
import { uploadUserPhoto } from "../../shared/api/supabase";

// NOTE: token names (colors/spacing/borderRadius/fontSize/fontWeight) match
// your current theme.ts per the handoff doc. If a name differs, adjust the
// import + usages below — everything else is independent of that shape.

export default function PhotoUploadScreen() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow photo library access to continue.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4], // portrait — best fit for full-body VTO
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleContinue = async () => {
    if (!imageUri) return;

    setIsUploading(true);
    try {
      const publicUrl = await uploadUserPhoto(imageUri);
      await AsyncStorage.setItem("userPhotoUrl", publicUrl);
      router.push("/body-shape-quiz");
    } catch (err) {
      Alert.alert(
        "Upload failed",
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add your photo</Text>
      <Text style={styles.subtitle}>
        A full-length, front-facing photo works best for accurate try-on
        results.
      </Text>

      <TouchableOpacity
        style={styles.imagePicker}
        onPress={pickImage}
        activeOpacity={0.85}
        disabled={isUploading}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Tap to choose a photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {imageUri && (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={pickImage}
          disabled={isUploading}
        >
          <Text style={styles.secondaryButtonText}>
            Choose a different photo
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[
          styles.continueButton,
          (!imageUri || isUploading) && styles.continueButtonDisabled,
        ]}
        onPress={handleContinue}
        disabled={!imageUri || isUploading}
        activeOpacity={0.85}
      >
        {isUploading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.continueButtonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: "center",
  },
  title: {
    fontSize: fontSize.h1 ?? 28,
    fontWeight: fontWeight.bold ?? "700",
    color: colors.primaryDark ?? colors.primary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: fontSize.body ?? 16,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  imagePicker: {
    alignSelf: "center",
    width: 240,
    aspectRatio: 3 / 4,
    borderRadius: borderRadius.lg ?? 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  placeholderText: {
    color: colors.primaryDark ?? colors.primary,
    fontSize: fontSize.body ?? 16,
    textAlign: "center",
  },
  secondaryButton: {
    alignSelf: "center",
    marginBottom: spacing.xl,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: fontSize.bodySmall ?? 14,
    textDecorationLine: "underline",
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md ?? 12,
    alignItems: "center",
  },
  continueButtonDisabled: {
    backgroundColor: colors.border,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: fontSize.button ?? 16,
    fontWeight: fontWeight.semiBold ?? "600",
  },
});
