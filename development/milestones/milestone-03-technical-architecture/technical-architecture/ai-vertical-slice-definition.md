# ForgeMinds — Vertical Slice Definition

> **Purpose:** Define the minimum playable version that proves ForgeMinds is fun and validates the core ForgeMinds hypotheses. This is the engineering brief for the vertical slice sprint.
> **Scope:** One stage, one developer, 2–4 weeks.
> **Cites:** `game-design/ai-vision.md` Pillars 1–4, Knowledge Doctrine §5, Target Emotions §3, Anti-Patterns §7.
> **Status:** v1 — ready to execute.

---

## 1. Slice Objective

The vertical slice must answer a single question: **does the ForgeMinds loop work?** That loop is: player encounters a broken world, discovers knowledge through play, wields that knowledge against enemies, defeats a boss by demonstrating comprehension, and feels something genuine at the end. Success means a first-time playtester — someone with no prior Kubernetes knowledge — can play the slice start to finish in one sitting (under 45 minutes), exit the slice able to explain what a Pod is in their own words, and report that they felt like they were on an adventure, not taking a class. The slice must expose whether knowledge-gated combat is satisfying or frustrating, whether the emotional anchor (an NPC the player cares about) makes the learning feel meaningful, and whether the "comprehension click" fires in the expected moments. Everything else is secondary to observing those three things under live playtest conditions.

---

## 2. Chosen Stage and Rationale

**The vertical slice uses Stage 2 — Podveil Village (Pods).**

Stage 1 (The Hollow Fields, Containers) was the alternative. The case for Stage 1 is real: Containers are the simpler concept, the world setup is minimal, and building Stage 1 first follows narrative order. The case against it is stronger on every dimension that matters for a vertical slice.

**Why Stage 2 wins over Stage 1:**

| Dimension | Stage 1 | Stage 2 |
|---|---|---|
| Emotional anchor | Two quest-giver NPCs (Bram, Fen). Functional but thin. | Mira — a child whose home is broken. This is the emotional hook that makes stakes personal. |
| Concept testability | "Container = isolated process." True but abstract. Hard to feel wrong. | "Pod = co-located containers sharing a home." Directly human-scale — a house, a family, two things that should be together. |
| Learning arc visibility | Container isolation is a static property. | Pod failure and recovery is a dynamic event the player can watch. |
| Boss mechanic richness | Hollow Sovereign tests one concept (isolation). | Pod Tyrant tests co-location rules, Pod spec boundaries, and container grouping — richer combat loop proof. |
| Campaign-critical NPC | Lyra only. No one with an ongoing arc is introduced. | Mira is introduced here and reappears in Stages 5, 10, and the Final epilogue. The slice introduces a load-bearing relationship. |
| Portal significance | Opens a path to a village obscured by fog. | Kestran appears for the first time. His silence is a characterisation beat. |

**What Stage 2 proves that Stage 1 cannot:**

Stage 1 proves the world is broken. Stage 2 proves the world is worth saving. The difference is Mira. A playtester who does not care about Mira after Stage 2 tells us the empathy system has failed — a finding that is worth having early. A playtester who does care has had the experience that ForgeMinds is designed to create.

**One concession:** Stage 2 assumes the player has arrived from Stage 1 and knows what a Container is. For the slice, this is handled with a brief hardcoded context panel at the entry point: "Containers are isolated running units. A Pod is a home for one or more containers." One sentence. This keeps Stage 2 self-contained for the playtester without building all of Stage 1.

---

## 3. The Minimum Beat Sequence

Stage 2 has a 9-beat arc. The slice does not require all 9 beats. Below is the minimum sequence that proves the ForgeMinds loop.

### Required beats

