# Milestone 04 — Vertical Slice

> **Status:** Planning complete. Ready to implement.
> **Target:** Stage 2 — Podveil Village (Pods concept)
> **Timeline:** 2–4 weeks, one developer
> **Primary question:** Does the ForgeMinds loop work?

---

## What this milestone is

Milestone 04 is the first code milestone. Everything before this has been architecture, design, and planning. This milestone produces a playable game.

The scope is deliberately minimal: one stage, placeholder art throughout, no audio, no save persistence between sessions. The point is not a polished product. The point is a playtest that answers: does knowledge-gated combat feel like gameplay? Does Mira make the player care? Does a person with no Kubernetes knowledge leave understanding what a Pod is?

If any of those answers is no, we learn it now — before 13 more stages are built on broken foundations.

---

## What is being built

**Stage 2 — Podveil Village.** A village whose homes are broken because their Pod structures have been corrupted. The player meets Mira (her home is broken), discovers what a Pod is through scrolls and NPC dialogue, fights Pod Bugs with knowledge-charged combat, navigates a one-room dungeon, defeats the Pod Tyrant boss, watches Mira's home reconnect, and sees Kestran open the northern gate.

Nine beats. One stage. All placeholder art. All real game logic.

---

## What this milestone does NOT include

- Stage 1, Stage 3, or any other stage
- Audio system
- Theme engine (Fantasy/Space swap)
- Inventory or item system
- Player levelling or XP display
- Multiple save slots
- Settings/accessibility menu
- Campaign selection screen (hardcode directly to Stage 2)
- Animated cutscenes
- Campaign-scoped quests (Mira's arc across stages)
- Cast member arc system (Lyra's multi-stage progression)

---

## Success criteria

The milestone is complete when a first-time playtester with no Kubernetes knowledge can:

1. Start the game and enter Podveil Village
2. Meet Mira and understand why her home matters
3. Find scrolls and learn what a Pod is
4. Fight Pod Bugs using knowledge-charged abilities
5. Navigate the dungeon and defeat Warren Knot
6. Defeat the Pod Tyrant boss
7. Watch Mira's home reconnect
8. Pass through Kestran's gate

…and exit the session able to explain what a Pod is in their own words, without prompting.

---

## Documents in this milestone

| Document | Purpose |
|---|---|
| `ai-overview.md` (this file) | Scope, context, success criteria |
| `ai-implementation-plan.md` | System-by-system build plan |
| `ai-task-breakdown.md` | Individual tasks with acceptance criteria |
| `ai-definition-of-done.md` | Precise completion conditions |
| `ai-risk-register.md` | Known risks and mitigations |
| `ai-development-order.md` | Phase A–F build sequence |

---

## Core architectural constraints

All locked decisions from M03 apply. Key ones for implementation:

| Decision | Implication for this milestone |
|---|---|
| D-20: Phaser + React Hybrid | Phaser renders the world canvas; React renders UI overlays |
| D-21: React shell + Phaser canvas | `PhaserGame.tsx` mounts Phaser via `next/dynamic` (ssr:false) |
| D-24A: React-side BeatController | BeatController is a React hook/module, not a Phaser scene |
| D-24B: BootScene + PreloaderScene + StageRuntimeScene | Three scenes only; StageRuntimeScene is reusable |
| D-24C: World Reality Ownership | Phaser owns spatial state; Zustand owns session + progress state |
| D-25: One Beat = One Completion Condition | Each of the 9 beats has exactly one defined completion trigger |
| D-26: Campaign model never enters Phaser | Phaser receives StageContext and commands, not Campaign objects |

---

## Cross-references

- `ai-vertical-slice-definition.md` — canonical scope (what to build)
- `ai-runtime-execution-architecture.md` — how the runtime works
- `ai-engine-architecture.md` — Phaser scene model, GameEventBus
- `ai-mvp-production-plan.md` — the 6-phase build plan this milestone implements
