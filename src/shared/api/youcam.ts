// src/shared/api/youcam.ts

const YOUCAM_API_KEY = process.env.EXPO_PUBLIC_YOUCAM_API_KEY;
const YOUCAM_BASE_URL = "https://yce-api-01.makeupar.com/s2s/v2.0/task";

export interface VTORequest {
  personImageUrl: string; // URL of the user's uploaded photo
  garmentImageUrl: string; // URL of the clothing item
  category: "upper_body" | "lower_body" | "full_body" | "auto"; // YouCam's exact categories [[30]]
}

export interface VTOResponse {
  success: boolean;
  resultImageUrl?: string;
  error?: string;
}

/**
 * Polls the YouCam API until the task is complete or fails.
 */
async function pollTaskStatus(taskId: string): Promise<string> {
  const maxAttempts = 30; // 30 attempts * 2 seconds = 60 seconds max wait
  const delayMs = 2000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    // Polling endpoint for cloth-v3
    const response = await fetch(`${YOUCAM_BASE_URL}/cloth-v3/${taskId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${YOUCAM_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `YouCam poll failed (${response.status}): ${await response.text()}`,
      );
    }

    const data = await response.json();

    // Check task status
    if (data.data?.task_status === "success") {
      return data.data.results?.url || data.url; // Return the result image URL
    }

    if (data.data?.task_status === "error" || data.data?.error) {
      throw new Error(
        `YouCam task failed: ${data.data.error || "Unknown error"}`,
      );
    }

    console.log(
      `[YouCam] Task ${taskId} still processing... (attempt ${attempt + 1}/${maxAttempts})`,
    );
  }

  throw new Error("YouCam task timed out after 60 seconds");
}

/**
 * Initiates an Apparel Virtual Try-On task and polls for the result.
 */
export async function requestVirtualTryOn(
  request: VTORequest,
): Promise<VTOResponse> {
  if (!YOUCAM_API_KEY) {
    return { success: false, error: "Missing YOUCAM_API_KEY in .env" };
  }

  try {
    console.log("[YouCam] Initiating Apparel VTO task...");

    // Step 1: Create the task using the official cloth-v3 endpoint [[30]]
    const createResponse = await fetch(`${YOUCAM_BASE_URL}/cloth-v3`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${YOUCAM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        src_file_url: request.personImageUrl,
        ref_file_url: request.garmentImageUrl,
        garment_category: request.category,
      }),
    });

    if (!createResponse.ok) {
      throw new Error(
        `YouCam create task failed (${createResponse.status}): ${await createResponse.text()}`,
      );
    }

    const createData = await createResponse.json();
    const taskId = createData.data?.task_id;

    if (!taskId) {
      throw new Error("No task_id returned from YouCam API");
    }

    console.log(`[YouCam] Task created successfully. Task ID: ${taskId}`);

    // Step 2: Poll for the result
    const resultUrl = await pollTaskStatus(taskId);

    return {
      success: true,
      resultImageUrl: resultUrl,
    };
  } catch (error) {
    console.error("YouCam API Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown YouCam error",
    };
  }
}
