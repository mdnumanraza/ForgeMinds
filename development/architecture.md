# Architecture

> ForgeMinds system architecture overview.

---

## Architectural Philosophy

ForgeMinds is a **JSON-driven RPG Learning Runtime Engine**. Users supply a World JSON and a Knowledge JSON; the engine validates, combines, and renders a fully playable RPG learning campaign — with no awareness of the topic being taught.

The system is built on **clean layered architecture**. Each layer has a single responsibility and communicates with adjacent layers only through typed interfaces. No layer imports directly from a non-adjacent layer.

## Architecture Layers (Phase 1.5+)

```
┌─────────────────────────────────────────────────────────────────┐
│  UI Layer          (React + TailwindCSS + Framer Motion)        │
│  HUD, DialogueBox, BattleModal, InventoryPanel — DOM overlay    │
├─────────────────────────────────────────────────────────────────┤
│  Game Engine       (Phaser.js 3 canvas — Phase 1.5+)            │
│  Tilemap, Player, NPCs, Enemies, Encounters, Discoveries        │
│  ── EventBus bridge to React UI layer ──                        │
├─────────────────────────────────────────────────────────────────┤
│  Learning Engine   (stage flow, quest runner, boss evaluation)  │
├─────────────────────────────────────────────────────────────────┤
│  Campaign Engine   (content-agnostic JSON runtime)              │
├─────────────────────────────────────────────────────────────────┤
│  Campaign Loader   (JSON ingestion, validation, persistence)    │
├─────────────────────────────────────────────────────────────────┤
│  AI Adapter        (provider-agnostic AI interface)             │
│                    ← Wired in Phase 3. Engine operates without it. │
├─────────────────────────────────────────────────────────────────┤
│  API Layer         (Next.js Route Handlers)                     │
├─────────────────────────────────────────────────────────────────┤
│  Data Layer        (Drizzle ORM + PostgreSQL)                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer Definitions

### UI Layer (`src/components/`, `src/app/`)
- Renders all visible game and app UI
- Knows about: store (Zustand), server state (TanStack Query)
- Does NOT: contain game logic, call DB directly, call AI directly

### Game Engine (`src/engine/phaser/`)
- **Phase 1.5+**: Phaser.js 3 replaces PixiJS for the world canvas
- Manages Phaser Game lifecycle, scene stack, tilemap rendering, entity spawning
- Systems: TilemapSystem, InteractionSystem, DiscoverySystem, EncounterSystem
- Entities: PlayerEntity, NPCEntity, EnemyEntity
- Communicates with React UI via typed EventBus (`eventBus.emit('battleStart', ...)`)
- Reads from Zustand stores (progress, campaign) — never writes directly
- Does NOT: render game UI (HUD/dialogue/modals are React DOM), run learning logic

> **Phase 1 compatibility**: if a campaign JSON has no `tilemap` field, the engine falls back to the PixiJS node-map view via a compatibility shim. PixiJS is retained solely for this path.

### Learning Engine (`src/engine/learning/`)
- Orchestrates the stage flow state machine
- Knows about: Campaign object, player progress, AI adapter interface
- Does NOT: render UI, touch PixiJS

### Campaign Engine (`src/engine/content/`)
- Resolves, validates, normalises World+Knowledge JSON from any source (user upload, DB, template registry). Combines both configs into a runtime `Campaign` object consumed by the Game and Learning engines.
- Owns the `CampaignResolver` (source-agnostic), `SchemaValidator` (Zod), `CampaignNormalizer`, and `CampaignCache`
- Knows about: Zod schemas, `ContentSource` interface, `TemplateRegistry`
- Does NOT: call API directly, touch DB directly (delegates to `ContentSource` implementations), render UI
- Key invariant: **all content passes Zod validation before reaching any engine consumer**

### Campaign Loader (`src/engine/loader/`)
- Handles JSON ingestion from user input (paste/upload), runs Zod validation, surfaces errors, persists to DB (Phase 2+), and hydrates the Campaign Engine.
- Owns the upload/paste pipeline, the validation error formatter, and the DB write for `campaigns`
- Knows about: Campaign Engine interface, Zod schemas, API layer
- Does NOT: contain game logic, render UI, manage player progress

### AI Adapter (`src/engine/ai/`)
- Provider-agnostic interface for all AI calls
- Knows about: learning context types, prompt templates
- Does NOT: know which AI provider is active (only the provider file does)
- **Phase 3+** — not wired in Phase 1 or Phase 2. The engine runs identically with `ENABLE_AI_HINTS=false`

### API Layer (`src/app/api/`)
- Next.js Route Handlers serving JSON
- Knows about: auth session, Drizzle queries, Zod validation
- Does NOT: contain game logic

### Data Layer (`src/db/`)
- Drizzle schema + query helpers
- Knows about: PostgreSQL schema
- Does NOT: import from any other layer

---

## Data Flow: Loading a Campaign

```
User loads a campaign (uploads JSON or selects a template)
  → CampaignLoader receives worldJson + knowledgeJson
  → SchemaValidator (Zod) validates both JSONs
      ↳ on failure: returns structured field-level errors to UI; flow stops
  → CampaignEngine.hydrate(worldJson, knowledgeJson)
      ↳ combines both configs into a runtime Campaign object
      ↳ normalises stage positions, asset key references, unlock conditions
  → GameEngine receives Campaign object
      ↳ iterates campaign.world.stages[] to place StageNodeSprites on World Map
  → LearningEngine receives Campaign object
      ↳ initialises stage flow state machine from campaign.knowledge.stages[]
  → World Map renders — player can navigate and begin stages
  → (Phase 2+) CampaignLoader persists validated JSON to campaigns table in DB
