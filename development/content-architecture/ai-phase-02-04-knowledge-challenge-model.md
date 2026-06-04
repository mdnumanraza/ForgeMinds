# ForgeMinds — Knowledge + Challenge Model

> **Phase:** 2.4 — Knowledge + Challenge Model
> **Purpose:** Define the conceptual architecture for how technical concepts are discovered, understood, tested, and tracked — the learning core of ForgeMinds.
> **Status:** v1 — conceptual only. No schemas, no storage, no implementation.
> **Owned by:** AI
> **Depends on:** `ai-phase-02-01-content-hierarchy.md`, `ai-phase-02-03-quest-npc-castmember-model.md`
> **Cites:** `ai-vision.md §5, §7.1, §7.3, §7.4, §4 Pillar 3`, `ai-gameplay-loop.md §1b/§1c`

---

## Guiding principle

Knowledge is not a number. Knowledge is not a score. Knowledge is the substrate that powers gameplay verbs.

Every entity in this phase exists to make that principle concrete: discoverable (KnowledgeBeat), expressed (KnowledgePanel), tested (Challenge), tracked (ConceptMastery), and connected to the world (worldEventContext).

---

## MODEL 1 — Concept

### Why it exists

A Concept is the platform-level definition of a technical idea the player can discover and demonstrate. It is the atom around which all knowledge content orbits. KnowledgeBeats introduce it. Challenges test it. ConceptMastery tracks the player's relationship to it. Quest resolution conditions check it. NPC dialogue branches on it.

Without the Concept as a first-class entity, knowledge content is scattered strings. With it, any piece of content can declare what it is about — and any gameplay system can ask "does the player understand this?" and receive a real answer.

### What a Concept is responsible for

- Declaring its **identifier** — unique, stable, platform-level ID (e.g., `concept:kubernetes:pod`)
- Declaring its **domain** — which technical domain it belongs to (kubernetes, linux, docker, etc.)
- Declaring its **prerequisite concepts** — which Concepts must be encountered before this one can be meaningfully introduced (e.g., `concept:kubernetes:container` is a prerequisite for `concept:kubernetes:pod`)
- Providing a **canonical summary** — a brief, theme-neutral definition used by the engine for validation and tooling (not shown to players directly)
- Declaring its **mastery dimensions** — the three states a player can achieve relative to this Concept (see ConceptMastery §4)

### What a Concept does NOT contain

- **KnowledgePanel content** — the actual text, analogies, examples, and commands shown to the player live in KnowledgePanel (L3), not in Concept. Concept is the *anchor*; KnowledgePanel is the *delivery*.
- **Theme-specific text** — Concept is always theme-neutral. "A Pod groups containers" is true in Fantasy Kingdom and Space Galaxy. The themed framing ("magical summons group their bound spirits") lives in KnowledgePanel.
- **Challenge questions** — Concepts do not own challenges directly; under the pool model (D-CA-06), challenges *reference* a Concept. Even under the embedded model, challenge text is not in the Concept.
- **Campaign-specific lore** — how the Kubernetes Kingdom story frames Pods is campaign content, not platform content.

### Concept lifecycle

```
DRAFT → PUBLISHED → DEPRECATED
```

- **DRAFT:** Concept is being defined; not yet available for campaign use
- **PUBLISHED:** Concept is available; campaigns can reference it
- **DEPRECATED:** Concept has been superseded or removed from active use. Cannot be deprecated while any campaign references it.

**Rule C-1:** Concept IDs are permanent once published. They are never renamed or reused. If a concept needs significant revision, a new Concept is created and the old one is deprecated.

**Rule C-2:** Concept prerequisite declarations create an ordering constraint. A Stage that introduces Concept B must appear after a Stage that introduced Concept A, if A is a prerequisite of B.

### Reuse

Concepts are the most reusable entities in ForgeMinds. `concept:kubernetes:pod` is referenced by:
- Kubernetes Kingdom Stage 2 (primary concept)
- Any future campaign that also touches Kubernetes
- All challenges, knowledge beats, and mastery conditions related to Pods — across all campaigns

