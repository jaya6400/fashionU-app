# Claude Code / AI Agent Instructions

This file is Claude-specific context that supplements AGENTS.md.
**Read AGENTS.md first** — it has the authoritative product rules,
tech stack, schema, and current status. This file only adds
Claude-specific working notes.

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
