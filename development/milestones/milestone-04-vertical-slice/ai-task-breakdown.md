# Task Breakdown

> **Milestone:** 04 — Vertical Slice
> **Purpose:** Every task independently implementable, testable, and completable. Each has acceptance criteria and dependencies.

---

## Task index

| ID | Task | Phase | Est. |
|---|---|---|---|
| T-01 | Phaser mounts in Next.js | A | 2h |
| T-02 | BootScene + PreloaderScene | A | 1h |
| T-03 | StageRuntimeScene skeleton | A | 2h |
| T-04 | Player movement + camera | A | 2h |
| T-05 | Podveil Village tilemap | A | 3h |
| T-06 | Tilemap collision + walkability | A | 1h |
| T-07 | GameEventBus | B | 2h |
| T-08 | Object interaction triggers | B | 2h |
| T-09 | BeatController scaffold | B | 3h |
| T-10 | Zustand state stores | B | 2h |
| T-11 | Input suspension/restore | B | 1h |
| T-12 | KnowledgePanel component | C | 3h |
| T-13 | KNOWLEDGE beat handler | C | 2h |
| T-14 | Stage 2 scroll content | C | 2h |
| T-15 | Scroll objects in tilemap | C | 1h |
| T-16 | DialogueBox component | C | 2h |
| T-17 | NPC_INTERACTION beat handler | C | 2h |
| T-18 | Mira + Lyra + Sera NPCs | C | 2h |
| T-19 | QUEST beat handler | C | 2h |
| T-20 | ChallengeRenderer component | D | 4h |
| T-21 | Combat engine (HP + charge) | D | 3h |
| T-22 | Pod Bug enemy + ENCOUNTER handler | D | 2h |
| T-23 | PLAYER_DIED + retry flow | D | 2h |
| T-24 | Dungeon room + scene area | E | 3h |
| T-25 | Orphan Shade + Warren Knot | E | 2h |
| T-26 | DUNGEON beat handler | E | 2h |
| T-27 | Pod Tyrant boss entity | E | 2h |
| T-28 | BOSS beat handler + phase loop | E | 4h |
| T-29 | Boss phase transition + visual | E | 2h |
| T-30 | Mira state change (home restored) | F | 1h |
| T-31 | PORTAL beat + Kestran entity | F | 2h |
| T-32 | Beat sequence integration (all 9) | F | 3h |
| T-33 | Session persist (localStorage) | F | 2h |
| T-34 | End-to-end playtest pass | F | 2h |

---

## Task details

---

### T-01 — Phaser mounts in Next.js
**Phase:** A
**Description:** Create `PhaserGame.tsx` using `next/dynamic` with `ssr: false`. Phaser instantiates with an empty canvas on the `/game` route. No scenes, no content — just a black canvas that mounts and unmounts cleanly.

**Acceptance criteria:**
- [ ] `/game` route loads without a server-side rendering error
- [ ] A black canvas is visible in the browser
- [ ] No `window is not defined` errors in the console
- [ ] Navigating away from `/game` and back re-mounts Phaser without errors
- [ ] Navigating away and then closing the tab produces no React warnings about memory leaks

**Dependencies:** None (first task)

---

### T-02 — BootScene + PreloaderScene
**Phase:** A
**Description:** Implement BootScene (immediately transitions to PreloaderScene) and PreloaderScene (loads a placeholder tilemap + placeholder player sprite, then emits `SCENE_LOADED` and transitions to StageRuntimeScene).

**Acceptance criteria:**
- [ ] BootScene starts on game launch and transitions within one frame
- [ ] PreloaderScene loads the Stage 2 tilemap JSON and player sprite without errors
- [ ] `SCENE_LOADED` event fires after loading completes
- [ ] Loading completes in under 3 seconds with placeholder assets

**Dependencies:** T-01

---

### T-03 — StageRuntimeScene skeleton
**Phase:** A
**Description:** StageRuntimeScene starts, receives `StageContext` (hardcoded for now), and renders a flat-coloured rectangle world. No tilemap yet. Just a scene that runs.

**Acceptance criteria:**
- [ ] StageRuntimeScene starts after PreloaderScene completes
- [ ] The scene renders (green background, no errors)
- [ ] The Phaser update loop runs (confirmed by a frame counter in the console — remove after verification)
- [ ] Scene does not crash on startup

**Dependencies:** T-02

---