---

## MODEL 2 — KnowledgeBeat

### Why it exists

A KnowledgeBeat is the moment the player discovers something. It is a discrete, world-triggered event — not a lesson, not a screen, not a pause. The player walks past a glowing scroll. They talk to an NPC who reveals something. They solve a dungeon puzzle that shows them a truth. The KnowledgeBeat is the content object that makes those moments exist and tracks that they happened.

Without KnowledgeBeats as explicit content objects, knowledge delivery would be implicit — scattered in stage descriptions with no way to track density, no way to validate prerequisites, and no way for the engine to update ConceptMastery.

### What a KnowledgeBeat is responsible for

- Declaring which **Concept** it introduces (reference to platform L0)
- Declaring its **delivery type** — how the player encounters this beat
- Declaring its **gameplay channel** — which of the 5 channels this beat belongs to (exploration, combat, quest, boss, dialogue) — per `ai-vision.md §5.2`
- Holding its **KnowledgePanel** — the content shown when the beat is triggered
- Declaring its **trigger** — the world event that causes this beat to fire (player interacts with scroll, NPC dialogue reaches a state, dungeon puzzle solved, quest step completed)
- Recording its **completion state** — whether the player has triggered it (feeds into ConceptMastery ENCOUNTERED dimension)

### Delivery types

| Type | Description | Example |
|---|---|---|
| `SCROLL` | Physical object in the world the player interacts with | Ancient scroll in the Hollow Fields |
| `NPC_DIALOGUE` | NPC speech that reveals a concept | Old Dorn explaining what a healthy Pod looks like |
| `DUNGEON_REVEAL` | Environmental/puzzle solution that reveals understanding | Seeing how Volume mount paths work by navigating the dungeon |
| `QUEST_REWARD` | Understanding revealed upon completing a quest step | Restoring the Pod reveals how co-location works |
| `ENVIRONMENTAL` | Passive world detail that conveys the concept | Observing the mill running backwards before Hadris explains why |

### What a KnowledgeBeat does NOT own

- The Concept definition — it references it
- Challenge questions — challenges are a separate type (see §5)
- Quest structure — a KnowledgeBeat may be triggered by a quest step, but the Quest owns the step; the KnowledgeBeat is a side effect of that step

### Theme rules

KnowledgeBeat's trigger description and world-object name are theme-variant ("ancient scroll" vs "data tablet"). The Concept reference and the KnowledgePanel's technical content are invariant.

### Lifecycle

Bound to Stage lifecycle. A KnowledgeBeat is authored when its Stage is authored, published when the Campaign publishes, and retired when the Campaign retires.

**Rule KB-1:** Once a KnowledgeBeat is completed by the player, the ENCOUNTERED dimension of the corresponding ConceptMastery is set. This is permanent — it cannot be unset by death, stage exit, or any gameplay event.

**Rule KB-2:** A Stage must have at least one KnowledgeBeat for its primary Concept. The validation pass enforces this.

---

## MODEL 3 — KnowledgePanel

### Why it exists

A KnowledgePanel is the content the player reads when a KnowledgeBeat fires. It is the delivery vehicle for the concept — shaped like a piece of the world, not like a textbook.

### What a KnowledgePanel contains

| Field | Description | Theme-variant? |
|---|---|---|
| `title` | The heading shown on the panel | Yes — "The Pod Scroll" vs "Habitat Module Data Tablet" |
| `body` | The core explanation — maximum ~5 short lines | Partially — framing is theme-variant; technical definition is not |
| `analogy` | Optional — a real-world comparison to make the concept concrete | Yes — analogy language adapts to theme |
| `example` | Optional — a specific, observable instance of the concept | No — technical examples are invariant |
| `command` | Optional — a command-line or declarative example | No — commands are invariant |
| `practicalNote` | Optional — a "watch out for this" note | No — practical implications are invariant |

### The 5-line rule (Anti-Pattern 7.3)

