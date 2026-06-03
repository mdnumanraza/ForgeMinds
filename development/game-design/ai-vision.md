# ForgeMinds — Game Vision

> **Status:** v1 — load-bearing. The highest-priority design document in this project.
> **Owned by:** AI (drafted) · Human (sign-off pending — see `00-game-discovery/you-vision-review.md`)
> **Scope:** ForgeMinds the platform. Kubernetes Kingdom is the first instance.
> **Last revised:** Phase 1.1 of Milestone 01 — Game Discovery.

> **How to use this document.** Every design decision downstream of this one must cite which section(s) of this document it serves — or explain why this document needs to change first. If a proposed feature contradicts a Pillar (§4), the Knowledge Doctrine (§5), or an Anti-Pattern (§7), the feature loses by default. Contradictions never sneak through silently. **Do not override this document without a version bump and a change-log entry.**

---

## 1. Executive Vision Statement

ForgeMinds is a story-driven RPG where the player is summoned into a wounded kingdom and saves it by *learning to understand it*. The kingdom's wounds are the gaps in collective knowledge of a real technical domain — knowledge that was once known, has been lost or corrupted, and must be rediscovered. The player is not chosen because they are already special. They are summoned because they are *willing to learn*: to explore, to ask questions, to gather scattered knowledge, and to wield what they discover against the forces that have corrupted the kingdom. The act of learning IS the act of becoming the hero.

The first kingdom is Kubernetes. Future kingdoms — Linux, Docker, and those not yet imagined — will follow the same shape with different domains. What makes ForgeMinds a platform rather than a single game is that this shape holds regardless of the domain: a world broken by the loss of technical knowledge, a player who grows by recovering it, and a final reckoning that validates their understanding.

This paragraph exists so that nine months from now, when someone proposes a feature that quietly turns ForgeMinds into a quiz with a fantasy theme, it can be read aloud and the proposal can lose.

---

## 2. The Player Fantasy

**The player is summoned — not because they are already the hero, but because they are willing to become one.**

The kingdom did not call for someone with mastery. It called for someone with *capacity*: the ability to learn, to discover, to improve. The player begins knowing nothing. Their power is not pre-existing. It is found in scrolls, earned through quests, proven against enemies, and validated against bosses. The player who reaches the dragon at the end of Kubernetes Kingdom is not the same player who crossed the first threshold — and the difference is measured entirely in what they now understand.

The fantasy, felt at three scales:

- **In a single moment** — the player interacts with a knowledge scroll, something clicks, and the world quietly shifts around them. A door weakens. An NPC's dialogue changes. A new path is visible. The world responds to what the player now knows.
- **In a single session** — the player walks back through a region they entered an hour ago and *sees it differently*. The broken systems they passed without understanding are now legible. The NPCs they dismissed now have context. The kingdom becomes more knowable the more they learn.
- **At the campaign scale** — when the player stands before the dragon, they are not stronger because they levelled up. They are stronger because they understand the kingdom now — its systems, its structure, its logic — and the dragon does not. That understanding is the weapon.

### What the player fantasy is NOT

- **Not a chosen-mastery fantasy.** The player is not born with special power or pre-selected because they are already exceptional. They are called because they showed up willing. Any system that gates progress on "being smart" rather than "being willing to learn" violates this fantasy.
- **Not a saviour-from-above fantasy.** The kingdom has its own people, its own history, its own partially-preserved wisdom. The player rediscovers alongside those people; they do not descend from outside to rescue the helpless.
- **Not a power-accumulation fantasy.** The satisfaction is not "I have more stuff." It is "I understand more now." A player who finishes a stage rich in gold but fuzzy on the concept has not had the fantasy — they have had a different game.

### Audience

| Tier | Who | What this fantasy must deliver |
|---|---|---|
| **Primary** | Engineers and learners new to (or shaky on) the domain. | The comprehension click (§3.1) at every major beat. They leave able to explain Pods, Deployments, Services in their own words. |
| **Secondary** | Engineers who already know the domain and play for pleasure, recognition, or narrative. | Recognition and delight. Familiar concepts appearing in fiction form. Depth in dungeons and mini-challenges beyond what the surface teaches. (How exactly — see Tension 3, §9.) |
| **Out of scope** | Players who want a pure RPG with no learning, OR pure learners who want no game. | We do not try to serve them. They are correctly served by other products. |

