# Folder Structure

> Canonical reference for the project directory layout.

---

## Top Level

```
forgeMinds/
├── development/        ← all architecture and planning docs (source of truth)
│   ├── phases/         ← PHASE_1.md through PHASE_8.md
│   └── examples/       ← example world/knowledge JSONs and AI prompt templates
├── src/                ← application source code
├── public/             ← static assets served by Next.js
├── tests/              ← E2E and integration tests
├── drizzle.config.ts   ← Drizzle ORM configuration
├── next.config.ts      ← Next.js configuration
├── tailwind.config.ts  ← TailwindCSS configuration
├── tsconfig.json       ← TypeScript configuration
└── package.json
```

---

## `src/` Structure

```
src/
├── app/                          ← Next.js App Router
│   ├── (auth)/                   ← auth route group (no game layout)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (game)/                   ← game route group (game layout)
│   │   ├── hub/page.tsx          ← world selection hub
│   │   ├── world/[worldId]/
│   │   │   ├── page.tsx          ← world map view
│   │   │   └── stage/[stageId]/page.tsx
│   │   └── profile/page.tsx
│   ├── (creator)/                ← Phase 4+ creator portal
│   ├── api/                      ← API route handlers
│   │   ├── auth/[...all]/route.ts
│   │   ├── player/route.ts
│   │   ├── progress/route.ts
│   │   ├── quests/route.ts
│   │   └── ai/route.ts
│   ├── layout.tsx                ← root layout
│   ├── page.tsx                  ← landing page
│   └── globals.css
│
├── engine/                       ← game, learning, content, AI engines
│   ├── game/
│   │   ├── PixiApp.ts            ← PixiJS Application singleton
│   │   ├── SceneManager.ts       ← scene stack
│   │   ├── scenes/
│   │   │   ├── WorldMapScene.ts
│   │   │   ├── StageScene.ts
│   │   │   └── BossScene.ts
│   │   ├── entities/
│   │   │   ├── PlayerSprite.ts
│   │   │   ├── EnemySprite.ts
│   │   │   └── NpcSprite.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── learning/
│   │   ├── LearningEngine.ts     ← stage flow state machine
│   │   ├── QuestRunner.ts        ← single quest execution
│   │   ├── ChallengeEngine.ts    ← MCQ + code task evaluation
│   │   ├── AdaptiveFlow.ts       ← difficulty adjustment
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── content/
│   │   ├── ContentEngine.ts          ← orchestrates full load pipeline
│   │   ├── ContentResolver.ts        ← source-agnostic JSON resolver
│   │   ├── ContentCache.ts           ← in-memory TTL cache
│   │   ├── ContentNormalizer.ts      ← fills defaults, resolves references
│   │   ├── ProgressionMapBuilder.ts  ← builds stage unlock graph at runtime
│   │   ├── sources/
│   │   │   ├── StaticContentSource.ts    ← reads from /content/worlds/*
│   │   │   └── DatabaseContentSource.ts  ← Phase 4+: reads from DB
│   │   ├── schemas/
│   │   │   ├── world.schema.ts           ← Zod WorldSchema + sub-schemas
│   │   │   ├── knowledge.schema.ts       ← Zod KnowledgeSchema + sub-schemas
│   │   │   └── versions.ts               ← schema version registry
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   └── ai/
│       ├── AIAdapter.ts          ← interface definition
│       ├── providers/
│       │   └── AnthropicProvider.ts
│       ├── prompts/
│       │   ├── hint.prompt.ts
│       │   ├── feedback.prompt.ts
│       │   └── evaluate.prompt.ts
│       ├── types.ts
│       └── index.ts
│
├── store/                        ← Zustand state slices
│   ├── playerStore.ts
│   ├── progressStore.ts
│   ├── gameStore.ts
│   └── uiStore.ts
│
├── components/
│   ├── game/                     ← game-specific UI
│   │   ├── WorldMap/
│   │   │   ├── WorldMap.tsx
│   │   │   └── WorldMapCanvas.tsx
│   │   ├── StageNode/
│   │   │   └── StageNode.tsx
│   │   ├── QuestPanel/
│   │   │   └── QuestPanel.tsx
│   │   ├── ChallengeModal/
│   │   │   └── ChallengeModal.tsx
│   │   ├── BossIntro/
│   │   │   └── BossIntro.tsx
│   │   ├── XPBar/
│   │   │   └── XPBar.tsx
│   │   └── DialogBox/
│   │       └── DialogBox.tsx
│   ├── ui/                       ← reusable design system primitives
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Modal/
│   │   └── Typography/
│   └── layout/
│       ├── GameLayout.tsx
│       └── AuthLayout.tsx
│
├── content/                      ← static game content (JSON) — source of truth for Phase 1–3
│   ├── worlds/
│   │   └── world-1-javascript-basics/
│   │       ├── world.json        ← game experience layer ($schema: forgeMinds/world/v1)
│   │       └── knowledge.json    ← learning experience layer ($schema: forgeMinds/knowledge/v1)
│   └── index.ts                  ← CONTENT_REGISTRY (maps worldId → dynamic import fns)
│
├── db/                           ← Drizzle ORM
│   ├── schema/
│   │   ├── users.ts
│   │   ├── players.ts
│   │   ├── progress.ts
│   │   ├── quests.ts
│   │   └── index.ts
│   ├── migrations/               ← auto-generated by drizzle-kit
│   ├── client.ts
│   └── seed.ts
│
├── lib/
│   ├── auth.ts                   ← Better Auth instance
│   ├── query-client.ts           ← TanStack Query client
│   ├── constants.ts
│   └── utils.ts
│
└── types/                        ← global shared types (not engine-specific)
    ├── game.types.ts
    ├── learning.types.ts
    ├── api.types.ts
    └── content.types.ts
```

---

## `public/` Structure

```
public/
├── assets/
│   ├── sprites/        ← PixiJS sprite sheets + atlases
│   ├── backgrounds/    ← world background images
│   ├── ui/             ← icons, badges, HUD elements
│   └── audio/          ← sound effects (Phase 2+)
└── fonts/              ← custom game fonts
```

---

## `tests/` Structure

```
tests/
├── e2e/                ← Playwright E2E tests
│   ├── stage-flow.spec.ts
│   └── auth.spec.ts
└── integration/        ← API integration tests
    └── api.test.ts
```

Unit tests live co-located with their source file (e.g., `LearningEngine.test.ts`).