A KnowledgePanel body must not exceed approximately 5 short lines of text. This is an architectural constraint, not a style suggestion.

**Rule KP-1:** If a concept requires more than ~5 lines to explain at its current stage of introduction, it must be split across multiple KnowledgeBeats. One beat, one chunk. The player reads it, closes it, continues the adventure.

**Rule KP-2:** A KnowledgePanel body explains enough to make the player ready for the quests and encounters ahead. It is not comprehensive documentation. Depth comes through multiple beats, quests, and dungeon reveals — not through longer panels.

### Theme rules

The panel's title, body framing, and analogy are theme-variant. The technical content — the definition itself, any commands, the example — is invariant. A themed KnowledgePanel patches only its presentational fields; the factual core is the same in every theme.

---

## MODEL 4 — ConceptMastery

### What it is

ConceptMastery is the player's relationship to a Concept — a runtime record of what they have done with it, not a score of how well they did it.

It is NOT a stat. It has no numeric value. It cannot be raised or lowered. It is a set of boolean dimensions — each one either achieved or not.

### The three dimensions

| Dimension | Achieved when | Can be unset? |
|---|---|---|
| `ENCOUNTERED` | Player triggers any KnowledgeBeat for this Concept | Never |
| `DEMONSTRATED` | Player answers a Challenge for this Concept correctly at least once | Never |
| `APPLIED` | Player completes a Quest whose ResolutionCondition references this Concept as a mastery check | Never |

**Rule CM-1 (write-once):** Once a dimension is achieved, it is permanent. Death does not unset it. Stage exit does not unset it. A player who has ENCOUNTERED Pods has encountered Pods, forever, within this campaign.

**Rule CM-2 (no reset):** There is no game mechanic that resets ConceptMastery. Not difficulty settings, not new game plus, not any boss mechanic. The player's knowledge is theirs.

**Rule CM-3 (no stat):** No part of the model produces a numeric value from ConceptMastery. There is no "mastery score." There is no "80% mastered." Either a dimension is achieved or it is not.

### How ConceptMastery is queried

ConceptMastery is the most queried entity in the runtime system. Anything that responds to the player's understanding must be able to ask it.

Query patterns:
- **Dialogue branch:** "if player.conceptMastery('concept:kubernetes:pod').ENCOUNTERED → show dialogue state X"
- **Traversal gate:** "if player.conceptMastery('concept:kubernetes:deployment').DEMONSTRATED → unlock door"
- **Quest resolution:** "if player.conceptMastery('concept:kubernetes:configmap').APPLIED → quest resolves with branch A"
- **Boss phase transition:** "if player.conceptMastery('concept:kubernetes:service').DEMONSTRATED → phase 4 is available"

The query interface is always: "for this player, for this Concept, is dimension D achieved?" — returning true or false.

### Can mastery be gained without a Challenge?

Yes. ENCOUNTERED is gained through a KnowledgeBeat (no challenge required). DEMONSTRATED requires a Challenge. APPLIED requires a Quest completion with a mastery-check condition. A player can be ENCOUNTERED without being DEMONSTRATED or APPLIED — this is a valid and important state. It means "they have read it; they haven't proven it yet."

### ConceptMastery on death

**Rule CM-4:** Death resets position and HP only. All three dimensions of all ConceptMastery records are preserved exactly as they were before death. (Pillar 3: failure teaches, never punishes.)

---

## MODEL 5 — Challenge

### Why it exists

A Challenge is the moment the player must act on what they know. It is not the learning moment (that is KnowledgeBeat). It is the test — framed as a world event, never as an abstract prompt.

### The worldEventContext requirement

**Rule CH-1:** Every Challenge must have a `worldEventContext` field declaring the in-world event that triggered it. This field is required. A Challenge without a worldEventContext cannot be published.

This is the architectural enforcement of Anti-Pattern 7.1 ("no quizzing without context") and Pillar 4 ("adventure first"). The worldEventContext is not flavour text — it is the world event that gives the challenge its narrative reason to exist.

