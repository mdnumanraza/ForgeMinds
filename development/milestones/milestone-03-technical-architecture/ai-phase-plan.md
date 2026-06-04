# Milestone 03 — Phase Plan

> **Purpose:** Detailed execution plan for each phase. A future session can pick up any phase from this document and execute it without needing to rediscover context.
> **Status:** Planning complete. Phase 3.1 is the first to execute.
> **Owned by:** AI

---

## How to use this document

Each phase section includes:
- **Objective** — the single question this phase answers
- **Input** — what must exist and be read before this phase runs
- **Deliverable** — the specific file and what it must contain
- **Key questions** — the concrete decisions this phase must resolve
- **Constraints** — locked decisions from M02/M03 that bound this phase
- **Execution order** — what can run in parallel, what must be sequential
- **Validation** — how to confirm this phase is complete
- **Critical decisions** — decisions that will flow into `DECISIONS.md`

---

## Phase 3.1 — Technology Evaluation

**Objective:** Evaluate all candidate technologies for the ForgeMinds stack and make the engine decision. This is the first and most consequential phase — every subsequent phase depends on it.

**Input:**
- `src/package.json` — current installed packages (Phaser 3, PixiJS, Zustand, React 19, Next.js 15, Framer Motion, Zod, TanStack Query)
- `game-design/ai-vision.md` — gameplay pillars that constrain engine choice
- `game-design/ai-gameplay-loop.md` — the three-scale loop the engine must support
- `content-architecture/ai-beat-model.md` — Beat-centric architecture the engine must iterate
- `milestones/milestone-03-technical-architecture/ai-overview.md` — open questions entering M03

**Deliverable:** `milestones/milestone-03-technical-architecture/ai-tech-evaluation.md`

Content must include:
- Evaluation matrix: each candidate tech (Phaser, PixiJS, pure React, canvas API) rated against: Beat iteration model, React/Next.js coexistence, JRPG rendering requirements, learning-system integration, long-term maintainability
- Explicit decision on: game engine vs rendering library vs hybrid
- Explicit decision on: React coexistence pattern (React shell + canvas game vs full React game vs other)
- Explicit decision on: YAML runtime parsing vs build-time compilation
- Explicit decision on: Zustand scope (game-loop state vs persistent state vs both)
- Stack summary: one paragraph per chosen technology with rationale

**Key questions:**
- Phaser vs PixiJS vs both vs neither — which approach best serves Beat-centric architecture?
- Does the game run inside a React component, or does React wrap a standalone canvas?
- Is YAML parsed at runtime (js-yaml in-browser) or compiled at build time (YAML → JSON/TS via a build step)?
- Is Zustand appropriate for frame-level game state, or only for persistent state?
- What is the boundary between Next.js (web app shell) and the game runtime?

**Constraints:**
- Pillar 4 (Adventure first, lesson second): the engine must be capable of smooth, game-feeling interactions — not a slide deck
- Beat-centric model (D-17): the engine iterates `Stage.beats: Beat[]` — it never has named slot logic for "the dungeon" or "the boss"
- Blueprint Viewer compatibility: final engine types must be compatible with `src/blueprint/data/types.ts`
- Both Phaser and PixiJS are already installed — the decision may be to use one, both, or neither

**Validation:**
- [ ] Every candidate technology evaluated against ForgeMinds' specific requirements
- [ ] Final stack decision stated with explicit tradeoff acknowledgement
- [ ] React/canvas coexistence pattern decided
- [ ] YAML runtime vs build-time decision made
- [ ] No "we'll figure it out later" on any of the 7 open questions from the overview

**Critical decisions for `DECISIONS.md`:**
> D-20: Game engine choice (Phaser / PixiJS / pure React / hybrid)
> D-21: React + game runtime coexistence pattern
> D-22: YAML loading strategy (runtime parse vs build-time compile)
> D-23: Zustand scope boundary (persistent state only vs also frame state)

---

## Phase 3.2 — Engine Architecture

**Objective:** Design how the game engine processes the Beat-centric content model at runtime. Define the engine's internal structure — scene management, game loop, Beat execution model, and how it receives content.

**Input:**
- Phase 3.1 deliverable (`ai-tech-evaluation.md`) — stack is locked
- `content-architecture/ai-beat-model.md` — Beat entity, 12 types, ordering rules
- `game-design/ai-gameplay-loop.md` — moment-to-moment, session, stage-arc loops
- `content-architecture/ai-phase-02-02-campaign-act-stage-model.md` — Campaign/Act/Stage structure