---

## 3. Target Emotions

Five emotions, in priority order. Each is **testable** — a playtester either felt it at the expected moment, or they did not. If we cannot observe an emotion during playtesting, the design has failed for that emotion.

### 3.1 — The Comprehension Click *(primary)*

**"Oh. *That's* how it works."**

This is the emotion ForgeMinds exists to deliver. It fires when an abstract technical concept resolves — in the player's mind — into something they could explain to a friend. Not "I memorised the answer." Not "I picked the right option." But: *I now understand why this is true.*

- **Where it lands:** the moment after a knowledge panel closes; the moment a quest solution clicks because the player understood the underlying concept; the moment a boss's multi-phase pattern becomes legible because the player recognises what is happening.
- **How we test it:** after completing a stage, a playtester can explain the concept that stage taught — unprompted, in their own words. Recall is not the test. Comprehension is.
- **Failure mode:** the player completes a stage and cannot say what they learned. The click did not happen. The stage failed regardless of other metrics.

### 3.2 — Wonder

**"This place is mine to explore."**

The kingdom is sad and broken, but it is also dense, rewarding, and alive. Every screen offers something worth approaching. Nothing is filler. Wonder is what keeps a session running twenty minutes past when the player meant to stop — not because they are being pushed by a reward loop, but because they are genuinely curious what is around the next corner.

- **Where it lands:** seeing a region for the first time; finding a hidden scroll nobody told them about; an NPC saying something unexpected; a piece of environmental storytelling that pre-dates the player's arrival.
- **Failure mode:** a playtester, mid-session, says "I don't know what to do" or "there's nothing here." Wonder has collapsed before whatever came next.

### 3.3 — Competence

**"I made this work — and I made it work because I understood it."**

Competence is the steady rhythm of the loop. It is the smaller, repeated satisfaction of a knowledge-powered ability charging fully, of a quest solution clicking into place, of recognising a YAML fragment under pressure. It is not triumph — triumph is rarer and larger. Competence is the drumbeat: *I'm getting it.*

- **Where it lands:** 2/2 charged abilities in combat; completing a quest through understanding rather than guessing; getting through a dungeon encounter cleanly.
- **Failure mode:** competence consistently feels like luck ("I picked the right one") rather than understanding ("I knew why that was right"). When this happens, the design has silently decoupled the emotion from learning.

### 3.4 — Empathy

**"These people deserve to be saved."**

The dragon's attack is not backdrop. It has consequences the player can see: a house collapsed, a child without a parent, a guard who has been holding the gate alone for weeks. NPCs are not quest dispensers. They are characters with specific, small griefs — and the player should care about them as individuals before they care about winning the campaign.

- **Where it lands:** NPC dialogue that evolves before and after the player's intervention; environmental storytelling (a half-finished repair, a note left on a broken terminal); the NPC who is still there when the player returns to a stage they already completed.
- **Failure mode:** NPCs feel interchangeable. The kingdom feels like a quest-generation machine. The dragon's defeat feels like a level-up rather than a homecoming.

### 3.5 — Triumph *(earned, not gifted)*

**"I beat the dragon — because I understood the kingdom."**

Triumph is the campaign-scale payoff. It should feel rare and weighty. It happens at boss defeats, dungeon completions, and the final reckoning. Crucially: it must be earned by the four prior emotions, not granted by them. A triumph that arrives without comprehension, wonder, competence, and empathy preceding it is hollow — and hollow triumph is the sign of a game that succeeded mechanically but failed as ForgeMinds.

- **Where it lands:** boss defeat; the post-final epilogue showing the kingdom changed by what the player learned and did.
- **Failure mode:** triumph arrives but the player cannot articulate what they understand now that they did not before. The campaign ended. ForgeMinds did not.

### What we are NOT designing for

