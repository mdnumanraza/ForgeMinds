# Phase 1 — JSON-Driven Engine Vertical Slice

> Goal: prove the learning loop is addictive and engaging using fully dynamic, user-supplied JSON.  
> Scope: Campaign Loader system, runtime world generation from JSON, core game loop, local persistence.  
> No auth, no database, no AI in Phase 1. Do NOT build features from Phase 2+.

---

## Goals

- Ship a playable, polished vertical slice driven entirely by user-supplied JSON
- Build the Campaign Loader as the primary entry point — users paste or upload their own World + Knowledge JSON
- Validate the core learning loop: concept → quest → challenge → XP → boss
- Establish the full architecture foundation for all future phases
- Produce all documentation files in `/development`
- Make it feel like a real game, not a prototype

---

## User Flow (Phase 1)

1. Land on the app — no auth required
2. See the Campaign Hub: recently loaded campaigns (localStorage) + starter templates
3. Click "Load Campaign" (paste/upload JSON) or "Use Template" (one-click load)
4. JSON validation step — inline Zod errors shown if either JSON is invalid
5. On validation success: world map renders dynamically from the supplied JSON
6. Play through the stage flow: story → concept → quest → challenge → XP → boss
7. Progress saved to localStorage under the campaign's unique ID

---

## Deliverables

| # | Deliverable | Notes |
|---|---|---|
| 1 | Project scaffold | Next.js 15, TypeScript, Tailwind, all deps installed |
| 2 | `/development` docs | All planning files written |
| 3 | Design system | Game-themed Tailwind tokens, fonts, colors |
| 4 | Landing page | Cinematic intro, CTA to open Campaign Hub |
| 5 | Campaign Hub | Recently loaded campaigns (localStorage) + starter template cards |
| 6 | Campaign Loader UI | Paste or upload World JSON + Knowledge JSON with tab switcher |
| 7 | JSON Validator UI | Inline Zod error messages per field; clear "valid" confirmation state |
| 8 | Template Browser | 3–5 starter campaigns users can load instantly (no JSON required) |
| 9 | Example Prompt Modal | "Get Example Prompt" button — copy-pasteable ChatGPT/Claude prompt for generating JSON |
| 10 | World Map | PixiJS node-based map, stage nodes + connectors rendered from world.json |
| 11 | Stage flow | story → concept → quest → challenge → XP → boss |
| 12 | XP/level system | Zustand + localStorage persistence, keyed by campaign ID |
| 13 | Responsive UI | Mobile-friendly, Framer Motion transitions |

---

## Architecture for Phase 1

```
src/
├── app/
│   ├── page.tsx                          ← landing
│   ├── (game)/hub/page.tsx               ← Campaign Hub (recently played + templates)
│   ├── (game)/load/page.tsx              ← Campaign Loader (paste/upload JSON)
│   ├── (game)/world/[campaignId]/page.tsx
│   └── (game)/world/[campaignId]/stage/[stageId]/page.tsx
├── engine/
│   ├── game/          ← PixiJS layer (world map rendering)
│   ├── learning/      ← stage flow orchestration
│   └── content/
│       ├── CampaignLoader.ts     ← parse + hydrate JSON into engine state
│       ├── SchemaValidator.ts    ← Zod validation + error formatting
│       └── TemplateRegistry.ts  ← built-in starter templates
├── store/
│   ├── playerStore.ts
│   ├── progressStore.ts
│   └── uiStore.ts
├── components/
│   ├── game/          ← WorldMap, StageNode, QuestPanel, XPBar, BossIntro
│   ├── loader/        ← CampaignLoaderPanel, JSONTextarea, ValidationFeedback
│   │                     TemplateBrowser, ExamplePromptModal
│   └── ui/            ← Button, Card, Modal, Typography
├── content/templates/
│   ├── javascript-basics.world.json
│   ├── javascript-basics.knowledge.json
│   └── ...            ← 3–5 starter template pairs
└── lib/
    └── localStorage.ts  ← campaign persistence helpers
```

---

## Technical Decisions

### Campaign Loader

- User pastes World JSON into one textarea and Knowledge JSON into another (tabbed panel)
- Alternatively, user uploads `.json` files via file input
- On submit: `SchemaValidator.ts` runs both through Zod schemas simultaneously
- If either fails: inline error list shown per JSON block — no navigation allowed until valid
- If both pass: campaign object is hydrated and passed to PixiJS world map renderer
- Loaded campaign is saved to localStorage (`campaigns[id]`) with timestamp for "recently played"

### Template Browser