### T-04 — Player movement + camera
**Phase:** A
**Description:** Place a white 32×32 rectangle as the player character in StageRuntimeScene. WASD + arrow key movement at a fixed speed. Camera follows the player.

**Acceptance criteria:**
- [ ] Player rectangle is visible at `StageContext.playerStart` position
- [ ] WASD and arrow keys move the player in the correct direction
- [ ] Camera follows the player (player stays near screen centre)
- [ ] Movement is smooth (no jitter at 60fps)
- [ ] Player does not move outside the tilemap bounds (simple boundary clamp)

**Dependencies:** T-03

---

### T-05 — Podveil Village tilemap
**Phase:** A
**Description:** Create a Tiled `.json` tilemap for Podveil Village. Single layer. Coloured rectangles for regions (houses, paths, dungeon entrance, portal zone). Named objects for interactive triggers.

**Acceptance criteria:**
- [ ] Tilemap loads without errors in Phaser
- [ ] The tilemap has a named object layer with these objects: `scroll_pod_01`, `scroll_pod_02`, `npc_mira`, `npc_lyra`, `npc_sera`, `dungeon_entrance`, `portal`
- [ ] Regions are visually distinguishable (different tile colours for houses, paths, dungeon zone, portal zone)
- [ ] The map is large enough to require the camera to pan when moving (minimum 20×15 tiles at 32px each)

**Dependencies:** T-03

---

### T-06 — Tilemap collision + walkability
**Phase:** A
**Description:** Set collision properties on the tilemap so the player cannot walk through houses or unwalkable tiles. Paths and open areas are walkable.

**Acceptance criteria:**
- [ ] Player cannot walk through house tiles
- [ ] Player can walk on path and open area tiles
- [ ] Player does not clip through walls at any movement speed
- [ ] The dungeon entrance tile is walkable (will be triggered, not blocked)

**Dependencies:** T-04, T-05

---

### T-07 — GameEventBus
**Phase:** B
**Description:** Implement the typed event bus as a singleton module. Provides `emit(event, payload)` and `on(event, handler)` methods with typed events.

**Acceptance criteria:**
- [ ] `GameEventBus.emit('PLAYER_DIED', {})` fires without errors
- [ ] `GameEventBus.on('SCENE_LOADED', handler)` calls `handler` when `SCENE_LOADED` is emitted
- [ ] Emitting an event with wrong payload type causes a TypeScript compile error (type safety confirmed)
- [ ] `GameEventBus.off(event, handler)` removes the handler (no memory leak on component unmount)

**Dependencies:** None (can be built independently)

---

### T-08 — Object interaction triggers
**Phase:** B
**Description:** When the player character walks within proximity of a named object in the tilemap, `GameEventBus.emit('PLAYER_INTERACTED_WITH', { objectId, objectType })` fires. An interaction hint ("Press E") appears near the object.

**Acceptance criteria:**
- [ ] Walking near `scroll_pod_01` fires `PLAYER_INTERACTED_WITH { objectId: 'scroll_pod_01', objectType: 'KNOWLEDGE' }`
- [ ] Walking near `npc_mira` fires `PLAYER_INTERACTED_WITH { objectId: 'npc_mira', objectType: 'NPC_INTERACTION' }`
- [ ] The interaction hint ("Press E") appears when within range and disappears when out of range
- [ ] The event fires on keypress (E), not on proximity alone
- [ ] Each object fires its event exactly once per interaction (no repeat firing while standing still)

**Dependencies:** T-05, T-07

---

### T-09 — BeatController scaffold
**Phase:** B
**Description:** Implement the BeatController as a React hook. Reads the hardcoded Stage 2 Beat array. Calls `advance()` on initialisation. Has `executeBeat(beat)` that logs the beat type to console (handlers added in later tasks).

**Acceptance criteria:**
- [ ] BeatController initialises with the Stage 2 Beat sequence (9 beats)
- [ ] `advance()` increments `currentBeatIndex` and calls `executeBeat`
- [ ] `executeBeat` logs the beat type and index to console
- [ ] EXPLORATION beat calls `advance()` immediately after logging (does not block)
- [ ] `beatInProgress` flag is set to `true` on `executeBeat` and `false` on `beatCompleted()`
- [ ] Calling `beatCompleted()` twice for the same beat does not double-advance

**Dependencies:** T-07, T-10

---

### T-10 — Zustand state stores
**Phase:** B
**Description:** Create `sessionState` and `progressState` Zustand stores with the Stage 2 state schema.

