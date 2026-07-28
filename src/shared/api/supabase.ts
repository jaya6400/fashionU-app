import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Type definitions for your tables
export interface StylingRule {
  id: string;
  body_shape:
    | "hourglass"
    | "rectangle"
    | "triangle"
    | "inverted_triangle"
    | "oval";
  occasion: string;
  category: string;
  rule_text: string;
  embedding?: number[];
  created_at: string;
}

export interface SavedLook {
  id: string;
  outfit_id: string;
  body_shape: string;
  occasion: string;
  vto_image_url?: string;
  styling_insight?: string;
  embedding?: number[];
  created_at: string;
}

// Helper: vector similarity search
export async function searchStylingRules(
  queryEmbedding: number[],
  bodyShape: string,
  occasion: string,
  limit = 5,
) {
  const { data, error } = await supabase.rpc("match_styling_rules", {
    query_embedding: queryEmbedding,
    match_body_shape: bodyShape,
    match_occasion: occasion,
    match_count: limit,
  });

  if (error) throw error;
  return data as StylingRule[];
}

// Save a favorited look
export async function saveLook(look: Omit<SavedLook, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("saved_looks")
    .insert([look])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get user's saved looks
export async function getSavedLooks(limit = 20) {
  const { data, error } = await supabase
    .from("saved_looks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as SavedLook[];
}

/**
 * Uploads a local image URI (from expo-image-picker) to the `user-photos`
 * bucket and returns a public URL. YouCam's task API requires a publicly
 * reachable src_file_url, so this step is required before any VTO call.
 */
export async function uploadUserPhoto(fileUri: string): Promise<string> {
  // Convert local file URI -> blob (RN fetch supports file:// URIs directly)
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const extension = fileUri.split(".").pop()?.toLowerCase() ?? "jpg";
  const contentType = extension === "png" ? "image/png" : "image/jpeg";
  const fileName = `photo_${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("user-photos")
    .upload(fileName, blob, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Photo upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from("user-photos").getPublicUrl(fileName);

  if (!data?.publicUrl) {
    throw new Error("Upload succeeded but no public URL was returned.");
  }

  return data.publicUrl;
}