- `TemplateRegistry.ts` maps template IDs to bundled JSON pairs in `content/templates/`
- Template cards show: world name, topic, difficulty, estimated hours (from knowledge.json metadata)
- "Use Template" immediately loads the JSON pair through the same validation + render pipeline
- Templates serve as working examples users can inspect and adapt

### Example Prompt Modal

- "Get Example Prompt" button opens a modal with a pre-written prompt for ChatGPT/Claude
- Prompt instructs the AI to generate a valid `world.json` + `knowledge.json` pair for a given topic
- User copies the prompt, pastes it into their preferred AI tool, pastes the output back into the loader
- No Anthropic API key or server call needed — Phase 1 is entirely client-side for this feature

### PixiJS Integration Pattern

- Mount PixiJS on a `<canvas>` ref inside a React component
- React/DOM handles all HUD and UI overlays
- PixiJS handles only the world map visual (nodes, paths, sprites)
- World map nodes are generated dynamically from `world.json` stage definitions — no hardcoded layouts
- Use `useEffect` for init, `useLayoutEffect` for resize

### State Architecture

- `playerStore` — XP, level, avatar (persisted to localStorage)
- `progressStore` — completed stages per campaign ID (persisted to localStorage)
- `uiStore` — active modal, overlay state, notifications, active campaign

### Content Loading

- `CampaignLoader.ts` accepts raw JSON strings, parses, and validates via Zod schemas
- `SchemaValidator.ts` returns typed errors with field paths for inline display
- Validation errors surface at load time, never at runtime
- Engine is fully content-agnostic: it renders any passing JSON regardless of topic

### Stage Flow State Machine

```
IDLE → STORY_INTRO → CONCEPT → QUEST → CHALLENGE → XP_REWARD → BOSS_FIGHT → COMPLETE
```

- Managed by `LearningEngine.ts` using a state enum
- Each step is a React component rendered conditionally
- All content (story text, concept chunks, quest prompts, challenge questions) sourced from the loaded JSON

---

## Persistence in Phase 1

- All persistence is localStorage only — no database, no auth, no server
- Keys:
  - `fm:campaigns` — array of recently loaded campaign summaries (id, name, lastPlayed)
  - `fm:campaign:[id]:progress` — stage completion state per campaign
  - `fm:player` — XP, level, avatar preference
- Replaced by API + PostgreSQL in Phase 2 without changing store interfaces

---

## Starter Templates

3–5 bundled JSON pairs covering different topics and difficulties:

| Template | Topic | Stages |
|---|---|---|
| JavaScript Basics | Variables, Functions, Arrays, Objects, Async | 5 |
| Python Fundamentals | Variables, Lists, Dicts, Functions, Classes | 5 |
| TypeScript Essentials | Types, Interfaces, Generics, Decorators, Modules | 5 |

Templates are authored manually, validated against Zod schemas at build time, and serve as the canonical demonstration of what valid JSON looks like.

---

## Risks

| Risk | Mitigation |
|---|---|
| Invalid user JSON crashes engine | Strict Zod validation before any render — engine never receives unvalidated JSON |
| PixiJS SSR incompatibility | Dynamic import with `ssr: false` wrapper |
| Phase 1 scope creep | Hard freeze on feature list — defer auth, AI, and DB to later phases |
| Users confused about JSON format | Template Browser + Example Prompt Modal eliminate the need to write JSON from scratch |
| Malformed JSON (syntax errors) | JSON.parse error caught before Zod validation; clear "Invalid JSON syntax" message shown |

---

## Scalability Notes

- All engine layers are interface-driven — swappable in Phase 2+
- `CampaignLoader.ts` + `SchemaValidator.ts` are reused unchanged in Phase 2+ with cloud persistence added around them
- localStorage persistence replaced by API persistence in Phase 2 without store API changes
- PixiJS scene system supports additional scenes without refactoring
- Zod schemas are the single source of truth for JSON structure — shared between loader, validator, and future editor (Phase 4)

---

## Testing Strategy

- Unit tests: `LearningEngine.ts` state transitions, `SchemaValidator.ts` with valid + invalid fixtures
- Component tests: `CampaignLoaderPanel`, `ValidationFeedback`, `TemplateBrowser`, `QuestPanel`, `XPBar`
- E2E: full flow from Campaign Hub → load JSON → world map → stage completion (Playwright)
- Manual: full game loop walkthrough with each starter template before marking deliverable complete

---

## Future Migration Notes

- localStorage → PostgreSQL via existing Drizzle schema (Phase 2)
- Campaign Loader UI reused in Phase 2 with save-to-cloud added post-validation
- `TemplateRegistry.ts` extended to load templates from DB in Phase 4
- `engine/content/` folder extended with `AITemplateGenerator.ts` in Phase 3 (off by default)
- Static templates → AI-generated template suggestions (Phase 3)
