# Milestone 03 — Technical Architecture

> **Purpose:** Translate the ForgeMinds content architecture (Milestone 02) into concrete technical decisions. Define the technology stack, rendering engine, content loading pipeline, state management, save system, progression engine, theme engine runtime, and a vertical slice that proves the architecture works end-to-end.
> **Status:** Planning complete. Phase 3.1 is the first to execute.
> **Owned by:** AI
> **Opened:** 2026-06-04
> **Inputs:** All 19 locked decisions in `DECISIONS.md`, all Milestone 02 phase documents

---

## What this milestone is

Milestone 02 answered: *"How is ForgeMinds content represented and organised?"*

Milestone 03 answers: *"How does that content become a running game?"*

This is the architectural bridge between the conceptual content model and the engine that executes it. Every decision in this milestone must trace back to a locked decision from Milestone 02 — and every downstream implementation milestone (06 Core Engine onward) must trace forward to a decision made here.

This milestone produces **no code**. It produces decisions, models, and an architectural blueprint that engineers can implement with confidence.

---

## What Milestone 02 established (inputs to this milestone)

Every technical decision in Milestone 03 must serve these locked foundations:

| Foundation | Decision | Impact on M03 |
|---|---|---|
| Content hierarchy | Campaign → Act → Stage → Beat → Payload (D-17) | Engine iterates a Beat sequence — not named slots, not a flat list |
| Challenge Pool | Option B — Concept Pool (D-18) | Engine resolves Challenge lookups by Concept ID + difficulty; pool is platform-level |
| Authoring format | YAML (D-19) | Content authoring is in YAML; runtime format may differ — M03 decides |
| Authoring model | E3 — `campaign.yaml` + `cast/` + `stages/` (D-CA-AUTH) | File structure the content loader must understand |
| Blueprint Viewer | React Flow prototype at `/tools/blueprints` | Engine types must stay compatible with `src/blueprint/data/types.ts` |
| Theme system | ThemeOverride additive, invariant core inviolable (D-CA-TV-1/2/3) | Engine applies ThemeOverrides at content load time; runtime logic never varies by theme |
| Knowledge mastery | Three write-once dimensions: ENCOUNTERED, DEMONSTRATED, APPLIED (D-CA-07) | Save system must persist mastery; death never erases it (Pillar 3) |
| Authoring lifecycle | AI content requires human REVIEW gate (D-CA-LC-1) | Content pipeline enforces lifecycle state before content is PLAYABLE |

---

## Milestone goal

Produce a complete technical architecture document set that defines — conceptually, not in code:

1. **Technology evaluation** — assess all candidate technologies; make the stack decision
2. **Engine architecture** — how the game engine processes the Beat-centric content model at runtime
3. **Content loading pipeline** — how YAML stage files become a running game world
4. **State management** — how runtime game state (player progress, quest state, mastery, inventory) is managed
5. **Save system** — what is persisted, when, where, and how it survives content updates
6. **Progression engine** — how XP, levels, ConceptMastery, and ability unlocks are computed and applied
7. **Theme engine runtime** — how ThemeOverrides are applied to content at load time without touching game logic
8. **Blueprint Runtime Integration** — how the Blueprint Viewer and the game runtime share types and validation
9. **Vertical slice architecture** — what the minimal end-to-end playable slice looks like; which systems it exercises
10. **Architecture review** — consistency, completeness, risk audit before implementation begins

---

## Success criteria

This milestone is complete when:

- [ ] Technology stack is locked with explicit rationale for every choice
- [ ] A new engineer can read M03 docs and trace exactly how a YAML stage file becomes a playable Beat sequence
- [ ] The Beat-centric hierarchy is preserved from file → loader → engine runtime — no named slots appear in the engine
- [ ] The save system design explicitly honours Pillar 3: mastery state is never erasable under any condition
- [ ] The theme system runtime design matches Phase 2.7's ThemeOverride model — invariant core is protected at the engine level
- [ ] The progression engine design aligns with Phase 2.6's PlayerProgress model — XP and ConceptMastery remain parallel non-fungible tracks
- [ ] `src/blueprint/data/types.ts` is formally reconciled with the M03 type definitions
- [ ] The vertical slice defines what "Stage 1 playable" means and what it proves
- [ ] No implementation has started before Phase 3.10 (Architecture Review) exits

