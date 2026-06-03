# Gameplay Loop — ForgeMinds

> **Purpose:** Define the rhythm of play at three time scales — moment-to-moment, session-to-session, and stage-to-stage — so every later system (combat, quests, encounters, dungeons, bosses, knowledge delivery) can be checked against a single coherent rhythm.
> **Status:** v1 — refined from `prompts/prompt2.md`. Load-bearing for downstream docs. Subject to revision when weaknesses, repetition risks, and fun-factor improvements are addressed in follow-up slices.
> **Owned by:** AI

## Scope

This document defines **what the player is doing**, at three nested time scales:

| Scale | Duration | Owner of attention |
|---|---|---|
| Moment-to-moment | 5–30 seconds | The current input, the current screen |
| Session-to-session | 20–60 minutes | The current quest, the current region |
| Stage-to-stage / arc | hours per stage | The current Kubernetes concept, the campaign |

Anything outside these — UI, control scheme, combat math, specific challenge formats, world layout, asset choices — is **deliberately not in this doc**. Those are downstream decisions that must conform to this loop, not constrain it.

## The three loops at a glance

> **Moment-to-moment** — explore the world, find things worth interacting with, interact, get a small reward (knowledge, items, story), continue.
>
> **Session-to-session** — pick up a quest, follow a thread of curiosity through a region, hit at least one knowledge beat, hit at least one combat beat, reach a satisfying checkpoint, save, log off.
>
> **Stage-to-stage / arc** — arrive in a region thematically tied to one Kubernetes concept, learn the concept naturally through play, prove mastery against escalating challenges, defeat the regional boss, leave changed.

The principle that binds all three: **knowledge becomes gameplay**. Every loop, at every scale, must have a moment where what the player has learned about Kubernetes affects what the player can *do* in the game world. If a loop has no knowledge-application beat, it is not a ForgeMinds loop.

## 1. Moment-to-moment loop (5–30 seconds)

The smallest loop is what the player is doing *right now*. It splits cleanly into three modes the player flows between:

### 1a. Exploration mode

```
move → notice something → approach → interact → small reward → move
```

The player is walking through a region. They see a glowing object, an NPC with an icon over their head, a door, a path. They approach it. They interact. Something happens — dialogue, a knowledge panel, a chest, a gate. They keep moving.

**The hidden contract:** *every screen has at least one thing worth approaching.* Empty regions are the silent killer of exploration loops. If the player can walk for 30 seconds without something pulling them toward an interaction, the loop is broken.

### 1b. Knowledge-discovery mode

```
interact with knowledge object → learning panel opens → read small chunk
  → optionally collect/save → close → world resumes
```

The player triggered a scroll, tablet, crystal, or NPC dialogue that delivers a Kubernetes concept. The panel is short — one chunk per panel, never a wall of text. The player reads, possibly takes a small action (collect, mark, accept a quest), and returns to exploration.

**The hidden contract:** *the panel ends with the world still feeling alive.* Knowledge moments must not feel like the game stopped to teach. The closing animation, the sound, the camera return — all of it should say "and now, back to your adventure."

### 1c. Combat mode (knowledge-powered)

```
encounter triggers → challenge appears → player answers → ability charges
  → player commits action → outcome plays out → next exchange or encounter ends
```

This is the most fragile loop in the game. Prompt2.md describes correct answers charging abilities (2/2 = full charge, 1/2 = partial, 0/2 = miss). Soft failure: wrong answers reduce HP, never insta-kill.

**The hidden contract:** *the player must feel like a player, not a test-taker.* That means challenges resolve fast (seconds, not minutes), the character animates *as* the answer is being chosen (not just after), the outcome reads as combat first and grading second. If the combat screen could be screenshotted and mistaken for a quiz app, the loop is broken.

> **Risk flagged for follow-up slice:** if every encounter is just "combat = MCQ with sword animation," combat will feel samey across 15 stages. Mitigation candidates (variety of challenge types, contextual encounters, environmental combat, knowledge-traversal puzzles) belong in the **Repetition Risks** and **Combat Recommendations** docs — not here.

## 2. Session-to-session loop (20–60 minutes)

A satisfying ForgeMinds session has a shape, not a duration. The shape is:

```
re-enter world (small "welcome back" beat)
  ↓
pick up a thread (open quest, hint from last save, NPC waiting)
  ↓
explore — hit at least one knowledge beat
  ↓
encounter — hit at least one combat beat
  ↓
mini-challenge or NPC-driven puzzle (variety beat)
  ↓
reach a checkpoint — quest progress, region-edge, dungeon entrance, etc.
  ↓
save → log off → tomorrow-hook
```

**Why this shape:**

