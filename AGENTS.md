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
- Styling AI: Gemini `text-embedding-004` for embeddings, Groq
  (llama-3.3-70b-versatile) for live insight text generation, Gemini
  Flash-Lite as fallback if Groq rate-limits
- VTO: YouCam API (Apparel Virtual Try-On + Skin AI)
- No auth system — local state + AsyncStorage only, this is a hackathon MVP

## Folder structure (feature-based, keep this pattern)

src/
features/
onboarding/
photo-upload/
body-shape-quiz/
outfit-browse/
vto-comparison/
styling-insights/
favorites/
shared/
components/
api/ <- gemini.ts, groq.ts, youcam.ts, supabase.ts
types/
constants/
theme.ts <- Country Garden palette, Muli font tokens

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

## Data model (Supabase, pgvector enabled)

- styling_rules: body_shape, occasion, recommended_silhouette,
  description, embedding (vector)
- saved_looks: user-saved outfits with description embedding, for
  semantic "find similar favorites" via pgvector cosine similarity

## Working agreements for coding agents

- Build vertical slices, not isolated screens: photo upload -> YouCam
  VTO call -> result display was the first slice: extend from there.
- Don't add libraries beyond the stack above without flagging it.
- Don't build features not listed in Core User Journey below.
- Ask before generating placeholder/mock styling content that could
  read as real fashion advice — flag TODOs instead.

## Core user journey (build in this order)

1. Onboarding + full-body photo upload
2. Body shape quiz (self-report, not photo-inferred)
3. Occasion + style selection
4. Outfit browsing -> YouCam Apparel VTO per outfit
5. Comparison screen with Gemini/Groq-generated styling insight text
6. Save favorite looks (local + Supabase)
