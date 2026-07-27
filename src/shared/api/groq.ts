// src/shared/api/groq.ts
import Groq from "groq-sdk";

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error(
    "Missing Groq API Key. Check your .env file for EXPO_PUBLIC_GROQ_API_KEY",
  );
}

export const groqClient = new Groq({
  apiKey: GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface StylingContext {
  bodyShape: string;
  occasion: string;
  retrievedRules: string[];
  outfitDescription: string;
}

export async function generateStylingInsight(
  context: StylingContext,
): Promise<string> {
  const systemPrompt = `You are an expert AI personal stylist. 
  Based on the user's body shape, occasion, and retrieved styling rules, explain WHY this specific outfit silhouette works well for them. 
  Keep it encouraging, concise (max 3 sentences), and focused on silhouette/proportion. 
  NEVER mention body weight, size, or numbers. Only use terms like "balanced proportions", "elongation", "waist definition".`;

  const userPrompt = `Body Shape: ${context.bodyShape}
Occasion: ${context.occasion}
Styling Rules: ${context.retrievedRules.join(" | ")}
Outfit: ${context.outfitDescription}

Provide the styling insight:`;

  try {
    const completion = await groqClient.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 150,
    });

    return (
      completion.choices[0]?.message?.content || "Unable to generate insight."
    );
  } catch (error) {
    console.error("Groq API Error:", error);
    throw new Error("Failed to generate styling insight");
  }
}
