# Project: Fashion Decision Assistant (YouCam Hackathon)

## What this is

AI-powered styling decision assistant — NOT a virtual try-on demo wrapper.
Core value: reduce purchase uncertainty by comparing outfit options with
styling insight text, not just rendering VTO images.

Deadline: 17 August. Built with React Native + Expo (SDK 54), TypeScript,
Expo Router.

## Non-negotiable product rules

- NEVER reference body size/weight (no "slim/fat/plus-size" language).
  Use body SHAPE categories only: hourglass, rectangle, triangle/pear,
  inverted triangle, oval. These are proportion-based, self-reported by
  the user via a short quiz — never inferred from photos.
- All styling copy must be positive/confidence-framed. Never say
  "doesn't suit you" — say what silhouette works better and why.
- The styling-insight comparison screen is the core differentiator.
  Prioritize its quality over outfit catalogue breadth.

## Tech stack

- Expo (SDK 54), Expo Router, TypeScript (strict mode)
- State: Zustand (add only once core flow works — don't over-engineer early)
- Data fetching: TanStack Query
- Backend: Supabase (Postgres + pgvector extension enabled)
- Storage: Supabase Storage (`user-photos` bucket, public) — required
  because YouCam's src_file_url must be a publicly reachable URL; local
  file:// URIs are uploaded here first to get a public link
- Styling AI: Gemini `gemini-embedding-001` (3072-dim, matches Supabase
  pgvector column) for embeddings, Groq (llama-3.3-70b-versatile) for
  live insight text generation, Gemini `gemini-3.5-flash` for Vision
  analysis (with `responseMimeType: "application/json"` forced — this
  model wraps JSON in markdown fences otherwise) and as Groq fallback
- VTO: YouCam API (Apparel VTO via `s2s/v2.0/task/cloth-v3` — CONFIRMED
  working via live test, see Verified Integrations below) + Skin AI
  (not yet integrated)
- No auth system — local state + AsyncStorage only, this is a hackathon MVP

## Verified integrations (as of Aug 2, 2026)

- ✅ Gemini Vision image analysis — working, JSON mode forced
- ✅ Gemini embeddings (gemini-embedding-001, 3072-dim) — working
- ✅ Groq styling insight generation — working
- ✅ Supabase saved_looks insert — working (see real schema below)
- ✅ Supabase Storage upload → public URL — working, verified reachable
- ✅ YouCam Apparel VTO (cloth-v3) — working, confirmed via standalone
  test script (`npx tsx src/shared/api/test-apis.ts`). Auth is a direct
  API key as Bearer token (v2 API, no token exchange needed).
- ⚠️ YouCam result images are presigned S3 URLs, ~2hr expiry
  (X-Amz-Expires=7200) — must be re-hosted to Supabase Storage before
  persisting long-term, or saved looks will show broken images later.
  NOT YET HANDLED.
- ❌ YouCam not yet wired into the UI/screen flow (client exists in
  `youcam.ts`, unused elsewhere)
- ❌ No garment/outfit catalogue exists yet — needed as source for
  `garmentImageUrl` before VTO can run end-to-end in the app

## Known SDK 54 gotchas (do not re-debug these)

- **expo-file-system**: `readAsStringAsync`/`EncodingType`/etc. moved
  out of the package root in SDK 54. Import from
  `expo-file-system/legacy`, not `expo-file-system`.
- **ImagePicker.MediaTypeOptions.Images**: shows a deprecation warning
  but works fine — verified via testing, do NOT omit it based on
  warning text alone (earlier assumption in this file was wrong).
- **RN `fetch().blob()` + FileReader**: unreliable for local `file://`
  URIs (RN's blob bridge). Use `expo-file-system/legacy`'s
  `readAsStringAsync` with base64 encoding instead, wherever a local
  file needs to become base64 or binary data.
- **`crypto.randomUUID()`**: not a global in RN/Hermes. Use
  `expo-crypto`'s `Crypto.randomUUID()`.
- **gemini-3.5-flash**: does not reliably return clean JSON from prompt
  instructions alone — wraps output in markdown fences. Always set
  `generationConfig: { responseMimeType: "application/json" }` and
  strip fences defensively as a backup.

## Folder structure (feature-based, keep this pattern)

src/
app/ <- Expo Router routes (thin re-export stubs)
features/
landing/ LandingScreen.tsx
body-shape-quiz/ BodyShapeQuizScreen.tsx — writes "userBodyShape" to AsyncStorage
occasion-selection/ OccasionSelectionScreen.tsx — writes "userOccasion" to AsyncStorage
photo-upload/ PhotoUploadScreen.tsx — has useFocusEffect guard requiring
both AsyncStorage keys before allowing entry
analysis/ AnalysisScreen.tsx — reads both keys back, runs AI pipeline
outfit-browse/ NOT YET BUILT
vto-comparison/ NOT YET BUILT
favorites/ NOT YET BUILT
shared/
api/
gemini.ts Vision analysis + embeddings
groq.ts Styling insight generation + fallback
supabase.ts DB client, saveLook(), uploadPhotoToStorage()
youcam.ts Apparel VTO client — built, NOT wired into UI yet
components/
constants/
theme.ts <- Country Garden palette, Muli font tokens
services/
aiService.ts <- Orchestrates the AI pipeline

## Design tokens (do not invent new colors — use these)

Primary: #723380 (deep plum)
Primary dk: #5C3364
Secondary: #DBD4FE (lavender)
Accent: #808135 (olive)
Background: #FDFDFD / #FFFFE3 (cream variant)
Border/disabled: #B0ACA3
Text secondary: #726164
Font: Muli (via @expo-google-fonts/muli)

## Environment variables (see .env, never hardcode keys)

EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_GEMINI_API_KEY
EXPO_PUBLIC_GROQ_API_KEY
EXPO_PUBLIC_YOUCAM_API_KEY
EXPO_PUBLIC_EMBEDDING_MODEL=gemini-embedding-001

## Data model (Supabase, pgvector enabled) — ACTUAL schema, verified

**styling_rules**: id, body_shape (CHECK constrained enum), occasion,
category, rule_text, embedding vector(3072), created_at

**saved_looks**: id, outfit_id (TEXT NOT NULL), body_shape (TEXT,
nullable), occasion (TEXT NOT NULL), vto_image_url, styling_insight,
embedding vector(3072), created_at

Note: `saved_looks` columns are NOT `image_uri`/`description` — that
was an early mismatch between the schema and `saveLook()`, now fixed.
`match_saved_looks` RPC referenced in `supabase.ts`'s
`findSimilarLooks()` does NOT exist yet — only `match_styling_rules`
was migrated. Will error if called before that migration is written.

**Storage**: `user-photos` bucket, public read/insert (intentionally
open, no auth in MVP scope).

## Onboarding flow (enforced via guard, not just UI ordering)

Landing → Body Shape Quiz → Occasion Selection → Photo Upload → Analysis

`PhotoUploadScreen` has a `useFocusEffect` guard that checks both
AsyncStorage keys on every focus (not just mount) and redirects back
to whichever step is missing. This covers deep links, killed/relaunched
sessions, and "Try Another Look" navigating straight back to
photo-upload.

## Working agreements for coding agents

- Build vertical slices, not isolated screens: photo upload -> YouCam
  VTO call -> result display was the first slice: extend from there.
- Don't add libraries beyond the stack above without flagging it.
- Don't build features not listed in Core User Journey below.
- Ask before generating placeholder/mock styling content that could
  read as real fashion advice — flag TODOs instead.
- When touching AI API clients, verify current model names/params via
  web search before assuming — model naming (Gemini especially) has
  moved multiple times during this project already.

## Core user journey (build in this order)

1. ✅ Onboarding + full-body photo upload
2. ✅ Body shape quiz (self-report, not photo-inferred)
3. ✅ Occasion + style selection
4. ⚠️ Outfit browsing -> YouCam Apparel VTO per outfit — YouCam client
   works standalone, needs: (a) minimal garment catalogue, (b) wiring
   into AnalysisScreen before the styling-insight step, (c) analysis
   should run on the VTO _result_ image, not the raw upload
5. ✅ Comparison screen with Gemini/Groq-generated styling insight text
   (currently runs on raw upload — needs updating per #4)
6. ⚠️ Save favorite looks (local + Supabase) — saveLook() works, but
   VTO result URL expiry (see above) not yet handled for persistence

## Next session (Aug 3, 2026) — pick up here

1. Decide: hardcoded 3-4 outfit garment catalogue vs. skip VTO wiring
   for now and prove the rest of the loop first
2. Confirm `category` param default for `requestVirtualTryOn` — leaning
   "auto" given full-outfit product focus
3. Wire uploadPhotoToStorage() + requestVirtualTryOn() into
   AnalysisScreen, ahead of the Gemini Vision call
4. Handle VTO result URL expiry before any save-to-favorites work
5. Write missing `match_saved_looks` RPC migration before touching
   the favorites/similarity feature
