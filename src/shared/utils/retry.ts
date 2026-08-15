// src/shared/utils/retry.ts
//
// Retries a transient failure (429 rate-limit, 503 service-unavailable)
// with exponential backoff + jitter. Used to smooth over Gemini/Groq
// hiccups so the user gets a real result after a short wait instead of
// an immediate error.
//
// This does NOT retry on other errors (bad request, auth failure, parse
// error, etc.) — those are real bugs and should surface immediately
// rather than silently retrying 3 times before failing anyway.

interface RetryOptions {
  retries?: number; // max retry attempts, not counting the first try
  baseDelayMs?: number; // starting delay, doubles each attempt
  maxDelayMs?: number; // cap so a demo doesn't hang indefinitely
  isRetryable?: (error: unknown) => boolean;
  onRetry?: (attempt: number, delayMs: number, error: unknown) => void;
}

const DEFAULT_RETRYABLE_STATUSES = [429, 503];

/**
 * Best-effort extraction of an HTTP status code from very different
 * error shapes: a raw fetch Response, a thrown Error with a numeric
 * `.status`/`.code`, or a Google SDK error whose message embeds the
 * status text (e.g. "[503 Service Unavailable]").
 */
function extractStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") return null;
  const anyErr = error as Record<string, unknown>;

  if (typeof anyErr.status === "number") return anyErr.status;
  if (typeof anyErr.code === "number") return anyErr.code;

  const message =
    typeof anyErr.message === "string" ? anyErr.message : String(error);
  const match = message.match(/\b(429|503)\b/);
  return match ? parseInt(match[1], 10) : null;
}

function defaultIsRetryable(error: unknown): boolean {
  const status = extractStatus(error);
  return status !== null && DEFAULT_RETRYABLE_STATUSES.includes(status);
}

/**
 * Attempts to read a Retry-After header (seconds or HTTP-date) off a
 * fetch Response, if the caller's error carries one. Falls back to null
 * if not present/parseable — caller uses exponential backoff instead.
 */
export function retryAfterMsFromResponse(response: Response): number | null {
  const header = response.headers?.get?.("retry-after");
  if (!header) return null;
  const seconds = Number(header);
  if (!Number.isNaN(seconds)) return seconds * 1000;
  const dateMs = Date.parse(header);
  return Number.isNaN(dateMs) ? null : Math.max(0, dateMs - Date.now());
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    retries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 8000,
    isRetryable = defaultIsRetryable,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const isLastAttempt = attempt === retries;
      if (isLastAttempt || !isRetryable(error)) {
        throw error;
      }

      const jitter = Math.random() * 250;
      const delayMs = Math.min(baseDelayMs * 2 ** attempt + jitter, maxDelayMs);

      onRetry?.(attempt + 1, delayMs, error);
      await sleep(delayMs);
    }
  }

  // Unreachable, but keeps TS satisfied.
  throw lastError;
}