| Beat | Description | Why required |
|---|---|---|
| **Beat 1 — Arrival** | Player enters Podveil Village. Environmental storytelling: containers scattered, homes broken, village quiet. Lyra speaks. | Sets the world state. The player must feel the wound before they understand it. |
| **Beat 2 — Mira** | Player meets Mira. Her home is a Pod structure that stopped functioning. She is waiting. She does not explain what a Pod is — she just lives in one that is broken. | Introduces the emotional anchor. This beat is the entire empathy system on trial. |
| **Beat 3 — First knowledge discovery** | Player finds a knowledge scroll or NPC (Sera or Old Dorn) that introduces the Pod concept: "a home for containers that share network and storage." | First comprehension click target. |
| **Beat 4 — Combat encounter (Pod Bugs)** | Player fights Pod Bugs. Combat charges from correct Pod knowledge answers. | Proves the combat loop: does knowledge-gated combat feel like it makes sense in context? |
| **Beat 5 — Second knowledge discovery** | Player learns Pod failure and recovery: a Pod that fails is not catastrophic — it can restart; the home is not destroyed, just temporarily empty. | Second comprehension click. Proves the most important Kubernetes nuance (failure is designed for). |
| **Beat 6 — Pod Warrens dungeon** | Player enters the dungeon. Navigates by understanding which containers belong together. Fights Warren Knot (mini-boss). | Tests traversal gated by knowledge (Pillar 1) and dungeon pacing. |
| **Beat 7 — Pod Tyrant boss** | Player fights the Pod Tyrant. Boss mechanic tests co-location rules and Pod boundary knowledge across multiple phases. | The primary knowledge synthesis test. This is the main thing the slice exists to validate. |
| **Beat 8 — Resolution: Mira's home restored** | Mira's two-container Pod reconnects. A small, human-scale victory. | The payoff beat. If the player does not feel something here, the empathy system failed. |
| **Beat 9 — Portal: Kestran** | Kestran appears at the northern gate. Assesses the player. Says nothing. Opens the gate. | The tone-setting moment for his entire arc. Proves the world-remembers pillar at the NPC level. |

All 9 beats are required. The arc is short enough that cutting any beat weakens what the remaining beats prove.

### What can be compressed, not cut

