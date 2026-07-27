// test-apis.ts
import "dotenv/config";
import { getEmbedding } from "./gemini";
import { generateStylingInsight } from "./groq";
import { requestVirtualTryOn } from "./youcam";

async function test() {
  console.log("1. Testing Gemini Embedding...");
  const vector = await getEmbedding(
    "A fitted casual top for an hourglass body shape",
  );
  console.log(`✅ Success! Got vector of length: ${vector.length}`);

  console.log("\n2. Testing Groq Styling Insight...");
  const insight = await generateStylingInsight({
    bodyShape: "hourglass",
    occasion: "casual",
    retrievedRules: ["Fitted tops emphasize balanced proportions."],
    outfitDescription:
      "A tucked-in fitted crewneck t-shirt with high-waisted jeans",
  });
  console.log(`✅ Success! Insight: ${insight}`);

  // Add this to the bottom of test-apis.ts
  console.log("\n4. Testing YouCam VTO...");
  try {
    const vtoResult = await requestVirtualTryOn({
      personImageUrl:
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500", // Sample public image
      garmentImageUrl:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500", // Sample public image
      category: "upper_body",
    });
    if (vtoResult.success) {
      console.log(`✅ Success! VTO Result:`, vtoResult);
    } else {
      console.log(
        `⚠️ YouCam returned an error (this is normal if keys/endpoints need tweaking):`,
        vtoResult.error,
      );
    }
  } catch (e) {
    console.error("❌ YouCam test crashed:", e);
  }
}

test().catch(console.error);
