# Runtime Execution Architecture

> **Purpose:** Trace the complete ForgeMinds runtime — from game launch to campaign completion — documenting what happens at every step, who owns it, what data changes, and what events fire.
> **Status:** v1 — architectural design only. No implementation code.
> **Owned by:** AI
> **Inputs:** `ai-engine-architecture.md` (D-24A/B/C, D-25, D-26), `ai-content-loading-pipeline.md` (D-27, D-28, CompiledCampaign), all locked M03 decisions

---

## 1. Boot Lifecycle

**What happens:**
The player navigates to the `/game` route in the Next.js app. The `GamePage` server component renders. The `GameShell` client component mounts. `PhaserGame.tsx` instantiates `new Phaser.Game(config)` targeting a `<canvas>` element. The game config declares three scenes: BootScene → PreloaderScene → StageRuntimeScene.

BootScene fires immediately. It configures global Phaser settings (scale mode, render type, gravity off), registers the typed `GameEventBus` listeners, and transitions to PreloaderScene with no delay. BootScene is not visible to the player.

PreloaderScene renders a loading indicator (React-side, passed as a progress callback from `GameShell`). It loads the minimal shared assets needed before any campaign is shown: title screen background, UI sound effects, font atlases. On completion it signals `BeatController` (via `GameEventBus.emit('BOOT_COMPLETE')`), which triggers React to render the Campaign Selection screen.

**Who owns it:** `PhaserGame.tsx` (React) owns Phaser instantiation. BootScene and PreloaderScene (Phaser) own asset loading. `GameShell` (React) owns the loading progress display.

**Data changes:** None in `progressState` or `sessionState`. Phaser frame state initialises internally.

**Events:** `BOOT_COMPLETE` → React renders Campaign Selection.

---

## 2. Campaign Lifecycle

**What happens:**
The Campaign Selection screen (React) lists available campaigns by reading from the content root (or pre-compiled campaign manifests). The player selects Kubernetes Kingdom and a theme (Fantasy Kingdom or Space Galaxy).

`BeatController` triggers the content pipeline: `pipeline.compile('kubernetes-kingdom', 'fantasy-kingdom')`. In development this runs the 7-stage pipeline against live YAML files. In production it loads the pre-compiled TypeScript module. Either way, the output is a `CompiledCampaign` object held by `BeatController`.

`BeatController` initialises `progressState`: sets `activeCampaignId`, `campaignVersion` (from `CompiledCampaign.meta`), creates empty mastery maps for all concepts in `conceptRegistry`, sets `playerLevel: 1`, `xp: 0`, `completedStages: []`. If a save file exists for this campaign and its `campaignVersion` is compatible, `progressState` is hydrated from the save instead.

`BeatController` selects the first unvisited Stage from `campaign.acts[0].stages` and begins the Stage Lifecycle.

**Who owns it:** `BeatController` (React) owns campaign loading and initial state setup. Content pipeline owns `CompiledCampaign` production. Zustand `progressState` owns all progress initialisation.

**Data changes:** `progressState` initialised or restored from save. `sessionState.activeCampaignId` set.

**Events:** None to Phaser at this point — Phaser has not received any content yet.

---

## 3. Stage Lifecycle

**What happens:**
`BeatController` receives the target `Stage` from `CompiledCampaign`. It derives a `StageContext`:

```
StageContext = {
  tilemapKey: derived from stage.id + active theme,
  playerStart: { x, y } from stage metadata,
  npcSpawnList: NPCs referenced in NPC_INTERACTION beats,
  regionThemeTag: stage.themeVariant.visualTag
}
```

`BeatController` also builds an `AssetManifest` from the stage's Beat payloads (which sprite sheets, tilesets, portraits are needed). It emits `GameEventBus.emit('SWITCH_TO_PRELOADER', { manifest })`.

PreloaderScene loads the stage assets. On completion it emits `SCENE_LOADED`. `BeatController` receives the event, transitions Phaser to StageRuntimeScene by emitting `GameEventBus.emit('START_STAGE_RUNTIME', { stageContext })`.