Examples:
- `worldEventContext: "Pod Bug encountered while crossing the village path"`
- `worldEventContext: "Shield activation during Stage 13 boss Phase 2 attack"`
- `worldEventContext: "Dungeon gate sealed by an RBAC rule requiring a specific permission set"`

### The 7 challenge types

| Type | Description | Example |
|---|---|---|
| `MCQ` | Multiple choice — one correct answer, 2–4 distractors. | "Which of these is part of a Pod's spec? (a) image (b) namespace-color (c) emotion" |
| `CommandCompletion` | Player completes a partial command or declaration. | "Complete this kubectl command: `kubectl ___ deployment nginx`" |
| `CodeRecognition` | Player identifies valid vs invalid code/config. | "Which of these YAML fragments defines a valid Pod?" |
| `Scenario` | Player chooses the correct action given a described situation. | "A Deployment has 3 replicas and 1 Pod has just failed. What happens next?" |
| `Debugging` | Player identifies the error in a broken configuration. | "This ConfigMap is causing the mill to run backwards. What is wrong?" |
| `Matching` | Player matches items across two lists. | "Match each Kubernetes object to its purpose." |
| `Ordering` | Player arranges steps in the correct sequence. | "Put these Pod lifecycle events in order." |

### Challenge fields (all types)

| Field | Description | Theme-variant? |
|---|---|---|
| `type` | One of the 7 types above | No |
| `conceptRef` | Reference to the Concept being tested | No |
| `difficulty` | Tier: INTRODUCTORY / INTERMEDIATE / ADVANCED | No |
| `worldEventContext` | The in-world event that triggered this challenge (required) | Yes — framing adapts to theme |
| `prompt` | The question or task presented to the player | Partially — framing is theme-variant; the technical substance is not |
| `correctAnswer` | The single correct answer (or correct ordering/matching) | No — invariant |
| `distractors` | For MCQ/Matching — the incorrect options | Partially — labels adapt to theme |
| `hintText` | Optional — shown after wrong answer to teach | Partially — framing adapts |
| `gameplayChannel` | Which channel this challenge belongs to (combat/exploration/quest/boss/dialogue) | No |

**Rule CH-2:** The correct answer is always theme-invariant. A themed Challenge patches its worldEventContext, prompt framing, and distractor labels. It never changes what the correct answer is.

---

## MODEL 6 — The Challenge Pool Decision (D-CA-06)

This is the most consequential unresolved decision in Phase 2.4. It determines where Challenges live in the ownership hierarchy. All three options are structurally sound; the choice depends on authoring workflow preferences and engine flexibility requirements.

### Option A — Embedded (Challenge owned by its user)

```
Enemy
└── Challenge[ ]  ← owned directly

BossPhase
└── Challenge[ ]  ← owned directly

MiniChallenge
└── Challenge    ← owned directly
```

**Ownership:** Challenge is L3 or L4, owned by whichever entity uses it.

**Authoring:** Author defines challenges inline when authoring the enemy or boss phase. Simple, self-contained.

**Reuse:** None. If Stage 2 and Stage 8 both test Pods via MCQ, they are two separate Challenge objects with similar content.

**Engine lookup:** Trivial — challenge is in the entity. No pool query needed.

**Tradeoff:** Simplest model. Highest content duplication. Adding new challenge types for a concept requires editing each entity that teaches that concept.

---

### Option B — Concept Pool (Challenge owned by Concept)

```
Concept (L0)
└── ChallengePool
    └── Challenge[ ]  ← all challenges for this concept, across all difficulties and types

Enemy → concept reference → engine draws challenge from Concept's pool (filtered by difficulty, type)
BossPhase → concept reference[ ] → engine draws from matching pools
```

**Ownership:** Challenge is L0-adjacent — owned by Concept at platform level. Shared across all campaigns that reference the Concept.

**Authoring:** Challenge authors work in the Concept's pool, not inside stage content. Stage content declares which concept to test and at what difficulty; the pool supplies the challenge.