**Deliverable:** `milestones/milestone-03-technical-architecture/ai-engine-architecture.md`

Content must include:
- Engine scene hierarchy: how Campaign, Act, Stage, and Beats map to engine scenes or states
- Beat execution model: how the engine iterates a Stage's Beat sequence; what happens when a Beat fires; what constitutes Beat completion
- Beat type handlers: for each of the 12 Beat types, what the engine does (a conceptual description, not code)
- Game loop design: update loop, render loop, input handling — at the architecture level
- Content ingestion boundary: the exact interface at which the engine receives a `Campaign` object (from the loader)
- Stage transition model: how the engine moves from one Stage to the next via a PORTAL Beat
- Act Boss model: how ActBoss (owned by Act, not Stage) is scheduled and executed

**Key questions:**
- Is each Stage a separate scene, or are they all loaded into one persistent scene?
- Does the engine "know" about Beat types, or does it dispatch to handlers that know?
- How does the engine determine a Beat is "complete" vs "in progress"? (A KNOWLEDGE Beat completes when the player closes the panel; an ENCOUNTER Beat completes when the enemy is defeated)
- How does the engine handle mid-Beat saves? (Pacing rule: no mid-beat saves — how is this enforced architecturally?)
- How are AppearanceTriggers (Stage → CastMember dialogue activation) processed at runtime?

**Constraints:**
- Beat-centric model (D-17): engine must not have any logic specific to beat names like "dungeon" or "boss" — it must dispatch generically to typed handlers
- Pacing rule 5 (no mid-beat saves): saves land after Beat completion — engine must have a concept of "Beat boundary" for save eligibility
- Knowledge mastery (write-once): ENCOUNTERED mastery fires when a KnowledgeBeat's panel closes — this must be an explicit engine event
- React coexistence pattern (D-21): engine architecture must respect the decided boundary

**Validation:**
- [ ] Every Beat type has a defined handler description
- [ ] Beat completion is defined for every Beat type (what triggers completion)
- [ ] AppearanceTrigger execution is described
- [ ] Mid-beat save prevention is architecturally accounted for
- [ ] The content ingestion interface is defined (what the engine receives and from where)

**Critical decisions:**
> D-24: Scene management model (one scene per stage vs persistent scene)
> D-25: Beat completion event model

---

## Phase 3.3 — Content Loading Pipeline

**Objective:** Define the complete data pipeline from YAML content files on disk to a loaded, theme-applied, validation-passed `Campaign` TypeScript object in the engine's memory.

**Input:**
- Phase 3.2 (`ai-engine-architecture.md`) — content ingestion boundary is defined
- `content-architecture/ai-content-authoring-architecture.md` — E3 file structure
- `content-architecture/ai-theme-variant-architecture.md` — ThemeOverride application model
- `content-architecture/ai-authoring-lifecycle.md` — PLAYABLE state is the gate for loadable content
- D-19 (YAML format), D-22 (runtime parse vs build-time compile)

**Deliverable:** `milestones/milestone-03-technical-architecture/ai-content-loading-pipeline.md`

Content must include:
- Pipeline stages: source files → parse → validate → resolve references → apply theme → produce runtime object
- YAML compilation decision (from D-22): if build-time, what the build step looks like; if runtime, how async loading is managed
- Reference resolution: how `castMemberId` references in stage files are resolved to full `CastMember` objects
- Challenge Pool resolution: how the engine resolves an Enemy's concept reference + difficulty filter to a concrete `Challenge[]` (D-18 Option B)
- ThemeOverride application: at which pipeline stage overrides are merged; how invariant core is protected
- Validation integration: which validation rules run in the pipeline (all `validateStage` rules from Blueprint Viewer + new rules)
- Error handling: what happens when a stage file fails validation — does loading abort, skip the stage, or surface a warning?
- Hot-reload design: how content changes during development are picked up without restarting the engine

**Key questions:**
- Does the pipeline run at startup (load all content), or lazily (load stages on demand)?
- Where does Challenge Pool lookup happen — at load time (materialise challenges into stage objects) or at runtime (engine queries the pool dynamically)?
- If a stage has a ThemeOverride for theme X and the player has selected theme Y (which has no override for this stage), what happens?
- How does the pipeline handle the Campaign's optional stage registry — are expandable stages loaded upfront or deferred?