**Acceptance criteria:**
- [ ] `sessionState` contains: `hp`, `maxHp`, `currentBeatIndex`, `explorationActive`, `combatActive`
- [ ] `progressState` contains: `knowledgeFound: string[]`, `masteryEncountered: string[]`, `masteryDemonstrated: string[]`, `completedBeats: string[]`
- [ ] `progressState` is persisted to `localStorage` (via Zustand `persist` middleware)
- [ ] Refreshing the page restores `progressState` from `localStorage`
- [ ] `sessionState` is NOT persisted (resets on refresh)
- [ ] Both stores are accessible from any React component and from BeatController

**Dependencies:** None (can be built independently)

---

### T-11 — Input suspension/restore
**Phase:** B
**Description:** `SUSPEND_INPUT` event disables Phaser keyboard input and sets canvas `pointer-events: none`. `RESTORE_INPUT` reverses it.

**Acceptance criteria:**
- [ ] Emitting `SUSPEND_INPUT` stops player movement immediately
- [ ] Player character does not move while input is suspended
- [ ] Emitting `RESTORE_INPUT` restores movement
- [ ] Clicking on the Phaser canvas while suspended does not trigger game events
- [ ] Suspend/restore cycle can be repeated multiple times without state corruption

**Dependencies:** T-07, T-04

---

### T-12 — KnowledgePanel component
**Phase:** C
**Description:** React component that displays knowledge scroll content. Styled as a physical world object (parchment/stone aesthetic). Closes on button click. Fires `beatCompleted` back to BeatController.

**Acceptance criteria:**
- [ ] Panel renders with: title, body text (max 5 lines visible), close button
- [ ] Panel is visually distinct from a web form or quiz panel (parchment/stone styling)
- [ ] Closing the panel calls `GameEventBus.emit('RESTORE_INPUT')` and `beatCompleted()`
- [ ] Panel does not render when `isOpen = false`
- [ ] Panel is positioned over the Phaser canvas (z-index above canvas)
- [ ] Screenshot test: show a screenshot to someone unfamiliar with the project; they should describe it as a "game UI element" not a "web form"

**Dependencies:** T-11

---

### T-13 — KNOWLEDGE beat handler
**Phase:** C
**Description:** Wire the KNOWLEDGE beat type in BeatController. When a KNOWLEDGE beat fires: emit `SUSPEND_INPUT`, open KnowledgePanel with the beat's content, wait for close, call `progressState.addKnowledge(scrollId)`, emit `RESTORE_INPUT`, call `beatCompleted`.

**Acceptance criteria:**
- [ ] Interacting with `scroll_pod_01` opens the KnowledgePanel with the correct content
- [ ] Panel closes correctly and BeatController advances
- [ ] `progressState.knowledgeFound` includes the scroll ID after close
- [ ] `progressState.masteryEncountered` includes `'concept:kubernetes:pod'` after the first Pod scroll
- [ ] The scroll object disappears or changes visual state after being found (cannot be found twice)

**Dependencies:** T-08, T-09, T-12

---

### T-14 — Stage 2 scroll content
**Phase:** C
**Description:** Author the three knowledge scroll texts for Stage 2. Each must be accurate, concise (max 4 lines), and written in the game's voice (not documentation style).

**Scroll 1 — "What a Pod is":**
> Pods are the smallest living units in the kingdom. A Pod is a home — a boundary where containers share the same network and storage. What lives together in a Pod can speak to each other directly. What lives in separate Pods must call across the village.

**Scroll 2 — "Why co-location matters":**
> When containers share a Pod, they share a local address. They do not need roads between them — they speak through the walls. This is why a Pod is a home, not just a box: it is a space where things meant to work together actually can.

**Scroll 3 — "Pod failure and recovery":**
> A Pod that fails is not a catastrophe. The home may be dark for a moment, but it can be rebuilt. The kingdom was not designed for permanence — it was designed for resilience. Things fall. The question is only whether they can rise again.

**Acceptance criteria:**
- [ ] All three scrolls are authored and committed to the content object
- [ ] Each scroll is 3–4 lines maximum
- [ ] A test reader with no Kubernetes knowledge can explain what a Pod is after reading all three
- [ ] No scroll uses the word "cluster," "node," "container runtime," or any jargon not previously introduced

**Dependencies:** None (content authoring; can be done independently)

---