- **Frustration as motivation.** This is not Dark Souls. Failure must teach, not punish.
- **Dread or horror.** The tone is "fairy tale at dusk," not "gothic at midnight." The kingdom is wounded, not haunted.
- **Power-accumulation greed.** Loot lust is not a target emotion. Equipment serves fantasy and combat texture — it is not the point.
- **Competitiveness.** There is no leaderboard, no "faster than your friend," no shame in learning slowly.

---

## 4. Design Pillars

Four pillars. Each one **cuts** — it rejects something. Short enough to be repeated by anyone working on this project.

### Pillar 1 — Knowledge is the verb

Every gameplay verb in ForgeMinds resolves to: *the player knows something and acts on that knowledge.*

- **Includes:** combat that charges from understanding; traversal gated by recognition (a sealed door that opens when the player demonstrates they know a valid Pod spec); quests that branch on what the player has learned; dialogue that opens new threads as comprehension grows.
- **Excludes:** combat decoupled from knowledge ("press X to attack" with no comprehension gate); fetch quests that require carrying items but no understanding; padding encounters whose only function is occupying a region.
- **Decision it forces:** a proposed encounter where the player wins by reflex alone is redesigned to require knowledge, or it is cut.

### Pillar 2 — The world remembers

The kingdom is a living place. It responds to the player's actions and their growth.

- **Includes:** NPCs whose dialogue evolves across quest states; regions that visibly begin to heal as the player progresses; environmental storytelling that predates the player; consequences that persist.
- **Excludes:** static "thank you, hero" dialogue that never changes; regions that look identical before and after the player saves them; NPCs with no memory of the player's prior interaction.
- **Decision it forces:** the NPC content schema must support at minimum a pre-quest, mid-quest, and post-quest dialogue state — and ideally state-aware lines beyond that.

### Pillar 3 — Failure teaches, never punishes

The cost of being wrong is *information*, never *erasure*.

- **Includes:** soft-failure combat (HP loss, retry-friendly, no insta-kill on wrong answers); knowledge state preserved across death; hint escalation when a player is stuck; respawn at the boss room, not the dungeon entrance, after a boss wipe.
- **Excludes:** perma-loss of scroll progress on death; "wrong answer — restart from the beginning" gates; punishing time-walls between attempts.
- **Decision it forces:** the save and respawn rules must never delete completed knowledge or discovery state. Dying resets position and HP. It never resets understanding.

### Pillar 4 — Adventure first, lesson second

The player must always feel like they are on an adventure. Learning happens *because of* the adventure, not *despite* it.

- **Includes:** knowledge delivered through diegetic objects and events (scrolls, NPCs, encounters, environments) — never through a "lesson menu"; challenges framed as world events, not test prompts; every knowledge beat with a story reason.
- **Excludes:** dedicated "study mode" UI; "click here to begin the lesson" buttons; menus that interrupt exploration to deliver content.
- **Decision it forces:** if a knowledge moment cannot be triggered by a world event, it does not appear. There is no abstract lesson screen.

> **Note on Pillars 1 and 4.** They look similar but cut in different directions. Pillar 1 is about *what gameplay does* — it resolves to knowledge. Pillar 4 is about *how the player experiences it* — as adventure, never as study. A feature can satisfy one and violate the other. A "lessons menu" with knowledge-gated buttons satisfies Pillar 1 but violates Pillar 4. Both must hold simultaneously.

---

## 5. The Knowledge-Becomes-Gameplay Doctrine

**The defining principle of ForgeMinds. If this principle weakens, ForgeMinds becomes another product.**

### 5.1 Knowledge is acquired, not assumed

The player begins with nothing. Every piece of knowledge in the game must be *discoverable through play* — through scrolls, NPCs, dungeons, quest rewards, and enemy encounters. The game never assumes prior knowledge and never punishes its absence. A player who arrives knowing Kubernetes deeply will encounter familiar concepts in new forms; a player who has never seen a YAML file will discover what one means through the world itself.

Knowledge rarity lives in the kingdom — it has been lost, scattered, corrupted. The player's power is the capacity to find it, understand it, and wield it. That capacity is not rare. The knowledge is.