**Constraints:**
- D-CA-LC-1 (lifecycle): only PLAYABLE-state content may be loaded by the pipeline — DRAFT/REVIEW/APPROVED content is invisible to the engine
- D-18 (Concept Pool): Challenge resolution must query platform-level concept pools, not stage-embedded challenges
- D-CA-TV-1 (invariant core): the pipeline must protect invariant fields from theme overrides — this is enforced at the merge step, not at authoring time
- E3 authoring structure (D-CA-AUTH): pipeline must understand `campaign.yaml`, `cast/*.yaml`, `stages/*.yaml`

**Validation:**
- [ ] Every pipeline stage is named and described
- [ ] Challenge Pool B resolution is explicitly designed
- [ ] ThemeOverride merge and invariant protection are explicitly designed
- [ ] Lifecycle gate (PLAYABLE only) is enforced in the pipeline
- [ ] Hot-reload is designed (even if deferred to Milestone 06 implementation)

**Critical decisions:**
> D-26: Lazy vs eager content loading strategy
> D-27: Challenge Pool lookup timing (load-time materialise vs runtime query)

---

## Phase 3.4 — State Management

**Objective:** Define the runtime state architecture — how the engine tracks and mutates player state, quest state, and game world state across a session, and how different state categories are kept cleanly separated.

**Input:**
- Phase 3.1 (D-23: Zustand scope boundary)
- Phase 3.2 (`ai-engine-architecture.md`) — engine event model
- `content-architecture/ai-phase-02-06-progression-reward-item-model.md` — PlayerProgress model
- `content-architecture/ai-phase-02-04-knowledge-challenge-model.md` — ConceptMastery model
- `content-architecture/ai-phase-02-03-quest-npc-castmember-model.md` — Quest lifecycle

**Deliverable:** `milestones/milestone-03-technical-architecture/ai-state-management.md`

Content must include:
- State categories: define at minimum (a) frame-level rendering state, (b) session-level game state (current position, HP, active quests), (c) persistent state (mastery, inventory, quest completion, progression level)
- State boundary: the explicit line between categories — what lives in each, what crosses the boundary and how
- ConceptMastery state: how ENCOUNTERED/DEMONSTRATED/APPLIED are stored, updated, and queried at runtime (write-once enforcement)
- Quest state machine: how a Quest transitions through DORMANT → AVAILABLE → ACTIVE → COMPLETED at runtime
- AppearanceTrigger state: how the engine tracks which CastMember dialogue states have been activated per stage visit
- Beat progress state: how the engine knows which Beats in the current Stage have been completed
- State reset on death: exactly which state resets (position, HP) and which never resets (mastery, quest completion, inventory)

**Key questions:**
- Is Zustand used for all state categories, or only persistent state? What manages frame-level state?
- How is ConceptMastery state queried in real-time (dialogue branches, traversal gates, quest resolution) without performance cost?
- Does quest state live in the engine's own store, or in a Zustand slice?
- How does the state system handle the boundary between "in this stage" state (Beat progress, NPC dialogue state) and "campaign-wide" state (mastery, inventory)?

**Constraints:**
- D-CA-07 (ConceptMastery as state, not stat): mastery has no numeric value — it is a set of boolean flags per Concept per dimension
- Pillar 3 (failure teaches, never punishes): death resets position and HP — explicitly never resets ENCOUNTERED/DEMONSTRATED/APPLIED
- Anti-Pattern 7.4 (no knowledge stat): no numeric knowledge score anywhere in the state model

**Validation:**
- [ ] All three state categories are defined with explicit contents
- [ ] ConceptMastery write-once enforcement is described
- [ ] Death reset boundary is explicitly stated (what resets, what does not)
- [ ] Quest state machine is fully defined
- [ ] AppearanceTrigger state tracking is designed

**Critical decisions:**
> D-28: State category partitioning (frame / session / persistent)

---

## Phase 3.5 — Save System

**Objective:** Design what is serialised to permanent storage, when and how often, how it is versioned, and how it is restored — while respecting the architectural constraint that mastery state is never erasable.

**Input:**
- Phase 3.4 (`ai-state-management.md`) — the state model to be persisted
- Phase 3.2 (`ai-engine-architecture.md`) — Beat completion events (save eligibility)
- `game-design/ai-gameplay-loop.md §2` — checkpoint discipline (saves after Beats, never mid-Beat)

