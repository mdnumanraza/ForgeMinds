# ForgeMinds — Master Roadmap

> JSON-driven RPG Learning Runtime Engine — users bring their own World + Knowledge JSON configs and the engine dynamically renders a playable RPG learning campaign.  
> Learning transformed into worlds, quests, XP, progression, and boss fights.

---

## Vision

ForgeMinds is not an LMS, quiz app, or Duolingo clone.

It is a **JSON-driven RPG learning runtime engine** — a system where any valid World + Knowledge JSON pair is loaded at runtime and instantly rendered as a fully playable RPG campaign. Players explore worlds, complete quests, fight bosses, and unlock knowledge through addictive gameplay loops.

The engine does not own or hardcode any content. Users bring their own JSON — generated via ChatGPT, Claude, or any tool — and the engine renders it.

The product must feel:
- immersive
- rewarding
- progression-driven
- visually beautiful
- game-first

---

## Product Phases Overview

| Phase | Focus | Status |
|---|---|---|
| 1 | JSON-driven engine vertical slice — campaign loader, runtime world generation from JSON, core game loop, local persistence | ✅ Complete |
| 1.5 | **2D RPG Engine Upgrade** — Phaser.js tilemap world, tile movement, NPC dialogues, monster encounters, boss arenas, per-campaign progression isolation | 🔲 Planned |
| 2 | Auth, cloud persistence, campaign library, recently played, saved campaigns, multi-world | 🔲 Planned |
| 3 | AI compatibility layer — optional hint generation (provider-agnostic, off by default), template generation prompts | 🔲 Planned |
| 4 | Visual no-code world editor — JSON builder UI, drag-and-drop stage placement, tilemap designer | 🔲 Planned |
| 5 | Multi-campaign expansion, quest branching, achievement system | 🔲 Planned |
| 6 | Performance optimization — caching, CDN, edge rendering | 🔲 Planned |
| 7 | Social features — guilds, leaderboards, co-quests | 🔲 Planned |
| 8 | Creator marketplace, enterprise training, public API | 🔲 Planned |

---

## Core Loop (Phase 1.5+)

```
Load Campaign → Enter 2D Overworld
  ├── Walk around, explore
  ├── Interact with NPCs → dialogue, hints, quest direction
  ├── Find knowledge scrolls / shrines → concept fragments + XP
  ├── Encounter roaming enemies → MCQ battle
  │       ├── Win → XP + coins, enemy defeated
  │       └── Lose → retry or flee (HP loss)
  ├── Enter dungeon/cave zone → denser enemies + lore
  └── Find Boss Arena entrance
        ├── Pre-check: enough discoveries collected?
        │       └── No → locked door + hint dialogue
        └── Yes → Boss Fight (multi-MCQ, 75% threshold)
                ├── Pass (≥75%) → Stage complete, next zone unlocks
                └── Fail (<75%) → Ejected + redirect to explore more
```

**Phase 1 Loop (legacy — still valid for JSON without tilemap)**:

```
Enter World → Select Stage → Story → Concept → Quest → Challenge → XP → Boss
```

---

## Architecture Principles (Enforced Across All Phases)

1. **Layers never import across boundaries** — only through defined interfaces
2. **Content is data, not code** — worlds and knowledge are JSON, validated by Zod schemas
3. **AI is optional and isolated** — the engine runs fully without AI; AI adapter is wired in Phase 3 and is off by default
4. **State is sliced** — one Zustand store per domain
5. **Documentation updates before code changes** — docs are source of truth
6. **Phase boundaries are hard** — no Phase N+1 features in Phase N code
7. **Engine is content-agnostic** — it renders any valid World + Knowledge JSON without knowing the topic
8. **Campaign Loader is the primary entry point** — users provide JSON configs; the engine does not own or hardcode content

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 App Router + TypeScript |
| Styling | TailwindCSS v4 |
| Animation | Framer Motion |
| 2D Engine | **Phaser.js 3** (Phase 1.5+, replaces PixiJS) |
| Tilemap | **Tiled map editor** — exports JSON, Phaser reads natively |
| UI State | Zustand v5 |
| Server State | TanStack Query v5 |
| Backend | Next.js Route Handlers |
| Database | PostgreSQL 16 |
| ORM | Drizzle ORM + drizzle-kit |
| Auth | Better Auth |
| Validation | Zod |
| AI | Phase 3+: Anthropic Claude API (optional adapter, off by default) |

---

## Folder Map (Top Level)

```
forgeMinds/
├── development/       ← all planning and architecture docs
├── src/
│   ├── app/           ← Next.js App Router pages + API routes
│   ├── engine/        ← game / learning / content engines
│   ├── store/         ← Zustand state slices
│   ├── components/    ← React UI components
│   ├── content/       ← starter template JSON files
│   ├── db/            ← Drizzle schema + migrations
│   ├── lib/           ← auth, query client, utils
│   └── types/         ← global shared types
├── public/            ← assets, sprites, fonts
└── tests/             ← unit / integration / e2e
```

---

## Documentation Files

All decisions, architecture, and system designs live in `/development`.  
Files are source of truth — they must be updated before code changes.

See `phases/PHASE_N.md` for detailed implementation plans.  
See supporting docs (architecture.md, game-engine-design.md, etc.) for system designs.

---

## Development Rules

1. **Docs first** — every architecture decision is written before code
2. **No scope creep** — stick to the current phase deliverables
3. **Clean boundaries** — no cross-layer imports
4. **Tests required** — every engine module has unit tests
5. **Type-safe** — no `any`, no implicit types
6. **Modular content** — world/knowledge files are self-contained and independently loadable
