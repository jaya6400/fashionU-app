# Claude Code / Claude-specific notes

See AGENTS.md for full project context — that file is the source of
truth for stack, folder structure, design tokens, and product rules.
This file adds Claude-specific working notes.

## Priorities when generating code

1. Correctness of the vertical slice over premature abstraction —
   this is a 16-day hackathon build, not a production app.
2. Match existing patterns in src/shared/api/\*.ts before introducing
   new patterns for API calls.
3. Strict TypeScript — no `any` unless genuinely unavoidable, and
   comment why if used.
4. Every screen needs a loading state and an error state — judges
   will see this live, a blank screen on API failure is a bad look.

## Things NOT to do

- Don't add authentication/login flows.
- Don't scaffold a custom backend server — Supabase handles this.
- Don't invent new color values outside the theme.ts tokens.
- Don't write styling advice copy that references body size/weight.
- Don't call Groq or Gemini directly from components — always go
  through src/shared/api/ wrapper functions so rate-limit/fallback
  logic stays centralized.

## Current build status

(Update this section as you go so agents piggybacking on later
sessions know where things stand — e.g. "onboarding + photo upload
done, VTO integration in progress")