### T-15 — Scroll objects in tilemap
**Phase:** C
**Description:** Place three scroll objects in the Podveil Village tilemap at appropriate positions. Each glows or is visually distinct. Disappear after interaction.

**Acceptance criteria:**
- [ ] Three scroll objects are visible on the tilemap at distinct positions
- [ ] Each scroll has a visual indicator (yellow glow rectangle or similar)
- [ ] After interaction, the scroll visual is removed (no duplicate interactions)
- [ ] Scroll positions are in areas the player naturally traverses (not hidden in corners)

**Dependencies:** T-05, T-13

---

### T-16 — DialogueBox component
**Phase:** C
**Description:** React component for NPC dialogue. Receives `{ npcName, portrait, lines[] }`. Player advances through lines. Last line advance fires `beatCompleted`.

**Acceptance criteria:**
- [ ] NPC name is displayed prominently
- [ ] Portrait area shows a coloured rectangle with name if no image provided
- [ ] Click or keypress (E/Space) advances to next line
- [ ] On last line, advance fires `beatCompleted()`
- [ ] Component is stateless — all content comes from props
- [ ] A dialogue with 1 line and a dialogue with 5 lines both work correctly

**Dependencies:** T-11

---

### T-17 — NPC_INTERACTION beat handler
**Phase:** C
**Description:** Wire NPC_INTERACTION beat type in BeatController. On interaction: emit `ACTIVATE_NPC`, `SUSPEND_INPUT`, open DialogueBox with the NPC's current dialogue state, wait for close, `RESTORE_INPUT`, `beatCompleted`.

**Acceptance criteria:**
- [ ] Interacting with Mira opens her dialogue with "home broken" content
- [ ] Interacting with Lyra opens her arrival dialogue
- [ ] DialogueBox closes and BeatController advances after last line
- [ ] After boss defeat, Mira's dialogue state switches to "home restored"

**Dependencies:** T-09, T-16, T-08

---

### T-18 — Mira + Lyra + Sera NPC content
**Phase:** C
**Description:** Author dialogue strings for Mira (2 states), Lyra (2 states), and Sera (1 state), plus Kestran (1 beat — added in T-31).

**Mira — home broken:**
> "The walls used to hum. My mother says that means they're healthy — the containers inside can hear each other. It's been quiet since the attack. I've been waiting for the hum to come back."

**Mira — home restored (post-boss):**
> "Did you hear that? It's back. The hum." *(pause)* "I didn't think it would feel like that."

**Lyra — arrival:**
> "You're here. Good. This village — the homes here aren't just buildings. They're pods. Living structures that let everything inside work together. The attack severed those connections. Every house is intact. Nothing inside can communicate." *(She pauses.)* "I don't entirely understand why it works the way it does. But you'll figure it out. You always do."

**Lyra — post-boss:**
> "You know what I got wrong? I said pods were just grouped containers. Old Dorn corrected me. They share a network interface. They speak through the walls. I had it right in structure, wrong in understanding." *(A small smile.)* "I'm beginning to think understanding is the whole point."

**Sera — quest trigger:**
> "Thank you for coming. The village is — it's still here, which is more than I expected. But everything inside the homes has gone quiet. If you can find out what made them work and bring it back, I think the rest will follow."

**Acceptance criteria:**
- [ ] All five dialogue states are authored and committed
- [ ] Lyra's "wrong about Pods" correction fires in her post-boss state
- [ ] Mira's state change is observable by the player (different words, not just a log message)
- [ ] No dialogue line exceeds 3 sentences

**Dependencies:** None (content authoring)

---

### T-19 — QUEST beat handler
**Phase:** C
**Description:** Wire QUEST beat type. On activation: set quest ACTIVE in progressState, register step listeners. On all steps complete: evaluate resolution condition, call progressState.completeQuest, fire beatCompleted.

**Acceptance criteria:**
- [ ] Talking to Sera activates the quest "Restore the Village Pods"
- [ ] Quest steps track: scroll_pod_01 found, scroll_pod_02 found, pod_bug_defeated
- [ ] Quest completes when all three steps resolve
- [ ] Quest completion calls `progressState.masteryEncountered.push('concept:kubernetes:pod')` if not already present
- [ ] BeatController advances after quest completes

**Dependencies:** T-09, T-10, T-17

---

### T-20 — ChallengeRenderer component
**Phase:** D
**Description:** The most important UI component in the game. Displays a knowledge challenge during combat. MUST NOT look like a quiz app.