```

---

## Data Flow: Stage Completion

```
User clicks "Complete Stage"
  → LearningEngine.completeStage(stageId)
  → progressStore.markComplete(stageId)
  → POST /api/progress { stageId, campaignId, score, xpEarned }
  → Drizzle: INSERT stage_progress + UPDATE player XP
  → TanStack Query invalidates 'player' + 'progress' queries
  → playerStore updates XP + level (from server response)
  → XPBar animates to new value (Framer Motion)
  → Next stage node unlocks on World Map (PixiJS tween)
```

---

## Campaign Runtime Flow

When the Campaign Engine hydrates a `Campaign` object, the Game and Learning engines dynamically render the full experience entirely from config:

- **World Map** — rendered by iterating `campaign.world.stages[]`. Each stage's position, icon sprite, connection lines, and lock state are all derived from the JSON.
- **Stage Nodes** — placed at `stage.position.x/y`, styled by `stage.nodeIconKey` (resolved against AssetRegistry; falls back to `node-default` if not found).
- **Progression Paths** — connection lines drawn by evaluating `stage.unlockCondition` references between stage IDs.
- **Quests** — generated from `campaign.knowledge.stages[].quests[]`; the Learning Engine runs them in sequence with no knowledge of the domain.
- **Boss Encounters** — triggered from `campaign.world.bossStages[]`; boss sprite, name, and dialogue all come from the JSON.
- **NPC Dialogue** — resolved from `campaign.world.npcs[]`; the engine renders whatever text and sprite key the JSON defines.

The engine is fully topic-agnostic at every step. A campaign teaching Kubernetes and a campaign teaching music theory run through identical code paths.

---

## State Architecture

```
Zustand Stores (in-memory, fast, game state)
  ├── playerStore    — XP, level, avatar
  ├── progressStore  — completed stages per campaign
  ├── gameStore      — active scene, current stage state, loaded Campaign
  └── uiStore        — active modal, notifications

TanStack Query (server state, cached, persistent)
  ├── usePlayer()      — GET /api/player
  ├── useProgress()    — GET /api/progress?campaignId=...
  ├── useCampaigns()   — GET /api/campaigns
  └── useQuests()      — GET /api/quests
```

---

## Modularity Contracts

Each engine module exports exactly:
1. One primary class/object (the engine)
2. One `types.ts` (all types for this module)
3. One `index.ts` (public surface only)

Internal implementation files are NOT imported from outside the module directory.

---

## Key Invariants

1. `world.json` and `knowledge.json` are the single source of truth for game content
2. **No hard-coded stage/quest/world/topic data in TypeScript files** — ALL content comes from user-supplied or template JSON
3. All cross-cutting concerns (auth, logging, error handling) live in `src/lib/`
4. Zod schemas are shared between campaign loaders and API validators
5. PixiJS never touches React state; React never directly manipulates PixiJS objects
6. **Content always passes Zod validation before use** — user-supplied and template content are equally subject to validation
7. The Campaign Engine is source-agnostic: user uploads, DB-persisted campaigns, and template registry entries all flow through the same pipeline
8. `ContentSource` interface must be implemented for any new content origin — no ad-hoc loading
9. **Engine is topic-agnostic** — it renders Kubernetes, Docker, Linux, or any domain from valid JSON
10. **Campaign Loader is the primary user entry point** — no hardcoded content ships with the app beyond templates
11. **AI adapter is optional** — the engine runs identically with `ENABLE_AI_HINTS=false`
