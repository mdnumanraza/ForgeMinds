# Implementation Plan

> **Milestone:** 04 — Vertical Slice
> **Purpose:** System-by-system build plan. What gets built, what gets mocked, what must be reusable.

---

## System inventory

### Systems built reusably (will be used by all 14 stages)

These systems get built correctly now. A mistake here is a mistake in every stage.

---

#### 1. PhaserGame component + scene scaffold

**What it is:** The React component that mounts Phaser. Three empty scenes: BootScene, PreloaderScene, StageRuntimeScene.

**Build plan:**
- `PhaserGame.tsx` — `next/dynamic` import with `ssr: false`; instantiates `new Phaser.Game(config)` on mount; calls `game.destroy(true)` on unmount
- `BootScene` — configures Phaser globals, registers `GameEventBus`, transitions immediately to PreloaderScene
- `PreloaderScene` — receives asset manifest, loads assets, emits `SCENE_LOADED`
- `StageRuntimeScene` — receives `StageContext`, creates tilemap, places player, runs update loop

**What is hardcoded for Stage 2:** The asset list (hardcoded tilemap key, player sprite key). Generic in Phase F.

---

#### 2. GameEventBus

**What it is:** A typed event emitter shared by Phaser and React. The only permitted crossing point between the two rendering worlds.

**Build plan:**
- Singleton module (not a React context, not a Phaser plugin)
- Typed `emit(event, payload)` and `on(event, handler)` methods
- Events typed as a union (no untyped string events permitted)
- For Stage 2: implement only the events used in the 9-beat sequence. Unused events are declared in types but not wired.

**Events needed for Stage 2:**
- Phaser→React: `SCENE_LOADED`, `PLAYER_INTERACTED_WITH`, `ENEMY_DEFEATED`, `PLAYER_REACHED_PORTAL`, `PLAYER_DIED`, `BOSS_PHASE_COMPLETE`
- React→Phaser: `SUSPEND_INPUT`, `RESTORE_INPUT`, `SPAWN_ENEMY`, `ACTIVATE_NPC`, `START_BOSS_SEQUENCE`, `ACTIVATE_PORTAL`

---

#### 3. BeatController

**What it is:** The React-side module that reads the Beat sequence and drives execution. The most architecturally important piece of this milestone.

**Build plan:**
- A React hook (`useBeatController`) or a module with a React interface
- Holds a typed Beat sequence for Stage 2 (hardcoded array for now)
- `advance()` — increments beat index, calls `executeBeat(beat)`
- `executeBeat(beat)` — dispatches to the correct handler based on `beat.type`
- One handler per Beat type (ARRIVAL, KNOWLEDGE, NPC_INTERACTION, QUEST, ENCOUNTER, BOSS, PORTAL)
- EXPLORATION is ambient — marked as active without blocking advance
- Tracks `beatInProgress: boolean` to prevent save mid-beat and double-advance

**Critical requirement:** EXPLORATION Beat must NOT block advance. The controller enters EXPLORATION state and immediately calls `advance()` for the next sequential Beat. Interaction events during exploration fire ambient handlers without consuming a sequential beat slot.

---

#### 4. ChallengeRenderer component

**What it is:** The React component that displays a knowledge challenge during combat and boss fights. The most important UI component in the game.

**Build plan:**
- Receives `{ question: string, answers: string[], correctIndex: number }`
- Displays in a styled panel over the canvas (not a bare form)
- On selection: emits result to BeatController; shows correct/incorrect feedback
- On incorrect: shows hint text after a brief delay
- **Visual mandate:** must NOT look like a quiz. The panel must be styled as a diegetic world element — parchment texture or stone tablet aesthetic, not a web form. This component's treatment is the most important aesthetic decision in the slice.

---

#### 5. KnowledgePanel component

**What it is:** The scroll/discovery panel that appears when the player finds a knowledge object.

**Build plan:**
- Receives `{ title: string, body: string, analogy?: string, example?: string }`
- Max 4–5 lines visible at once (Anti-Pattern 7.3 enforcement)
- Styled as a physical object (unrolling scroll, cracked stone tablet)
- Close button fires `BeatCompleted` back to BeatController
- Suspends Phaser input on open; restores on close

---

#### 6. DialogueBox component