- **Knowledge beat + combat beat + variety beat** in every session means no single mode dominates. A session that is all combat feels like a quiz with sword art. A session that is all reading feels like an LMS. A session that is all walking feels like nothing happened.
- **Tomorrow-hook** — every session should end with the player aware of *what they want to do next*. An NPC with a new quest, a locked door whose key the player just spotted, a mini-boss visible across a chasm. Without this, retention drops at the natural break point.
- **Checkpoint discipline** — saves should land *after* satisfying beats, not in the middle of them. Saving mid-combat feels broken. Saving after defeating a corrupted creature and walking back to camp feels earned.

**Failure handling at the session scale:** a player who spends 40 minutes failing the same encounter does not have a "challenge" — they have a broken session. Soft-failure mechanics (HP loss, retry, partial progress) need to be tuned so the *third* attempt at a challenge teaches something new about the concept, not just retests the same gap.

## 3. Stage-to-stage loop (hours per stage)

This is prompt2.md's structure, refined. A stage is a region tied to one Kubernetes concept. The arc:

```
1. Arrival         — story beat, "something is wrong here"
2. Exploration     — meet the region, meet its NPCs, see the wound
3. Discovery       — encounter knowledge objects that introduce the concept
4. Quests          — the concept is applied to a small problem someone has
5. Encounters      — the concept is tested against corrupted creatures
6. Mini-challenges — the concept is bent and recombined in new ways
7. Dungeon         — the concept's harder edges and depth
8. Boss            — mastery validation, multi-concept synthesis
9. Portal          — leave changed, with a story thread to the next region
```

**What's load-bearing about this order:**

- **Discovery before quests, quests before encounters.** The player learns a concept *before* the world demands they apply it. Demanding application before introduction is what turns a game into a quiz.
- **Mini-challenges before dungeon.** Variety before depth. Mini-challenges expose the player to forms of the concept they wouldn't see in straight combat — debugging scenarios, ordering, command completion, matching. The dungeon then escalates into harder versions of the forms the player has already met. No new mechanics surprise them in the dungeon — only harder versions of familiar ones.
- **Boss validates mastery, not memory.** Bosses combine concepts seen earlier in the stage. They should not introduce *new* facts the player hasn't met. Their job is to ask: "you saw all of this — can you use it together under pressure?"
- **Portal as ritual.** Crossing the portal is a one-way commitment. It marks "this concept is now part of you." This is also the natural session boundary for many players — the most likely place a player saves and stops.

### Concrete example — the Pods stage (running example)

To make the three scales tangible, here is a single stage threaded through all three loops:

**Arrival.** The player crosses into a village whose people are scattered, panicked. Buildings are collapsed. An elder explains: the Pod Bug has infected the village. (Story beat. Stage scale.)

**Exploration.** The player walks the village. Three NPCs are nearby — a guard at the gate, a child by a broken hut, a scribe near a glowing scroll. *Every screen has something worth approaching.* (Moment-to-moment exploration mode.)

**Discovery.** The player approaches the glowing scroll. A learning panel opens: "A Pod is the smallest deployable unit — a wrapper around one or more containers that share network and storage." The panel is one chunk. The player closes it. Two more scrolls are scattered across the region — each adds a chunk. (Moment-to-moment knowledge mode, repeated 3–4 times across the session.)

**Quest.** The child says her family's hut is broken because "the Pod won't stand up." Quest: restore the Pod by finding the right combination of components. The player explores, learns through interaction *what a Pod actually contains*. (Session-scale beat — variety. Combines exploration and knowledge.)

**Encounter.** Crossing back through the village, a Pod Bug appears. Combat triggers. Challenge: "Which of these is part of a Pod's spec? (a) image (b) namespace-color (c) emotion." Correct answer charges the sword. The player commits. The Pod Bug takes damage proportional to charge. (Moment-to-moment combat mode. Session-scale combat beat.)

**Mini-challenge.** The scribe in the marketplace gives the player a riddle: order these four steps that happen when a Pod starts. The player drags them into order. Reward: a small item that helps in the dungeon. (Variety beat. Same concept, different form.)

**Dungeon.** Beneath the village, a deeper warren — multiple Pod Bugs, environmental hazards tied to the concept (e.g., volumes that wash away if not mounted), hidden knowledge about Pod lifecycles. (Stage-scale escalation.)

**Boss.** The Corrupted Pod-Lord. Combines all of it: an MCQ for the shield, a command-completion for the sword, a debugging scenario for the special ability. Multi-phase fight. (Stage-scale mastery validation.)

**Portal.** The player crosses into the next region. The village, behind them, is slowly rebuilding. (Stage-scale closure + tomorrow-hook for next session.)

The same nine beats happen for Deployments, Services, ConfigMaps, Secrets, and so on — but with different villages, different bugs, different rituals. **The arc is constant; the surface changes.**

## 4. The "knowledge becomes gameplay" mechanism