---

## What this milestone does NOT do

- Does not write engine code, loader code, or state management code
- Does not write YAML schemas (those are Milestone 04 schema work)
- Does not design specific gameplay mechanics — those are locked in Milestone 02
- Does not design game UI/UX — that is Milestone 07 (World Navigation) and later
- Does not write production save files or database schemas — only the design

---

## Phases

| # | Phase | Deliverable | Execution |
|---|---|---|---|
| 3.1 | Technology Evaluation | `ai-tech-evaluation.md` | Sequential first |
| 3.2 | Engine Architecture | `ai-engine-architecture.md` | After 3.1 |
| 3.3 | Content Loading Pipeline | `ai-content-loading-pipeline.md` | After 3.2 |
| 3.4 | State Management | `ai-state-management.md` | Parallel with 3.3 |
| 3.5 | Save System | `ai-save-system.md` | After 3.3 + 3.4 |
| 3.6 | Progression Engine | `ai-progression-engine.md` | After 3.4 |
| 3.7 | Theme Engine Runtime | `ai-theme-engine-runtime.md` | After 3.3 |
| 3.8 | Blueprint Runtime Integration | `ai-blueprint-runtime-integration.md` | After 3.2 + 3.3 |
| 3.9 | Vertical Slice Architecture | `ai-vertical-slice.md` | After 3.3–3.8 |
| 3.10 | Architecture Review | `ai-m03-architecture-review.md` + `you-technical-review.md` | Final |

**Execution order:**
```
3.1 (Technology)
  ↓
3.2 (Engine Architecture)
  ↓
3.3 (Content Loading) ──────┬──── 3.4 (State Management)
  ↓                          ↓           ↓
3.7 (Theme Runtime)      3.5 (Save)   3.6 (Progression)
  └──────────────────────────┴───────────┘
                              ↓
                   3.8 (Blueprint Integration)
                              ↓
                   3.9 (Vertical Slice)
                              ↓
                   3.10 (Architecture Review)
```

---

## Key open questions entering M03

These must be answered — they are the substance of Phase 3.1:

1. **Engine choice:** Phaser 3 is already in `package.json`. Is it the right engine for a Beat-driven RPG where the content model is the central abstraction? Or is a lighter rendering library (PixiJS — also in `package.json`) more appropriate, with game logic living above it?

2. **Rendering layer vs game engine:** ForgeMinds has both Phaser (game engine) and PixiJS (renderer) installed. Are these alternatives or complements? The answer shapes the entire engine architecture.

3. **React/Next.js coexistence:** Phaser renders to a canvas; React renders to the DOM. The Blueprint Viewer is React/React Flow. How do these coexist? Does React own the shell (menus, tooling) while the game runs in a canvas? Or is the entire game React-based with no canvas engine?

4. **YAML → Runtime format:** YAML is the authoring format (D-19). Does the engine parse YAML directly at runtime, or does a build step compile YAML to JSON (or TypeScript types)? The answer has significant implications for hot-reload, bundle size, and content pipeline complexity.

5. **State management:** Zustand is installed. Is it appropriate for game-loop state (frame-by-frame position, animation) as well as persistent game state (mastery, quests)? Or should these be separate state systems with a clear boundary?

6. **Save persistence:** Browser `localStorage` (simple, limited to ~5MB), `IndexedDB` (larger, async, more complex), or server-side (requires auth, backend)? The answer is shaped by campaign size and multi-device requirements.

