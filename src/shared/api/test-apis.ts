import "dotenv/config";
import { generateEmbedding } from "./gemini";
import { generateStylingInsight } from "./groq";
import { requestVirtualTryOn } from "./youcam";

async function test() {
  console.log("1. Testing Gemini Embedding...");
  try {
    const vector = await generateEmbedding(
      "A fitted casual top for an hourglass body shape",
    );
    console.log(`✅ Success! Got vector of length: ${vector.length}`);
  } catch (e) {
    console.error("❌ Gemini Embedding failed:", e);
  }

  console.log("\n2. Testing Groq Styling Insight...");
  try {
    // generateStylingInsight expects a pre-built prompt string, not an object.
    // (aiService.ts handles converting the context object into a prompt string)
    const testPrompt = `
      You are an expert fashion stylist. Provide a positive, confidence-framed styling insight based on the following:
      Body Shape: hourglass
      Occasion: casual
      Rules: Fitted tops emphasize balanced proportions.
      Outfit: A tucked-in fitted crewneck t-shirt with high-waisted jeans.
      
      Output your reasoning, a styling tip, and a short verdict.
    `;
    const insight = await generateStylingInsight(testPrompt);

    // Convert to string safely to bypass TS inference quirks, then truncate
    const insightStr = String(insight ?? "");
    const preview =
      insightStr.length > 150
        ? insightStr.substring(0, 150) + "..."
        : insightStr;
    console.log(`✅ Success! Insight preview:`, preview);
  } catch (e) {
    console.error("❌ Groq Insight failed:", e);
  }

  console.log("\n3. Testing YouCam VTO...");
  try {
    const vtoResult = await requestVirtualTryOn({
      personImageUrl:
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500", // Sample public image
      garmentImageUrl:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500", // Sample public image
      category: "upper_body",
    });
    if (vtoResult.success) {
      console.log(
        `✅ Success! VTO Result URL received:`,
        Boolean(vtoResult.resultImageUrl),
      );
    } else {
      console.log(
        `⚠️ YouCam returned an error (this is normal if keys/endpoints/credits need tweaking):`,
        vtoResult.error,
      );
    }
  } catch (e) {
    console.error("❌ YouCam test crashed:", e);
  }
}

// Execute the test
test();
