import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("EXPO_PUBLIC_GEMINI_API_KEY is not defined in .env");
}

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Generate embeddings for text using Gemini gemini-embedding-001
 * Used for semantic search in Supabase pgvector
 */
const EMBEDDING_MODEL =
  process.env.EXPO_PUBLIC_EMBEDDING_MODEL || "gemini-embedding-001";

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    const result = await model.embedContent({
      content: { parts: [{ text }], role: "user" },
      taskType: TaskType.RETRIEVAL_DOCUMENT,
    });
    const embedding = result.embedding.values;

    if (!embedding) {
      throw new Error("No embedding returned from Gemini API");
    }

    return embedding;
  } catch (error) {
    console.error("Gemini embedding error:", error);
    throw new Error("Failed to generate embedding");
  }
}

/**
 * Analyze outfit image and extract styling attributes
 * Using Gemini Vision for image understanding
 */
export async function analyzeOutfitImage(imageUri: string): Promise<{
  description: string;
  colors: string[];
  style: string;
  occasion: string[];
}> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    // Convert image URI to base64 for Gemini Vision.
    // IMPORTANT: fetch().blob() + FileReader is unreliable for local file://
    // URIs in RN (see AGENTS.md gotchas) and is the likely cause of
    // intermittent hangs/timeouts on the no-garment (raw photo) path.
    // Local files -> expo-file-system/legacy. Remote https:// (VTO result
    // URLs) -> fetch+blob is fine, that path was already confirmed working.
    let imageData: string;
    if (imageUri.startsWith("file://")) {
      const { readAsStringAsync, EncodingType } =
        await import("expo-file-system/legacy");
      imageData = await readAsStringAsync(imageUri, {
        encoding: EncodingType.Base64,
      });
    } else {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      imageData = base64.split(",")[1]; // strip data:image/...;base64, prefix
    }

    const prompt = `Analyze this outfit image and provide:
    1. A detailed description of the clothing items, INCLUDING fit and
       silhouette specifics: neckline shape, waist definition (cinched,
       loose, dropped), sleeve length and volume, garment length, and
       overall cut (fitted, relaxed, structured, flowy). These fit
       details are essential — a downstream stylist uses them to give
       body-shape-specific advice, so be concrete rather than generic
       (e.g. "V-neck with a fitted waist and wide-leg trouser" rather
       than "a nice top and pants").
    2. The dominant colors
    3. The overall style (e.g., casual, formal, bohemian, minimalist)
    4. Suitable occasions
    
    Return as JSON with keys: description, colors (array), style, occasion (array)`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageData,
          mimeType: "image/jpeg",
        },
      },
      prompt,
    ]);

    const candidate = result.response.candidates?.[0];
    console.log("Finish reason:", candidate?.finishReason);
    console.log(
      "Prompt feedback:",
      JSON.stringify(result.response.promptFeedback),
    );

    const responseText = result.response.text();
    console.log("Raw response text:", JSON.stringify(responseText));

    if (!responseText || responseText.trim().length === 0) {
      throw new Error(
        `Empty response from Gemini. Finish reason: ${candidate?.finishReason ?? "unknown"}`,
      );
    }

    const cleaned = responseText.replace(/```json\s*|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      description: parsed.description,
      colors: parsed.colors,
      style: parsed.style,
      occasion: parsed.occasion,
    };
  } catch (error) {
    console.error("Gemini Vision analysis error:", error);
    throw new Error("Failed to analyze outfit image");
  }
}