**Reuse:** High — a MCQ challenge for Pods can be used by Stage 2 enemies, Stage 7 dungeon gates, and future campaign encounters without duplication.

**Engine lookup:** Moderate — engine must filter pool by difficulty and type at runtime (or at content load time).

**Tradeoff:** Most reusable. Platform-level pool grows with the platform. Risk: challenges authored for one campaign's framing may feel out of place in another campaign (though worldEventContext is always overridden per entity).

---

### Option C — Campaign Pool (Challenge owned by Campaign)

```
Campaign (L1)
└── ChallengePool
    └── Challenge[ ]  ← tagged: conceptRef, difficulty, type, stageRange

Stage enemy → filter campaign pool by conceptRef + difficulty
BossPhase → filter by conceptRef[ ] + difficulty + phase
```

**Ownership:** Challenge is L1, owned by the Campaign.

**Authoring:** Campaign authors maintain one pool file. All enemies and bosses reference the pool via tags. Stage content declares what it needs; the pool is curated campaign-wide.

**Reuse:** Within campaign — high. Across campaigns — none (each campaign maintains its own pool).

**Engine lookup:** Similar to Option B — engine filters at load or runtime.

**Tradeoff:** Campaign-scoped flexibility. Allows campaign authors to curate exactly which challenges appear and in what contexts, without committing to platform-level permanence. Middle path between A and C in terms of reuse and complexity.

---

### Recommendation for Phase 2.8

**Option B (Concept Pool) is recommended** if the platform intends to grow concept coverage over time and reuse challenges across future campaigns. It aligns most cleanly with the platform architecture and eliminates content duplication.

**Option C (Campaign Pool) is recommended** if campaign authors want full control over which challenges appear and how they are tuned per campaign, with no concern for cross-campaign reuse.

**Option A** is acceptable only for a v1 prototype where authoring simplicity outweighs reuse. It should not be the long-term model.

The decision requires human input in Phase 2.8.

---

## MODEL 7 — KnowledgeBeat vs Challenge: Same or Different?

**Resolution: Separate types.**

| | KnowledgeBeat | Challenge |
|---|---|---|
| **Player mode** | Knowledge-discovery mode (`ai-gameplay-loop.md §1b`) — passive reception | Combat/test mode (`ai-gameplay-loop.md §1c`) — active response |
| **Player agency** | None required — the player reads/listens | Required — the player must answer correctly |
| **Consequence** | ENCOUNTERED mastery dimension set; no HP risk | DEMONSTRATED mastery dimension set (on success); HP risk on failure |
| **Ownership** | Stage (L2) | Pending D-CA-06: L0, L1, or L3 |
| **Content** | KnowledgePanel — explanation, analogy, example | Prompt, correct answer, distractors, hint |
| **World trigger** | Required (player interacts with world object/NPC) | Required (worldEventContext) |

Both reference a Concept. Both require a world-event trigger. But they are fundamentally different interactions — one delivers, one tests. Merging them into a single type would require conditional fields (this Challenge is actually a KnowledgeBeat when there is no correct answer...) which is worse than two clean types.

**Rule KBC-1:** A KnowledgeBeat is never a Challenge. A Challenge is never a KnowledgeBeat. Content authors never confuse the two: one teaches, one tests.

---

## OWNERSHIP MATRIX (Phase 2.4 additions)

| Entity | Owned by | Level |
|---|---|---|
| Concept | Platform | L0 |
| ChallengePool (Option B) | Concept | L0 |
| ChallengePool (Option C) | Campaign | L1 |
| KnowledgeBeat | Stage | L2 |
| KnowledgePanel | KnowledgeBeat | L3 |
| Challenge (Option A) | Enemy / BossPhase / MiniChallenge | L3–L4 |
| Challenge (Option B) | Concept via ChallengePool | L0 |
| Challenge (Option C) | Campaign via ChallengePool | L1 |
| ConceptMastery | Player runtime state (not static content) | Runtime |

---

## DEPENDENCY MATRIX (Phase 2.4)