**Deliverable:** `milestones/milestone-03-technical-architecture/ai-save-system.md`

Content must include:
- Save payload definition: exactly which fields from the state model are serialised
- Save trigger model: when autosave fires (Beat completion, stage completion, portal crossing) and what triggers a manual save
- Storage backend decision: localStorage vs IndexedDB vs server-side — with explicit tradeoff analysis
- Slot model: single save slot vs multiple; implications for "new game" behaviour
- Versioning strategy: how save data from version N is migrated when content changes (e.g., a stage is updated after a player has partially completed it)
- Restore model: how saved state is loaded back into the engine's state system
- Death handling: the precise save/restore behaviour when a player dies (position resets, HP resets, mastery preserved)
- Corruption handling: what the engine does if a save file is unreadable (corrupt, outdated, tampered)

**Key questions:**
- Does the save include the full state of all discovered content (every ENCOUNTERED mastery flag) or just deltas from a baseline?
- If a player saves mid-dungeon and the dungeon's stage file changes (new beats added), can they still load that save?
- Is the save format human-readable (YAML/JSON) or binary?
- Does the save encode Beat completion state per-stage, or only stage completion?

**Constraints:**
- Pillar 3 (mastery never erased): any save operation that would delete a DEMONSTRATED or APPLIED flag is a validation error — must be architecturally impossible
- Checkpoint discipline (gameplay loop pacing rule 5): saves only fire at Beat boundaries — never mid-Beat
- Anti-Pattern 7.6 (failure as erasure): death never rolls back completed knowledge

**Validation:**
- [ ] Save payload explicitly lists what is and is not included
- [ ] Save trigger model covers both autosave and manual save
- [ ] Storage backend is decided with rationale
- [ ] Versioning/migration strategy is designed
- [ ] Death restore behaviour is explicitly defined

**Critical decisions:**
> D-29: Save storage backend (localStorage / IndexedDB / server)
> D-30: Save slot model (single / multiple)

---

## Phase 3.6 — Progression Engine

**Objective:** Design how player progression (XP, levels, ConceptMastery, ability unlocks) is computed, applied, and displayed — ensuring XP and mastery remain parallel non-fungible tracks.

**Input:**
- Phase 3.4 (`ai-state-management.md`) — state model for progression data
- `content-architecture/ai-phase-02-06-progression-reward-item-model.md` — PlayerProgress, ProgressionLevel, Reward, Item, Ability models
- `content-architecture/ai-phase-02-04-knowledge-challenge-model.md` — ConceptMastery dimensions
- `game-design/ai-vision.md §7.4` — Anti-Pattern: knowledge as a side stat

**Deliverable:** `milestones/milestone-03-technical-architecture/ai-progression-engine.md`

Content must include:
- XP computation model: when XP is awarded, how much, and how it maps to level thresholds
- Level-up event: what the engine does when a ProgressionLevel threshold is crossed (ability unlock, visual feedback)
- ConceptMastery update model: which engine events trigger ENCOUNTERED / DEMONSTRATED / APPLIED updates, in which order
- Reward processing: how the engine processes a `Reward` object (XP grant, item grant, ability unlock, story flag set)
- Mastery-gated content: how the engine checks ConceptMastery before allowing traversal, dialogue branches, and quest resolution — without coupling these systems tightly
- The XP / mastery non-fungibility guarantee: the architectural mechanism that ensures a player cannot gain mastery by accumulating XP, or levels by grinding mastery

**Key questions:**
- When does DEMONSTRATED mastery fire — immediately on a correct challenge answer, or after a minimum number of correct answers?
- Can a player reach max level without demonstrating mastery of any concept? (Answer: yes — they will find mastery-gated content locked; this is by design)
- How does the engine deliver the reward "story progression flag" — what system owns story flags?

**Constraints:**
- Anti-Pattern 7.4 (knowledge as side stat): no numeric knowledge value; mastery is boolean per dimension
- Anti-Pattern 7.8 (no cross-game progression): all progression data is scoped to the active campaign — engine must not have global progression state
- D-CA-LC-2 (lifecycle floors): only content in PLAYABLE state contributes to or is required for progression

**Validation:**
- [ ] XP and ConceptMastery update paths are explicitly separate
- [ ] ENCOUNTERED/DEMONSTRATED/APPLIED triggers are each associated with a specific engine event
- [ ] Reward processing covers all reward types from Phase 2.6
- [ ] Mastery-gating is designed without tight coupling

