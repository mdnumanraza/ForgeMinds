# ForgeMinds — Development

This directory is the **source of truth** for the project. All development-related work — design docs, system specs, phase plans, decision records, progress notes — lives here.

> Read [`working-style.md`](./working-style.md) first — it sets the rules for how we work.

## How this directory is organized

The structure follows the planning order: **Game Discovery → Architecture Discovery → Design Decisions → Master Roadmap → Milestones → Development.** Cross-cutting concerns (content, assets, game-design, decisions, human tasks) live in their own top-level folders.

```
development/
├── working-style.md            ← rules for collaborating on this project
├── README.md                   ← this file
│
├── 00-game-discovery/          ← Stage 1: vision, target feel, player fantasy
├── 01-architecture-discovery/  ← Stage 2: candidate technical architectures
├── 02-design-decisions/        ← Stage 3: lock gameplay/progression/world/learning/combat (as ADRs)
├── roadmap/                    ← Stage 4: ai-master-roadmap.md (executive summary of all 15 milestones)
├── 04-milestones/              ← Stage 5: one folder per milestone (01–15)
│
├── content-architecture/       ← How campaigns/stages/quests/NPCs/etc. are stored & themed
├── assets/                     ← Asset strategy (fantasy/ + space/ subfolders)
├── game-design/                ← Per-system design stubs (vision, loop, progression, …)
├── decisions/                  ← Architecture Decision Records (ADRs) + index + template
├── human-tasks/                ← Master tracker of work that requires you (the human)
└── prompts/                    ← Saved planning prompts (e.g. prompt1.md)
```

## Index

### Foundation
- [Working Style](./working-style.md) — how we collaborate on this project. **Mandatory reading.**
- [Master Roadmap](./roadmap/ai-master-roadmap.md) — executive summary of all 15 milestones.

### Planning stages (upstream of code)
- [00 — Game Discovery](./00-game-discovery/) — vision, target feel, player fantasy, success criteria. Locks nothing.
- [01 — Architecture Discovery](./01-architecture-discovery/) — candidate rendering, state, content, AI-layer, save options.
- [02 — Design Decisions](./02-design-decisions/) — locks gameplay loop, progression, world, learning delivery, combat.

### Milestones (detail per milestone)
- [04 — Milestones](./04-milestones/) — one folder per milestone, 01 through 15. Each milestone has its own `ai-overview.md` plus its phase docs.

### Cross-cutting
- [Content Architecture](./content-architecture/) — schemas for campaigns, stages, quests, NPCs, enemies, bosses, dialogs, questions, rewards, items.
- [Assets](./assets/) — required assets, sources, gaps. Fantasy + Space themes.
- [Game Design](./game-design/) — preliminary stubs for vision, gameplay loop, progression, campaign, quest, enemy, boss, dialogue, knowledge, reward, inventory, save.
- [Decisions (ADRs)](./decisions/) — Architecture Decision Records. Anything we lock, we record here with rationale.
- [Human Tasks](./human-tasks/) — master tracker of work that requires you (asset selection, playtesting, theme/art decisions, architecture approval, …).

## File naming convention

- **`ai-*.md`** — written and maintained by AI.
- **`you-*.md`** — requires human action (collection, review, decision, playtesting).

This convention applies to every file in this directory. When in doubt, the file's `> **Owned by:**` header tells you definitively.

## Stub format

Every planning file is created as a stub first and deepened later. Stubs use this exact format so they're recognizable at a glance:

```markdown
# <Title>

> **Purpose:** <one-line purpose>
> **Status:** Stub — not yet detailed.
> **Owned by:** <AI | Human>

## TODO
- [ ] <what we'll plan inside this file>
```

## Conventions

- **One topic per file.** If a file is covering two things, split it.
- **Update docs in the same change as the code they describe.** Stale docs are worse than no docs.
- **Decisions get a short rationale** — what we considered, what we picked, why. Lock decisions go in [`decisions/`](./decisions/) as ADRs.
- **Folder structure** evolves as we add subsystems. When we add a new directory, give it its own `README.md` index.
- **Cross-link liberally.** It's fine to reference docs that don't exist yet — that's a marker for what to write next.

## Current status (snapshot)

> Updated as the project moves. Replace this paragraph when status changes — don't append.

**Phase:** Milestone 01 — Game Discovery. Phase 1.1 (Game Vision) complete.

**Last completed:** Canonical Game Vision document written (`game-design/ai-vision.md` v1). Locks Vision Statement, Player Fantasy (summoned learner / capacity-to-learn / knowledge rarity is environmental), five Target Emotions (comprehension click as primary), four Design Pillars, Knowledge Doctrine (three commitments + recognisability test), Success Criteria (three tiers), Anti-Patterns (eight, capped). Tensions: 1 resolved · 2 form-locked · 3 open. Milestone 01 phase structure updated: phase docs are now working logs / deepening passes on the canonical vision. Three companion files in `00-game-discovery/` retired to redirect stubs.

**Next slice:** Phase 1.2 — Target Feel & Reference Analysis: a deepening pass on `ai-vision.md` §3 (Target Emotions) and §4 (Pillars) through reference game analysis (Pokémon, Zelda, Golden Sun, classic JRPGs + 1–2 indie refs for teaching-through-play).