The phrase is easy to say and easy to ignore. Concretely, it means:

| Where knowledge could "become gameplay" | What we will demand of it |
|---|---|
| Combat | Correct understanding of the concept changes how hard the player can hit. Not a quiz with a sword skin. |
| Exploration | Knowing what a concept *is* unlocks paths or objects (e.g., a sealed door labeled with a YAML fragment opens for players who recognize a valid Pod spec). |
| Quests | Quest *solutions* change based on the player's understanding, not just their inventory. |
| Boss design | Bosses combine concepts in ways memorization alone can't beat — mastery is required. |
| Dialogue | NPCs respond differently when the player has demonstrated understanding (visible knowledge tags, completed scrolls). |

If a system can't articulate which of these it leans on, it does not yet earn a place in the loop.

## 5. Failure & retry handling at each loop scale

| Scale | What failure feels like | What retry feels like |
|---|---|---|
| Moment-to-moment | Sword swing misses; HP nicked. | Next exchange, immediately. |
| Session | A quest stalls; player is stuck. | A hint appears, an NPC offers help, an alternate path opens. (Form of "hint escalation" still TBD — Tension 3.) |
| Stage | Boss kills the player. | Respawn at last save. Knowledge already gained is preserved. (Never re-do the learning, only re-do the test.) |

**Universal rule:** *failure never erases learning.* If a player has read a scroll, that scroll stays read. If a player has identified a Pod spec, that recognition is permanent. Death only resets state, never knowledge. This is what makes "experimentation safe."

## 6. Pacing rules (what the loop must avoid)

These are not aesthetic preferences — they are loop-breakers. If any of these is violated, the corresponding loop fails.

1. **No wall of text.** Knowledge panels are chunked. If a panel exceeds ~5 short lines, it splits into multiple panels.
2. **No empty screens.** Every visible region of the game has at least one thing worth approaching.
3. **No quizzing without context.** Challenges always trigger from a world event (an enemy, a door, an NPC). Never "click a button to begin the quiz."
4. **No rote repetition across stages.** The 9-beat structure repeats; the *content* of beats does not. (Repetition mitigation deferred — see follow-up slice.)
5. **No mid-beat saves.** Saving lands after exploration completes, after combat resolves, after dialogue closes. Never inside.
6. **No mandatory boss-rush retries.** A failed boss returns the player to the boss room with full HP, not to the dungeon entrance.
7. **No introduction of new concepts inside the boss fight.** Bosses combine; they do not teach.

## 7. Open questions / deferred to future slices

These are real questions this doc deliberately doesn't answer. Each becomes its own slice.

- **Repetition risk** — across 12–15 stages with the same 9-beat structure, what stops the game from feeling formulaic? *Belongs in: `weaknesses` and `repetition-risks` slices.*
- **Returning-expert handling** — if the player already knows Pods, what does Stage 1 feel like? Skip-out? Optional speedrun? Acknowledged-but-still-played? *(This is the still-open Tension 3.)*
- **Challenge format ratios** — when do we use MCQ vs. command-completion vs. ordering vs. debugging? *Belongs in: knowledge-system slice.*
- **Combat depth beyond charge thresholds** — what variety lives inside combat encounters so they don't all feel like "answer + swing"? *Belongs in: combat-recommendations slice.*
- **Dungeon design language** — what makes a dungeon feel like a dungeon, not just a longer encounter chain? *Belongs in: dungeon-recommendations slice.*
- **Session-end rituals** — what does the "save and log off" moment look like? *Belongs in: long-term-engagement slice.*
- **Theme-skin invariance** — does the loop survive identical when reskinned from Fantasy to Space? *Belongs in: theme-engine milestone (14).*

## 8. Cross-references

- [[ai-vision]] — what this loop must serve
- [[ai-knowledge-system]] — what fills the discovery and combat slots
- [[ai-quest-system]] — what fills the quest slot
- [[ai-enemy-system]] — what fills the encounter slot
- [[ai-boss-system]] — what fills the boss slot
- [[ai-progression]] — what carries across stages
- [[ai-campaign-structure]] — what carries across the campaign
- `00-game-discovery/ai-overview.md` — open tensions (Tension 1 and 2 resolved by this doc; Tension 3 remains open)
- `prompts/prompt2.md` — the v1 design proposal this doc refines
- `02-design-decisions/` — when this loop is officially locked, an ADR will be added there referencing this doc

## 9. Status & change log

- **v1 (current)** — refined from prompt2.md. Three-scale loop, Pods running example, 7 pacing rules, deferred questions enumerated. Two of three open tensions resolved.
- **Pending v2** — incorporate findings from upcoming slices: weaknesses, repetition risks, fun-factor improvements, combat/quest/dungeon/boss/engagement recommendations.
