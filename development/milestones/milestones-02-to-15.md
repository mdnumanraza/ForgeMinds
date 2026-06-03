# Milestones 02–15 — Overview Stubs

> **Purpose:** Placeholder overviews for milestones not yet opened. Each will be expanded into its own subdirectory (like `milestone-01-game-discovery/`) when that milestone becomes active.
> **Status:** Stubs — not yet detailed.
> **Owned by:** AI

---

## Milestone 02 — Architecture Discovery

> **Goal:** Map all candidate technical architectures and their trade-offs before any implementation begins.
> **Status:** Not started. Opens after Milestone 01 exit criteria are met.

### TODO
- [ ] Define milestone goal and why it exists
- [ ] List deliverables (rendering options, state management, content storage, AI layer, save system)
- [ ] Map dependencies on Milestone 01 vision output
- [ ] Identify risks (tech lock-in, over-engineering, under-engineering)
- [ ] Define exit criteria
- [ ] Break into 5–10 phases
- [ ] Human review: `you-architecture-approval.md`

---

## Milestone 03 — Design Decisions

> **Goal:** Lock gameplay loop, progression model, world structure, learning-delivery model, and combat/challenge model as ADRs.
> **Status:** Not started. Opens after Milestone 02.

### TODO
- [ ] Define milestone goal and why it exists
- [ ] List deliverables (gameplay loop ADR, progression ADR, world structure ADR, learning delivery ADR, combat/challenge ADR)
- [ ] Resolve open Tension 3 (returning-expert vs. under-prepared player)
- [ ] Map dependencies on Milestones 01–02
- [ ] Identify risks (premature lock, missing edge cases)
- [ ] Define exit criteria
- [ ] Human review: `you-decisions-review.md`

---

## Milestone 04 — Content Architecture

> **Goal:** Design how campaigns, stages, quests, NPCs, enemies, bosses, dialogs, questions, rewards, and items are stored, authored, and themed.
> **Status:** Not started. Opens after Milestone 03.

### TODO
- [ ] Define milestone goal and why it exists
- [ ] Detail 10 schema stubs already in `content-architecture/`
- [ ] Map dependencies on Milestone 03 locked gameplay loop
- [ ] Identify risks (schema rigidity, theming complexity, authoring complexity)
- [ ] Define exit criteria
- [ ] Human review: `you-content-model-review.md`

---

## Milestone 05 — Asset Strategy

> **Goal:** Plan required assets for Fantasy and Space themes, sources, gaps, and human collection trackers.
> **Status:** Not started. Opens after Milestone 04.

### TODO
- [ ] Define milestone goal and why it exists
- [ ] Detail asset stubs already in `assets/fantasy/` and `assets/space/`
- [ ] Map dependencies on Milestone 04 content architecture
- [ ] Identify risks (asset availability, licensing, scope creep)
- [ ] Define exit criteria
- [ ] Human tasks: `you-asset-collection-tracker.md` (fantasy + space), `you-art-decisions.md`

---

## Milestone 06 — Core Engine Foundation

> **Goal:** Plan the core runtime: scene graph, update loop, input, camera, asset loading, time/state management.
> **Status:** Not started. Opens after Milestone 05.

### TODO
- [ ] Define milestone goal and why it exists
- [ ] List deliverables
- [ ] Map dependencies on Milestones 02 architecture decisions
- [ ] Identify risks
- [ ] Define exit criteria
- [ ] Human review: `you-engine-review.md`

---

## Milestone 07 — World Navigation

> **Goal:** Plan exploration, tile/world rendering, region transitions, minimap, and fast-travel rules.
> **Status:** Not started. Opens after Milestone 06.

### TODO
- [ ] Define milestone goal and why it exists
- [ ] List deliverables
- [ ] Map dependencies
- [ ] Identify risks
- [ ] Define exit criteria
- [ ] Human review: `you-navigation-feel-review.md`

---

## Milestone 08 — NPC Interactions

> **Goal:** Plan NPC types, dialogue trees, schedules/states, and quest hooks.
> **Status:** Not started. Opens after Milestone 07.

### TODO
- [ ] Define milestone goal and why it exists
- [ ] List deliverables
- [ ] Reference `game-design/ai-dialogue-system.md` stub
- [ ] Map dependencies
- [ ] Identify risks
- [ ] Define exit criteria
- [ ] Human review: `you-dialogue-tone-review.md`

