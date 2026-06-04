# Development Order

> **Milestone:** 04 — Vertical Slice
> **Purpose:** Exact build sequence. Which tasks to do in which order, what can be parallel, what blocks what.

---

## Phase A — First Playable World

**Goal:** A square moves on a map. Nothing else. The game loop exists.

**Why first:** T-01 (Phaser mounting) is the highest-risk task in the entire milestone. If Phaser doesn't mount cleanly in Next.js 15, nothing else can start. Resolve this blocker on day one.

| Task | Description | Parallel with |
|---|---|---|
| T-01 | Phaser mounts in Next.js | — (must be first) |
| T-02 | BootScene + PreloaderScene | T-07 (GameEventBus — independent) |
| T-03 | StageRuntimeScene skeleton | — |
| T-04 | Player movement + camera | T-14, T-18 (content tasks — no code dependency) |
| T-05 | Podveil Village tilemap | T-07, T-10 |
| T-06 | Tilemap collision + walkability | — |

**Phase A exit criteria:**
- Player rectangle moves around a tilemap
- Camera follows the player
- No console errors
- Navigating away and back to `/game` works cleanly

**Phase A output:** A black canvas with a moving white square. This is enough to continue.

---

## Phase B — First Interaction

**Goal:** The player can interact with an object in the world. The GameEventBus works. BeatController exists.

| Task | Description | Parallel with |
|---|---|---|
| T-07 | GameEventBus | Can be done during Phase A |
| T-08 | Object interaction triggers | After T-05, T-07 |
| T-09 | BeatController scaffold | After T-07, T-10 |
| T-10 | Zustand state stores | Can be done during Phase A |
| T-11 | Input suspension/restore | After T-07, T-04 |

**Phase B exit criteria:**
- Player approaches a scroll object, presses E, console logs "PLAYER_INTERACTED_WITH scroll_pod_01"
- `GameEventBus.emit` and `GameEventBus.on` work correctly
- Zustand stores are accessible from React components
- `SUSPEND_INPUT` stops player movement; `RESTORE_INPUT` restores it

**Phase B output:** The plumbing is in place. Nothing is visible to a playtester yet. That's fine.

---

## Phase C — First Knowledge Loop

**Goal:** The player finds a scroll, reads it, and the game records what they learned.

**This phase has the most content authoring.** T-14 (scroll text) and T-18 (NPC dialogue) should be authored first — before the components are built — so the components are designed around real content, not placeholder text.

| Task | Description | Parallel with |
|---|---|---|
| T-14 | Stage 2 scroll content | Immediately — content first |
| T-18 | NPC dialogue content | Immediately — content first |
| T-12 | KnowledgePanel component | After T-11; alongside T-14 |
| T-13 | KNOWLEDGE beat handler | After T-09, T-12 |
| T-15 | Scroll objects in tilemap | After T-05, T-13 |
| T-16 | DialogueBox component | After T-11; alongside T-12 |
| T-17 | NPC_INTERACTION beat handler | After T-09, T-16 |
| T-19 | QUEST beat handler | After T-09, T-17 |

**Phase C exit criteria:**
- Player finds a scroll → KnowledgePanel opens → player reads → panel closes → `progressState.knowledgeFound` contains the scroll ID
- Player talks to Mira → DialogueBox shows her "home broken" dialogue → closes after last line
- Player talks to Sera → quest "Restore the Village Pods" becomes active
- Screenshot test on KnowledgePanel passes (game UI, not a quiz)

**⚠️ Internal checkpoint after Phase C:** Run a quick session with someone who hasn't seen the game. Do they care about Mira after 5 minutes? If not, revise dialogue before Phase D.

---

## Phase D — First Combat Loop

**Goal:** The player fights a Pod Bug and wins using knowledge.

| Task | Description | Parallel with |
|---|---|---|
| T-20 | ChallengeRenderer component | After T-11; alongside T-16 |
| T-21 | Combat engine (HP + charge) | After T-10, T-07 |
| T-22 | Pod Bug enemy + ENCOUNTER handler | After T-08, T-09, T-20, T-21 |
| T-23 | PLAYER_DIED + retry flow | After T-21, T-22 |

**Phase D exit criteria:**
- Player walks into a Pod Bug → ChallengeRenderer opens
- Correct answer → charge meter rises → ability fires in Phaser
- Incorrect answer → HP decreases → hint appears
- Player HP reaches 0 → death screen → retry from encounter start with hint
- Pod Bug defeated → `progressState.masteryDemonstrated` updated

**⚠️ Screenshot test after Phase D:** Take a screenshot of the ChallengeRenderer mid-combat. Show it to someone unfamiliar with the project. If they say "quiz" or "test," stop and fix the visual treatment before Phase E.

---

## Phase E — First Boss Loop

**Goal:** The player completes the dungeon and defeats the Pod Tyrant.