StageRuntimeScene receives `StageContext`, creates the tilemap, places the player at `playerStart`, spawns NPCs from `npcSpawnList`, and begins the Phaser update loop. It emits `SCENE_READY`.

`BeatController` receives `SCENE_READY` and calls `advance()` — beginning Beat execution for this Stage.

**Who owns it:** `BeatController` derives StageContext and drives the transition. Phaser's PreloaderScene loads assets. StageRuntimeScene renders the world.

**Data changes:** `sessionState.currentStageId` set. `sessionState.currentBeatIndex = 0`. `sessionState.beatInProgress = false`.

**Events:** `SWITCH_TO_PRELOADER` → `SCENE_LOADED` → `START_STAGE_RUNTIME` → `SCENE_READY` → BeatController begins execution.

---

## 4. Beat Lifecycle

**What happens:**
`BeatController` holds the current Stage's Beat sequence (sorted by position). The Beat Lifecycle is the core execution loop:

```
advance()
  → picks next Beat from stage.beats[currentBeatIndex]
  → sets sessionState.beatInProgress = true
  → calls executeBeat(beat)
  → waits for BeatCompleted event

BeatCompleted fires
  → sessionState.beatInProgress = false
  → if beat.type === 'CHECKPOINT': trigger save
  → currentBeatIndex++
  → advance()
```

**EXPLORATION is the special case.** When the EXPLORATION Beat is reached, `BeatController` sets `sessionState.explorationActive = true` and calls `advance()` immediately — it does not wait for EXPLORATION to complete. KNOWLEDGE, NPC_INTERACTION, and QUEST beats can fire *during* exploration, triggered by player interaction with world objects (not by sequential Beat index advancement). These fire their handlers concurrently with ongoing exploration.

The Beat sequence effectively has two tracks running simultaneously during exploration:
- **Sequential track:** DUNGEON → BOSS → PORTAL (gated — each waits for the prior to complete)
- **Ambient track:** KNOWLEDGE, NPC_INTERACTION, QUEST, MINI_CHALLENGE (triggered by world interaction, not sequential gate)

ARRIVAL fires first (always sequential). Then EXPLORATION fires and becomes ambient. Sequential Beats (DUNGEON, BOSS, PORTAL) resume after exploration reaches a natural player action (e.g., entering the dungeon entrance).

**Who owns it:** `BeatController` (React) owns the advance loop and beat dispatch. Each Beat type handler owns its own completion.

**Data changes:** `sessionState.beatInProgress` toggles with each beat. `sessionState.currentBeatIndex` increments on completion.

**Events:** Beat-specific — see §5–§11.

---

## 5. Exploration Runtime

**What happens:**
The player controls their character in the Phaser canvas via keyboard/gamepad input. The player character moves through the tilemap; the camera follows. NPCs animate in place. The world is alive.

When the player approaches an interactive object (scroll, tablet, NPC, dungeon entrance), Phaser's collision/proximity detection fires `GameEventBus.emit('PLAYER_INTERACTED_WITH', { objectId, objectType })`. `BeatController` receives this event and looks up whether this objectId corresponds to a Beat in the current stage. If yes, it fires that Beat's handler.

Player exploration is entirely Phaser-owned. BeatController is passive during exploration — it listens for interaction events but does not drive Phaser.

**Who owns it:** Phaser (StageRuntimeScene) owns all spatial reality: movement, collision, proximity detection, camera, NPC animation. `BeatController` receives interaction events and decides which Beat handler to fire.

**Data changes:** Phaser frame state only (player position, animation frame, camera position). No Zustand changes until an interaction triggers a Beat.

**Events fired by Phaser:** `PLAYER_INTERACTED_WITH` (when player activates an object).

---

## 6. Knowledge Runtime

**What happens:**
Player approaches a glowing scroll. Phaser detects proximity and emits `PLAYER_INTERACTED_WITH { objectId: 'scroll-pod-01', objectType: 'KNOWLEDGE' }`. `BeatController` dispatches the KNOWLEDGE handler.

