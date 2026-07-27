const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const EMBEDDING_MODEL =
  process.env.EXPO_PUBLIC_EMBEDDING_MODEL || "gemini-embedding-001";

const EMBEDDING_DIMENSIONS = 3072;

export async function getEmbedding(text: string): Promise<number[]> {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing Gemini API Key");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: `models/${EMBEDDING_MODEL}`,
        content: {
          parts: [{ text }],
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini Embedding failed: ${await response.text()}`);
  }

  const data = await response.json();

  const embedding = data.embedding?.values;

  if (!Array.isArray(embedding)) {
    throw new Error("No embedding returned from Gemini.");
  }

  if (embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Expected ${EMBEDDING_DIMENSIONS} dimensions, got ${embedding.length}`,
    );
  }

  return embedding;
}