---

## Phase 3.7 — Theme Engine Runtime

**Objective:** Design how the engine applies ThemeOverrides to content at load time, producing a fully-themed runtime content object without any theme logic appearing in gameplay code.

**Input:**
- Phase 3.3 (`ai-content-loading-pipeline.md`) — where in the pipeline theme application happens
- `content-architecture/ai-theme-variant-architecture.md` — ThemeOverride model, invariant core rules, validation rules TVL-1 through TVL-5
- D-CA-TV-1/2/3 — invariant core protection, CastMember arc invariance, additive-only overrides

**Deliverable:** `milestones/milestone-03-technical-architecture/ai-theme-engine-runtime.md`

Content must include:
- Theme selection model: when and how the player selects a theme; how that selection is persisted; when it can be changed
- Override application algorithm: the precise merge operation (base entity + ThemeOverride → themed runtime object) — conceptually described
- Invariant core protection: the mechanism that prevents a ThemeOverride from touching invariant fields — where in the pipeline this is enforced
- Missing override handling: what happens at runtime when the active theme has no override for a given entity (fallback to base; surface as a validation warning)
- Theme-neutral gameplay guarantee: how the engine ensures that no gameplay logic (quest resolution, mastery checks, boss phase transitions) ever branches on theme identity
- Blueprint Viewer theme integration: how the viewer's future theme-selector mode would work given this runtime design

