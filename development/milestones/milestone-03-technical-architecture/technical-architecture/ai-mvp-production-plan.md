# MVP Production Plan

> **Purpose:** Define the build order, phasing, and production strategy for ForgeMinds' vertical slice and MVP — one developer, AI assistance, limited assets, visible progress quickly.
> **Status:** v1 — production planning only. No implementation code.
> **Owned by:** AI
> **Input:** `ai-vertical-slice-definition.md` (Stage 2, Podveil Village), `ai-runtime-execution-architecture.md`, all M03 architecture decisions

---

## Context

The vertical slice target is **Stage 2 — Podveil Village (Pods concept)**. It is completable in 2–4 weeks by one developer. The architecture is defined. The content is designed. The goal of this plan is to tell that developer what to build, in what order, with what trade-offs.

**Production philosophy:**
- Infrastructure that will be used 14 times (BeatController, ChallengeScreen, KnowledgePanel) gets built right from day one
- Infrastructure that appears once in the vertical slice (boss dialogue, stage completion screen) gets hardcoded for now
- Everything visible to a playtester must look intentional, even if placeholder
- Everything invisible to a playtester can be rough

---

## Phase 1 — First Playable

**Goal:** The player can launch the game, see a world, move their character in it.

**Deliverables:**
- `PhaserGame.tsx` — Phaser 3 mounted inside React on the `/game` route, canvas visible
- BootScene, PreloaderScene (basic), StageRuntimeScene (basic)
- Podveil Village tilemap (placeholder tiles — coloured rectangles OK, proper tilemap structure required)
- Player character sprite (placeholder — a white square that moves)
- Camera follow
- Keyboard/gamepad input (WASD + arrow keys)
- No game content yet — just a navigable world

**Success criteria:**
- Launch the app, navigate to `/game`, see a tilemap
- Move the character with keyboard, camera follows
- No Phaser errors in the console

**What is mocked:** Everything. Tilemap is placeholder. Character is a rectangle. No NPCs. No UI.

**What is built reusably:** `PhaserGame.tsx` component, BootScene, PreloaderScene, StageRuntimeScene structure, input handling. These ship in final v1.

**Risks:** Phaser + Next.js SSR conflict (Phaser uses `window` — must be `next/dynamic` with `ssr: false`). This must be solved in Phase 1 or nothing works.

**Dependencies:** None — this is the foundation.

**Estimated complexity:** Low-Medium. Phaser + Next.js mounting is well-documented. Tilemap setup requires one Tiled map file.

---

## Phase 2 — Learning Loop

**Goal:** The player can discover knowledge. The comprehension click must be deliverable.

**Deliverables:**
- `GameEventBus` — typed event emitter (the bridge between Phaser and React)
- `BeatController` — React-side; reads Beat sequence, advances through beats, handles KNOWLEDGE beats
- Scroll/discovery objects in the tilemap (3 scrolls for Stage 2: "What a Pod is", "Pod failure is recoverable", "Pod spec")
- `<KnowledgePanel>` React component — renders panel content; handles close; fires mastery event
- `progressState` Zustand slice — ENCOUNTERED mastery tracking (write-once)
- Input suspension during panel (SUSPEND_INPUT / RESTORE_INPUT events)
- Stage 2's three KnowledgeBeat payloads authored in YAML

**Success criteria:**
- Player walks to a scroll, presses interact
- KnowledgePanel appears over the canvas
- Player reads it, closes it
- Console confirms `mastery['concept:kubernetes:pod'].ENCOUNTERED = true`
- Phaser canvas responds after close (input restored)

**What is mocked:** No real YAML pipeline yet — Stage 2 content loaded from a TypeScript mock object (same mock as Blueprint Viewer). Real YAML pipeline comes in Phase 5 or 6.

**What is built reusably:** `GameEventBus`, `BeatController` (structure), `<KnowledgePanel>`, `progressState` schema. All of these are load-bearing for all 14 stages.

