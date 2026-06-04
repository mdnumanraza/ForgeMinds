# Phase 3.2 — Engine Architecture

> **Phase:** 3.2 — Engine Architecture
> **Purpose:** Define the internal structure of the ForgeMinds game engine — how Phaser and React are composed, how the Beat sequence is executed, how scenes are managed, and where the ownership boundary between Phaser world state and React/Zustand progress state lies.
> **Status:** v1 — conceptual only. No implementation code.
> **Owned by:** AI
> **Inputs:** `ai-tech-evaluation.md` (D-20, D-21, D-23, D-24A, D-24B), `ai-beat-model.md`, `ai-gameplay-loop.md §3`

---

## Guiding constraint

> Phaser is a dumb renderer. It executes world actions. It never contains campaign logic, Beat-type decisions, or progression knowledge.

Everything in this architecture flows from that constraint. The content model (Campaign, Act, Stage, Beat) lives in React. Phaser only receives commands: "render this tilemap," "spawn this NPC," "play this animation." When something happens in the world (enemy defeated, player steps on a tile, panel closed), Phaser fires an event. React's BeatController interprets it.

---

## 1. Component structure

### The mounting hierarchy

```
Next.js App Router
└── /game route
    └── GamePage (React Server Component)
        └── GameShell (Client Component)
            ├── PhaserGame          ← mounts Phaser onto <canvas>
            │   └── <canvas id="phaser-canvas">
            ├── UIOverlayLayer      ← React DOM, z-index above canvas
            │   ├── <DialogueBox>
            │   ├── <KnowledgePanel>
            │   ├── <HUD>
            │   └── <ChallengeScreen>
            └── BeatController      ← no DOM output; drives game logic
```

### PhaserGame.tsx responsibilities

`PhaserGame.tsx` is a React client component that:

1. On mount: instantiates `new Phaser.Game(config)` targeting the canvas element
2. On unmount: calls `game.destroy(true)` — releases canvas, removes all event listeners, stops the game loop
3. Exposes a ref (`phaserGameRef`) so the `BeatController` can send commands to the active scene
4. Does nothing else — no game logic, no state management

The Phaser config declares three scenes in order:
```
scenes: [BootScene, PreloaderScene, StageRuntimeScene]
```

### Route and navigation

The game lives at `/game`. Internal stage transitions are handled by the `BeatController` + `StageRuntimeScene` (no Next.js route change). Navigation back to the home page (`/`) triggers `PhaserGame` unmount, which destroys Phaser cleanly.

Sub-routes within the game (e.g., `/game?stage=02`) are query-parameter driven — no route segments that would cause full remounts.

---

## 2. The three Phaser scenes

### BootScene

**Purpose:** Minimal initialisation. Runs once at game startup.

**Responsibilities:**
- Configure Phaser global settings (scale mode, render type, gravity off)
- Register global event listeners on `GameEventBus`
- Proceed immediately to PreloaderScene

**Does NOT own:** Any game content, any stage data, any assets.

---

### PreloaderScene

**Purpose:** Load assets required for the current stage before StageRuntimeScene starts.