**Content for Stage 2 (12 unique questions authored here):**

**Pod Bug questions (INTRODUCTORY — 4 questions):**
1. "Which of these is part of a Pod's spec? (a) image list (b) theme colour (c) player level" — Answer: a
2. "Two containers in a Pod share ___. (a) a network interface (b) separate IP addresses (c) different file systems" — Answer: a
3. "A Pod that fails can ___. (a) restart (b) never be recovered (c) corrupt other Pods" — Answer: a
4. "What makes a Pod different from a single container? (a) co-location and shared resources (b) a larger size (c) a different language" — Answer: a

**Warren Knot questions (INTERMEDIATE — 4 questions):**
1. "Container A and Container B share a Pod. Container A crashes. What happens to Container B? (a) it keeps running (b) it crashes too (c) the Pod is destroyed" — Answer: a
2. "A Pod has two containers. They communicate via ___. (a) localhost (b) external network (c) separate IP addresses" — Answer: a
3. "Which describes a healthy Pod? (a) containers running and communicating (b) containers isolated in separate spaces (c) containers sharing a single process" — Answer: a
4. "Pod failure is designed to be ___. (a) recoverable (b) catastrophic (c) permanent" — Answer: a

**Pod Tyrant questions (ADVANCED — Boss phases):**
Phase 1: "The Pod Tyrant has absorbed a container that doesn't belong. Which spec field defines what belongs in a Pod? (a) containers list (b) resource limits (c) node affinity" — Answer: a
Phase 2: "Two containers in the Tyrant's Pod can't communicate. Why? (a) they've been placed in separate network namespaces (b) they're running different images (c) their resource limits are exceeded" — Answer: a
Phase 3 (final): "What makes a Pod group healthy? (a) containers co-located, sharing network and storage, able to restart independently (b) containers isolated with separate IP addresses (c) containers sharing a single process space" — Answer: a

**Acceptance criteria:**
- [ ] Panel renders with question text and 3 answer options as large tappable areas
- [ ] Correct selection: green highlight, charge meter increases, combat continues
- [ ] Incorrect selection: red highlight, hint text appears, HP decreases, retry available
- [ ] Screenshot test PASSES: shown cold to a non-playtester, described as a "game moment" not a "quiz"
- [ ] All 12 questions are committed to the content object
- [ ] Component is stateless (receives question data from BeatController, not hardcoded inside)

**Dependencies:** T-11

---

### T-21 — Combat engine (HP + charge)
**Phase:** D
**Description:** Implement the HP + charge mechanic in `sessionState`. ChallengeRenderer feeds results in; combat animations fire via GameEventBus.

**Acceptance criteria:**
- [ ] Correct answer: `chargeLevel += 34` (3 correct answers = full charge at 100)
- [ ] Full charge: `emit('ABILITY_FIRED', { power: 'full' })` → enemy takes 40 HP damage
- [ ] Partial charge (1 correct, 1 wrong): `emit('ABILITY_FIRED', { power: 'partial' })` → enemy takes 20 HP damage
- [ ] Incorrect answer: `sessionState.hp -= 15`; hint fires
- [ ] Player HP reaches 0: `emit('PLAYER_DIED')`
- [ ] Enemy HP reaches 0: `emit('ENEMY_DEFEATED', { enemyId, conceptRef })`
- [ ] Charge resets to 0 after each ability fires

**Dependencies:** T-10, T-07

---

### T-22 — Pod Bug enemy + ENCOUNTER handler
**Phase:** D
**Description:** Place Pod Bug enemies in the village tilemap. Wire ENCOUNTER beat handler: spawn enemy, open ChallengeRenderer, process results, handle defeat.

**Acceptance criteria:**
- [ ] Pod Bugs are visible in the village (2 distinct positions)
- [ ] Player proximity triggers the ENCOUNTER beat
- [ ] ChallengeRenderer opens with a Pod Bug question
- [ ] Combat plays through: correct answers charge → ability fires (flash on enemy) → enemy defeated
- [ ] `progressState.masteryDemonstrated.push('concept:kubernetes:pod')` fires on first Pod Bug defeat
- [ ] Defeated Pod Bug is removed from the scene

**Dependencies:** T-08, T-09, T-20, T-21

---

### T-23 — PLAYER_DIED + retry flow
**Phase:** D
**Description:** When player HP reaches 0, show death screen. Player chooses retry. Respawn at start of current encounter with full HP and the hint text visible.