- **Beat 3 and Beat 5** can each be delivered by a single NPC line and a single scroll panel rather than a full quest chain.
- **Beat 6 (Dungeon)** can be one room deep instead of three — minimum viable dungeon is one knowledge gate and the mini-boss.
- **Beat 8** can be a static visual change (Mira's home lights up) rather than an animated sequence.

---

## 4. Required Systems Table

Every system that must exist for the slice. Classified ruthlessly.

| System | Classification | Reason |
|---|---|---|
| **Beat sequencer** — triggers the 9 beats in order | Required | The entire arc collapses without ordered progression. This is the skeleton. |
| **Dialogue system** — NPC lines with at least pre-quest / post-quest states | Required | Pillar 2 (world remembers) requires NPCs to change after the player acts. Without this the world feels dead. |
| **Knowledge scroll reader** — displays a short text panel when a scroll is found | Required | Knowledge must be discovered through the world (Pillar 4). The scroll reader is the minimum delivery mechanism. |
| **Combat engine** — turn-based, HP, knowledge-gated charge mechanic | Required | This is the primary proof-of-concept. Combat that charges from correct answers is the core ForgeMinds hypothesis under test. |
| **Challenge renderer** — displays a knowledge challenge during combat and scores the answer | Required | Without this the combat loop is not knowledge-gated, which means the slice proves nothing about ForgeMinds. |
| **Enemy AI** — Pod Bugs, Orphan Shades, Warren Knot (mini-boss), Pod Tyrant (boss) | Required | Four enemy types to cover combat variety and the boss fight. Bare minimum to test the loop at scale. |
| **Boss phase system** — Pod Tyrant has multiple phases gated on knowledge challenges | Required | The boss is the primary knowledge synthesis moment. Multi-phase is required to test whether the player demonstrates comprehension or just guesses. |
| **Dungeon room system** — a sequence of rooms with one knowledge gate and a mini-boss | Required | Dungeon traversal gated by knowledge is Pillar 1. Without at least one knowledge gate in the dungeon, the slice does not prove exploration as a knowledge channel. |
| **NPC emotional anchor** — Mira has at minimum two states (home broken, home restored) | Required | The empathy hypothesis is only testable if Mira visibly changes. One image swap is enough. |
| **Scene transition** — move between village, dungeon, and boss room | Required | The player must be able to navigate to all 9 beats without breaking. |
| **Save state (session only)** — do not lose beat progress on refresh | Required | Pillar 3 (failure never erases). The player must not lose their knowledge discovery state mid-session. |
| **Player HP and death flow** — player can take damage and die; respawn at current beat entry | Required | Pillar 3 requires a death state that teaches, not punishes. Respawn at the start of the current fight, not the dungeon entrance. |
| **Knowledge state tracker** — records which scrolls the player has found; gates combat charges accordingly | Required | Knowledge charge in combat must reflect actual discovery. If a player who found no scrolls charges equally well as one who found all three, the system lies. |
| **Portal trigger** — Kestran beat fires after boss defeat | Required | The portal is the proof that the world moves forward in response to the player's demonstrated comprehension. |
| **Persistent volume / simple save** — beat progress survives a page close | Nice To Have | The slice can be played in one sitting. In-memory session state is sufficient for a 45-minute playtester. Add persistence in the next slice. |
| **Inventory / item system** | Cut For Later | No items exist in the slice. Adds scope with no hypothesis value. |
| **Player progression / levelling** | Cut For Later | One stage, one developer. Level-up math is a balance question, not a proof-of-concept question. |
| **Audio system** | Cut For Later | Silence or placeholder audio does not invalidate the comprehension click. Sound design is an emotion amplifier, not an emotion creator. Build it when the emotions are already firing. |
| **Animated cutscenes** | Cut For Later | Beat 8 (Mira's home restored) can be a static image change. Animation polish costs time that should go to interaction quality. |
| **Multiple save slots** | Cut For Later | One playtester, one session. |
| **Settings / accessibility options** | Cut For Later | Not a proof-of-concept concern. Add before public playtesting. |
| **Theme engine (Fantasy / Space swap)** | Cut For Later | The slice proves the loop. Theme switching is a platform feature for Milestone 14. |
| **Stage 1 / Stage 3 content** | Cut For Later | The slice is self-contained. Adjacent stages are not under test. |

---

## 5. Required Content

### NPCs

| NPC | Classification | Reason |
|---|---|---|
| **Mira** — two dialogue states (home broken, home restored); one question she asks the player | Required | The emotional anchor. Without her the empathy hypothesis is untestable. |
| **Lyra** — two dialogue states (arrival, post-boss); her "wrong about Pods" moment must fire once | Required | The primary knowledge guide. Her being-wrong moment is the first proof that the world has intellectual honesty — learning corrects even the guide. |
| **Sera (Village Keeper)** — one quest-giver beat, post-quest thank-you line | Required | She is the practical knowledge trigger. Beat 3 can fire through her. |
| **Old Dorn (Pod-Builder)** — one analogy-based Pod explanation | Nice To Have | Enriches the second knowledge discovery (Beat 5). His analogy form is good for retention but Sera can cover his function if time is short. |
| **Kestran** — one beat at the portal (silently opens the gate) | Required | Portal beat. His silence is the characterisation. One image + one line (or no line) is sufficient. |

### Kubernetes Concept

| Concept | Classification | Reason |
|---|---|---|
| **What a Pod is** — smallest deployable unit, wrapper for co-located containers sharing network and storage | Required | The stage's entire learning goal. If the player exits not knowing this, Stage 2 failed regardless of fun. |
| **Why co-location matters** — containers in the same Pod share a network interface and can communicate via localhost | Required | The "comprehension click" moment. This is the nuance that separates understanding from memorisation. |
| **Pod failure and recovery** — a Pod dying does not mean the application is destroyed; it can be restarted | Required | This is the most important Kubernetes concept to feel before Deployments: failure is designed for, not catastrophic. |
| **What a Pod spec contains** — containers list, shared volumes reference, resource requests | Nice To Have | Useful depth for the boss fight but the core loop works without it. Introduce via one scroll if time allows. |
| **Container dying vs. Pod dying distinction** | Nice To Have | Conceptually important but can be deferred to Stage 3 without breaking Stage 2's learning goals. |

### Enemies

| Enemy | Classification | Reason |
|---|---|---|
| **Pod Bugs** — fight in Beat 4; test co-location knowledge; 2–3 question types | Required | The slice's first combat encounter. Must prove the knowledge-charge mechanic with Pod-specific questions. |
| **Orphan Shades** — one or two in the dungeon; non-hostile until approached | Required | Needed to make the dungeon feel like a Pod-themed space and to test a second combat variant (panicked, defensive). One encounter is enough. |
| **Warren Knot (mini-boss)** — Beat 6; a tangle of Orphan Shades merged; tests Pod boundary knowledge | Required | The dungeon needs a knowledge synthesis test before the boss. This is the minimum dungeon climax. |
| **Pod Tyrant (boss)** — Beat 7; multi-phase; absorbs wrongly-answered containers; tests all Stage 2 Pod knowledge | Required | The primary synthesis test. The boss fight is the main thing being proved. |

### Boss

| Boss mechanic component | Classification | Reason |
|---|---|---|
| **Phase 1** — boss absorbs a container; player must correctly answer a Pod co-location question to prevent HP increase | Required | Proves the "wrong answer costs you" mechanic without being punishing. |
| **Phase 2** — boss exposes a bloated Pod spec; player identifies which container does not belong | Required | Deeper knowledge test. Tests whether the player understands Pod boundaries, not just Pod definition. |
| **Phase 3** — boss at low HP; player delivers final answer correctly to trigger the "Pod dissolves gracefully" animation | Nice To Have | The graceful failure animation is emotionally satisfying but not required to test the combat loop. A standard defeat sequence is acceptable. |
| **Fail state** — player loses a phase challenge; boss heals slightly; player gets a hint on retry | Required | Pillar 3. Failure must teach. The hint on second attempt is the minimum teaching mechanism. |

### UI Elements

| UI element | Classification | Reason |
|---|---|---|
| **Combat HUD** — player HP bar, enemy HP bar, knowledge charge meter | Required | The player must be able to see the charge mechanic. Without the charge meter the mechanic is invisible. |
| **Challenge panel** — displays question and 3–4 answer options during combat; shows correct/incorrect feedback | Required | This is how the knowledge-gated combat communicates. Must exist and must not look like a quiz app (image treatment, framing matter). |
| **Scroll reader panel** — knowledge scroll overlay with ~3 short lines of text | Required | Knowledge delivery mechanism. Must feel like finding a scroll in a world, not opening a textbook. |
| **Dialogue box** — NPC name, portrait placeholder, 1–2 lines of dialogue, advance button | Required | The emotional anchor system requires Mira's dialogue to render correctly. |
| **Beat progress indicator** — subtle (could be visual state of the village, not a progress bar) | Nice To Have | A progress bar violates Anti-Pattern 7.2 (LMS UI). Visual world state (village gets slightly brighter after each beat) is better. Can be implied by scene state rather than explicit UI. |
| **Boss phase indicator** — visual signal that the boss has entered a new phase | Required | Without this the player cannot tell whether their knowledge answer changed the fight. |
| **Death / retry screen** — player can retry from start of current fight with hint visible | Required | Pillar 3 minimum. |
| **Mini-map or room indicator** | Cut For Later | One-room dungeon does not need navigation UI. |
| **Settings menu** | Cut For Later | Not required for playtesting. |
| **Main menu / title screen** | Nice To Have | A placeholder is fine. The slice starts at Beat 1. Polish the title screen later. |

---

## 6. Hardcoded vs. Reusable

The slice will be built faster and cleaner if it is honest about what is throwaway scaffolding versus what must be reusable from day one. The distinction is: if other stages will use this system, build it right. If only Stage 2 uses it, hardcode it now and refactor later.

### Hardcoded for speed

| Item | What is hardcoded | Why it can wait |
|---|---|---|
| **Beat sequence** | The 9-beat order for Stage 2 is a hardcoded array | Other stages will need a data-driven beat engine, but Stage 2 alone does not prove the engine needs to be generic |
| **Stage 2 context panel** | "Containers are isolated running units. A Pod is a home for one or more containers." — one hardcoded text string at stage entry | Stage 1 will replace this with a real stage-transition system; for the slice it is two sentences of text |
| **NPC dialogue strings** | All Mira, Lyra, Sera, Kestran dialogue is hardcoded in a JSON or TS constant | NPC scripting format will be designed in Milestone 04; for the slice it can be an array of strings keyed to beat index |
| **Knowledge questions** | Pod Bug questions, Warren Knot questions, Pod Tyrant questions are hardcoded objects | The Knowledge Question database design belongs to a later milestone |
| **Dungeon layout** | One fixed room order (entry, knowledge gate, Warren Knot room) | Procedural or configurable dungeon layout is not a slice concern |
| **Portal trigger condition** | "Boss defeated = gate opens" is a hardcoded boolean | Campaign graph traversal is a system for later; one conditional is sufficient |
| **Mira's state change** | A boolean `mirasHomeRestored` that swaps one image | The full NPC state system comes later; the emotional beat only needs one image swap |

### Designed to be reusable from day one

| Item | Why it must be reusable | Design implication |
|---|---|---|
| **Combat engine** — HP, charge mechanic, turn flow | Every stage uses combat. Getting the data model wrong now means refactoring 14 times. | Model: `CombatState`, `EnemyDefinition`, `ChargeResult`. No stage-specific logic inside the engine. |
| **Challenge renderer** — question display, answer selection, feedback | Every knowledge challenge in the game uses this component. If it looks like a quiz here, it will look like a quiz everywhere. | Build the treatment carefully. This component's aesthetic is the most important UI decision in the slice. |
| **Knowledge state tracker** — which scrolls the player has found | Scroll discovery gates combat charges and (in later stages) dialogue branches. The schema must be extensible. | Model: `{ scrollId: string, discovered: boolean }[]`. Stage-agnostic. |
| **Scroll reader panel** — the UX of finding a scroll | This is the primary knowledge delivery moment across 14 stages. Its feel sets the tone for the entire game. | Build it once, well. The scroll open animation, text layout, and close interaction must feel diegetic, not like a popup. |
| **Dialogue box** — NPC portrait, name, text, advance | Dialogue appears in every stage. Any NPC-specific logic baked into the component becomes a maintenance problem. | Stateless component. Receives `{ npcName, portrait, lines[] }`. No NPC logic inside it. |
| **Save state schema** — beat progress, scroll discovery, HP | If the save schema is wrong, every subsequent stage that touches it needs a migration. Define it cleanly for Stage 2 even if only Stage 2 uses it. | Document the schema. Make the fields generic (`stageId`, `beatIndex`, `knowledgeState`), not Stage 2-specific. |

---

## 7. Mock Strategy

The slice uses placeholder content aggressively. Every mock is a deliberate choice — it reduces build time without compromising what is under test.

| Asset / content | Mock approach | What it does NOT mock |
|---|---|---|
| **Character art** | Coloured rectangle with name label (Mira = small cyan rectangle; Lyra = tall purple rectangle). No portraits in Beat 1. | The dialogue content itself. Mira's words must be final-quality even if her art is a rectangle. |
| **Enemy sprites** | Simple geometric shapes with a colour code (Pod Bugs = red hexagons; Orphan Shades = grey ovals). | Enemy behaviour, knowledge question set, and HP values. These must be real. |
| **Boss sprite** | One large shape that changes colour by phase (Phase 1 = orange, Phase 2 = red). | The phase transition logic, the challenge questions, and the fail-state hint. These must work. |
| **Village environment** | Flat-coloured tile regions (house = grey square; path = beige rectangle). | The beat trigger zones. The player must be able to navigate to all 9 beats. |
| **Dungeon rooms** | Single-colour backgrounds with a text label ("Knowledge Gate Room", "Warren Knot Chamber"). | The knowledge gate logic. The gate must require a correct answer to pass. |
| **Mira's home restored** | One CSS class swap (grey → warm yellow) on Mira's home rectangle. | The state change trigger. The swap must fire exactly when Beat 8 fires, not before. |
| **Knowledge scrolls** | Styled text panels (parchment-coloured background, serif font). No illustration. | The text content. Scroll text must be accurate, concise (max 4 lines), and written to the game's voice. |
| **Sound / music** | Silence, or a single looping placeholder track for combat. | Nothing. Audio does not affect the hypotheses under test. |
| **Portal animation** | Kestran's rectangle slides aside. No animation. | Kestran's dialogue line and the transition to "Stage 3 — Coming Soon" screen. |
| **Number of questions per enemy** | Pod Bugs: 3 unique questions. Warren Knot: 4. Pod Tyrant: 5 (across phases). | Question quality. Every question must have one definitively correct answer and 2–3 plausible-but-wrong distractors. No trick questions. No trivia. Every question tests understanding, not memorisation. |

---

## 8. What This Slice Proves

The slice is designed to validate six specific ForgeMinds hypotheses. Each is observable during a playtest session.

**Hypothesis 1 — The knowledge-charge mechanic is satisfying, not frustrating.**
The combat loop charges abilities based on correct answers. The slice tests whether this feels like competence (Emotion 3.3) or like a quiz interrupting a fight. If players report the charge moment as satisfying, the mechanic works. If they report it as annoying or arbitrary, the design needs revision before more content is built.

**Hypothesis 2 — The comprehension click fires at the Pod concept.**
Pod co-location — two containers sharing a home — is a human-scale concept designed for the comprehension click. The slice tests whether a first-time player exits understanding what a Pod is, in their own words, unprompted. If they cannot explain it after Stage 2, the knowledge delivery pipeline has failed and must be revised before Stage 3 is built.

**Hypothesis 3 — Empathy for Mira is achievable in one stage.**
Mira is introduced in Beat 2 and her home is restored in Beat 8. The slice tests whether a 45-minute session is enough to make a player care about that outcome. If the playtester describes Mira's restoration as meaningful, the emotional anchor design works. If they describe it as a game event with no emotional weight, the NPC design must change before the recurring cast strategy holds.

**Hypothesis 4 — Failure teaches, does not punish (Pillar 3).**
Every wrong answer in combat and at the boss costs HP and triggers a hint on the next attempt. The slice tests whether playtesters who lose fights report learning something from the loss, or whether they report frustration and wanting to quit. If no playtester who loses a fight reports comprehension improvement, the hint system is insufficient.

**Hypothesis 5 — The boss fight works as a knowledge synthesis moment.**
The Pod Tyrant is the first multi-phase boss in the game. The slice tests whether a boss that requires Pod knowledge across all phases feels like a culminating test of understanding rather than a repeat of the same question type. If playtesters describe the boss fight as "the same thing three times," the phase design is wrong. If they describe it as "showing everything came together," it works.

**Hypothesis 6 — The world is legible as an adventure, not a lesson (Pillar 4).**
The screenshot test (Knowledge Doctrine §5.3): does a screenshot of the slice look like a game or a quiz app? The slice tests whether the challenge panel, the scroll reader, and the combat HUD pass this test under real play conditions. If playtesters describe any moment as "feeling like a quiz," that moment is redesigned before it spreads to 14 stages.

---

## 9. What This Slice Does NOT Prove

Honest accounting of what remains unvalidated after the slice.

**It does not prove the campaign arc works.** The emotional payoff of Mira's return in Stage 5 and her appearance in the Final epilogue cannot be tested with Stage 2 alone. The recurring cast strategy is unproven at campaign scale.

**It does not prove cross-concept synthesis.** The Isolation Wyrm (Act 1 boss) is the first test of whether players can apply multiple concepts simultaneously. Stage 2 teaches one concept. The slice proves single-concept depth, not multi-concept breadth.

**It does not prove the Knowledge State scales.** The slice has three scrolls and ~12 unique questions. Whether the knowledge tracking system holds at the scale of 14 stages and hundreds of questions is untested.

**It does not prove the dungeon format is fun at full depth.** The slice uses a one-room dungeon. Whether a multi-room dungeon with multiple knowledge gate types holds player attention is a Stage 3+ question.

**It does not prove the pacing works at the act scale.** Act 1 pacing depends on all four stages landing in sequence. The slice proves Stage 2 in isolation. Whether the transition from Containers (Stage 1) to Pods (Stage 2) to Deployments (Stage 3) creates a coherent learning curve is untested.

**It does not prove the expert player experience.** A player who already knows Kubernetes has not been tested. How the slice reads to someone who already understands Pods — whether it is delightful recognition or tedious repetition — is a secondary-audience question for a later playtest.

**It does not prove art direction or sound.** The slice uses placeholder art throughout. Visual and audio quality affect Emotion 3.2 (Wonder) significantly. The slice specifically defers wonder at the aesthetic level.

**It does not prove multiplayer, progression, or persistence.** All three are explicitly out of scope for v1 per `ai-vision.md` §8.

---

## 10. Success Criteria

The playtest is a "yes" if all of the following are observable. Each is specific and does not require the playtester to be asked leading questions.

**Comprehension (primary pass/fail):**
- A playtester who entered with no Kubernetes knowledge can explain what a Pod is — in their own words, without prompting — within 5 minutes of finishing the slice.
- A playtester can name at least one thing that happens when a Pod fails and why that is not a disaster.

**Emotion:**
- At least two out of three playtesters mention Mira by name or describe her home restoration as a positive moment without being asked.
- No playtester describes any moment in the slice as "feeling like a quiz" or "feeling like a class."
- At least one playtester continues past an enemy death instead of stopping. (They retried. The fail-state did not punish them into quitting.)

**Mechanics:**
- The knowledge charge meter rises visibly after a correct answer and is described as satisfying by at least two out of three playtesters.
- The Pod Tyrant boss fight is described by at least one playtester as feeling different from the regular combat — "harder," "more like it was testing me," or equivalent.

**Pacing:**
- A first-time playtester completes the full 9-beat sequence in under 60 minutes without walkthrough assistance.
- No playtester reports being stuck for more than 2 minutes without knowing what to do next.

**The screenshot test:**
- A screenshot of the challenge panel shown to a neutral observer is described as a "game moment" rather than a "quiz question." This test is applied to the challenge renderer specifically and applied cold — no game context given to the observer.

---

## Final Answer

**What is the minimum game that proves the ForgeMinds vision?**

A single playable stage — Podveil Village, Stage 2 — in which a player with no Kubernetes knowledge meets Mira, discovers what a Pod is through scrolls and NPC dialogue, fights Pod Bugs using knowledge-charged abilities, clears a one-room dungeon, defeats the Pod Tyrant in a multi-phase boss fight that requires demonstrating Pod comprehension across three question types, watches Mira's home reconnect, and sees Kestran open the northern gate. That experience, completable in under 60 minutes with placeholder art throughout, is sufficient to determine whether the ForgeMinds loop — knowledge as gameplay, adventure as the delivery mechanism, empathy as the motivator, comprehension as the win condition — actually works under real playtest conditions. Nothing else needs to be built first.