**Key questions:**
- Is theme selection a game-start decision or can it be changed mid-campaign? (With implications for save state.)
- If a theme is incomplete (some stages have overrides, others don't), does the engine allow play with mixed-theme content, or block until the theme is complete?
- How does the engine serve NPC names to the UI — from the themed object directly, or via a theme-aware lookup?

**Constraints:**
- Rule TB-1 (invariant core inviolable): the engine must reject any ThemeOverride that touches invariant fields — this is a hard runtime error, not a warning
- Rule TB-2 (themes cannot change gameplay pacing): no Beat type or position may differ between themes
- D-CA-TV-3 (additive-only): the merge operation only patches; it never replaces the base object

**Validation:**
- [ ] Override merge algorithm is described precisely enough to implement
- [ ] Invariant core protection is described as a concrete enforcement mechanism
- [ ] Theme-neutral gameplay guarantee is stated as a design rule enforced in the engine layer
- [ ] Missing override handling is designed

---

## Phase 3.8 — Blueprint Runtime Integration

**Objective:** Design how the Blueprint Viewer and the game engine share types, validation, and content pipeline without coupling their implementations — so changes to one do not break the other.

**Input:**
- Phase 3.3 (`ai-content-loading-pipeline.md`) — the engine's content model
- `src/blueprint/data/types.ts` — current viewer type definitions
- `src/blueprint/validation/rules.ts` — current 7 validation rules
- `src/blueprint/data/adapter.ts` — current Campaign → React Flow adapter

**Deliverable:** `milestones/milestone-03-technical-architecture/ai-blueprint-runtime-integration.md`

Content must include:
- Type reconciliation plan: a diff between `src/blueprint/data/types.ts` and the M03 engine types — what needs to be added (themeOverrides, lifecycleState, phaseExposureMechanism) and how the reconciliation is done without breaking the viewer
- Shared type strategy: options — (a) single canonical `types.ts` shared by viewer and engine; (b) viewer types derived from engine types; (c) parallel types with a runtime adapter; recommendation and rationale
- Validation pipeline extension: how the Blueprint Viewer's 7 rules become the engine's content validation rules — are they the same code, the same logic in different implementations, or one canonical source?
- Blueprint Viewer as development tool: how the viewer integrates with the real content pipeline (reading from YAML files rather than TypeScript mock objects) — the architecture of the real data adapter
- Live validation: how validation errors surface in the viewer when a real YAML file is malformed or fails a rule

**Key questions:**
- Should `src/blueprint/data/types.ts` be the canonical type definition for both the viewer and the engine? If yes, it becomes a shared library concern. If no, how is parity maintained?
- Should validation rules live in the Blueprint Viewer codebase (`src/blueprint/validation/rules.ts`) and be imported by the engine, or should they live somewhere both can access?
- When the viewer loads a real YAML campaign file, does it go through the same content pipeline as the engine, or a separate path?

**Constraints:**
- Blueprint Viewer must not be coupled to the game engine — it is a development tool that can run independently
- The viewer's `Campaign` type and the engine's `Campaign` type must be compatible at the semantic level, even if not identical structurally

**Validation:**
- [ ] Type reconciliation plan is complete (every missing field identified)
- [ ] Shared type strategy is decided with rationale
- [ ] Validation rule sharing strategy is decided
- [ ] Real data adapter architecture is designed (YAML → Campaign for the viewer)

**Critical decisions:**
> D-31: Shared type strategy (single canonical / derived / parallel with adapter)
> D-32: Validation rule ownership (viewer-owned / engine-owned / shared package)

---

## Phase 3.9 — Vertical Slice Architecture

**Objective:** Define the minimal end-to-end playable slice that validates the M03 architecture — what it includes, what it proves, and what it does not need to include.

**Input:**
- All Phase 3.1–3.8 deliverables — the full M03 architecture
- `game-design/ai-campaign-structure.md §Stage 1 — The Hollow Fields` — the proposed slice subject
- `game-design/ai-gameplay-loop.md §Concrete example — the Pods stage` — the gameplay model

**Deliverable:** `milestones/milestone-03-technical-architecture/ai-vertical-slice.md`

Content must include:
- Slice scope: exactly which Stage, which Beats, which systems are exercised — and what is deliberately excluded
- Architectural coverage matrix: which M03 systems the slice proves (content loading, Beat iteration, state management, save/restore, progression, theme application, Blueprint Viewer integration, validation pipeline)
- Success criteria for the slice: a concrete list of things that must work for the slice to be considered proven
- Excluded scope: what is NOT required in the vertical slice (multi-stage, act bosses, full campaign, all Beat types, audio, polish)
- Implementation guidance: the specific Beats to implement, in which order, to build up to the full slice incrementally

**Constraints:**
- The slice must exercise the full content pipeline (YAML → Campaign → Beat sequence → engine)
- The slice must include at least one KNOWLEDGE Beat, one ENCOUNTER Beat (with Challenge), and one QUEST Beat — these are the three core learning mechanisms
- The slice must exercise the save/restore cycle at least once (save after Beat completion; restore and verify mastery is preserved)
- The slice must exercise at least one ThemeOverride (base + one theme variant for one entity)

**Validation:**
- [ ] Slice scope is defined precisely enough that a developer knows exactly what to build
- [ ] All M03 systems are accounted for (some exercised, some explicitly deferred)
- [ ] Success criteria are observable and testable

---

## Phase 3.10 — Architecture Review

**Objective:** Audit the full M03 architecture for consistency, completeness, risks, and readiness before implementation begins. This is the gate that closes Milestone 03.

**Input:** All Phase 3.1–3.9 deliverables

**Deliverables:**
- `milestones/milestone-03-technical-architecture/ai-m03-architecture-review.md` — AI-authored review
- `milestones/milestone-03-technical-architecture/you-technical-review.md` — human sign-off

**Review dimensions:**
- Internal consistency: do all phase deliverables agree with each other?
- M02 fidelity: does the technical architecture honour all 19 M02 locked decisions?
- Decision completeness: are all M03 critical decisions recorded in `DECISIONS.md`?
- Implementation readiness: can Milestone 06 (Core Engine) begin from these docs without additional discovery?
- Vertical slice feasibility: is the Phase 3.9 slice actually achievable as a first implementation milestone?
- Risk register: updated from the risks identified in the overview

**Validation:**
- [ ] No Critical issues remain unresolved
- [ ] All M03 decisions recorded in `DECISIONS.md`
- [ ] Human technical review completed and signed off
- [ ] Milestone 03 closure document written

---

## Execution summary

| Phase | Depends on | Parallel with |
|---|---|---|
| 3.1 Technology Evaluation | Nothing | — |
| 3.2 Engine Architecture | 3.1 | — |
| 3.3 Content Loading Pipeline | 3.2 | 3.4 |
| 3.4 State Management | 3.1, 3.2 | 3.3 |
| 3.5 Save System | 3.3, 3.4 | — |
| 3.6 Progression Engine | 3.4 | 3.7, 3.8 |
| 3.7 Theme Engine Runtime | 3.3 | 3.6, 3.8 |
| 3.8 Blueprint Runtime Integration | 3.2, 3.3 | 3.6, 3.7 |
| 3.9 Vertical Slice | 3.3–3.8 | — |
| 3.10 Architecture Review | 3.9 | — |