| Entity | Depends on (references) |
|---|---|
| KnowledgeBeat | Concept (L0) |
| KnowledgePanel | KnowledgeBeat (owns it), Concept (for theme-invariant content) |
| Challenge | Concept (L0 — what concept is being tested) |
| ConceptMastery | Concept (L0 — which concept this mastery is for), Player state |
| Quest ResolutionCondition | ConceptMastery (queries APPLIED dimension) |
| DialogueState (knowledge-gated) | ConceptMastery (queries ENCOUNTERED or DEMONSTRATED) |
| Traversal gate / Portal condition | ConceptMastery (queries DEMONSTRATED) |
| Boss (concept requirements) | Concept[ ] (L0) |

---

## LIFECYCLE MATRIX (Phase 2.4)

| Entity | Lifecycle |
|---|---|
| Concept | DRAFT → PUBLISHED → DEPRECATED; permanent once published |
| KnowledgeBeat | Bound to Stage lifecycle; completion state is player-runtime, never reset |
| KnowledgePanel | Bound to KnowledgeBeat lifecycle |
| Challenge | Depends on D-CA-06; under Option B: bound to Concept lifecycle; under A/C: bound to owner lifecycle |
| ConceptMastery (per dimension) | Write-once append-only; dimension achieved → permanent |

---

## REUSE RULES (Phase 2.4)

| Entity | Reuse rule |
|---|---|
| Concept | Fully reusable across all campaigns and all content |
| KnowledgeBeat | NOT reusable. Each stage introduces a concept in its own world context. |
| KnowledgePanel | NOT reusable. Specific to its KnowledgeBeat's delivery moment. |
| Challenge | Depends on D-CA-06. Option B: fully reusable within same Concept. Option A: not reusable. |
| ConceptMastery | Not a content entity — player runtime state only |

---

## VALIDATION RULES (Phase 2.4)

- [ ] Every KnowledgeBeat references a valid Concept (platform L0)
- [ ] Every KnowledgeBeat has at least one KnowledgePanel
- [ ] Every KnowledgePanel body text is within the ~5-line limit
- [ ] Every KnowledgePanel has theme-variant fields for every Theme the Campaign supports
- [ ] Every Challenge has a non-empty `worldEventContext` field
- [ ] Every Challenge references a valid Concept (L0)
- [ ] Every Challenge has exactly one `correctAnswer`
- [ ] No Challenge has subjective or free-text correct answers (Anti-Pattern 7.5)
- [ ] A Stage's Boss may only reference Concepts that have KnowledgeBeats earlier in the same Stage or prior Stages in the Act
- [ ] ConceptMastery dimensions are validated at runtime — the content model defines the dimensions; the engine enforces write-once

---

## UNRESOLVED DECISIONS FOR PHASE 2.8

| ID | Decision | Impact | Human input needed? |
|---|---|---|---|
| D-CA-06 | Challenge pool architecture (Option A / B / C) | Determines ownership level of Challenge; affects all content that uses challenges | **Yes** |
| — | Minimum difficulty tiers for challenges | How many tiers (INTRODUCTORY / INTERMEDIATE / ADVANCED) — can a stage use all three? Who defines the distribution? | No (recommend: campaign-level configuration) |
| — | ChallengePool seeding for new Concepts | Who authors the initial challenge pool when a new Concept is added to the platform? | No (recommend: AI-authored, human-reviewed) |

---

## Cross-references

- `milestones/milestone-02-content-architecture/ai-phase-plan.md` — Phases 2.5 and 2.6 run in parallel with this phase
- `content-architecture/ai-phase-02-01-content-hierarchy.md` — Concept established as L0; Challenge pool options map to L0/L1/L3
- `game-design/ai-vision.md §5` — Knowledge Doctrine is the origin of all constraints in this phase
- `game-design/ai-gameplay-loop.md §1b/§1c` — the mode distinction that separates KnowledgeBeat from Challenge
- `DECISIONS.md` — D-CA-06 to be recorded once Phase 2.8 resolves it