`BeatController` sets `sessionState.beatInProgress = true`. It emits `GameEventBus.emit('SUSPEND_INPUT')` — Phaser disables keyboard input and the canvas becomes pointer-events:none. React renders `<KnowledgePanel>` over the canvas with the KnowledgeBeat's `KnowledgePanel` content (title, body, analogy, example, command — all theme-applied).

The player reads the panel. When they close it (click/tap the close button), React fires the panel-closed event back to `BeatController`. `BeatController`:
1. Calls `progressState.markEncountered(conceptRef)` — ENCOUNTERED dimension set (write-once)
2. Emits `GameEventBus.emit('RESTORE_INPUT')` — Phaser re-enables input
3. Fires `BeatCompleted`

**Who owns it:** Phaser owns interaction detection. `BeatController` dispatches the handler. React owns `<KnowledgePanel>` rendering. Zustand `progressState` owns mastery tracking.

**Data changes:** `progressState.mastery[conceptRef].ENCOUNTERED = true` (write-once, permanent). No session state changes.

**Events:** `SUSPEND_INPUT`, `RESTORE_INPUT`, `BeatCompleted`.

---

## 7. NPC Runtime

**What happens:**
Player approaches Mira. Phaser emits `PLAYER_INTERACTED_WITH { objectId: 'mira', objectType: 'NPC_INTERACTION' }`. `BeatController` dispatches the NPC_INTERACTION handler.

`BeatController` resolves which `DialogueState` to show: it checks `progressState` for Mira's current dialogue state (which depends on quest state, mastery state, and stage visit number). It emits `GameEventBus.emit('ACTIVATE_NPC', { npcId: 'mira', dialogueStateId: 'stage-2-pre-quest' })` — StageRuntimeScene plays the NPC approach animation.