**What it is:** The NPC dialogue display.

**Build plan:**
- Receives `{ npcName: string, portrait?: string, lines: string[] }`
- Advance through lines with click/keypress
- Final line advance fires `BeatCompleted`
- Portrait is a placeholder rectangle with name for Stage 2
- Stateless — receives dialogue state from BeatController; no NPC logic inside it

---

#### 7. Zustand state stores

**What they are:** `sessionState` (current HP, beat index, active beat) and `progressState` (scrolls found, mastery flags, completed beats).

**Build plan:**
- `sessionState` slice: `{ hp: number, maxHp: number, currentBeatIndex: number, explorationActive: boolean }`
- `progressState` slice: `{ knowledgeFound: string[], masteryState: Record<string, {encountered: boolean, demonstrated: boolean}>, completedBeats: string[] }`
- Both use Zustand 5 (`create` with `persist` for progressState; sessionState is in-memory only)
- `progressState` persisted to `localStorage` for session resume (not a full save system)

---

### Systems hardcoded for Stage 2 only

These work for Stage 2 but will be refactored when more stages exist.

---

#### 8. Stage 2 content object

**What it is:** The Beat sequence and all content for Stage 2, as a hardcoded TypeScript object (matching the `Stage` type from `src/blueprint/data/types.ts`).

**Why hardcoded:** The YAML pipeline (Phase 3.3) is real architecture but it blocks progress. The TypeScript mock already exists in `src/blueprint/data/mock-campaign.ts`. Extend it to full Stage 2 content. Wire up the real pipeline in Phase F or post-slice.

---

#### 9. Tilemap

**What it is:** A Tiled `.json` map for Podveil Village.

**Build plan:**
- Single tilemap, single layer
- Coloured rectangles for regions (house areas, paths, scroll locations, NPC positions, dungeon entrance, portal)
- Walkable/unwalkable tiles set correctly
- Named object layer for interactive triggers (scroll_01, npc_mira, dungeon_entrance, portal)
- Dungeon is a separate scene or off-screen area within the same tilemap (one room)

---

#### 10. Player character

**What it is:** A moving sprite in Phaser with keyboard control.

**Build plan:**
- 32×32 white rectangle with a directional indicator (a small coloured triangle for facing direction)
- WASD + arrow key movement
- Camera follows player
- Collision with unwalkable tiles

---

#### 11. Enemy entities

**What they are:** Pod Bug, Orphan Shade, Warren Knot, Pod Tyrant — all placeholder sprites.

**Build plan:**
- Pod Bug: 24×24 red hexagon — stationary, triggers combat on player proximity
- Orphan Shade: 24×24 grey oval — stationary until approached; triggers combat
- Warren Knot: 40×40 dark purple circle — mini-boss in dungeon room; triggers combat
- Pod Tyrant: 64×64 orange rectangle (changes to red at Phase 2) — stationary boss entity
- All use the same combat engine — only their question sets and HP differ

---

#### 12. Combat engine

**What it is:** The HP + charge mechanic system.

**Build plan:**
- `CombatState`: `{ playerHp, enemyHp, chargeLevel, phase }` (in `sessionState`)
- On `CHALLENGE_ANSWERED_CORRECT`: `chargeLevel += chargeAmount` (determined by question difficulty)
- On `CHALLENGE_ANSWERED_INCORRECT`: `playerHp -= damageAmount`; show hint on next attempt
- On `chargeLevel >= FULL_CHARGE`: emit `ABILITY_FIRED { power: full }` → enemy takes damage
- On `enemyHp <= 0`: emit `ENEMY_DEFEATED`
- On `playerHp <= 0`: emit `PLAYER_DIED`

---

## What is explicitly NOT built in this milestone

| System | Why not |
|---|---|
| YAML content pipeline | TypeScript mock is faster; pipeline comes after slice validates the loop |
| Theme engine | Fantasy theme only; one content set |
| Audio | Does not affect hypotheses under test |
| Item/inventory | No items in Stage 2 |
| Level/XP UI | Number goes up in state; no visual feedback needed for playtest |
| Campaign selection | Hardcode to Stage 2 |
| Act boss (Isolation Wyrm) | Not in Stage 2 |
| Cross-stage quest tracking | Mira's arc across stages is not tested in the slice |