| Task | Description | Parallel with |
|---|---|---|
| T-24 | Dungeon room + scene area | After T-06 |
| T-25 | Orphan Shade + Warren Knot | After T-22, T-24 |
| T-26 | DUNGEON beat handler | After T-09, T-24, T-25 |
| T-27 | Pod Tyrant boss entity | After T-05, T-26 |
| T-28 | BOSS beat handler + phase loop | After T-09, T-20, T-21, T-27 |
| T-29 | Boss phase transition + visual feedback | After T-28 |

**Phase E exit criteria:**
- Player enters dungeon, fights Orphan Shade, passes knowledge gate, defeats Warren Knot
- Pod Tyrant activates in village after dungeon complete
- Phase 1 fight plays through (question → charge → damage or heal)
- Phase 2 begins after boss reaches 50% HP (visual change confirmed)
- Boss defeat fires BOSS_PHASE_COMPLETE and ENEMY_DEFEATED

---

## Phase F — First Complete Stage

**Goal:** The full 9-beat arc runs start to finish without assistance.

| Task | Description | Parallel with |
|---|---|---|
| T-30 | Mira state change (home restored) | After T-28 |
| T-31 | PORTAL beat + Kestran entity | After T-17, T-28 |
| T-32 | Beat sequence integration (all 9) | After all above tasks |
| T-33 | Session persist (localStorage) | After T-10 (can be done earlier) |
| T-34 | End-to-end playtest pass | After T-32, T-33 |

**Phase F exit criteria = all criteria in `ai-definition-of-done.md`.**

---

## Dependency graph (simplified)

```
T-01 (Phaser mounts)
  └── T-02 (Scenes)
      └── T-03 (RuntimeScene)
          └── T-04 (Player movement)
              └── T-06 (Collision)

T-05 (Tilemap) ──────────────────────────────────┐
T-07 (GameEventBus) ─────────────────────────────┤
T-10 (Zustand) ──────────────────────────────────┤
                                                  ▼
                                         T-08 (Interaction triggers)
                                              └── T-09 (BeatController)

T-11 (Input suspend) ─────── T-12 (KnowledgePanel) ─── T-13 (KNOWLEDGE handler)
                              T-16 (DialogueBox)    ─── T-17 (NPC handler)
                              T-20 (ChallengeRenderer) ─ T-22 (ENCOUNTER handler)

T-21 (Combat engine) ─── T-22 ─── T-23 (Death/retry)
                              └── T-25 (Orphan Shade/Warren Knot)
                                      └── T-26 (DUNGEON handler)
                                              └── T-27 (Pod Tyrant)
                                                      └── T-28 (BOSS handler)
                                                              └── T-29 (Phase transition)
                                                              └── T-30 (Mira state)
                                                              └── T-31 (Portal/Kestran)

T-32 (Integration) ─── T-34 (Playtest)
T-33 (Persist)
```

---

## Parallel work opportunities

These tasks have no blocking dependencies and can be done in parallel with their phase's main track:

| Task | Can be done during |
|---|---|
| T-07 GameEventBus | Phase A |
| T-10 Zustand stores | Phase A |
| T-14 Scroll content | Phase A or B |
| T-18 NPC dialogue content | Phase A or B |
| T-33 Session persist | Phase C, D, or E |

Content authoring (T-14, T-18) should be done **as early as possible** — before the components that display it. Writing content after the UI exists leads to content that fits the UI rather than UI that serves the content.

---

## Estimated total timeline

| Phase | Tasks | Estimated time |
|---|---|---|
| A — First Playable World | T-01 to T-06 | 1.5 days |
| B — First Interaction | T-07 to T-11 | 1.5 days |
| C — First Knowledge Loop | T-12 to T-19 | 2.5 days |
| D — First Combat Loop | T-20 to T-23 | 2 days |
| E — First Boss Loop | T-24 to T-29 | 2.5 days |
| F — First Complete Stage | T-30 to T-34 | 2 days |
| **Total** | 34 tasks | **~12 working days (~2.5 weeks)** |

This assumes one developer with AI assistance and no art production delays (all assets are placeholder geometry).

---

## What to do if a phase stalls

**Phase A stalls (Phaser won't mount):** Check Phaser 3.90 compatibility with React 19 and Next.js 15. The most likely issue is `window is not defined` during SSR — ensure `next/dynamic` with `ssr: false` is applied. This has a known solution.

**Phase C stalls (KnowledgePanel looks like a quiz):** This is a design problem, not a code problem. Stop. Spend time on the visual treatment. The rest of the game depends on this component not looking like a quiz. It is the correct place to stall.

**Phase E stalls (boss fight feels wrong):** Revisit the question set before adding more phases. If a single question doesn't feel right in combat, three of them won't either. Fix Phase D combat feel before Phase E boss complexity.
