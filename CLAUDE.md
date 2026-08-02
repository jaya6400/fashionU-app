# Claude Code / AI Agent Instructions

This file is Claude-specific context that supplements AGENTS.md.
**Read AGENTS.md first** — it has the authoritative product rules,
tech stack, schema, and current status. This file only adds
Claude-specific working notes.

## Session conventions

- This project is under active hackathon development with a hard
  deadline of Aug 17, 2026. Prioritize working code over ideal
  architecture. Flag tech debt in comments rather than blocking on it.
- Before touching any third-party API client (`gemini.ts`, `groq.ts`,
  `supabase.ts`, `youcam.ts`), check AGENTS.md's "Verified
  integrations" and "Known SDK 54 gotchas" sections first — several
  bugs in this project came from assuming stale API/SDK behavior
  instead of checking current docs.
- When a model name, API endpoint, or library version is uncertain,
  search for current info rather than relying on training data. This
  project has hit multiple issues from outdated assumptions (Gemini
  model naming, expo-file-system SDK 54 restructuring, YouCam API
  version differences).
- Don't assume a fix is correct without the person confirming a real
  run — this project's bugs have repeatedly been in the gap between
  "looks right" and "actually tested," especially around async
  AsyncStorage timing, RN's fetch/blob bridge, and third-party API
  auth schemes.

## Testing conventions

- Standalone API testing (outside the RN app) uses
  `src/shared/api/test-apis.ts`, run via `npx tsx src/shared/api/test-apis.ts`
  — NOT plain `node`, which has stricter ESM resolution than this
  project's import style assumes.
- In-app debugging relies heavily on `console.log` at data-flow
  boundaries (AsyncStorage reads, API response bodies before parsing,
  route param resolution) — this has been the most reliable way to
  isolate bugs in this codebase so far, more than guessing from error
  messages alone.

## Things NOT to re-litigate

- `ImagePicker.MediaTypeOptions.Images` shows a deprecation warning
  but works — confirmed via direct testing. Don't "fix" this again.
- `expo-file-system/legacy` is the correct import for
  `readAsStringAsync`/`EncodingType` in SDK 54 — this is Expo's
  intended migration path, not a workaround to revisit.
- YouCam's `cloth-v3` endpoint (`s2s/v2.0/task/cloth-v3`) is confirmed
  correct for this account/API key via a live successful test run
  with a real task_id and result image. Don't second-guess this
  against documentation that may describe a different API version.

## Open questions for the person, not to be assumed

- Garment catalogue approach (hardcoded placeholder vs. deferred)
- Whether VTO result images get re-hosted to Supabase Storage before
  persisting to `saved_looks` (needed — presigned URLs expire in ~2hrs)
- Default `category` value for YouCam requests when not derivable
  from garment metadata