React renders `<DialogueBox>` with the resolved DialogueState's lines. The player advances through lines. When dialogue ends, `BeatController`:
1. Checks if an `AppearanceTrigger` fired (e.g., Lyra's "stage-2-arrival" dialogue state should now be active)
2. Updates `progressState.npcDialogueStates` if a state was unlocked
3. If this NPC triggers a quest: activates the quest in `progressState`
4. Emits `GameEventBus.emit('RESTORE_INPUT')`
5. Fires `BeatCompleted`

**Who owns it:** Phaser owns detection and NPC animation. `BeatController` resolves which dialogue state to show. React owns `<DialogueBox>`. Zustand owns dialogue state tracking.

**Data changes:** `progressState.npcDialogueStates[npcId] = newStateId`. Possibly `progressState.activeQuests` updated. `sessionState.npcsInteractedWith` updated (session-local; resets on stage reload).

**Events:** `ACTIVATE_NPC`, `SUSPEND_INPUT`, `RESTORE_INPUT`, `BeatCompleted`.

---

## 8. Quest Runtime

**What happens:**
When a quest-giving NPC dialogue completes, `BeatController` activates the quest. The QUEST Beat handler:

1. Calls `progressState.activateQuest(questId)` — Quest enters ACTIVE state
2. Registers `GameEventBus` listeners for the quest's step conditions (e.g., `KNOWLEDGE_BEAT_COMPLETED` for a concept, `ENEMY_DEFEATED` for a specific enemy)
3. React's `<HUD>` (if present) updates to show active quest

As the player progresses through the stage, step conditions resolve:
- Player reads the Pod scroll → `progressState.mastery['concept:kubernetes:pod'].ENCOUNTERED = true` → Quest Step 1 resolved
- Player defeats Pod Bug → Step 2 resolved

When all steps are resolved, `BeatController` evaluates the `QuestResolutionCondition` against `progressState`. If the condition is mastery-based (the player demonstrated understanding), the quest resolves with the "understanding" branch. If the player guessed through without demonstrating mastery, the quest may still complete but with a different resolution branch (lower reward, different NPC response).

`progressState.completeQuest(questId, resolutionBranch)` is called. Quest reward is processed. `BeatCompleted` fires.

**Who owns it:** `BeatController` owns quest activation and step tracking. Zustand `progressState` owns quest state. React `<DialogueBox>` delivers quest-giver dialogue. Resolution evaluation is pure logic in `BeatController`.

**Data changes:** `progressState.activeQuests` → `progressState.completedQuests`. XP awarded via `progressState.addXP(amount)`. Level-up evaluated.

**Events:** `BeatCompleted`, possibly `LEVEL_UP`.

---

## 9. Encounter Runtime

**What happens:**
Player enters an encounter zone in the tilemap (or an ENCOUNTER Beat fires during exploration via interaction). `BeatController` dispatches the ENCOUNTER handler.

1. `BeatController` selects a `Challenge[]` from `CompiledCampaign.challengePools[enemy.conceptRef][enemy.difficulty]` using the session seed shuffle
2. `BeatController` emits `GameEventBus.emit('SPAWN_ENEMY', { enemyId, position, spriteKey })` — StageRuntimeScene places the enemy entity
3. React renders `<ChallengeScreen>` over the canvas (Phaser input suspended)
4. Player answers the challenge. React sends result to `BeatController`
5. `BeatController` emits `GameEventBus.emit('CHALLENGE_RESULT', { correct, chargeLevel })` — StageRuntimeScene animates the player character's ability charging and attack
6. If incorrect: React shows hint text; `sessionState.hp -= damageAmount` (Phaser visually reduces HP); challenge retried or enemy deals damage
7. If correct at full charge: `GameEventBus.emit('ABILITY_FIRED', { power: 'full' })` — enemy takes damage animation
8. When enemy HP reaches zero: `GameEventBus.emit('ENEMY_DEFEATED', { enemyId, conceptRef })`
9. `BeatController` calls `progressState.markDemonstrated(conceptRef)`
10. Reward processing. `BeatCompleted` fires.

**Who owns it:** `BeatController` owns challenge selection and result processing. StageRuntimeScene owns enemy spawn, animation, and death sequence. React owns `<ChallengeScreen>`. Zustand owns mastery + HP tracking.

**Data changes:** `progressState.mastery[conceptRef].DEMONSTRATED = true`. `progressState.addXP()`. `sessionState.hp` may decrease on wrong answers. Session-local `defeatedEnemies` updated.

**Events:** `SPAWN_ENEMY`, `CHALLENGE_RESULT`, `ABILITY_FIRED`, `ENEMY_DEFEATED`, `BeatCompleted`.

---

## 10. Boss Runtime

**What happens:**
The BOSS Beat fires. This is the most structurally complex Beat type.

1. `BeatController` emits `GameEventBus.emit('START_BOSS_SEQUENCE', { bossId, arenaKey })` — StageRuntimeScene transitions to the boss arena area (tilemap zone or scene overlay)
2. React renders boss introduction (name, brief narrative — theme-applied)
3. Boss phase loop begins. For each `BossPhase` in `boss.phases`:
   a. `BeatController` selects challenges for this phase from the concept pool
   b. Boss "attacks" — StageRuntimeScene plays boss attack animation
   c. Player selects an action (sword / shield / spell) — `BeatController` opens the appropriate challenge type
   d. React renders `<ChallengeScreen>`. Player answers
   e. `GameEventBus.emit('CHALLENGE_RESULT', { correct, chargeLevel })` — StageRuntimeScene plays result
   f. If correct: ability charges; if incorrect: HP loss; retry or next exchange
   g. Phase resolution condition evaluated (DAMAGE_HP_ZERO or CORRECT_ANSWER_PRESENTED)
   h. Phase complete: `BeatController` checks `phaseExposureMechanism` — fires the event/transition that exposes the next phase (e.g., "boss core revealed")
4. After all phases: boss defeat sequence plays in Phaser
5. `BeatController` calls `progressState.markApplied(conceptRef)` for each concept in `boss.conceptsRequired`
6. Reward processing (XP, items, story flag). `BeatCompleted` fires.

**Death during boss:** If `sessionState.hp` reaches zero mid-boss, death runtime fires (§12). On respawn, player is placed at the boss room entrance with full HP. Boss is reset to Phase 1. No mastery already gained is lost.

**Who owns it:** `BeatController` owns phase orchestration and mastery tracking. StageRuntimeScene owns arena visuals and boss animation. React owns `<ChallengeScreen>` and boss UI. Zustand owns mastery and HP.

**Data changes:** `progressState.mastery[conceptRef].APPLIED = true` for all boss concepts. XP + items awarded. `sessionState.hp` may vary during fight.

**Events:** `START_BOSS_SEQUENCE`, `CHALLENGE_RESULT`, `BOSS_PHASE_COMPLETE`, `ENEMY_DEFEATED`, `BeatCompleted`.

---

## 11. Portal Runtime

**What happens:**
The PORTAL Beat fires. This is the stage exit and transition Beat.

1. `BeatController` emits `GameEventBus.emit('ACTIVATE_PORTAL', { nextStageRef })` — StageRuntimeScene renders the portal (a door, a glowing arch, a teleporter — whatever the theme applies)
2. Player walks their character into the portal tile. Phaser proximity detection fires
3. `GameEventBus.emit('PLAYER_REACHED_PORTAL')` — `BeatController` receives this
4. `BeatController` calls `progressState.markStageComplete(currentStage.id)`
5. If a CHECKPOINT Beat is adjacent to the PORTAL (as it should be by architecture), it fires first — save is written
6. `BeatController` loads the next Stage from `CompiledCampaign` (next in Act sequence, or first Stage of next Act)
7. `GameEventBus.emit('SWITCH_TO_PRELOADER', { nextManifest })` — asset loading for next stage begins
8. `BeatController.advance()` begins for the new Stage

**Portal narrative beat:** Before the portal is activated, a `StoryBeat` (arrival variant for the portal narrative — e.g., Kestran opening the gate, the Fields reassembling) plays in a React `<CutscenePlayer>` or `<DialogueBox>`. This is a CUTSCENE or NPC Beat that precedes the PORTAL Beat in the sequence.

**Who owns it:** `BeatController` owns stage completion and next stage loading. StageRuntimeScene owns portal visual and player collision. Zustand `progressState` owns stage completion tracking.

**Data changes:** `progressState.completedStages.push(stageId)`. Save written (via CHECKPOINT). `sessionState` cleared (resets for new stage). `sessionState.currentStageId` updated.

**Events:** `ACTIVATE_PORTAL`, `PLAYER_REACHED_PORTAL`, `SWITCH_TO_PRELOADER`, `BeatCompleted`.

---

## 12. Death & Retry Runtime

**What happens:**
`sessionState.hp` reaches zero (decremented by the encounter/boss runtime on wrong answers or special boss attacks). `BeatController` detects `hp <= 0`.

`BeatController` sets `sessionState.beatInProgress = false` (critical — no save can fire mid-death). It emits `GameEventBus.emit('PLAYER_DIED')`. StageRuntimeScene plays the death animation and freezes player input.

React renders a death screen overlay: "The Pod Bug got you. Try again." (theme-applied). No shame. No timer.

**What resets:**
- `sessionState.hp = maxHp` (full restore)
- Player position: respawned at the Boss Room entrance (if died in boss fight) or at the start of the current dungeon (if died in dungeon) or at the stage entry point (if died in exploration)
- Current Beat: BeatController backs up to the start of the Beat that caused death (re-executes the encounter/boss from its beginning)

**What is preserved (never reset):**
- `progressState.mastery` — ALL ENCOUNTERED/DEMONSTRATED/APPLIED dimensions preserved (Pillar 3)
- `progressState.completedQuests` — preserved
- `progressState.xp` and `progressState.playerLevel` — preserved
- `progressState.inventory` — preserved
- All previously collected scrolls and knowledge beats — preserved

**The principle enforced:** Dying costs nothing except time. The player returns to try again. They never re-read a scroll they already read. They never re-demonstrate mastery they already demonstrated.

**Who owns it:** Zustand `sessionState` owns HP and triggers death detection. `BeatController` owns the respawn logic. StageRuntimeScene owns the death animation and respawn visual.

**Data changes:** `sessionState.hp` restored to max. Beat index backed to start of death-causing Beat. No progress state changes.

**Events:** `PLAYER_DIED`, `RESPAWN`, StageRuntimeScene places player at respawn point.

---

## 13. Save & Resume Runtime

### Save

CHECKPOINT Beats are placed at natural pause points in each Stage's Beat sequence (after quest completion, after defeating a named enemy, before entering the dungeon, after boss defeat). When a CHECKPOINT Beat fires:

1. `BeatController` confirms `sessionState.beatInProgress === false` (save cannot fire mid-Beat)
2. `BeatController` serialises `progressState` to the save payload:
   ```
   SavePayload {
     campaignId, campaignVersion, playerLevel, xp,
     completedStages[], activeQuests[], completedQuests[],
     masteryState: Map<conceptId, { ENCOUNTERED, DEMONSTRATED, APPLIED }>,
     inventory[], abilities[],
     lastCompletedBeat: { stageId, beatPosition },
     sessionSeed
   }
   ```
3. Save system writes to storage backend (decided in Phase 3.5)
4. `BeatCompleted` fires

### Resume

Player opens the app, selects a campaign, and has an existing compatible save.

1. Pipeline loads `CompiledCampaign` (same as new game)
2. Save system reads the save payload. Version check: `save.campaignVersion` vs `compiledCampaign.meta.campaignVersion`
   - Exact match: full restore
   - Minor version: compatibility mode (stage-completion-based placement)
   - Major version: incompatible — player informed, can start over or play with older version
3. `progressState` is hydrated from save payload
4. `BeatController` navigates to `save.lastCompletedBeat.stageId`
5. StageRuntimeScene loads for that stage
6. `BeatController` advances to the Beat after `save.lastCompletedBeat.beatPosition`
7. Player is placed at the stage entry point (safe respawn — not at the exact tile they saved at)

**Who owns it:** `BeatController` owns save trigger and resume navigation. Save system owns serialisation/deserialisation and version checking. Zustand `progressState` owns state hydration.

**Data changes on resume:** `progressState` fully hydrated from save. All mastery, quests, XP, inventory restored.

---

## 14. Campaign Completion Runtime

**What happens:**
The PORTAL Beat in the final stage fires, but `nextStageRef` is null (or flagged as `CAMPAIGN_COMPLETE`). `BeatController` detects this.

1. `progressState.markCampaignComplete(campaignId)` — campaign marked complete
2. `GameEventBus.emit('CAMPAIGN_COMPLETE')` — StageRuntimeScene plays a grand exit animation (theme-applied: the kingdom healing, the cluster stabilising)
3. `BeatController` triggers the epilogue sequence — a `CutsceneEvent` payload held at the Campaign level plays in React `<CutscenePlayer>`. The epilogue: Mira at the Watchtower, Kestran watching the kingdom hold, Lyra writing, the kingdom restored.
4. React renders a mastery summary screen: all Concepts encountered/demonstrated/applied, in theme-appropriate language ("Concepts you restored to the Kingdom"). This reads from `progressState.masteryState`.
5. Player is returned to the Campaign Selection screen. The campaign's entry in the selection is marked COMPLETED.
6. The `CompiledCampaign` object is discarded from memory.

**Who owns it:** `BeatController` detects campaign completion and triggers the sequence. React owns the epilogue player and mastery summary screen. Zustand `progressState` owns the final state record.

**Data changes:** `progressState.completedCampaigns.push(campaignId)`. Mastery summary is a read-only view of existing mastery state.

**Events:** `CAMPAIGN_COMPLETE`, campaign complete animation, epilogue playback, mastery summary display.

---

## Top Runtime Risks

**RISK-01 — EXPLORATION beat concurrency (High).**
The ambient EXPLORATION Beat running concurrently with sequential Beats is architecturally sound but easy to implement incorrectly. If `BeatController` treats EXPLORATION as a blocking Beat, the entire exploration phase stops. If it advances past EXPLORATION without registering interaction listeners, world events are missed. Implementation must explicitly handle the "two-track" execution model.

**RISK-02 — Beat completion event misfires (Medium).**
If a completion event fires for the wrong Beat (e.g., an old `ENEMY_DEFEATED` event fires after the Beat has already completed), `BeatController` could double-advance or corrupt the Beat index. The implementation must include Beat ID validation in all completion handlers — events must carry the Beat ID they belong to.

**RISK-03 — HP state boundary (Medium).**
HP is logically "session state" (resets on stage reload) but behaves like progress in some contexts (should not reset on death). The implementation must be explicit: death restores HP but does NOT reload the stage. Reloading the stage (returning to stage entry) would erase session state including enemy defeat progress.

**RISK-04 — Phaser destroy/remount on route navigation (Medium).**
If the player navigates away from `/game` and back, Phaser must be destroyed and recreated cleanly. React's `useEffect` cleanup must call `game.destroy(true)`. If not, canvas event listeners accumulate and Phaser instances stack — a hard-to-debug memory leak.

**RISK-05 — Save version compatibility edge cases (Low-Medium).**
The compatibility mode (minor version, stage-completion-based restore) is designed for content additions. But a content author who reorganises beat positions within an existing stage (changing beat indices) would produce a minor version bump that behaves unexpectedly on restore. The save's `lastCompletedBeat.beatPosition` may reference a beat that no longer exists at that position.

---

## Top Runtime Simplifications (for vertical slice)

1. **Hardcode the session seed** for the vertical slice — no seeded shuffle variation needed to validate the loop. Every playtest sees the same challenge sequence.
2. **One HP value per encounter** — no HP reduction curve, no difficulty tuning. Wrong answer = lose X HP. Fixed value. Balance later.
3. **Skip the Preloader progress indicator** — loading screen with a spinner, no percentage. Visual fidelity of loading is not under test.
4. **Skip campaign selection** — the vertical slice has one campaign. Navigate directly to Stage 2. No selection screen needed.
5. **Skip level-up animation and feedback** — XP accumulates and is tracked. Visual feedback for levelling up is deferred. The number goes up; nothing needs to play.

---

## Most Difficult Runtime Areas

**1. The EXPLORATION + concurrent Beat model.**
This is the architectural heart of the game — the moment exploration feels like a world vs a menu. Getting the two-track model right (sequential Beats and ambient interaction Beats coexisting) requires careful implementation of the BeatController's state machine. It's not difficult in concept, but it's easy to accidentally build a sequential-only controller that doesn't feel like an RPG world.

**2. Boss multi-phase orchestration.**
The Boss Runtime has the most moving parts of any Beat type: multi-phase loop, per-phase challenge selection, phase exposure mechanism (each phase reveals the next), resolution condition variety (HP zero vs correct answer presented). The Severed Envoy's four-phase consequential chain in particular — where each phase's outcome shapes the next phase's entry condition — requires the BeatController to track phase state carefully.

**3. Save/Resume with Beat-level precision.**
Saving at Beat granularity (not just stage completion) means the resume path must place the player at the right point in a Beat sequence — including mid-exploration, after some ambient beats have fired and some haven't. The simplest and most defensible approach for v1: save after Beat completion only (not mid-Beat), and resume by re-executing the current incomplete beat from its start. This is slightly imprecise but avoids complex mid-Beat state serialisation.

---

## Cross-references

- `ai-engine-architecture.md` — BeatController, GameEventBus, scene model (the components this doc orchestrates)
- `ai-content-loading-pipeline.md` — CompiledCampaign object (the data this doc consumes)
- `game-design/ai-gameplay-loop.md` — three-scale loop (moment-to-moment maps to §5–§9; session maps to §13; stage-arc maps to §3–§11)
- `game-design/ai-vision.md §4 Pillar 3` — failure teaches, never punishes (drives §12 design)
- `DECISIONS.md` — D-24A through D-28 all exercised in this document