---

## Milestone 09 — Quest System

> **Goal:** Plan quest data model, lifecycle, journal UI, branching, completion, failure, and rewards.
> **Status:** Not started. Opens after Milestone 08.

### TODO
- [ ] Define milestone goal and why it exists
- [ ] List deliverables
- [ ] Reference `game-design/ai-quest-system.md` and `ai-reward-system.md` stubs
- [ ] Map dependencies
- [ ] Identify risks
- [ ] Define exit criteria
- [ ] Human review: `you-quest-flow-review.md`

---

## Milestone 10 — Learning System

> **Goal:** Plan how Kubernetes concepts are introduced, practiced, and verified through gameplay — not quizzes.
> **Status:** Not started. Opens after Milestone 09.

### TODO
- [ ] Define milestone goal and why it exists
- [ ] List deliverables
- [ ] Reference `game-design/ai-knowledge-system.md` stub
- [ ] Address Tension 2 (mastery detection without quiz aesthetics) residual from Milestone 03
- [ ] Map dependencies
- [ ] Identify risks
- [ ] Define exit criteria
- [ ] Human review: `you-learning-quality-review.md`

---

## Milestone 11 — Enemy Encounters

> **Goal:** Plan random/scripted encounters, enemy AI, pacing, and difficulty scaling.
> **Status:** Not started. Opens after Milestone 10.

### TODO
- [ ] Define milestone goal and why it exists
- [ ] List deliverables
- [ ] Reference `game-design/ai-enemy-system.md` stub
- [ ] Reference enemy designs from `game-design/ai-campaign-structure.md`
- [ ] Map dependencies
- [ ] Identify risks
- [ ] Define exit criteria
- [ ] Human review: `you-encounter-pacing-review.md`

---

## Milestone 12 — Boss Battles

> **Goal:** Plan boss design, mechanics, multi-phase fights, knowledge-gating, and narrative payoff.
> **Status:** Not started. Opens after Milestone 11.

### TODO
- [ ] Define milestone goal and why it exists
- [ ] List deliverables
- [ ] Reference `game-design/ai-boss-system.md` stub
- [ ] Reference boss designs from `game-design/ai-campaign-structure.md`
- [ ] Address Critical issue from campaign review: boss progression gap (single→cross-concept jump)
- [ ] Map dependencies
- [ ] Identify risks
- [ ] Define exit criteria
- [ ] Human review: `you-boss-feel-review.md`

---

## Milestone 13 — Save System

> **Goal:** Plan save data shape, slots, autosave rules, migration strategy, and anti-corruption.
> **Status:** Not started. Opens after Milestone 12.

### TODO
- [ ] Define milestone goal and why it exists
- [ ] List deliverables
- [ ] Reference `game-design/ai-save-system.md` stub
- [ ] Map dependencies
- [ ] Identify risks
- [ ] Define exit criteria
- [ ] Human review: `you-save-edge-case-review.md`

---

## Milestone 14 — Theme Engine

> **Goal:** Plan how the same content renders as Fantasy vs Space without forking content.
> **Status:** Not started. Opens after Milestone 13.

### TODO
- [ ] Define milestone goal and why it exists
- [ ] List deliverables (Space theme names for all 14 stages, skinning system design)
- [ ] Reference `assets/fantasy/` and `assets/space/` stubs
- [ ] Map dependencies on Milestone 04 content schemas
- [ ] Identify risks
- [ ] Define exit criteria
- [ ] Human tasks: `you-theme-selection.md`, `you-art-decisions.md`

---

## Milestone 15 — Content Expansion & Polish

> **Goal:** Plan content authoring pipeline, balancing pass, accessibility, juice, telemetry, and launch readiness.
> **Status:** Not started. Opens after Milestone 14.

### TODO
- [ ] Define milestone goal and why it exists
- [ ] List deliverables
- [ ] Address 3 expandable optional regions (E1: Ingress Depths, E2: Helm Forge, E3: Chaos Cluster)
- [ ] Map dependencies
- [ ] Identify risks
- [ ] Define exit criteria
- [ ] Human review: `you-launch-readiness-review.md`
