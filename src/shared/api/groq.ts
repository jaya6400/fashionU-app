const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error("EXPO_PUBLIC_GROQ_API_KEY is not defined in .env");
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

interface StylingInsight {
  styleVerdict: string;
  reasoning: string;
  tags: string[];
  suggestion: string;
  bodyShapeAdvice?: string;
}

/**
 * Generate AI styling insights using Groq (Llama 3.3 70B)
 * This is the primary model for live insight generation
 */
export async function generateStylingInsight(
  outfitDescription: string,
  bodyShape?: string,
  occasion?: string,
): Promise<StylingInsight> {
  try {
    const systemPrompt = `You are an expert fashion stylist providing personalized, positive, and confidence-building advice.
    
IMPORTANT RULES:
- NEVER reference body size/weight (no "slim/fat/plus-size" language)
- If body shape is provided, use it to give silhouette advice (hourglass, rectangle, triangle/pear, inverted triangle, oval)
- Always frame advice positively - never say "doesn't suit you"
- Focus on what WORKS and why
- Be specific about colors, proportions, and styling details
- Ground every claim in the actual fit/silhouette details given in the
  outfit description below (neckline, waist, sleeve, length, cut) — do
  NOT default to generic praise like "this flatters your figure" or
  "looks great on you" without tying it to a specific garment detail
- Keep tone warm, encouraging, and editorial (like a fashion magazine)`;

    const userPrompt = `Analyze this outfit and provide styling insights:

Outfit: ${outfitDescription}
${bodyShape ? `Body Shape: ${bodyShape}` : ""}
${occasion ? `Occasion: ${occasion}` : ""}

Provide your analysis in this exact JSON format:
{
  "styleVerdict": "A 2-3 word style category (e.g., 'Effortlessly Chic', 'Bold & Confident')",
  "reasoning": "2-3 sentences explaining why this outfit works, focusing on colors, proportions, and silhouette",
  "tags": ["3-4 style tags as array"],
  "suggestion": "One specific styling tip to elevate this look",
  ${bodyShape ? `"bodyShapeAdvice": "Specific advice for ${bodyShape} body shape regarding this silhouette"` : ""}
}`;

    console.log(
      "[Groq] Calling llama-3.3-70b-versatile for styling insight...",
    );

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from Groq API");
    }

    const parsed: StylingInsight = JSON.parse(content);
    console.log("[Groq] Success — verdict:", parsed.styleVerdict);
    return parsed;
  } catch (error) {
    console.error("Groq styling insight error:", error);
    throw error;
  }
}

/**
 * Fallback to Gemini Flash-Lite if Groq rate-limits
 */
export async function generateStylingInsightFallback(
  outfitDescription: string,
  bodyShape?: string,
  occasion?: string,
): Promise<StylingInsight> {
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(API_KEY!);

    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
    });

    const prompt = `You are an expert fashion stylist. Analyze this outfit:

Outfit: ${outfitDescription}
${bodyShape ? `Body Shape: ${bodyShape}` : ""}
${occasion ? `Occasion: ${occasion}` : ""}

Provide JSON with: styleVerdict (2-3 words), reasoning (2-3 sentences), tags (array of 3-4), suggestion (one tip).
Use positive, confidence-building language. Never mention body size/weight.
Ground the reasoning in the specific fit/silhouette details above (neckline,
waist, sleeve, length, cut) rather than generic praise.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in Gemini response");
    }

    const parsed: StylingInsight = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error("Gemini fallback error:", error);
    throw new Error("Failed to generate styling insights");
  }
}

/**
 * Main function with automatic fallback
 */
export async function generateStylingInsightWithFallback(
  outfitDescription: string,
  bodyShape?: string,
  occasion?: string,
): Promise<StylingInsight> {
  try {
    return await generateStylingInsight(outfitDescription, bodyShape, occasion);
  } catch (groqError) {
    console.warn("Groq failed, falling back to Gemini:", groqError);
    return await generateStylingInsightFallback(
      outfitDescription,
      bodyShape,
      occasion,
    );
  }
}
