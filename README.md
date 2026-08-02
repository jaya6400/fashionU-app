# FashionU

AI-powered styling decision assistant — built for the YouCam API
Skin AI & Apparel VTO Hackathon.

FashionU helps people compare outfit options with AI-generated styling
insight, not just a try-on render. Upload a photo, try on outfits via
YouCam's virtual try-on, and get positive, confidence-framed styling
advice tailored to your self-reported body shape and occasion.

## Status

🚧 Active hackathon development. Deadline: **August 17, 2026**.

Core AI pipeline (Gemini Vision + Groq styling insights + Supabase
persistence) and onboarding flow are working end-to-end. YouCam
Apparel VTO is integrated as a standalone client and verified working
via test script, but not yet wired into the app's screen flow — see
`AGENTS.md` for the detailed current status and next steps.

## Tech stack

- **Framework**: Expo (SDK 54), Expo Router, TypeScript (strict mode)
- **State**: React state + AsyncStorage (no auth — hackathon MVP scope)
- **Backend**: Supabase (Postgres + pgvector for semantic similarity)
- **AI**:
  - Gemini (`gemini-3.5-flash`) — outfit image analysis
  - Gemini (`gemini-embedding-001`) — text embeddings for similarity search
  - Groq (`llama-3.3-70b-versatile`) — styling insight generation, with
    Gemini fallback
- **Virtual Try-On**: YouCam API (Perfect Corp) — Apparel VTO

## Getting started

### Prerequisites

- Node.js 18+
- Expo Go app (for testing on device) or an Android/iOS simulator

### Setup

```bash
npm install
```

Create a `.env` file with:

```ini
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_GEMINI_API_KEY=
EXPO_PUBLIC_GROQ_API_KEY=
EXPO_PUBLIC_YOUCAM_API_KEY=
EXPO_PUBLIC_EMBEDDING_MODEL=gemini-embedding-001
```

Run the Supabase migrations in `supabase/migrations/` (or the SQL
editor, in order).

Before running the application for the first time, you must apply the database migrations:

1. Ensure the Supabase CLI is installed and your local stack is running:

```bash
supabase start
```

2. Run the migrations to build your schema:

```bash
supabase db reset
```

### Run

```bash
npx expo start -c
```

Scan the QR code with Expo Go, or press `a`/`i` for a simulator.

### Test API clients standalone (without the RN app)

```bash
npx tsx src/shared/api/test-apis.ts
```

Useful for isolating third-party API issues (auth, endpoint, payload
shape) from React Native environment quirks.

## Project structure

See `AGENTS.md` for the full folder structure, data model, and
detailed build conventions — it's kept up to date as the source of
truth for both human and AI contributors on this project.

## Product principles

- Body shape is always self-reported (short quiz), never inferred from
  photos — proportion-based categories only (hourglass, rectangle,
  triangle/pear, inverted triangle, oval), no size/weight language.
- All styling copy is positive and confidence-framed.
- The styling-insight comparison screen is the core product
  differentiator — prioritized over catalogue breadth.

## License

MIT.
