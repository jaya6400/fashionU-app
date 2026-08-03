import { analyzeOutfitImage, generateEmbedding } from "@/shared/api/gemini";
import { generateStylingInsightWithFallback } from "@/shared/api/groq";
import { saveLook } from "@/shared/api/supabase";

export interface AnalysisResult {
  styleVerdict: string;
  reasoning: string;
  tags: string[];
  suggestion: string;
  bodyShapeAdvice?: string;
  outfitDescription: string;
  colors: string[];
  embedding: number[];
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
    const imageAnalysis = await analyzeOutfitImage(imageUri);
    const embedding = await generateEmbedding(imageAnalysis.description);

    const stylingInsight = await generateStylingInsightWithFallback(
      imageAnalysis.description,
      options?.bodyShape,
      options?.occasion,
    );

    if (options?.saveToDatabase) {
      await saveLook({
        outfitId: Date.now().toString(),
        vtoImageUrl: imageUri,
        stylingInsight: imageAnalysis.description,
        embedding,
        bodyShape: options.bodyShape,
        occasion: options.occasion,
      });
    }

    return {
      ...stylingInsight,
      outfitDescription: imageAnalysis.description,
      colors: imageAnalysis.colors,
      embedding,
    };
  } catch (error) {
    console.error("AI analysis pipeline error:", error);
    throw new Error("Failed to analyze outfit. Please try again.");
  }
}