### 5.2 Every system answers: "what does knowledge do here?"

Five channels through which knowledge becomes gameplay. Every system must account for at least one. A system that accounts for none is a candidate for cutting.

| Channel | What "knowledge does" looks like |
|---|---|
| **Combat** | Correct understanding charges abilities. Depth of comprehension shapes damage, shield strength, and spell power. A player who guesses wins less than a player who understands. |
| **Exploration** | Recognition of valid technical artifacts unlocks traversal. A sealed door labeled with a YAML fragment opens for the player who recognises what it is. A path activates when the player demonstrates understanding of its underlying concept. |
| **Quests** | Quest solutions branch on the player's understanding, not their inventory. The same quest ends differently for a player who understood vs. one who guessed through. |
| **Bosses** | Mastery validation. Bosses combine multiple concepts from the stage and require synthesis. Memorisation alone cannot beat them. |
| **Dialogue** | NPC conversations open new branches as the player's demonstrated knowledge grows. The world is more talkative to the player who understands more. |

### 5.3 The recognisability test

> *If a screenshot of the game could be mistaken for a quiz app, the doctrine has been violated. If it looks like a moment from an RPG that happens to require understanding, the doctrine is intact.*

This test is intentionally severe. It applies to combat screens, knowledge panels, mini-challenges, and dungeon puzzles equally. Every system must pass it before it ships.

> **Canon note.** This section is the canonical home of the Knowledge Doctrine. `ai-gameplay-loop.md` §4 covers the same principle from the loop's perspective and is a *derived* statement. If they disagree, this document wins.

---

## 6. Success Criteria

What "ForgeMinds is working" means. Three tiers. No business KPIs — those belong elsewhere.

### Tier A — The vision held *(did we build what we said we would?)*

- [ ] Every design doc downstream of this one cites at least one Pillar, the Knowledge Doctrine, or an Anti-Pattern. Documents that cannot are flagged for review.
- [ ] No screenshot of a live ForgeMinds session can be mistaken for a quiz app. Test this: show screenshots to a stranger, ask "game or study tool?" The answer must be "game."
- [ ] When a feature is proposed that violates §7, it is rejected or this document changes first. The number of caught intrusions is non-zero — meaning this doc is being *used*, not filed away.

### Tier B — The vision worked *(did the player feel what we designed for?)*

- [ ] **Comprehension click is observable.** Playtesters explain the concept a stage taught — unprompted, in their own words, after the session. This is the primary pass/fail criterion.
- [ ] **Wonder is observable.** Playtesters spend more time in a region than the critical-path quests require. They explored. They missed their planned stop time.
- [ ] **Competence is observable.** Playtesters describe successful encounters as "I figured it out" — not "I got lucky."
- [ ] **Empathy is observable.** Playtesters refer to NPCs by name. They notice when something has changed. They have feelings about the kingdom's state.
- [ ] **Triumph lands at the right moments, not routine ones.** If playtesters report triumph at every encounter, the curve is flat. Triumph should spike at boss completions and the finale.

### Tier C — The vision lasted *(does it survive expansion?)*

- [ ] The same four Pillars hold without revision when Linux Kingdom and Docker Kingdom enter design. If they require revision, that is a platform-level event requiring a major version bump.
- [ ] The Knowledge Doctrine §5 works across domains. A future kingdom whose subject resists the doctrine signals the edge of the platform's reach — and a prompt to either expand the doctrine deliberately or decline that kingdom.
- [ ] A Kubernetes Kingdom stage played in Fantasy theme and in Space theme produces the same emotional beats at the same moments. If themes produce different feels for identical content, the Theme Engine has failed.

---

## 7. Anti-Patterns

What ForgeMinds will not become. Capped at 8. Each is a load-bearing exclusion: removing one opens a door we deliberately closed.

### 7.1 — Quiz-with-a-skin

*What it is:* multiple-choice questions as the core challenge surface, with RPG art layered on top.
*Why it harms us:* violates the Knowledge Doctrine §5.3 (screenshot test) and Pillar 4. The player learns to read the game as a quiz.
*Decision it blocks:* "Just put a clean MCQ screen for combat — players will adapt." Rejected.