**Risks:** The EXPLORATION Beat concurrency model must be implemented correctly here — if BeatController treats learning as a blocking Beat that prevents movement, the game loop breaks. Phase 2 is where this architectural complexity surfaces first.

**Dependencies:** Phase 1 complete.

**Estimated complexity:** Medium. BeatController architecture is the most complex piece here. KnowledgePanel UI is straightforward.

---

## Phase 3 — Combat Loop

**Goal:** The player can encounter an enemy and fight it with knowledge-powered combat.

**Deliverables:**
- Pod Bug enemy entity (placeholder sprite — a red circle)
- `SPAWN_ENEMY` and `ENEMY_DEFEATED` GameEventBus events wired
- `<ChallengeScreen>` React component — renders MCQ challenge, handles answer selection, fires result event
- Challenge Pool (hardcoded for now — 3 MCQ questions for `concept:kubernetes:pod`, INTRODUCTORY difficulty)
- Charge mechanic — correct answer → full charge animation in Phaser; incorrect → HP loss
- HP tracking in `sessionState` (simple integer, max HP hardcoded)
- `<HUD>` React component — displays HP (simple text/bar)
- DEMONSTRATED mastery set on enemy defeat

**Success criteria:**
- Player encounters a Pod Bug in the tilemap
- ChallengeScreen appears with an MCQ question about Pods
- Correct answer: ability fires with a visual flash in Phaser, enemy takes damage
- Incorrect answer: HP decreases, hint shown, retry
- Enemy defeated: DEMONSTRATED mastery logged, XP awarded (number logged to console OK)

**What is mocked:** Enemy AI (enemies don't move — they're stationary encounter triggers). Multiple enemy types (just Pod Bugs). Ability animations (flash effect OK). Audio (none).

**What is built reusably:** `<ChallengeScreen>` (used for every encounter and boss in v1), `<HUD>` structure, charge mechanic logic. Challenge pool query function (even if pointing at hardcoded data).

**Risks:** Phaser animation + React overlay timing. The challenge screen appearing "too fast" (before the enemy encounter animation plays) breaks immersion. A small deliberate delay (200ms) after SPAWN_ENEMY before opening ChallengeScreen may be needed.

**Dependencies:** Phase 2 complete (GameEventBus, progressState established).

**Estimated complexity:** Medium-High. The combat loop has more moving parts than the learning loop. Getting the visual feedback right (animation response to challenge result) requires polish iteration.

---

## Phase 4 — Boss Loop

**Goal:** The player can fight the Pod Tyrant and experience multi-phase boss combat.

**Deliverables:**
- Pod Tyrant boss entity (placeholder sprite — a large red rectangle)
- Boss arena area in the tilemap (a distinct room/zone)
- BOSS Beat handler in `BeatController` — multi-phase loop
- Boss phases (2 phases for vertical slice: one MCQ, one CommandCompletion)
- `BOSS_PHASE_COMPLETE` GameEventBus event
- APPLIED mastery set after boss completion
- Stage completion state (`progressState.markStageComplete`)
- Basic Kestran portal transition (hardcoded NPC dialogue, portal tile, stage completion screen)

**Success criteria:**
- Player enters boss arena
- Boss fight plays through 2 phases
- Each phase: different challenge type
- Boss defeated: APPLIED mastery logged for Pod concept
- Portal appears; player walks through
- Stage completion screen shows (hardcoded text OK: "Stage Complete — You learned about Pods")

**What is mocked:** Boss narrative introduction (skip for now). Kestran dialogue (single hardcoded line). Portal visual effect (a coloured tile that the player steps on). Stage completion screen (React component with text, no animation).

**What is built reusably:** Multi-phase boss handler in BeatController. Boss phase loop. APPLIED mastery tracking. Stage completion event chain.

