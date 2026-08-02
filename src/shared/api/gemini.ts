import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("EXPO_PUBLIC_GEMINI_API_KEY is not defined in .env");
}

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Generate embeddings for text using Gemini text-embedding-004
 * Used for semantic search in Supabase pgvector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
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
      model: "gemini-1.5-flash-latest",
    });

    // Convert image URI to base64 for Gemini Vision
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    const imageData = base64.split(",")[1]; // Remove data:image/...;base64, prefix

    const prompt = `Analyze this outfit image and provide:
    1. A detailed description of the clothing items
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

    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

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