### 7.2 — LMS UI patterns

*What it is:* lesson menus, "modules completed" progress bars, "study mode" dashboards, course-structured navigation.
*Why it harms us:* trains the player to categorise ForgeMinds as a learning tool with a story wrapper — precisely what we are not.
*Decision it blocks:* a "Lessons" tab in the main navigation. Rejected.

### 7.3 — Walls of text

*What it is:* knowledge panels longer than ~5 short lines; NPC dialogue that runs three or more paragraphs before the player can act.
*Why it harms us:* breaks the moment-to-moment exploration loop (pacing rule #1 in `ai-gameplay-loop.md`). Shifts the medium from game to article mid-session.
*Decision it blocks:* dumping full documentation text into a scroll. Rejected — chunks only.

### 7.4 — Knowledge as a side stat

*What it is:* a discrete "Knowledge" or "K-points" stat tracked alongside HP and gold, where raw gameplay is decoupled from actual understanding.
*Why it harms us:* violates Knowledge Doctrine §5.1. Reduces understanding to a number that can be ground rather than earned.
*Decision it blocks:* equipment that boosts a "knowledge stat." Rejected. Knowledge is not a number to farm.

### 7.5 — Subjective challenges

*What it is:* essay answers, free-form text inputs, "describe in your own words" prompts as deterministic challenge mechanics.
*Why it harms us:* cannot be evaluated without subjectivity or AI grading; risks frustration; drifts toward LMS aesthetics.
*Decision it blocks:* "let the player type their own kubectl command and have AI grade it" at v1. Rejected — deterministic forms only for now.

### 7.6 — Failure as erasure

*What it is:* death or wrong answers that roll back completed knowledge, undo scroll progress, or require restarting content the player already understood.
*Why it harms us:* violates Pillar 3. Punishes experimentation. The player learns to be afraid of trying — the exact opposite of what ForgeMinds needs.
*Decision it blocks:* a "hardcore mode" that removes discovered scrolls on death. Rejected at platform level.

### 7.7 — Gameplay-narrative disconnect

*What it is:* story cutscenes that pause for combat with no narrative stake; combat with no story consequence; quests whose narrative explanation is "this is a tutorial."
*Why it harms us:* violates Pillar 4. Trains the player to skim story because the gameplay does not honour it. Kills empathy (§3.4).
*Decision it blocks:* "Skip intro" buttons that skip story-critical setup. Rejected — tighten the scene, do not bypass it.

### 7.8 — Cross-game progression

*What it is:* levels, gold, equipment, or unlocks that carry from Kubernetes Kingdom into Linux Kingdom or any future kingdom.
*Why it harms us:* each kingdom must stand alone as a self-contained beginning, middle, and end. Cross-game progression turns ForgeMinds into a metagame and dilutes per-kingdom narrative arc.
*Decision it blocks:* an account-wide level system shared across games. Rejected. Progression is scoped to the active kingdom.

> **Cap discipline.** New anti-patterns are only added by demoting a weaker existing entry or by version-bumping this document with explicit justification. Eight is the load.

---

## 8. Boundaries — what this document does NOT decide

Readers should know what they are free to decide elsewhere without contradicting the vision.

- **Engine, render pipeline, language, framework** — Milestone 02 (Architecture Discovery).
- **Specific gameplay mechanics: combat math, charge thresholds, HP values, damage formulas, balance numbers** — combat and balance documents downstream of Milestone 03.
- **Specific challenge formats and ratios** (MCQ vs. command-completion vs. ordering vs. debugging percentages) — Knowledge System doc.
- **Stage-by-stage content and narrative beats beyond the dragon framing** — `ai-campaign-structure.md` and Milestone 04 (Content Architecture).
- **Visual art style, palette, sound direction** — Milestone 05 (Asset Strategy) and per-theme docs.
- **Theme implementation mechanics** — Milestone 14 (Theme Engine).
- **Monetisation, pricing, distribution** — out of scope for v1 entirely.
- **Multiplayer, social features, leaderboards** — out of scope for v1 entirely.
- **Marketing positioning** — out of scope for this document.

If a downstream document decides any of the above in a way that contradicts §1–§7 of this document, **this document wins by default.** The downstream document must change, or a formal revision to this document must precede the decision.

---

## 9. Open Tensions

Unresolved decisions that will affect multiple systems. Each is logged here and tracked in `00-game-discovery/ai-overview.md`. Resolved formally in Milestone 03 (Design Decisions).

### Tension 1 — Knowledge-as-mechanic vs. knowledge-as-narrative

**Status: ✅ Resolved.** Knowledge is the mechanic. Per Pillar 1 and Knowledge Doctrine §5 — knowledge powers gameplay verbs. Resolved by `prompts/prompt2.md`, confirmed by this document.

### Tension 2 — Mastery detection without quiz aesthetics

**Status: ⚠️ Form locked, feel still open.** Challenge forms are deterministic (MCQ, command completion, ordering, debugging, code recognition, scenario, matching — no essays, no subjectivity). The *feel* — passing the §5.3 screenshot test consistently across 15 stages — is a live design challenge. Addressed in upcoming weaknesses, repetition-risks, fun-factor, and combat-recommendations slices.

### Tension 3 — Returning-expert vs. under-prepared player

**Status: 🟡 Open.** The corrected Player Fantasy (§2 — capacity-to-learn, not chosen mastery) makes this less sharp than it first appeared: a returning K8s expert is just a learner who starts with a head start, not a contradiction in terms. The fantasy does not break; it compresses. Candidate stances (optional speedrun, graceful skip, recognised-but-still-played, hint escalation for stuck players) are enumerated and chosen in Milestone 03. Sharpened in Milestone 01 Phase 1.6.

> When new tensions emerge, they are added here first, then logged to `00-game-discovery/ai-overview.md`.

---

## 10. How to use this document

Three rules, kept short deliberately.

1. **Cite, or change first.** Every design document downstream of this one cites which Pillar(s), Doctrine commitment(s), or Anti-Pattern(s) it serves. If it cannot cite, it either does not belong, or this document needs to expand — in which case this document changes first, with a version bump and a change-log entry.
2. **Contradictions lose by default.** A proposed feature or system that contradicts §4, §5, or §7 loses unless this document is deliberately revised first. Contradictions never pass silently.
3. **Re-read before major decisions.** Before any new milestone opens, before any system design begins, before any architectural choice is finalised — read this document end to end. Twenty minutes here saves a week of drift downstream.

---

## 11. Cross-references

- `prompts/prompt1.md` — master planning prompt that scoped this project.
- `prompts/prompt2.md` — gameplay vision proposal that resolved Tensions 1 and 2.
- `game-design/ai-gameplay-loop.md` — the three-scale loop. Derived from this doc; if they disagree, this doc wins.
- `roadmap/ai-master-roadmap.md` — the 15-milestone plan.
- `04-milestones/milestone-01-game-discovery/ai-overview.md` — the milestone that produced this doc.
- `04-milestones/milestone-01-game-discovery/ai-phase-01-vision.md` — the milestone artifact for this phase.
- `00-game-discovery/ai-overview.md` — the open tensions log.
- `00-game-discovery/you-vision-review.md` — human review and sign-off (pending).

---

## 12. Status & change log

| Version | Summary |
|---|---|
| **v1** | First canonical version. Promoted from preliminary stub during Phase 1.1 of Milestone 01. Locks: Vision Statement (§1), Player Fantasy (§2 — summoned learner, capacity-not-mastery, knowledge rarity is environmental), Target Emotions (§3 — five named, comprehension click as primary), Design Pillars (§4 — four), Knowledge Doctrine (§5 — three commitments, recognisability test), Success Criteria (§6 — three tiers), Anti-Patterns (§7 — eight, capped). Tensions: 1 resolved · 2 form-locked · 3 open. |

---

> **Pending sign-off.** v1 awaits human review. Sign-off captured in `00-game-discovery/you-vision-review.md`.