**Acceptance criteria:**
- [ ] PLAYER_DIED event triggers a React overlay: "You fell. Try again." with a Retry button
- [ ] Retry resets `sessionState.hp = maxHp`
- [ ] Retry restarts the current encounter (same enemy, same question set, hint from previous wrong answer visible)
- [ ] `progressState` is NOT modified by death (mastery is preserved)
- [ ] The death screen does not feel punishing — tone is calm, not dramatic

**Dependencies:** T-07, T-10, T-22

---

### T-24 — Dungeon room + scene area
**Phase:** E
**Description:** Create the Pod Warrens dungeon as a separate area accessible from the dungeon entrance tile. Single room with a knowledge gate and Warren Knot chamber.

**Acceptance criteria:**
- [ ] Stepping on `dungeon_entrance` transitions the player to the dungeon area
- [ ] Dungeon area has: an entry corridor, a knowledge gate (locked door), and a Warren Knot chamber
- [ ] Knowledge gate is locked until the player answers a Pod boundary question correctly
- [ ] Warren Knot chamber is entered only after the knowledge gate opens
- [ ] An exit path leads back to the village (or the player exits automatically after Warren Knot defeat)

**Dependencies:** T-06, T-08

---

### T-25 — Orphan Shade + Warren Knot
**Phase:** E
**Description:** Add Orphan Shade enemies (1–2 in dungeon) and Warren Knot mini-boss. Both use the same combat engine as Pod Bugs but with different question sets.

**Acceptance criteria:**
- [ ] Orphan Shades are visible in the dungeon
- [ ] Combat with an Orphan Shade uses Warren Knot INTERMEDIATE questions
- [ ] Warren Knot is placed in the Warren Knot chamber
- [ ] Warren Knot has 2× HP of a Pod Bug and uses all 4 INTERMEDIATE questions in sequence
- [ ] Warren Knot defeat opens the path back to the village and unlocks the boss

**Dependencies:** T-22, T-24

---

### T-26 — DUNGEON beat handler
**Phase:** E
**Description:** Wire the DUNGEON beat in BeatController. Fires when player enters dungeon entrance. Completes when Warren Knot is defeated and player exits dungeon.

**Acceptance criteria:**
- [ ] DUNGEON beat activates when player steps on dungeon_entrance
- [ ] DUNGEON beat completes when Warren Knot is defeated
- [ ] BeatController advances to BOSS beat after DUNGEON completion
- [ ] Pod Tyrant boss entity becomes visible/active in the village after DUNGEON beat completes

**Dependencies:** T-09, T-24, T-25

---

### T-27 — Pod Tyrant boss entity
**Phase:** E
**Description:** Place the Pod Tyrant in the village (in a boss arena area of the tilemap). Two visual states: Phase 1 (orange rectangle) and Phase 2 (red rectangle). Activates after DUNGEON beat completes.

**Acceptance criteria:**
- [ ] Pod Tyrant is not visible until DUNGEON beat completes
- [ ] Pod Tyrant is placed in a distinct boss arena area of the village tilemap
- [ ] Visual state changes from orange to red when Phase 2 begins
- [ ] Pod Tyrant has 3× HP of a Pod Bug (can survive multiple ability hits)

**Dependencies:** T-05, T-26

---

### T-28 — BOSS beat handler + phase loop
**Phase:** E
**Description:** Wire the BOSS beat. Multi-phase loop: Phase 1 (co-location question), Phase 2 (Pod boundary question), final defeat sequence.

**Acceptance criteria:**
- [ ] BOSS beat activates when player approaches Pod Tyrant
- [ ] Phase 1 fires: ChallengeRenderer with Phase 1 question; wrong answer = boss HP +10 (boss heals slightly); correct = boss takes damage
- [ ] Phase 1 completes when boss HP reaches 50%: `emit('BOSS_PHASE_COMPLETE', { phase: 1 })` → visual state changes to Phase 2
- [ ] Phase 2 fires: ChallengeRenderer with Phase 2 question; same combat rules
- [ ] Phase 2 completes when boss HP reaches 0: defeat sequence fires
- [ ] `progressState.masteryDemonstrated.push('concept:kubernetes:pod')` if not already set
- [ ] `progressState.masteryApplied` (optional flag) set after boss defeat

**Dependencies:** T-09, T-20, T-21, T-27

---