7. **Type sharing between Blueprint Viewer and engine:** `src/blueprint/data/types.ts` defines the Campaign model. How are these types shared without coupling the viewer to the engine? A shared package? A single canonical definition?

---

## Dependencies

**Upstream (M03 depends on):**
- All 19 locked decisions in `DECISIONS.md` (especially D-17, D-18, D-19, D-CA-AUTH)
- `content-architecture/ai-beat-model.md` — the Beat definition the engine must implement
- `content-architecture/ai-content-authoring-architecture.md` — file structure the loader reads
- `content-architecture/ai-theme-variant-architecture.md` — ThemeOverride model the engine applies
- `content-architecture/ai-phase-02-06-progression-reward-item-model.md` — PlayerProgress model
- `src/blueprint/data/types.ts` — baseline Campaign TypeScript types to reconcile

**Downstream (blocked until M03):**
- Milestone 04 (Content Architecture schemas) — needs M03 type definitions
- Milestone 06 (Core Engine Foundation) — needs M03 technology decisions
- Milestone 10 (Learning System) — needs M03 progression engine design
- Blueprint Viewer real data adapter — needs M03 content loading design
- All implementation milestones (06–15) — cannot start until M03 architecture review passes

---

## Risks

1. **Phaser + React integration complexity** (High). Phaser is a canvas game engine; React renders to the DOM. The coexistence pattern must be designed carefully. A poor decision here creates permanent architectural tension. Phase 3.1 must evaluate this explicitly and Phase 3.2 must resolve it.

2. **YAML runtime parsing bundle size** (Medium). If YAML is parsed in the browser at runtime, it adds ~50KB+ to the bundle and introduces async loading complexity. A build-time YAML → JSON/TypeScript step adds tooling but solves both problems. Phase 3.3 decides.

3. **State management scope creep** (Medium). Mixing game-loop state (frame-level) and persistent state (mastery, quests, save) in one system creates bugs. Phase 3.4 must draw a hard boundary between them.

4. **Type drift** (Low-Medium). If `src/blueprint/data/types.ts` and the engine's runtime types diverge, the Blueprint Viewer stops being a reliable preview of the real game. Phase 3.8 (Blueprint Runtime Integration) must formally prevent this.

5. **Vertical slice scope** (Low). Phase 3.9 (Vertical Slice) can easily become too ambitious ("we should build a whole stage") or too trivial ("just render a box"). Phase 3.9 must define a slice that exercises the full pipeline — loading, rendering, state, save — with the smallest possible gameplay scope.

---

## Exit criteria

Milestone 03 is done when:

- [ ] All 10 phase deliverables are written (not stubs)
- [ ] Phase 3.10 (Architecture Review) passes with no Critical issues
- [ ] Human review (`you-technical-review.md`) is completed and signed off
- [ ] `DECISIONS.md` is updated with all M03 technology and architecture decisions
- [ ] No phase deliverable contains implementation code (this milestone is architectural only)
- [ ] The vertical slice (Phase 3.9) is defined precisely enough that Milestone 06 can begin building it

---

## Cross-references

- `DECISIONS.md` — 19 locked decisions from M02 that constrain every M03 decision
- `milestones/milestone-02-content-architecture/ai-milestone-closure.md` — M02 full output list
- `content-architecture/ai-beat-model.md` — canonical Beat definition the engine must implement
- `content-architecture/ai-content-authoring-architecture.md` — E3 YAML file structure
- `content-architecture/ai-theme-variant-architecture.md` — ThemeOverride system
- `content-architecture/ai-phase-02-04-knowledge-challenge-model.md` — ConceptMastery model
- `content-architecture/ai-phase-02-06-progression-reward-item-model.md` — PlayerProgress model
- `src/blueprint/data/types.ts` — baseline Campaign types (must be reconciled in Phase 3.8)
- `milestones/milestone-03-technical-architecture/ai-phase-plan.md` — phase-by-phase detail
