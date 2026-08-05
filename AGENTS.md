# Project: Fashion Decision Assistant (YouCam Hackathon)

## What this is

AI-powered styling decision assistant — NOT a virtual try-on demo wrapper.
Core value: reduce purchase uncertainty by comparing outfit options with
styling insight text, not just rendering VTO images.
Deadline: 17 August. Built with React Native + Expo (SDK 54), TypeScript,
Expo Router.

## Non-negotiable product rules

NEVER reference body size/weight (no "slim/fat/plus-size" language).
Use body SHAPE categories only: hourglass, rectangle, triangle/pear,
inverted triangle, oval. These are proportion-based, self-reported by
the user via a short quiz — never inferred from photos.
All styling copy must be positive/confidence-framed. Never say
"doesn't suit you" — say what silhouette works better and why.
The styling-insight comparison screen is the core differentiator.
Prioritize its quality over outfit catalogue breadth.

## Tech stack

Expo (SDK 54), Expo Router, TypeScript (strict mode)
State: Zustand (add only once core flow works — don't over-engineer early)
Data fetching: TanStack Query
Backend: Supabase (Postgres + pgvector extension enabled)
Storage: Supabase Storage (`user-photos` bucket, public) — required
because YouCam's src_file_url must be a publicly reachable URL; local
file:// URIs are uploaded here first to get a public link
Styling AI: Gemini `gemini-embedding-001` (3072-dim, matches Supabase
pgvector column) for embeddings, Groq (llama-3.3-70b-versatile) for
live insight text generation, Gemini `gemini-3.5-flash` for Vision
analysis (with `responseMimeType: "application/json"` forced) and as
Groq fallback
VTO: YouCam Apparel VTO via `s2s/v2.0/task/cloth-v3` — CONFIRMED working
AND wired into the UI (AnalysisScreen step 2, gated on garment params,
category default "auto"). Skin AI not integrated. Body-reshape evaluated
and DEFERRED (brand conflict + credit budget).
No auth system — local state + AsyncStorage only, this is a hackathon MVP

## Verified integrations (as of Aug 5, 2026)

✅ Gemini embeddings (gemini-embedding-001, 3072-dim) — working.
`outputDimensionality` param removed Aug 6 (not in installed SDK types;
model default IS 3072 = vector column).
✅ Groq styling insight generation — working, primary insight model,
`[Groq]` success logs present.
✅ Supabase saved_looks insert — working INCLUDING embedding column.
✅ Supabase Storage upload → public URL — working.
✅ YouCam Apparel VTO (cloth-v3) — working, wired; polling log lines
("still processing attempt n/30") are NORMAL.
✅ VTO result re-hosting — `rehostImageToStorage()`; saved looks persist
past the 2h presigned expiry.
✅ Saved-looks history screen + entry points (Landing ghost link,
Analysis footer ghost button on stage="done"). Header heart = LOCAL
visual toggle only.
✅ UI polish (Aug 6): `shared/components/ScreenHeader.tsx` (safe-area
header via useSafeAreaInsets, back + optional right slot) used by
Analysis, PhotoUpload, SavedLooks. PhotoUpload: animated glow border on
selected photo (dashed only when empty), centered equal-height action
buttons, bottom inset padding. BodyShapeQuiz/Occasion: back arrow
absolutely positioned left of centered title (no layout shift), continue
button marginBottom lifts it off the gesture zone.
✅ GARMENT_CATALOGUE (Aug 5): 6 entries with real URLs. 001/003/005/006
self-hosted .webp in user-photos; 002/004 TEMPORARY Unsplash hotlinks —
re-host before submission. Interface: id, name, imageUrl, category,
occasionTags[].
✅ Outfit-browse screen BUILT (Aug 5): `features/outfit-browse/
OutfitBrowseScreen.tsx` + stub `app/outfit-browse.tsx`; renders catalogue
grid, passes garment params into /analysis.
❌ YouCam Skin AI — not integrated
❌ YouCam body-reshape — deferred (brand conflict + credits)
❌ `match_saved_looks` RPC — missing; `findSimilarLooks()` will error.

## Known SDK 54 gotchas (do not re-debug these)

expo-file-system: import from `expo-file-system/legacy`, not the root.
ImagePicker.MediaTypeOptions.Images: deprecation warning but works.
RN `fetch().blob()` + FileReader unreliable for file:// URIs — use
`expo-file-system/legacy` readAsStringAsync base64.
`crypto.randomUUID()`: not global in RN/Hermes — use expo-crypto.
gemini-3.5-flash: force `responseMimeType: "application/json"` + strip
fences defensively.
@google/generative-ai (installed version): `EmbedContentRequest` has NO
`outputDimensionality` — rely on the 3072 default.
"Unexpected end of input" seen once (Aug 5) on complete raw JSON; cleared
with Metro/device cache. Recurrence protocol: log raw length + tail, then
fix the extract step — not the prompt.
groq.ts keeps `[Groq]` success logs.
saved_looks list queries MUST use explicit column select (never `*`).
SafeAreaView does NOTHING on Android — headers must use
useSafeAreaInsets (see ScreenHeader).

## Folder structure (feature-based, keep this pattern)

src/
app/ <- Expo Router thin stubs (saved-looks, outfit-browse)
features/
landing/ LandingScreen.tsx
body-shape-quiz/ BodyShapeQuizScreen.tsx — writes "userBodyShape"
occasion-selection/ OccasionSelectionScreen.tsx — writes "userOccasion"
photo-upload/ PhotoUploadScreen.tsx — useFocusEffect guard; glow
preview; routes to /outfit-browse with imageUri
analysis/ AnalysisScreen.tsx — upload → VTO (if garment params)
→ Gemini Vision → Groq insight → rehost → saveLook
saved/ SavedLooksScreen.tsx — history view
outfit-browse/ OutfitBrowseScreen.tsx — BUILT Aug 5
vto-comparison/ NOT YET BUILT
shared/
api/ gemini.ts, groq.ts, supabase.ts, youcam.ts,
test-apis.ts (manual sanity script; run via tsx,
NOT imported by app; step 3 costs ~2 VTO credits)
components/ ScreenHeader.tsx — shared safe-area header
constants/
theme.ts <- Country Garden palette, Muli font tokens
garments.ts <- GARMENT_CATALOGUE, 6 entries (see Verified)
services/
aiService.ts <- orchestrates the AI pipeline; exposes embedding

## Design tokens (do not invent new colors — use these)

Primary: #723380 | Primary dk: #5C3364 | Secondary: #DBD4FE
Accent: #808135 | Background: #FDFDFD / #FFFFE3 | Border: #B0ACA3
Text secondary: #726164 | Font: Muli

## Environment variables (see .env, never hardcode keys)

EXPO_PUBLIC_SUPABASE_URL / \_ANON_KEY / \_GEMINI_API_KEY / \_GROQ_API_KEY /
\_YOUCAM_API_KEY / \_EMBEDDING_MODEL=gemini-embedding-001

## Data model (Supabase, pgvector enabled) — ACTUAL schema, verified

styling_rules: id, body_shape (CHECK enum), occasion, category,
rule_text, embedding vector(3072), created_at
saved_looks: id, outfit_id TEXT NOT NULL, body_shape TEXT nullable,
occasion TEXT NOT NULL, vto_image_url, styling_insight,
embedding vector(3072), created_at
Storage: `user-photos`, public read/insert (MVP scope).

## Onboarding flow (enforced via guard, not just UI ordering)

Landing → Body Shape Quiz → Occasion Selection → Photo Upload →
Outfit Browse → Analysis. PhotoUpload useFocusEffect guard checks both
AsyncStorage keys on every focus.

## Working agreements for coding agents

Build vertical slices, not isolated screens.
Don't add libraries beyond the stack without flagging.
Don't build features not in Core User Journey.
Ask before generating placeholder styling content — flag TODOs.
When touching AI clients, verify model names via web search first.
Catalogue images must be self-hosted in user-photos (no hotlinking).
YOUCAM CREDIT BUDGET: ~1022 as of Aug 3; a handful of verification runs
spent since — check before batch testing. ~2 credits per VTO run.
Never trigger VTO for UI-only checks — /analysis WITHOUT garment params
skips VTO, costs 0 credits.
Update this file at the END of every session.

## Core user journey (build in this order)

✅ Onboarding + full-body photo upload
✅ Body shape quiz (self-report)
✅ Occasion + style selection
✅ Outfit browsing → VTO per outfit (screen built Aug 5; 002/004
hotlinks to re-host; occasionTags/category mapping to verify)
✅ Comparison screen with Gemini/Groq styling insight
✅ Save favorite looks — automatic saveLook() with re-hosted URL;
history at /saved-looks
⚠️ Similarity search — blocked on missing match_saved_looks RPC

## Next session — pick up here (in this order)

1. Garment hardening: re-host 002/004 to user-photos; unify occasionTags
   with OccasionSelectionScreen values ("date" → "date_night"); verify
   youcam.ts category mapping (full_body → "auto"/"dresses" at call
   site); one VTO verification run per untested garment (~2 cr each;
   check .webp acceptance, crossed-arms suit 003, busy backdrop 006).
2. AI resilience: retry/backoff on 429, Groq vision fallback
   (llama-4-scout-17b-16e-instruct or llama-3.2-90b-vision — verify via
   web search), degraded mode; fix stale gemini-1.5-flash-latest
   fallback name in groq.ts.
3. match_saved_looks RPC migration (mirror match_styling_rules).
4. CONTINGENCY only if the parse error recurs: parseVisionJson() robust
   parser (recipe in gotchas above).

## Deferred / out of scope unless credits allow

YouCam body-reshape, vto-comparison screen, Zustand/TanStack Query.
