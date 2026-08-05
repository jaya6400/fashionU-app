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
- VTO: YouCam Apparel VTO via `s2s/v2.0/task/cloth-v3` — CONFIRMED
  working AND wired into the UI (AnalysisScreen step 2, gated on garment
  params, category default "auto"). Skin AI not integrated. Body-reshape
  API evaluated and DEFERRED (credit budget, see working agreements).
- No auth system — local state + AsyncStorage only, this is a hackathon MVP

## Verified integrations (as of Aug 4, 2026)

- ✅ Gemini Vision image analysis — working, JSON mode forced
- ✅ Gemini embeddings (gemini-embedding-001, 3072-dim) — working
- ✅ Groq styling insight generation — working, CONFIRMED as the primary
  insight model. groq.ts now logs `[Groq]` request + success; absence of
  the "Groq failed, falling back to Gemini" warn means Groq succeeded.
- ✅ Supabase saved_looks insert — working INCLUDING the embedding column
  (3072-dim vector persists; the "vector must have at least 1 dimension"
  bug was fixed by exposing `embedding` on `AnalysisResult` and passing
  `analysisResult.embedding` in AnalysisScreen's saveLook call)
- ✅ Supabase Storage upload → public URL — working, verified reachable
- ✅ YouCam Apparel VTO (cloth-v3) — working and wired into AnalysisScreen
  (step 2, runs only when garment params are present). Auth is a direct
  API key as Bearer token (v2 API, no token exchange needed).
- ✅ VTO result re-hosting — `rehostImageToStorage()` in supabase.ts
  downloads the presigned S3 result (~2hr expiry, X-Amz-Expires=7200) and
  re-uploads to `user-photos` before persisting; saveLook() stores the
  permanent Supabase URL. Saved looks no longer break after 2 hours.
- ✅ Saved-looks history screen — `features/saved/SavedLooksScreen.tsx`
  with thin stub `app/saved-looks.tsx` (route "/saved-looks"). Explicit
  column select (never pulls embeddings in list views), refetch on focus
  via useFocusEffect, empty-state CTA.
- ✅ Saved-looks entry points (Aug 4) — LandingScreen has a ghost text
  link below the primary CTA ("View Saved Looks" + heart-outline icon,
  router.push("/saved-looks")). AnalysisScreen footer has a bordered
  ghost button below "Try Another Look" when `stage === "done"`, same
  route. AnalysisScreen's header heart remains a LOCAL `isSaved` visual
  toggle only — persistence is still the automatic `saveLook()` call,
  unrelated to these nav entry points.
- ❌ YouCam Skin AI — not integrated
- ❌ YouCam body-reshape — evaluated, deferred (see working agreements)
- ❌ `match_saved_looks` RPC — still missing; `findSimilarLooks()` will
  error if called. Only `match_styling_rules` exists.

## Known SDK 54 gotchas (do not re-debug these)

- expo-file-system: `readAsStringAsync`/`EncodingType`/etc. moved out of
  the package root in SDK 54. Import from `expo-file-system/legacy`, not
  `expo-file-system`.
- ImagePicker.MediaTypeOptions.Images: shows a deprecation warning but
  works fine — verified via testing, do NOT omit it based on warning text
  alone.
- RN `fetch().blob()` + FileReader: unreliable for local `file://` URIs
  (RN's blob bridge). Use `expo-file-system/legacy`'s `readAsStringAsync`
  with base64 encoding instead, wherever a local file needs to become
  base64 or binary data.
- `crypto.randomUUID()`: not a global in RN/Hermes. Use `expo-crypto`'s
  `Crypto.randomUUID()`.
- gemini-3.5-flash: does not reliably return clean JSON from prompt
  instructions alone — wraps output in markdown fences. Always set
  `generationConfig: { responseMimeType: "application/json" }` and strip
  fences defensively as a backup.
- groq.ts historically logged ONLY on failure, so a successful Groq call
  was invisible and made the pipeline look Gemini-only. `[Groq]` success
  logs added Aug 3 — keep them.
- saved_looks list queries MUST use explicit column select
  (`id, outfit_id, body_shape, occasion, vto_image_url, styling_insight,
created_at`). `select("*")` pulls a 3072-dim vector per row.

## Folder structure (feature-based, keep this pattern)

```
src/
  app/              <- Expo Router routes (thin re-export stubs)
                      (saved-looks.tsx stub added Aug 3)
  features/
    landing/        LandingScreen.tsx
    body-shape-quiz/ BodyShapeQuizScreen.tsx — writes "userBodyShape" to AsyncStorage
    occasion-selection/ OccasionSelectionScreen.tsx — writes "userOccasion" to AsyncStorage
    photo-upload/   PhotoUploadScreen.tsx — useFocusEffect guard requiring both
                    AsyncStorage keys on every focus
    analysis/       AnalysisScreen.tsx — full pipeline: upload → VTO (if garment
                    params) → Gemini Vision → Groq insight → rehost → saveLook
    saved/          SavedLooksScreen.tsx — history view (BUILT Aug 3)
    outfit-browse/  NOT YET BUILT
    vto-comparison/ NOT YET BUILT
  shared/
    api/
      gemini.ts     Vision analysis + embeddings
      groq.ts       Styling insight generation + fallback + [Groq] logs
      supabase.ts   DB client, saveLook(), uploadPhotoToStorage(),
                    rehostImageToStorage()
      youcam.ts     Apparel VTO client — wired into AnalysisScreen Aug 3
    components/
  constants/
    theme.ts        <- Country Garden palette, Muli font tokens
    garments.ts     <- hardcoded GARMENT_CATALOGUE (001 URL verified;
                       002–004 still REPLACE_WITH_REAL_HOSTED_URL)
  services/
    aiService.ts    <- orchestrates the AI pipeline; exposes embedding
```

## Design tokens (do not invent new colors — use these)

- Primary: #723380 (deep plum)
- Primary dk: #5C3364
- Secondary: #DBD4FE (lavender)
- Accent: #808135 (olive)
- Background: #FDFDFD / #FFFFE3 (cream variant)
- Border/disabled: #B0ACA3
- Text secondary: #726164
- Font: Muli (via @expo-google-fonts/muli)

## Environment variables (see .env, never hardcode keys)

- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY
- EXPO_PUBLIC_GEMINI_API_KEY
- EXPO_PUBLIC_GROQ_API_KEY
- EXPO_PUBLIC_YOUCAM_API_KEY
- EXPO_PUBLIC_EMBEDDING_MODEL=gemini-embedding-001

## Data model (Supabase, pgvector enabled) — ACTUAL schema, verified

- styling_rules: id, body_shape (CHECK constrained enum), occasion,
  category, rule_text, embedding vector(3072), created_at
- saved_looks: id, outfit_id (TEXT NOT NULL), body_shape (TEXT, nullable),
  occasion (TEXT NOT NULL), vto_image_url, styling_insight,
  embedding vector(3072), created_at

Note: `saved_looks` columns are NOT `image_uri` / `description` — that was
an early schema/saveLook() mismatch, now fixed. `match_saved_looks` RPC
referenced in supabase.ts's `findSimilarLooks()` does NOT exist yet — only
`match_styling_rules` was migrated. Will error if called before that
migration is written.
Storage: `user-photos` bucket, public read/insert (intentionally open, no
auth in MVP scope).

## Onboarding flow (enforced via guard, not just UI ordering)

Landing → Body Shape Quiz → Occasion Selection → Photo Upload → Analysis
`PhotoUploadScreen` has a `useFocusEffect` guard that checks both
AsyncStorage keys on every focus (not just mount) and redirects back to
whichever step is missing. This covers deep links, killed/relaunched
sessions, and "Try Another Look" navigating straight back to photo-upload.

## Working agreements for coding agents

- Build vertical slices, not isolated screens.
- Don't add libraries beyond the stack above without flagging it.
- Don't build features not listed in Core User Journey below.
- Ask before generating placeholder/mock styling content that could read
  as real fashion advice — flag TODOs instead.
- When touching AI API clients, verify current model names/params via web
  search before assuming — model naming (Gemini especially) has moved
  multiple times during this project already.
- YOUCAM CREDIT BUDGET: ~1022 credits as of Aug 3; each VTO run costs ~2.
  Never trigger VTO to verify UI-only changes — navigating to /analysis
  WITHOUT garment params skips VTO entirely and costs 0 YouCam credits.
- Update this file at the END of every session. It has lagged the code
  twice already and stale "NOT YET" notes waste sessions.

## Core user journey (build in this order)

- ✅ Onboarding + full-body photo upload
- ✅ Body shape quiz (self-report, not photo-inferred)
- ✅ Occasion + style selection
- ⚠️ Outfit browsing → YouCam Apparel VTO per outfit — VTO is wired into
  AnalysisScreen and a hardcoded GARMENT_CATALOGUE exists (constants/
  garments.ts), but only garment-001's URL is verified and the
  outfit-browse SCREEN is not built yet
- ✅ Comparison screen with Gemini/Groq styling insight — runs on the VTO
  result image when a garment was selected, raw upload otherwise
- ✅ Save favorite looks — saveLook() runs automatically on analysis
  completion with a re-hosted permanent URL; history viewable at
  /saved-looks. NOTE: the AnalysisScreen header heart is a LOCAL visual
  toggle only (isSaved state) — persistence is the automatic saveLook.
- ⚠️ Similarity search — findSimilarLooks() exists but is blocked on the
  missing match_saved_looks RPC

## Next session — pick up here

1. Outfit-browse screen: render GARMENT_CATALOGUE as a selectable grid and
   pass garment params into /analysis. BEFORE that, replace garments
   002–004's REPLACE_WITH_REAL_HOSTED_URL by uploading real full-body
   garment photos to the user-photos bucket (no hotlinking).
2. Write the missing `match_saved_looks` RPC migration (mirror
   `match_styling_rules`) before touching the similarity feature.
3. Verify/harden the Groq fallback: `gemini-1.5-flash-latest` in groq.ts
   is a stale model name — align it with gemini.ts (gemini-3.5-flash +
   forced responseMimeType JSON, keep the regex strip as backup). Carried
   over — not touched in the Aug 4 UI-polish session.

Deferred / out of scope unless credits allow: YouCam body-reshape
integration, vto-comparison screen, Zustand/TanStack Query introduction.