### T-29 — Boss phase transition + visual feedback
**Phase:** E
**Description:** Visual feedback when a boss phase transitions. Phase indicator in the UI. Boss visual changes. Brief pause before Phase 2 begins.

**Acceptance criteria:**
- [ ] When `BOSS_PHASE_COMPLETE` fires, a React overlay briefly displays "Phase 2" (or equivalent)
- [ ] Boss rectangle changes colour within 500ms of the phase event
- [ ] A 1-second pause before Phase 2 combat begins (gives player a moment to register the change)
- [ ] Player can identify they are in a different phase without being told explicitly

**Dependencies:** T-28

---

### T-30 — Mira state change (home restored)
**Phase:** F
**Description:** After boss defeat, Mira's home tile changes colour from grey to warm yellow. Mira's dialogue state switches to "home restored".

**Acceptance criteria:**
- [ ] Boss defeat triggers `progressState.mirasHomeRestored = true`
- [ ] Mira's home tile changes colour within 1 second of boss defeat (CSS class swap or tilemap tile replacement)
- [ ] Interacting with Mira after boss defeat shows "home restored" dialogue
- [ ] The state change is visible without the player needing to interact with anything first

**Dependencies:** T-28, T-17

---

### T-31 — PORTAL beat + Kestran entity
**Phase:** F
**Description:** After boss defeat, a Kestran entity appears at the northern gate. Interacting with him plays his one-line beat. The portal tile becomes active.

**Kestran dialogue:** *(No words. He looks at the player for a long moment. Then opens the gate.)*
*[Alternatively, one line if silence reads as a bug: "You did it."]*

**Acceptance criteria:**
- [ ] Kestran entity appears at the northern gate after boss defeat
- [ ] Interacting with Kestran fires the NPC_INTERACTION beat
- [ ] After Kestran's beat completes, the portal tile becomes active (colour change + interaction enabled)
- [ ] Stepping on the active portal tile triggers the PORTAL beat
- [ ] PORTAL beat fires `progressState.completedBeats.push('stage-2-portal')` and transitions to "Stage 3 — Coming Soon" screen

**Dependencies:** T-17, T-28

---

### T-32 — Beat sequence integration (all 9 beats)
**Phase:** F
**Description:** Wire all 9 beats as a complete sequence in BeatController. Verify the full arc plays from Beat 1 (Arrival) to Beat 9 (Portal) without errors or deadlocks.

**Acceptance criteria:**
- [ ] Beat 1 (Arrival): Lyra's dialogue fires on scene start
- [ ] Beat 2 (Mira): Mira is interactable from the start of the scene
- [ ] Beat 3 (First scroll): scroll_pod_01 fires KNOWLEDGE beat
- [ ] Beat 4 (Combat): Pod Bugs trigger ENCOUNTER beats
- [ ] Beat 5 (Second scroll): scroll_pod_02 fires KNOWLEDGE beat
- [ ] Beat 6 (Dungeon): dungeon_entrance triggers DUNGEON beat
- [ ] Beat 7 (Boss): Pod Tyrant triggers BOSS beat after dungeon complete
- [ ] Beat 8 (Mira restored): Home colour changes after boss defeat
- [ ] Beat 9 (Portal): Kestran beat + portal activation + stage completion
- [ ] No beat can fire before its preconditions are met
- [ ] The entire sequence completes without console errors

**Dependencies:** All previous tasks

---

### T-33 — Session persist (localStorage)
**Phase:** F
**Description:** `progressState` persists to localStorage via Zustand persist middleware. Refreshing the page restores discovered scrolls and completed beats.

**Acceptance criteria:**
- [ ] After finding scroll_pod_01 and refreshing the page, `progressState.knowledgeFound` still contains the scroll ID
- [ ] Completed beats are restored on page refresh
- [ ] `sessionState` (HP, combat state) is NOT restored (resets to defaults)
- [ ] Corrupted localStorage data is handled gracefully (falls back to default state, no crash)

**Dependencies:** T-10

---

### T-34 — End-to-end playtest pass
**Phase:** F
**Description:** Internal playtest of the complete slice from Beat 1 to Beat 9. Verify every success criterion from `ai-definition-of-done.md`.

**Acceptance criteria:**
- [ ] A developer who did not build the slice plays it cold and completes all 9 beats without assistance
- [ ] All 9 success criteria from `ai-definition-of-done.md` pass
- [ ] No crashes or console errors during a complete playthrough
- [ ] Estimated play time is under 60 minutes

**Dependencies:** T-32, T-33
