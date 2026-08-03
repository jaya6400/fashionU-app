import { createClient } from "@supabase/supabase-js";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";

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

/**
 * Uploads a local photo to the public `user-photos` Supabase Storage bucket
 * and returns a publicly reachable URL — required by YouCam's src_file_url,
 * since it can't reach local file:// paths.
 */
export async function uploadPhotoToStorage(localUri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const fileExt = localUri.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const contentType = fileExt === "png" ? "image/png" : "image/jpeg";

    const { error: uploadError } = await supabase.storage
      .from("user-photos")
      .upload(fileName, decode(base64), {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("user-photos")
      .getPublicUrl(fileName);

    if (!data?.publicUrl) {
      throw new Error("Failed to get public URL for uploaded photo");
    }

    return data.publicUrl;
  } catch (error) {
    console.error("Photo upload error:", error);
    throw new Error("Failed to upload photo to storage");
  }
}

/**
 * Downloads a remote image (e.g. a presigned, expiring YouCam VTO
 * result URL) and re-uploads it into the public `user-photos` bucket
 * so it has a stable, non-expiring URL before being persisted.
 */
export async function rehostImageToStorage(remoteUrl: string): Promise<string> {
  try {
    const response = await fetch(remoteUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch remote image: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();

    const fileName = `vto-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("user-photos")
      .upload(fileName, arrayBuffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Rehost upload error:", uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("user-photos")
      .getPublicUrl(fileName);
    if (!data?.publicUrl) {
      throw new Error("Failed to get public URL for rehosted VTO result");
    }

    return data.publicUrl;
  } catch (error) {
    console.error("Rehost image error:", error);
    throw new Error("Failed to rehost VTO result image");
  }
}
