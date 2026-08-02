import { analyzeOutfitImage, generateEmbedding } from "@/api/gemini";
import { generateStylingInsightWithFallback } from "@/api/groq";
import { saveLook } from "@/api/supabase";

export interface AnalysisResult {
  styleVerdict: string;
  reasoning: string;
  tags: string[];
  suggestion: string;
  bodyShapeAdvice?: string;
  outfitDescription: string;
  colors: string[];
}

/**
 * Complete outfit analysis pipeline:
 * 1. Analyze image with Gemini Vision
 * 2. Generate embeddings for semantic search
 * 3. Get styling insights from Groq (with Gemini fallback)
 * 4. Optionally save to Supabase
 */
export async function analyzeOutfit(
  imageUri: string,
  options?: {
    bodyShape?: string;
    occasion?: string;
    saveToDatabase?: boolean;
  },
): Promise<AnalysisResult> {
  try {
    // Step 1: Analyze image with Gemini Vision
    const imageAnalysis = await analyzeOutfitImage(imageUri);

    // Step 2: Generate embedding for the outfit description
    const embedding = await generateEmbedding(imageAnalysis.description);

    // Step 3: Generate styling insights using Groq (with fallback)
    const stylingInsight = await generateStylingInsightWithFallback(
      imageAnalysis.description,
      options?.bodyShape,
      options?.occasion,
    );

    // Step 4: Optionally save to Supabase
    if (options?.saveToDatabase) {
      await saveLook({
        imageUri,
        description: imageAnalysis.description,
        embedding,
        bodyShape: options.bodyShape,
        occasion: options.occasion,
      });
    }

    return {
      ...stylingInsight,
      outfitDescription: imageAnalysis.description,
      colors: imageAnalysis.colors,
    };
  } catch (error) {
    console.error("AI analysis pipeline error:", error);
    throw new Error("Failed to analyze outfit. Please try again.");
  }
}
