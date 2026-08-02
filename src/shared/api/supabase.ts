import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase credentials not defined in .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Save a styled look to Supabase with embedding for semantic search
 */
export async function saveLook({
  outfitId,
  vtoImageUrl,
  stylingInsight,
  embedding,
  bodyShape,
  occasion,
}: {
  outfitId: string;
  vtoImageUrl?: string;
  stylingInsight: string;
  embedding: number[];
  bodyShape?: string;
  occasion?: string;
}) {
  const { data, error } = await supabase
    .from("saved_looks")
    .insert({
      outfit_id: outfitId,
      vto_image_url: vtoImageUrl,
      styling_insight: stylingInsight,
      embedding,
      body_shape: bodyShape,
      occasion,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase save error:", error);
    throw error;
  }

  return data;
}

/**
 * Find similar looks using pgvector cosine similarity
 */
export async function findSimilarLooks(embedding: number[], limit: number = 5) {
  const { data, error } = await supabase.rpc("match_saved_looks", {
    query_embedding: embedding,
    match_count: limit,
  });

  if (error) {
    console.error("Supabase similarity search error:", error);
    throw error;
  }

  return data;
}

/**
 * Get styling rules from database based on body shape and occasion
 */
export async function getStylingRules({
  bodyShape,
  occasion,
}: {
  bodyShape?: string;
  occasion?: string;
}) {
  let query = supabase.from("styling_rules").select("*");

  if (bodyShape) {
    query = query.eq("body_shape", bodyShape);
  }

  if (occasion) {
    query = query.eq("occasion", occasion);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase styling rules error:", error);
    throw error;
  }

  return data;
}