**Risks:** Boss phase orchestration is the most complex Beat handler (§10 of runtime doc). The `phaseExposureMechanism` (each phase reveals the next) may be overkill for the vertical slice — simplify to sequential phases without exposure mechanics for now.

**Dependencies:** Phase 3 complete.

**Estimated complexity:** High. Boss loop has the most state transitions of any system in the vertical slice.

---

## Phase 5 — Vertical Slice Complete

**Goal:** A complete, playable, shareable demo of Stage 2 — Podveil Village.

**Deliverables:**
- Mira NPC (placeholder portrait, real dialogue for pre-quest and post-boss states)
- `<DialogueBox>` React component — renders NPC dialogue lines, advance button
- Mira's quest ("Restore Mira's Home") — simple 2-step quest: read Pod scroll + defeat Pod Bug
- Quest tracking in `progressState`
- Basic dungeon area (one room, Pod Bugs, Warren Knot mini-boss — same combat as Phase 3)
- CHECKPOINT Beat handler — saves progress to localStorage
- Death and retry — HP zero → death screen → respawn at stage entry (full HP, mastery preserved)
- YAML content loading (development mode) — Stage 2 content loaded from real YAML files, not mock
- Zod schema validation for Stage 2 YAML
- Playable beginning-to-end: from stage entry to portal transition

**Success criteria:**
- A playtester with no Kubernetes knowledge can play Stage 2 start to finish
- They can explain what a Pod is after completing the stage (in their own words)
- They feel like they played a game, not took a quiz
- No fatal crashes in normal play
- Save/resume works (quit, reopen, resume from last checkpoint)

**What is mocked:** Real art assets (placeholder throughout). Audio. Multiple stages (Stage 1 and Stage 3 do not exist). Full campaign selection (hardcoded to Stage 2).

**What is built reusably:** `<DialogueBox>`, YAML pipeline (dev mode), Zod schemas, checkpoint save, death/retry flow. All reusable for stages 1–14.

**Risks:** Playtester feedback may reveal fundamental issues with the learning loop or combat feel that require architectural reconsideration. **This is the point.** Phase 5 is about learning, not shipping.

**Dependencies:** Phases 1–4 complete.

**Estimated complexity:** Medium (mostly integration and content authoring at this point — the hard systems are already built).

---

## Phase 6 — Production Expansion

**Goal:** Expand the vertical slice into the full Kubernetes Kingdom campaign.

This phase is post-MVP and post-playtest. It begins only after Phase 5 playtesting confirms the core loop works.

**What gets built:**
- Remaining 13 stages authored in YAML
- Production-quality tilemap art and sprite assets (Milestone 05 — Asset Strategy)
- Full cast member system (Lyra, Kestran, Voss, Mira — all stage appearances)
- Campaign selection screen
- Full YAML pipeline (production mode — build-time compilation)
- Audio system
- Act boss fights (Isolation Wyrm, Severed Envoy, Corrupted Warden)
- Space Galaxy theme override content
- Full save system (multi-slot, migration support)
- Accessibility (keyboard-only navigation, text scaling)

**What is NOT built in Phase 6 (deferred further):**
- Content Studio / visual editor
- AI content generation
- Campaign marketplace
- Multiplayer or social features
- Linux Realms or Docker Dominion

**Estimated timeline:** This is Milestones 04–15 work. Phase 6 is the rest of the production roadmap, not a sprint.

---

## Build order summary

| Phase | Duration | What's proven | Key risk |
|---|---|---|---|
| 1 | 2–3 days | Phaser + React works | SSR conflict |
| 2 | 3–5 days | Learning loop works | BeatController concurrency |
| 3 | 4–6 days | Combat loop works | Animation timing |
| 4 | 4–6 days | Boss loop works | Phase orchestration complexity |
| 5 | 4–7 days | Playable vertical slice | Core loop feel |
| 6 | Months | Full game | Content volume |

**Total vertical slice estimate:** 2–4 weeks (17–27 working days). Achievable by one developer with AI assistance and placeholder art.