**Responsibilities:**
- Receive an asset manifest from `BeatController` (derived from the current Stage's content)
- Load: tilemap JSON, tileset images, sprite sheets, audio files, NPC portraits
- On complete: signal `BeatController` that loading is done; transition to StageRuntimeScene
- Display a loading indicator (passed in from React as a progress callback)

**Asset manifest model:**
```
{
  tilesets: string[],        // tileset asset keys
  spriteSheets: string[],    // NPC and player sprite sheets
  audio: string[],           // ambient and effect audio keys
  portraits: string[],       // NPC portrait images
}
```

The manifest is derived from the Stage content at load time — the BeatController builds it by inspecting the Stage's beats and their payloads. Phaser does not know how the manifest was constructed.

---

### StageRuntimeScene

**Purpose:** The single reusable scene that executes any stage. One scene technically; one stage conceptually.

**Responsibilities:**
- Accept a `StageContext` object from `BeatController` on scene start (tilemap key, starting position, NPC spawn list)
- Create the tilemap and its layers
- Spawn the player entity at the starting position
- Spawn NPC entities from the spawn list
- Run the Phaser update loop (player movement, camera follow, NPC animation)
- Listen for and respond to `BeatController` commands: `SHOW_NPC`, `TRIGGER_ENCOUNTER`, `OPEN_DUNGEON_AREA`, `START_BOSS`, `HIGHLIGHT_OBJECT`
- Fire events via `GameEventBus` when world conditions are met: `PLAYER_REACHED_PORTAL`, `ENEMY_DEFEATED`, `PLAYER_INTERACTED_WITH`, `OBJECT_TRIGGERED`

**Does NOT own:**
- Which Beat is currently active — that is `BeatController`'s knowledge
- Whether the player has mastered a concept — that is `progressState`'s knowledge
- What happens next after an encounter — that is `BeatController`'s decision
- Any direct reference to `Campaign`, `Act`, `Stage`, or `Beat` data types

**StageContext** (what BeatController passes to the scene on load):
```
{
  tilemapKey: string,           // which tilemap asset to load
  playerStart: { x, y },        // starting tile coordinates
  npcSpawnList: NpcSpawn[],     // which NPCs to place and where
  regionThemeTag: string,       // visual theme variant tag for this stage
}
```

This is the only content data Phaser ever receives — and it contains no gameplay logic.

---

## 3. The Beat execution model

### BeatController overview

`BeatController` is a React-side module (implemented as a hook or service class — exact form is an implementation decision for Milestone 06). It holds a reference to the current `Stage`, tracks the current beat position, and drives execution.

```
React-side
┌─────────────────────────────────────────────────────┐
│  BeatController                                     │
│  ├── currentStage: Stage                           │
│  ├── currentBeatIndex: number                      │
│  ├── advance()                     ← moves to next │
│  └── executeBeat(beat: Beat)       ← dispatches    │
│                                                     │
│  → sends commands to Phaser via GameEventBus        │
│  → updates React UI state (KnowledgePanel, HUD)     │
│  ← receives completion events from GameEventBus     │
└─────────────────────────────────────────────────────┘
```

### Beat execution lifecycle

For each Beat in `stage.beats` (sorted by position):

```
1. BeatController.advance() → picks next Beat
2. BeatController.executeBeat(beat) → dispatches to handler
3. Handler runs (see §4 below)
4. Handler fires BeatCompleted event when done
5. BeatController receives BeatCompleted → saves checkpoint if eligible → advance()
```

**Beat completion is type-specific.** The controller does not guess — each Beat type has exactly one completion condition:

| Beat type | Completion condition | Who fires it |
|---|---|---|
| ARRIVAL | Immediately on scene ready + opening cutscene ends | `GameEventBus` (scene) |
| EXPLORATION | No explicit completion — exploration is ambient; other beats are reachable during it | N/A — overlapping |
| KNOWLEDGE | Player closes the KnowledgePanel | React (UI event) |
| QUEST | Quest reaches COMPLETED state | `progressState` action |
| ENCOUNTER | Enemy entity is defeated | `GameEventBus` (scene) |
| NPC_INTERACTION | Player exits the dialogue | React (UI event) |
| MINI_CHALLENGE | Challenge is answered (correct or incorrect after retry limit) | React (challenge component) |
| DUNGEON | Dungeon exit trigger reached | `GameEventBus` (scene) |
| BOSS | Boss resolution condition met (HP zero or correct answer presented) | `GameEventBus` (scene) |
| CUTSCENE | Cutscene sequence ends | React (cutscene player) |
| CHECKPOINT | Save written successfully | Save system callback |
| PORTAL | Player walks through portal tile | `GameEventBus` (scene) |

**EXPLORATION is the special case.** Exploration is not a sequential Beat that completes and triggers the next one — it is the ambient state of being in the world. KNOWLEDGE, NPC_INTERACTION, and QUEST beats fire when the player interacts with the world during exploration, not after Exploration "completes." The BeatController treats EXPLORATION as a persistent background state, not as a blocking Beat.

---

## 4. Beat type handler descriptions

Each handler is a function invoked by `BeatController.executeBeat()`. Handlers coordinate between React UI, GameEventBus, and Phaser. No handler contains game logic — they are coordinators only.

### ARRIVAL handler
1. `GameEventBus.emit('SCENE_READY_CHECK')` — confirm StageRuntimeScene has loaded
2. If a CutsceneEvent is attached: open React `<CutscenePlayer>` with the arrival StoryBeat payload
3. On cutscene end: fire `BeatCompleted`

### EXPLORATION handler
1. Emit `GameEventBus.emit('EXPLORATION_START')` — tells scene that player movement is active
2. Register world interaction listeners for any KNOWLEDGE, NPC, or QUEST beats in this stage
3. Does not complete — remains active until the stage exits via PORTAL

### KNOWLEDGE handler
1. React opens `<KnowledgePanel>` with the KnowledgeBeat's KnowledgePanel content
2. Phaser input suspended (canvas pointer-events-none while panel is open)
3. On panel close: fire `progressState.markEncountered(conceptRef)` (write-once ENCOUNTERED mastery)
4. Restore Phaser input. Fire `BeatCompleted`

### QUEST handler
1. Fire `progressState.activateQuest(questId)` — Quest enters ACTIVE state
2. Register quest-step listeners via `GameEventBus`
3. When all QuestSteps resolved: evaluate QuestResolutionCondition against `progressState`
4. Fire `progressState.completeQuest(questId, resolutionBranch)`. Fire `BeatCompleted`

### ENCOUNTER handler
1. `GameEventBus.emit('SPAWN_ENEMY', { enemyPayload, position })` — tells scene to place enemy entity
2. When enemy entity is in range: React opens `<ChallengeScreen>` with challenge from Concept pool
3. Challenge answered: `GameEventBus.emit('CHALLENGE_RESULT', { correct, charge })` — scene plays ability animation
4. If enemy HP reaches zero: `GameEventBus.emit('ENEMY_DEFEATED')` → fire `progressState.markDemonstrated(conceptRef)` + `BeatCompleted`

### NPC_INTERACTION handler
1. `GameEventBus.emit('ACTIVATE_NPC', { castMemberId | npcId, dialogueStateId })` — scene plays approach animation
2. React opens `<DialogueBox>` with the active dialogue state's lines
3. AppearanceTrigger fires if applicable: `progressState.unlockDialogueState(castMemberId, stateId)`
4. On dialogue close: React signals complete. Fire `BeatCompleted`

### MINI_CHALLENGE handler
1. React opens `<ChallengeScreen>` with the MiniChallenge payload (no HP risk)
2. On answer (correct or retry-limit reached): award reward if correct, surface hint if incorrect
3. Fire `BeatCompleted` regardless of result (failure teaches, never punishes)

### DUNGEON handler
1. `GameEventBus.emit('LOAD_DUNGEON_AREA', { dungeonPayload })` — scene transitions to dungeon tilemap area
2. MiniBoss Beat fires within the dungeon via a nested Beat sequence on the Dungeon payload
3. On MiniBoss completion + dungeon exit tile reached: `GameEventBus.emit('DUNGEON_EXITED')`
4. Fire `BeatCompleted`

### BOSS handler
1. `GameEventBus.emit('START_BOSS_SEQUENCE', { bossPayload })` — scene transitions to boss arena
2. BossPhases iterate sequentially via nested phase loop in the handler
3. Per phase: fire challenge via `<ChallengeScreen>`; resolve via resolution condition (D-CA-08: BossPhase sub-objects)
4. On all phases resolved: `progressState.markApplied(conceptRef)` for each concept required. Fire `BeatCompleted`

### CUTSCENE handler
1. React opens `<CutscenePlayer>` with the CutsceneEvent payload
2. Phaser input suspended
3. On sequence end: restore Phaser input. Fire `BeatCompleted`

### CHECKPOINT handler
1. Evaluate save eligibility: confirm no Beat is mid-execution (pacing rule 5)
2. Fire save system write with current `progressState` snapshot
3. On write confirmed: Fire `BeatCompleted`

### PORTAL handler
1. `GameEventBus.emit('ACTIVATE_PORTAL', { nextStageRef })` — scene renders portal open animation
2. Player walks into portal tile: `GameEventBus.emit('PLAYER_REACHED_PORTAL')`
3. BeatController receives event: load next Stage via Campaign navigation
4. Trigger PreloaderScene for next stage assets → StageRuntimeScene with new StageContext
5. Fire `BeatCompleted` (this Beat is terminal — no Beat follows it in this stage)

---

## 5. GameEventBus — the Phaser ↔ React bridge

### Design

The `GameEventBus` is a typed event emitter that lives outside both Phaser and React. It is the single permitted crossing point between the two rendering worlds.

```
Phaser World                          React World
─────────────────────────────────────────────────────────
StageRuntimeScene                     BeatController
   │                                      │
   │ scene fires:                         │ controller fires:
   │   ENEMY_DEFEATED                     │   SPAWN_ENEMY
   │   PLAYER_REACHED_PORTAL              │   ACTIVATE_NPC
   │   PLAYER_INTERACTED_WITH             │   LOAD_DUNGEON_AREA
   │   SCENE_LOADED                       │   SUSPEND_INPUT
   │   DUNGEON_EXITED                     │   RESTORE_INPUT
   │   BOSS_PHASE_COMPLETE                │   START_BOSS_SEQUENCE
   └──────────────► GameEventBus ◄────────┘
```

### Typed event catalogue

All events are typed at declaration. Adding an untyped event is a lint error. The bus is not a generic string-keyed pub/sub.

| Direction | Event | Payload |
|---|---|---|
| Phaser → React | `SCENE_LOADED` | `{ sceneKey: string }` |
| Phaser → React | `ENEMY_DEFEATED` | `{ enemyId: string, conceptRef: string }` |
| Phaser → React | `PLAYER_REACHED_PORTAL` | `{ portalId: string }` |
| Phaser → React | `PLAYER_INTERACTED_WITH` | `{ objectId: string, objectType: BeatType }` |
| Phaser → React | `DUNGEON_EXITED` | `{}` |
| Phaser → React | `BOSS_PHASE_COMPLETE` | `{ phaseIndex: number }` |
| Phaser → React | `CHALLENGE_RESULT` | `{ correct: boolean, chargeLevel: number }` |
| React → Phaser | `SPAWN_ENEMY` | `{ enemyId: string, position: {x,y}, spriteKey: string }` |
| React → Phaser | `ACTIVATE_NPC` | `{ npcId: string, dialogueStateId: string }` |
| React → Phaser | `LOAD_DUNGEON_AREA` | `{ tilemapKey: string, dungeonConfig: object }` |
| React → Phaser | `START_BOSS_SEQUENCE` | `{ bossId: string, arenaKey: string }` |
| React → Phaser | `SUSPEND_INPUT` | `{}` |
| React → Phaser | `RESTORE_INPUT` | `{}` |
| React → Phaser | `ACTIVATE_PORTAL` | `{ nextStageRef: string }` |

**Bus rule:** Events are fire-and-forget. No event carries a callback or expects a synchronous return. Responses are always separate events in the other direction.

---

## 6. Decision D-24C — World Reality Ownership

### The boundary problem

When the player is standing in a corridor in Stage 5, the following data all exist simultaneously:

- **Phaser owns:** the player's exact pixel position, the NPC's current animation frame, whether a torch is flickering, the camera pan amount
- **Zustand sessionState owns:** which Beat is active, the player's current HP, which NPCs have been interacted with in this stage visit
- **Zustand progressState owns:** whether the player has ENCOUNTERED the ConfigMap concept, which quests are ACTIVE, the player's current level

These must never bleed across boundaries. The following rules enforce that.

### D-24C — World Reality Ownership rules

**Rule WR-1 — Phaser owns all spatial reality.**
Position, velocity, collision, facing direction, pixel-level animation state. None of this is in Zustand. React never asks "where is the player?" — it has no reason to know. If React needs to display something spatial (a minimap), Phaser pushes a summary on demand via `GameEventBus`.

**Rule WR-2 — Zustand owns all progress reality.**
Whether a concept was learned, whether a quest is active, how much XP the player has. Phaser never reads from Zustand directly. If Phaser needs to conditionally render something based on progress (show a sealed door only if a concept is not yet learned), the BeatController pushes that information to Phaser as a command, never as a Zustand subscription.

**Rule WR-3 — No Phaser scene subscribes to Zustand.**
Scenes receive their initial context from `BeatController` at scene start. They receive updates via `GameEventBus` events. A Phaser scene that imports a Zustand store is an architectural violation.

**Rule WR-4 — No React component reads Phaser internal state.**
React components that need game-world information (current HP for the HUD) get it from Zustand `sessionState`, which is updated by the BeatController when it receives Phaser events. React never calls `phaserScene.player.x`.

**Rule WR-5 — The boundary is always event-driven.**
Every crossing between the Phaser world and the React world is via `GameEventBus`. There are no shared mutable objects, no shared refs to game entities, no direct function calls across the boundary.

### Ownership table

| Data | Owner | How React gets it | How Phaser gets it |
|---|---|---|---|
| Player pixel position | Phaser | Never (React doesn't need it) | Phaser internal |
| Player HP | Phaser (authoritative) → event → Zustand `sessionState.hp` | `useSessionState().hp` | Phaser internal |
| Current Beat | BeatController (React) | `useBeatController().currentBeat` | Pushed via GameEventBus command |
| Active quests | Zustand `progressState` | `useProgressState().activeQuests` | BeatController pushes when quest activates |
| ConceptMastery | Zustand `progressState` | `useProgressState().mastery[conceptRef]` | BeatController pushes sealed-door state at scene load |
| NPC dialogue state | Zustand `progressState` | `useProgressState().npcDialogueStates` | BeatController pushes on ACTIVATE_NPC |
| Current stage | BeatController (React) | `useBeatController().currentStage` | Passed as StageContext at scene start |
| Tilemap loaded? | Phaser (via SCENE_LOADED event) | Never needs to know | Phaser internal |

---

## 7. Stage transition model

When a PORTAL Beat fires and the player crosses to the next Stage:

```
1. BeatController receives PLAYER_REACHED_PORTAL event
2. BeatController emits SAVE_CHECKPOINT (if a CHECKPOINT beat is adjacent to PORTAL)
3. progressState.markStageComplete(currentStage.id)
4. BeatController loads next Stage from Campaign model
5. BeatController builds new StageContext + asset manifest for next Stage
6. GameEventBus.emit('SWITCH_TO_PRELOADER', { manifest }) → Phaser transitions to PreloaderScene
7. PreloaderScene loads assets → transitions to StageRuntimeScene with new StageContext
8. BeatController.advance() begins Beat execution for the new Stage
```

**Key property:** The `Campaign` model never moves to Phaser. The BeatController holds it, derives the `StageContext` from it, and passes only what Phaser needs to render.

---

## 8. Mid-Beat save prevention

Gameplay Loop pacing rule 5: saves land after Beat completion, never mid-Beat.

Architectural enforcement:

- `BeatController` maintains a `beatInProgress: boolean` flag
- Save system checks this flag before writing: if `beatInProgress === true`, the write is queued
- CHECKPOINT Beat handler sets `beatInProgress = false` before triggering the write
- `beatInProgress` is set to `true` when any Beat handler is entered and `false` only when `BeatCompleted` fires

This is not a user-visible delay — CHECKPOINT Beats are placed at natural pause points (after quest completion, after defeating an enemy, before entering a dungeon). The save fires immediately after the natural pause.

---

## 9. Input ownership model

When React UI is open (KnowledgePanel, DialogueBox, ChallengeScreen), Phaser input must be suspended to prevent background clicks.

```
React UI opens  → GameEventBus.emit('SUSPEND_INPUT')
                   → StageRuntimeScene disables input plugin
                   → Phaser canvas: pointer-events: none (CSS)

React UI closes → GameEventBus.emit('RESTORE_INPUT')
                   → StageRuntimeScene re-enables input plugin
                   → Phaser canvas: pointer-events: auto (CSS)
```

`z-index` contract:
- Phaser canvas: `z-index: 10`
- UIOverlayLayer (all React UI): `z-index: 20`
- Dialogue/panel overlays: `z-index: 30`

No React component over the canvas uses `pointer-events: auto` unless it is explicitly serving a UI interaction. The HUD is `pointer-events: none` by default — only interactive elements (buttons) set `pointer-events: auto` on themselves.

---

## 10. Decisions established in Phase 3.2

| Decision | Resolution |
|---|---|
| D-24A | Beat Controller: React-side (confirmed) |
| D-24B | Scene management: Boot + Preloader + StageRuntimeScene (confirmed) |
| D-24C | World Reality Ownership: 5 rules; full ownership table |
| D-25 | Beat completion event model: type-specific, listed per Beat type in §3 |

**New decision for DECISIONS.md:**

> **D-25 — Beat Completion Events:** Each Beat type has exactly one defined completion condition. EXPLORATION is the exception — it is ambient and does not complete. Completion is signalled either by a React UI event (KnowledgePanel close, DialogueBox close), a GameEventBus event from Phaser (enemy defeated, portal reached), or a system callback (save written). No Beat may be considered complete by timeout or by polling.

> **D-26 — Scene Transition Model:** Campaign model never moves to Phaser. BeatController derives StageContext from the Campaign model and passes it to Phaser at scene start. PreloaderScene loads assets from the manifest; StageRuntimeScene renders from the StageContext. Phaser sees only rendering commands, never content semantics.

---

## Cross-references

- `milestones/milestone-03-technical-architecture/ai-tech-evaluation.md` — D-20, D-21, D-23, D-24A, D-24B locked here
- `milestones/milestone-03-technical-architecture/ai-phase-plan.md §Phase 3.2` — validation checklist for this phase
- `content-architecture/ai-beat-model.md` — Beat types and completion semantics
- `game-design/ai-gameplay-loop.md` — three-scale loop; pacing rules (rule 5: no mid-beat saves)
- `content-architecture/ai-phase-02-04-knowledge-challenge-model.md` — ConceptMastery dimensions (ENCOUNTERED/DEMONSTRATED/APPLIED)
- `DECISIONS.md` — D-24A, D-24B, D-24C, D-25, D-26 to be recorded
