# ForgeMinds — Enemy + Boss Model

> **Phase:** 2.5 — Enemy + Boss Model
> **Purpose:** Define the conceptual model for enemies, encounter triggers, mini-challenges, dungeons, mini-bosses, stage bosses, and act bosses — before any schema or storage decisions. This model covers how corrupted creatures, their triggers, and all combat encounters are represented as content.
> **Status:** v1 — conceptual only. No schemas, no storage format, no implementation details.
> **Owned by:** AI
> **Depends on:** `ai-phase-02-01-content-hierarchy.md` (Phase 2.1), `ai-phase-02-02-campaign-act-stage-model.md` (Phase 2.2)
> **Cites:** `ai-campaign-structure.md` (all enemy/boss designs), `ai-gameplay-loop.md §3` (9-beat arc), `ai-vision.md §5` (Knowledge Doctrine), `ai-phase-plan.md §Phase 2.5`

---

## Guiding principle

Every enemy and every boss is a K8s concept expressed as a world wound. The creature is not a mechanical obstacle — it is the failure mode of a concept, made visible in the world. Defeating it is not killing a monster — it is demonstrating that the concept is understood.

This means: enemy design and boss design are content problems, not gameplay balance problems. The engine handles combat mechanics. Content defines what the fight means. This model defines how that meaning is encoded structurally.

---

## MODEL 1 — Enemy

### Why it exists

An Enemy is a corrupted creature that inhabits a stage and represents a specific failure mode of that stage's primary concept. When the player encounters an enemy, they are encountering the concept-gone-wrong — the thing that happens to the world when the concept is not understood, not applied, or actively violated.

Shell Beetles hollow out container structures — they are misconfigured containers. Pod Bugs sever the shared network between co-located containers — they are broken Pod groupings. Mandate Breakers tear up Deployment scrolls — they are deleted Deployment specs.

Every enemy must be traceable to a concept failure. An enemy with no concept linkage is not a valid ForgeMinds enemy — it is decoration.

### What an Enemy is responsible for

- Declaring its **primary concept** (the concept whose failure mode it embodies)
- Declaring its **failure mode description** (the specific way the concept is broken — misconfiguration, deletion, exposure, corruption, version drift, etc.)
- Owning its **EncounterTrigger** (the world condition that causes this enemy to appear — see Model 2)
- Declaring its **challenge pool relationship** (the challenges used to engage with this enemy in combat — see §Challenge Pool Dependency)
- Declaring its **difficulty tier** (beginner / intermediate / advanced — relative to the stage, not absolute)
- Carrying its **theme surface** (name, visual description, world context flavour text — all theme-variant, all invariant at the concept level)
- Declaring its **encounter context** (where in the stage it appears: exploration zone, dungeon approach, dungeon interior)
- Declaring whether it is a **dungeon enemy** (appears only inside the dungeon) or an **open-world enemy** (appears in the stage's exploration zone)

### What an Enemy explicitly does NOT own

- The Concept itself (Concept is platform-level, L0)
- The Stage (Enemy is owned by Stage, not the other way around)
- Challenge question content (whether embedded or drawn from a pool — see §Challenge Pool Dependency)
- A Boss reference (bosses and enemies are separate model types, even when a boss represents a related concept)

### Invariant core fields

These fields must be identical regardless of which theme is active:

- Primary concept reference (which L0 Concept this enemy represents)
- Failure mode description (the specific breakdown the enemy embodies)
- Difficulty tier
- Challenge pool reference / embedded challenge list (per D-CA-06 resolution)
- Encounter trigger type
- Encounter context (exploration vs. dungeon)
- Combat resolution type (damage-based; enemies always resolve by HP reaching zero — only mini-bosses and bosses may have alternative resolution conditions)

### Theme surface fields

These fields are overridable per theme. They must have a complete base (theme-neutral) version:

- Enemy name
- Enemy visual description (creature type, visual archetype, size)
- World context flavour text (the in-world narrative explanation of what this creature is)
- Environmental context description (what the corrupted environment looks like when this enemy is present)
- Audio tag (combat music / creature sound variant)

### Lifecycle

Enemy instances are strictly stage-scoped. An Enemy is created when a Stage is authored. It cannot exist outside its Stage. It is destroyed when its Stage is removed from the campaign.

Enemy *types* (the conceptual archetype: "a creature that severs Pod networking") can inspire similar creatures in other stages, but they do not transfer — each stage's enemy is a separate content object, authored fresh for that stage's narrative context.

### Invariants

- An Enemy must reference exactly one primary Concept (L0).
- The referenced Concept must appear in at least one KnowledgeBeat within the same Stage.
- An Enemy must have an EncounterTrigger (encounters are never abstract or click-initiated).
- An Enemy's difficulty tier must be appropriate for the Stage's player level range.
- A Stage must have at least one Enemy that references the Stage's primary Concept.
- Theme surface fields require a complete base (theme-neutral) version before any ThemeOverride can be applied.

---

## MODEL 2 — EncounterTrigger

### Why it exists

The EncounterTrigger is the world condition that causes an enemy to appear and engage the player. It is always a world event — never an abstract action like "click to begin combat" (Anti-Pattern 7.1). The encounter must feel like something happening in the world, not like a menu selection.

An EncounterTrigger defines: what the player observes or does in the world, and what that observation or action causes to happen. The trigger is owned by the Enemy — each enemy instance has exactly one EncounterTrigger.

### Trigger types

There are five trigger types. Every enemy encounter must use exactly one of these types.

**TriggerType: PROXIMITY**
The player moves into a world zone where the creature inhabits. The encounter begins when the player enters the creature's territory. This is the most common trigger type for open-world enemies.
- Example: Walking into the portion of the Hollow Fields where Shell Beetles have hollowed container structures. The encounter begins when the player steps into the corrupted zone.
- Invariant core: zone identifier, radius or boundary definition.
- Theme surface: zone name, description of what the corruption looks like.

**TriggerType: WORLD_EVENT_INTERACTION**
The player interacts with a corrupted world object — a broken scroll, a malfunctioning system, a sealed gate with wrong credentials. The interaction exposes the enemy or triggers its response.
- Example: A player attempts to read a configuration scroll and finds it corrupted. The Parameter Leech that has been feeding on it responds to the disturbance.
- Invariant core: world object type, interaction type (read / activate / repair / approach), enemy response description.
- Theme surface: world object name and appearance, interaction narrative text.

**TriggerType: QUEST_INVESTIGATION**
The player is following a quest step that leads them into an enemy's domain. The encounter is triggered when the quest objective is reached — a location, an NPC, a discovery.
- Example: Sera asks the player to find out why the warrens under Podveil are inaccessible. The investigation leads the player to the Pod Bugs nest at the warren entrance.
- Invariant core: quest reference, quest step that triggers the encounter, discovery type.
- Theme surface: investigative context description.

**TriggerType: NPC_ALERT**
An NPC flags a nearby threat and the player moves to respond. The trigger is an NPC observation, not the player's own discovery.
- Example: Brix the Diver (Stage 7) spots something moving in the contaminated wells and calls out. The Flood Wraiths in that section become active when the player approaches.
- Invariant core: NPC reference (who alerts), alert type, enemy activation zone.
- Theme surface: NPC alert dialogue line, creature description.

**TriggerType: DUNGEON_THRESHOLD**
The player crosses into a dungeon zone or sub-zone where specific enemies guard the passage. The crossing is the trigger. Used for structured dungeon encounters where the enemy's placement is architectural — it holds a specific position.
- Example: To reach the Configuration Vaults' lower chambers, the player must pass through a zone held by Default Haunts. The threshold crossing is the trigger.
- Invariant core: dungeon zone reference, threshold position, enemy patrol behaviour (guard / patrol / dormant-until-crossed).
- Theme surface: dungeon zone name, architectural description.

### What EncounterTrigger is NOT

An EncounterTrigger is not a menu button. It is not "click NPC to begin encounter." It is not a loading screen. Every trigger must be expressible as: "the player [observes / does] [X] in the world, and [Y] creature responds."

If the trigger cannot be expressed in this form, it violates Anti-Pattern 7.1 and must be redesigned.

### Lifecycle

EncounterTrigger is owned by Enemy. It has no independent lifecycle. When the Enemy is removed, the trigger is removed with it. Triggers are not reused across enemies — each enemy instance has its own trigger, even if two enemies use the same trigger type.

---

## MODEL 3 — MiniChallenge

### Why it exists

A MiniChallenge is a challenge encounter that is not part of standard enemy combat. It is delivered through a non-combat channel — an NPC gives the player a task, the player discovers a puzzle object in the environment, or a dungeon presents an obstacle that requires knowledge rather than combat to overcome.

MiniChallenges serve Beat 6 of the 9-beat arc (Mini-challenges). They exist to vary the pacing of knowledge application — not every test of understanding should come through combat.

### How MiniChallenge differs from a combat Challenge

| Dimension | Combat Challenge (via Enemy/Boss) | MiniChallenge |
|---|---|---|
| Delivery | During enemy encounter (fight is active) | Outside combat — NPC interaction, exploration discovery, dungeon puzzle |
| Failure consequence | HP loss or ability charge not earned | No HP cost. Failure has narrative / progression consequence only (NPC disappointed, puzzle resets, dungeon path stays sealed) |
| World trigger | EncounterTrigger (world event) | NPC dialogue, environment interaction, or dungeon puzzle object |
| Owner | Enemy or BossPhase | MiniChallenge (its own content object at L2) |
| Pacing function | Combat pace (high tension) | Exploration / rest pace (medium tension) |
| Repetition | Can be attempted multiple times until encounter ends | Can be retried with delay or NPC follow-up, per MiniChallenge's retry policy |

### MiniChallenge delivery types

**NPC_TASK**
An NPC poses a knowledge question framed as a real-world task. The NPC has a problem; the player's understanding is the solution.
- Example: Hadris asks the player to identify which ConfigMap is wrong for a malfunctioning mill. The player reads the configuration and selects the correct correction.
- Failure: The NPC notes the player's answer was wrong, restates the problem, and allows a retry. The mill stays broken until the correct answer is given.

**ENVIRONMENT_PUZZLE**
The player discovers a broken or sealed object in the exploration zone or dungeon that requires applying a concept to resolve. The puzzle itself is the framing — there is no explicit NPC direction.
- Example: A sealed gate in the dungeon approach that has a label selector mismatch — the player must identify which label is wrong to open it.
- Failure: The gate stays sealed. The player may explore other paths and return.

**DUNGEON_KNOWLEDGE_GATE**
A dungeon passage that opens only when the player demonstrates the correct knowledge. Structurally similar to ENVIRONMENT_PUZZLE but specifically positioned as a dungeon traversal element rather than a free-world discovery.
- Example: In the Configuration Vaults dungeon, a chamber that opens only when the player correctly identifies the consumption method (env var vs. mounted file) that applies to the mounted configuration ahead.
- Failure: The passage stays closed. Earlier dungeon knowledge beats may provide the required information if the player missed it.

### What a MiniChallenge owns

- Delivery type (NPC_TASK / ENVIRONMENT_PUZZLE / DUNGEON_KNOWLEDGE_GATE)
- Concept reference (which Concept this MiniChallenge tests — must be a Concept already introduced in the Stage via KnowledgeBeat)
- Challenge reference (the specific Challenge presented — per D-CA-06 resolution)
- Failure consequence definition (what happens when the player answers incorrectly — NPC reaction, puzzle reset, path stays sealed)
- Retry policy (immediate retry / cooldown / one-attempt-per-session)
- Reward condition (optional — some MiniChallenges reward an item, ability charge, or XP on correct completion; others simply unlock progression)
- Context description (the in-world framing — why this puzzle or task exists in this location)

### Invariants

- A MiniChallenge must reference a Concept that has already appeared in at least one KnowledgeBeat earlier in the Stage (or earlier Stages in the Act).
- A MiniChallenge must have zero HP-cost on failure (this is what distinguishes it from combat).
- A MiniChallenge must have a defined failure consequence (even if that consequence is only "retry").
- A MiniChallenge may not reference an EncounterTrigger — it is never a combat encounter.

---

## MODEL 4 — Dungeon

### Why it exists

The Dungeon is Beat 7 of the 9-beat arc. It is the stage's deeper, structured zone — a purposefully designed space that escalates from the open-world encounters the player has already seen, contains hidden knowledge, presents a MiniBoss encounter, and prepares the player for the Stage Boss.

A Dungeon is not a random encounter space. It is an authored zone with a specific architectural logic that mirrors the stage's concept. Every dungeon exists for a reason tied to the concept being taught — not just narrative flavour.

### What a Dungeon is responsible for

- Defining the dungeon's **conceptual architecture** (how the dungeon's structure embodies the stage concept — the Cracked Silos embody the difference between valid and corrupt container images; the Severed Exchange embodies Service routing types as physical tunnels)
- Owning its **escalating encounter sequence** (ordered list of encounters the player moves through — open encounters, knowledge gates, EncounterTrigger-driven enemy encounters)
- Owning its **MiniBoss** (the dungeon's named mid-point encounter — see Model 5)
- Referencing **KnowledgeBeats** that are unlocked only inside the dungeon (deeper knowledge reveals — some concepts are only fully understood after the dungeon's deeper context)
- Declaring its **depth structure** (how many zones or sections the dungeon has; whether sections gate on knowledge or combat; the sequence of escalation)
- Declaring the **dungeon's narrative frame** (what this place was before the dragon's attack; what corruption has done to it; what restoring it means for the kingdom)
- Owning **MiniChallenge instances** of type DUNGEON_KNOWLEDGE_GATE that appear as traversal elements

### What a Dungeon explicitly does NOT own

- The Stage Boss (the Stage Boss is owned by Stage, not by Dungeon — the dungeon leads to it but does not contain it)
- The Stage itself (Dungeon is owned by Stage)
- Enemies that appear in the open-world portion of the stage — only enemies encountered inside the dungeon are referenced by the dungeon structure

### Dungeon depth model

A Dungeon is structured as a sequence of depth zones. Each zone has:

- **Zone label** (outer / inner / deep — or a named equivalent)
- **Primary encounter type** for this zone (open enemy encounters, knowledge-gate traversal, or MiniBoss)
- **Enemy references** for encounters in this zone (specific enemy instances, or references to the stage's enemy pool)
- **KnowledgeBeat references** unlocked in this zone (which deeper discoveries become available here)
- **MiniChallenge instances** that serve as traversal gates or environmental puzzles in this zone
- **Progression dependency** (what must be resolved before the next zone opens — combat victory, MiniChallenge success, or KnowledgeBeat discovery)

The dungeon's depth zones flow in sequence: the player cannot reach a deeper zone before resolving the current one. This sequencing is content-defined, not engine-hardcoded.

### Dungeon architectural principle

The dungeon's structure must mirror the concept's own structure. This is not decoration — it is the learning principle. In the Configuration Vaults (ConfigMaps dungeon), the upper section tests environment-variable consumption; the lower section tests file-mount consumption. These are the two ways ConfigMaps can be consumed, and the dungeon's two-section architecture makes that distinction physical.

**Rule DG-1:** A Dungeon's depth structure must have a traceable relationship to the stage's primary concept. A dungeon that could swap its concept for a different one without any structural change is not correctly designed.

### Lifecycle

A Dungeon is stage-scoped. It is owned by exactly one Stage. It cannot exist outside its Stage. It is destroyed when its Stage is removed.

### Invariants

- A Dungeon must have at least two depth zones (outer and deeper minimum).
- A Dungeon must contain exactly one MiniBoss (the dungeon's mid-point encounter).
- A Dungeon must reference at least one KnowledgeBeat that is unlocked inside the dungeon (not available in the open-world stage content).
- A Dungeon's conceptual architecture must have a traceable relationship to the Stage's primary concept (Rule DG-1).
- Enemy instances referenced in the dungeon must be owned by the same Stage.

---

## MODEL 5 — MiniBoss

### Why it exists

A MiniBoss is a named, mid-dungeon encounter. It is more significant than a standard enemy — it has a name, a narrative role in the dungeon's story, and a specific mechanic that relates to the stage concept. It is not the Stage Boss. It is the escalation midpoint: harder than open-world enemies, purposefully designed for the dungeon context, and — crucially — potentially a seeder for mechanics that the Stage Boss will require.

### What a MiniBoss is responsible for

- Declaring its **primary concept** (what concept failure mode it represents — must be the stage's primary concept or a related sub-concept introduced by a dungeon KnowledgeBeat)
- Carrying its **narrative role** (its specific story identity within the dungeon — who or what it was before corruption; what it has become; why it is in the dungeon's deepest accessible section)
- Declaring its **mechanic seeding role** (see Privilege Escalator pattern below)
- Owning its **combat challenge references** (the challenges used in the MiniBoss encounter — per D-CA-06 resolution)
- Carrying its **resolution condition** (default: HP to zero; but the MiniBoss model supports alternative resolution conditions — see §Boss Resolution Conditions)
- Carrying its **theme surface** (name, visual description, dungeon context — all theme-variant)

### The mechanic-seeding role (Privilege Escalator pattern)

Some MiniBosses introduce a combat resolution mechanic that the Stage Boss will require the player to use. The Privilege Escalator in Stage 13 is the primary example: it does not require damage to defeat — it de-escalates when the player presents a correctly-bounded permission set. This teaches the player, mid-dungeon, that the correct answer ends the fight. The Corrupted Warden (Act 3 Boss) uses the same resolution mechanic at greater depth.

This seeding relationship is directional and explicit in the model: the MiniBoss declares which mechanic it seeds, and the Stage Boss (or ActBoss) declares which mechanic it requires. The seeding relationship is a content-level link — the engine does not infer it; the author declares it.

**The seeded mechanic relationship:** MiniBoss has a field `seedsMechanic` that names the resolution mechanic type it introduces. The corresponding Boss has a field `requiresMechanic` that references the same mechanic type. When these match, the content validation pass can confirm that the player has been introduced to the mechanic before it is required at boss level.

This is not a technical dependency — it is a design guarantee. If a Boss requires a mechanic, some MiniBoss in the same Stage (or an earlier Stage in the Act) must have seeded it.

### MiniBoss vs Enemy: key distinctions

| Dimension | Enemy | MiniBoss |
|---|---|---|
| Location | Open-world or dungeon | Dungeon only (mid-point) |
| Name | Theme-variant (can be generic) | Always named (unique dungeon identity) |
| Narrative role | Represents a concept failure mode | Has a specific story identity in the dungeon |
| Resolution condition | HP to zero only | May have alternative resolution (correct answer, mechanic application) |
| Mechanic seeding | Never seeds mechanics | May seed a Boss mechanic |
| Challenge depth | Standard stage difficulty | Higher difficulty, dungeon-appropriate |

### Invariants

- A MiniBoss must be owned by a Dungeon (never by the Stage directly, never by an open-world encounter).
- A MiniBoss must reference a Concept that appears in a KnowledgeBeat within the same Stage.
- If a MiniBoss's `seedsMechanic` field is populated, a corresponding Boss in the same Stage or Act must have a `requiresMechanic` field referencing the same mechanic type.
- A MiniBoss must have a defined resolution condition.
- Theme surface fields require a complete base (theme-neutral) version before any ThemeOverride can be applied.

---

## MODEL 6 — Stage Boss

### Why it exists

The Stage Boss is Beat 8 of the 9-beat arc. It validates mastery. It is not an escalated enemy — it is a structured test of the player's understanding of the Stage's concepts. Defeating the Stage Boss is the player's demonstration that they have understood what the stage was teaching. The boss fight is the payoff of the entire learning arc.

**Critical rule:** A Stage Boss must not introduce new concepts. Every concept tested in the boss fight must have appeared in at least one KnowledgeBeat earlier in the Stage (or, for Stage Bosses that test multiple concepts, in prior Stages within the Act). The boss is a synthesis test, not a teaching moment.

### What a Stage Boss is responsible for

- Declaring its **concept requirements** (the ordered list of Concepts it tests — all must be previously introduced; no new concepts permitted)
- Owning its **BossPhase list** (ordered sub-model; see BossPhase below)
- Carrying its **narrative role** (what this creature is, why it is here, what it represents in the world's wound)
- Declaring its **resolution condition** (how the fight ends — see §Boss Resolution Conditions)
- Declaring its **required mechanic** (if a dungeon MiniBoss seeded a specific mechanic, the Boss declares that it requires it)
- Carrying its **theme surface** (name, visual description, narrative framing — all theme-variant)
- Referencing its **concept validation signal** (what the player has demonstrated by winning — used by the Portal unlock condition and knowledge mastery update)

### What a Stage Boss explicitly does NOT own

- Concepts (L0 platform entities — boss references them, does not own them)
- The Stage (Boss is owned by Stage)
- KnowledgeBeats (Boss does not introduce knowledge — it tests it)
- Act-level entities

### BossPhase sub-model

A Stage Boss has one or more phases. Each phase is a BossPhase — an owned sub-object within the Boss.

A BossPhase is responsible for:

- Declaring its **phase concept** (which specific Concept this phase tests — must be from the Boss's concept requirements list)
- Owning or referencing its **phase challenges** (the challenges presented during this phase — per D-CA-06 resolution)
- Declaring its **phase trigger condition** (what causes the fight to transition to this phase — the first phase has no trigger condition; subsequent phases trigger on prior phase completion, HP threshold, or specific in-world event)
- Declaring its **phase resolution condition** (how this specific phase ends — damage / correct answer / mechanic application)
- Declaring the **phase transition narrative** (what happens in the world when this phase begins or ends — visual/audio cue, boss behaviour change, environment change)

**BossPhase ordering:** Phases are ordered. Phase 1 always begins when the Boss encounter starts. Each subsequent phase begins when its trigger condition is met. The final phase ends when its resolution condition is satisfied, which ends the Boss encounter.

### Stage Boss: single-phase example

**The Hollow Sovereign** (Stage 1 — Containers):

- Concept requirements: [Containers]
- BossPhase list: one phase
  - Phase concept: Containers
  - Phase challenges: container isolation, image layers, image vs. running instance
  - Phase trigger: combat begins
  - Phase resolution condition: HP to zero
  - Transition narrative: the Sovereign's multi-boundary attacks dissolve as container isolation is restored

This is the minimum valid Stage Boss: one concept, one phase, HP-to-zero resolution.

### Invariants

- A Stage Boss must reference at least one Concept.
- A Stage Boss must reference the Stage's primary Concept (it always tests the concept the Stage teaches).
- All Concepts referenced by the Stage Boss must have appeared in KnowledgeBeats within the Stage or prior Stages in the Act.
- A Stage Boss must never reference a Concept not yet introduced to the player.
- A Stage Boss must have at least one BossPhase.
- A BossPhase's concept must be from the Boss's concept requirements list — phases cannot test concepts the Boss has not declared.
- If the Boss has a `requiresMechanic` field, a MiniBoss in the same Stage's dungeon must have a `seedsMechanic` field referencing the same mechanic type.

---

## MODEL 7 — ActBoss

### Why it exists

An ActBoss is owned by an Act, not a Stage. It tests the player's synthesis of all concepts introduced across the Act's stages. It is the culminating encounter that validates that the player understands how the Act's concepts work as a system — not just individually.

An ActBoss cannot appear in the middle of an Act. It appears after all required Stages in the Act are complete, as the condition for Act completion.

### What distinguishes an ActBoss from a Stage Boss

| Dimension | Stage Boss | ActBoss |
|---|---|---|
| Owned by | Stage (L2) | Act (L1) |
| Concepts tested | Stage's concepts (1+ | must include primary) | All Act's concepts (2+ | cross-Stage synthesis) |
| Prerequisite | Stage KnowledgeBeats | All Act Stages completed |
| Narrative role | Stage wound healed | Act arc completed |
| Concept introduction rule | Stage primary + introduced-in-stage | All Act concepts must appear in Act's stage KnowledgeBeats |
| Phase count | 1–N (Stage-appropriate) | Typically matches Act concept count |

### What an ActBoss is responsible for

- Declaring its **concept requirements** (all Concepts from the Act's stages that this boss tests — minimum two, typically one per stage concept in the Act)
- Owning its **BossPhase list** (same BossPhase sub-model as Stage Boss — see §Stage Boss BossPhase sub-model)
- Carrying its **narrative role** (its identity, its relationship to Khaosynth, its world presence across the Act)
- Declaring its **resolution condition** (see §Boss Resolution Conditions)
- Declaring its **Act entry condition** (what stages must be completed before this ActBoss becomes available)
- Carrying its **theme surface** (name, visual description, act-level narrative framing — all theme-variant)

### Consequential phase chain model (Severed Envoy)

Some ActBosses have phases that are not simply sequential — each phase's *outcome* determines what the next phase reveals. This is a consequential chain: Phase N's resolution exposes Phase N+1's mechanism. The player is not solving four separate puzzles; they are dismantling one system, and each resolution is only possible because the previous one succeeded.

The BossPhase model supports this through the **phaseExposureMechanism** field. When a BossPhase has a `phaseExposureMechanism` populated, it means:

> "Completing this phase reveals a new aspect of the boss that becomes Phase N+1's entry point."

This is distinct from a simple sequential phase transition (where Phase 1 ends and Phase 2 begins regardless of how Phase 1 resolved). In a consequential chain:

- Phase 1's resolution directly creates Phase 2's context. The player's action in Phase 1 is what makes Phase 2 possible — not just what makes Phase 2 begin.
- Phase 2's resolution directly creates Phase 3's context. And so on.
- A player who somehow bypassed Phase 1 could not reach Phase 2 — not because of an HP gate, but because Phase 2's mechanism literally does not exist until Phase 1's action exposes it.

**phaseExposureMechanism field:** This is a description of what Phase N's resolution exposes — what new vulnerability, location, or mechanism becomes visible as a direct result of Phase N's successful completion. It is invariant core — it cannot be theme-overridden. It is the mechanical logic of the fight.

The Severed Envoy's four-phase consequential chain:

- Phase 1 (`CORRUPTED_CONFIGMAP`): correcting the ConfigMap stabilises the broadcast, which exposes the Envoy's physical location and reveals the persistent volume it is drawing from. `phaseExposureMechanism`: "Stabilising broadcast reveals physical location and PV backing store."
- Phase 2 (`PERSISTENT_VOLUME`): purging the corrupted PV forces the Envoy to move, which exposes its displacement onto an underresourced Node. `phaseExposureMechanism`: "PV purge forces displacement, exposing scheduling misplacement."
- Phase 3 (`SCHEDULING_MISPLACEMENT`): forcing eviction and denying a valid Node strips the Envoy of stable placement, which leaves it exposed with no backing store — raw network broadcast mode. `phaseExposureMechanism`: "Eviction without valid landing exposes raw broadcast mechanism."
- Phase 4 (`NETWORK_BROADCAST`): routing the correct packet through active NetworkPolicy gates delivers the terminating signal. `phaseExposureMechanism`: null (final phase; no further exposure).

The consequential chain is explicitly modelled in the BossPhase data: each phase's `phaseExposureMechanism` is the cause of the next phase's `phaseTriggerCondition`. The engine can read this chain and construct the fight's logic entirely from content — no hardcoded Severed Envoy logic in engine code.

### ActBoss: multi-concept non-consequential example (Isolation Wyrm)

**The Isolation Wyrm** (Act 1 — Containers, Pods, Deployments, Services):

- Concept requirements: [Containers, Pods, Deployments, Services]
- BossPhase list: four phases
  - Phase 1: concept = Containers; trigger = combat begins; resolution = HP threshold; exposureMechanism = null (next phase triggers at HP threshold, not by Phase 1's resolution exposing it)
  - Phase 2: concept = Pods; trigger = HP threshold (Phase 1 depleted); resolution = HP threshold; exposureMechanism = null
  - Phase 3: concept = Deployments; trigger = HP threshold (Phase 2 depleted); resolution = HP threshold; exposureMechanism = null
  - Phase 4: concept = Services; trigger = HP threshold (Phase 3 depleted); resolution = HP to zero; exposureMechanism = null

This is a sequential (not consequential) four-phase boss: the phases progress through HP thresholds, not through each phase exposing the next. The distinction is explicit in the content model via `phaseExposureMechanism` being null.

### Invariants

- An ActBoss must be owned by an Act (never by a Stage).
- An ActBoss must reference at least two Concepts.
- All Concepts referenced by the ActBoss must have appeared in KnowledgeBeats within the Act's Stages before the ActBoss becomes available.
- An ActBoss's entry condition must specify that all required Stages in the Act are complete.
- An ActBoss's BossPhase list must cover all declared concept requirements (each concept must appear in at least one phase).
- A consequential phase chain (any phase with `phaseExposureMechanism` populated) must have a matching `phaseTriggerCondition` in the immediately following phase that references the same exposed mechanism.

---

## MODEL 8 — Boss Resolution Conditions

### Why it exists

Not every boss fight ends when HP reaches zero. Some fights end when the player presents the correct answer. The model must support multiple resolution condition types without hardcoding any specific boss's resolution logic in engine code.

A resolution condition is declared on a BossPhase (for phase-level resolution) or on the Boss/ActBoss itself (for the final phase's resolution). Phases may have different resolution conditions — Phase 1 might resolve by damage, Phase 4 might resolve by correct answer.

### Resolution condition types

**DAMAGE_HP_ZERO**
The standard resolution: the phase ends when the boss's HP in this phase reaches zero. All enemy encounters resolve this way. Most boss phases resolve this way.
- Fields: HP total for this phase, damage calculation method (references gameplay engine — not content-defined), challenge performance modifier (how correct challenge answers affect damage output).
- Application: Shell Beetles, Pod Bugs, Mandate Breakers, Hollow Sovereign Phase 1, Isolation Wyrm all four phases.

**CORRECT_ANSWER_PRESENTED**
The phase ends when the player selects or constructs the correct answer. HP is irrelevant. The phase does not progress via damage at all — the boss is not responding to physical attack.
- Fields: expected answer type (MCQ selection / command completion / constructed rule set), correct answer reference (which Challenge's correct answer is evaluated), evaluation criteria (exact match / principle-match / threshold correctness).
- Application: Privilege Escalator (Stage 13 MiniBoss) — de-escalates when player presents correctly-bounded permission set. Corrupted Warden final phase — stands down when player presents correct RBAC rule set.

**MECHANIC_APPLIED**
The phase ends when the player correctly applies a specific mechanic — a type of action, not just an answer. This is used when the resolution requires demonstrating a multi-step process (routing a packet, configuring a service type, assembling a Helm release).
- Fields: mechanic type (references the named mechanic seeded by a MiniBoss), required steps, evaluation criteria.
- Application: Unravelling General (final phase — player identifies and "locks in" the correct desired state), Severed Envoy Phase 4 (routing correct packet through NetworkPolicy gates), Unravelling Architect (final phase — assembling correct Helm release from scratch).

**HYBRID_DAMAGE_AND_ANSWER**
The phase ends when both HP damage and correct answers are applied in sequence. Some phases require damage to weaken the boss and correct answers to stabilise the damage — neither alone is sufficient.
- Fields: HP threshold that triggers the answer-required condition, answer requirement (same as CORRECT_ANSWER_PRESENTED fields).
- Application: Configuration Wraith (each behaviour phase requires identifying the wrong parameter before damage can be applied to that phase segment), Isolated Wyrm Act 2 phases (damage + correct challenge answer to charge attacks).

### The Corrupted Warden: full resolution chain

The Corrupted Warden's resolution is the model's most complex case. It must be fully representable:

- Phase 1 (RBAC): resolution = HYBRID_DAMAGE_AND_ANSWER (identify which RBAC layer is active; correct identification opens damage window)
- Phase 2 (ServiceAccount): resolution = HYBRID_DAMAGE_AND_ANSWER (same pattern for ServiceAccount permissions layer)
- Phase 3 (NetworkPolicy): resolution = HYBRID_DAMAGE_AND_ANSWER (NetworkPolicy layer identification)
- Phase 4 (Least Privilege): resolution = CORRECT_ANSWER_PRESENTED (player constructs a correct RBAC rule set demonstrating minimum necessary access; the Warden evaluates it; if it satisfies least-privilege correctly, the Warden stands down — no HP damage required in this phase)

Phase 4 is the critical case: the Warden does not lose Phase 4 by running out of HP. It stands down when the player demonstrates understanding. The resolution is evaluation-based, not attrition-based. The content model supports this through CORRECT_ANSWER_PRESENTED with `evaluationCriteria: least-privilege-satisfied`.

### Invariants for resolution conditions

- Every enemy encounter must use DAMAGE_HP_ZERO.
- Every BossPhase and MiniBoss must have exactly one resolution condition declared.
- A BossPhase with resolution CORRECT_ANSWER_PRESENTED must reference a Challenge (or a constructed answer definition) that the engine can evaluate.
- A BossPhase with resolution MECHANIC_APPLIED must reference a mechanic type that has been seeded by a MiniBoss earlier in the Stage or Act.
- A Boss or ActBoss with a CORRECT_ANSWER_PRESENTED final phase must have had that mechanic seeded in the same Stage's dungeon MiniBoss.

---

## OWNERSHIP MATRIX ADDITIONS

These rows extend the ownership matrix established in Phase 2.2.

| Entity | Owned by | Level |
|---|---|---|
| Enemy | Stage | L2 |
| EncounterTrigger | Enemy | L3 |
| MiniChallenge | Stage | L2 |
| Dungeon | Stage | L2 |
| MiniBoss | Dungeon | L2 |
| Boss (stage boss) | Stage | L2 |
| ActBoss | Act | L1 |
| BossPhase | Boss or ActBoss | L3 |
| Challenge (combat) | Pending D-CA-06 | L3 or L1 or L0 |

---

## DEPENDENCY MATRIX ADDITIONS

These rows extend the dependency matrix established in Phase 2.2.

| Entity | Depends on (references) |
|---|---|
| Enemy | Concept (L0, primary — concept failure mode), Challenge (per D-CA-06), Stage (owner) |
| EncounterTrigger | Enemy (owner), Zone/Region (for PROXIMITY and DUNGEON_THRESHOLD types), NPC (for NPC_ALERT type), Quest (for QUEST_INVESTIGATION type) |
| MiniChallenge | Concept (L0 — must be previously introduced in Stage), Challenge (per D-CA-06), NPC (for NPC_TASK type, optional) |
| Dungeon | Stage (owner), Enemy[ ] (dungeon-zone references), KnowledgeBeat[ ] (dungeon-deep discoveries), MiniBoss (owns it) |
| MiniBoss | Dungeon (owner), Concept (L0), Challenge (per D-CA-06), Boss/ActBoss (for `requiresMechanic` relationship — reference by mechanic type, not ID) |
| Boss (stage) | Stage (owner), Concept[ ] (L0, all referenced), BossPhase[ ] (owns them), Challenge (per D-CA-06) |
| ActBoss | Act (owner), Concept[ ] (L0, all referenced), BossPhase[ ] (owns them), Challenge (per D-CA-06), Stage[ ] (entry condition — all referenced Stages must be complete) |
| BossPhase | Boss or ActBoss (owner), Concept (L0 — the concept this phase tests), Challenge (per D-CA-06) |

---

## LIFECYCLE MATRIX ADDITIONS

These rows extend the lifecycle matrix established in Phase 2.2.

| Entity | States | Notes |
|---|---|---|
| Enemy | Bound to Stage | Created with Stage; destroyed when Stage is removed. Cannot exist outside Stage. |
| EncounterTrigger | Bound to Enemy | Created with Enemy; destroyed when Enemy is removed. |
| MiniChallenge | Bound to Stage | Created with Stage; destroyed when Stage is removed. |
| Dungeon | Bound to Stage | One dungeon per stage; destroyed when Stage is removed. |
| MiniBoss | Bound to Dungeon | Created with Dungeon; destroyed when Dungeon is removed. |
| Boss (stage) | Bound to Stage | One stage boss per stage; destroyed when Stage is removed. |
| ActBoss | Bound to Act | One act boss per act (where campaign design includes it); destroyed when Act is removed. |
| BossPhase | Bound to Boss/ActBoss | Cannot exist outside its Boss. Destroyed when Boss is removed. |

---

## REUSE RULES

These rules extend the reuse rules established in Phase 2.1 and Phase 2.2.

| Entity | Reuse rule |
|---|---|
| Enemy | NOT reusable across stages. Enemy instances are stage-specific. Enemy *types* (the concept of a creature that severs Pod networking) can inspire similar enemies in other stages, but they are separate content objects with separate concept linkages and separate stage contexts. |
| EncounterTrigger | NOT reusable. Owned by a single enemy instance. |
| MiniChallenge | NOT reusable across stages. Each MiniChallenge is stage-specific. The same puzzle framing might appear in two stages, but they are separate content objects with potentially different concept references. |
| Dungeon | NOT reusable. Architecturally specific to its stage's concept. |
| MiniBoss | NOT reusable across stages. MiniBoss instances are dungeon-specific. |
| Boss (stage) | NOT reusable. Stage-specific. |
| ActBoss | NOT reusable. Act-specific. |
| BossPhase | NOT reusable. Owned by a single Boss/ActBoss. Phases are never extracted or shared. |
| Challenge | Reuse depends on D-CA-06. See §Challenge Pool Dependency. |

**Theme-invariant identity rule:** While names and visual descriptions of all enemies and bosses are theme-variant, their concept linkages, failure mode descriptions, challenge references, and resolution conditions are invariant. Shell Beetles in Fantasy theme and their Space theme equivalent are the same content object with a different ThemeOverride — they test the same concept, in the same way, with the same challenges. The theme changes what they look like and what they are called. It does not change what they teach.

---

## VALIDATION RULES

These rules extend the validation pass (Phase 2.9) for the Enemy + Boss model.

### Stage-level validation (enemy and dungeon)

- [ ] Stage has at least one Enemy referencing the Stage's primary Concept
- [ ] Every Enemy has an EncounterTrigger (no trigger-less enemies)
- [ ] Every EncounterTrigger is of a declared type (PROXIMITY / WORLD_EVENT_INTERACTION / QUEST_INVESTIGATION / NPC_ALERT / DUNGEON_THRESHOLD)
- [ ] Every EncounterTrigger can be expressed as "the player [observes/does] [X] in the world, and [Y] creature responds" — no abstract triggers
- [ ] Every Enemy references a Concept that has appeared in at least one KnowledgeBeat within the Stage
- [ ] Stage has exactly one Dungeon
- [ ] Dungeon has exactly one MiniBoss
- [ ] Dungeon references at least one KnowledgeBeat unlocked only inside the dungeon
- [ ] Dungeon's conceptual architecture is traceable to the Stage's primary Concept (Rule DG-1)
- [ ] Every MiniChallenge references a Concept previously introduced in the Stage via KnowledgeBeat
- [ ] Every MiniChallenge has a defined failure consequence with zero HP cost
- [ ] Stage has exactly one Stage Boss
- [ ] Stage Boss references the Stage's primary Concept
- [ ] All Concepts referenced by the Stage Boss have appeared in KnowledgeBeats within the Stage or prior Stages in the Act
- [ ] Stage Boss has at least one BossPhase
- [ ] Every BossPhase has a defined resolution condition
- [ ] Every BossPhase's concept is in the Boss's concept requirements list

### Mechanic-seeding validation

- [ ] If a Boss has `requiresMechanic` populated, a MiniBoss in the same Stage's Dungeon has `seedsMechanic` referencing the same mechanic type
- [ ] If a MiniBoss has `seedsMechanic` populated, a Boss in the same Stage or Act has `requiresMechanic` referencing the same mechanic type
- [ ] A BossPhase with CORRECT_ANSWER_PRESENTED or MECHANIC_APPLIED resolution references a mechanic that has been seeded

### Act-level validation (ActBoss)

- [ ] ActBoss is owned by Act (not Stage)
- [ ] ActBoss references at least two Concepts
- [ ] All Concepts referenced by the ActBoss have appeared in KnowledgeBeats within the Act's Stages
- [ ] ActBoss entry condition specifies which Stages must be complete before it becomes available
- [ ] ActBoss BossPhase list covers all declared concept requirements

### Consequential chain validation

- [ ] For any BossPhase with `phaseExposureMechanism` populated, the immediately following BossPhase has a `phaseTriggerCondition` that references the same exposed mechanism
- [ ] The final phase of a consequential chain has `phaseExposureMechanism` = null
- [ ] No phase in the middle of a consequential chain has `phaseExposureMechanism` = null (every non-final phase in a consequential chain must expose the next)

---

## BOSS VALIDATION AGAINST CAMPAIGN DESIGNS

### Test 1 — The Hollow Sovereign (Stage 1 Boss)

Can this model represent it?

The Hollow Sovereign is the Stage 1 boss. Single concept (Containers). Single phase. HP-to-zero resolution. Mechanic: answers about container isolation, image layers, image vs. running instance charge attacks. Boss's multi-boundary attack pattern is countered by demonstrating understanding of why isolation exists.

Model representation:
- Owner: Stage 1
- Concept requirements: [Containers]
- BossPhase list: one phase
  - Phase concept: Containers
  - Challenges: container isolation, image layers, image vs. running instance
  - Phase trigger: combat begins (no prior phase)
  - Phase resolution: DAMAGE_HP_ZERO (with HYBRID modifier — correct challenge answers modify damage output)
  - `phaseExposureMechanism`: null

**Result: representable. No gaps.** ✅

---

### Test 2 — The Isolation Wyrm (Act 1 Boss)

Can this model represent it?

The Isolation Wyrm is the Act 1 Boss, owned by Act 1. Four phases. Four concepts: Containers (Phase 1), Pods (Phase 2), Deployments (Phase 3), Services (Phase 4 — the kill phase). Each phase tests a different Act 1 concept. Sequential (not consequential) — phases progress at HP thresholds.

Model representation:
- Owner: Act 1
- Type: ActBoss
- Concept requirements: [Containers, Pods, Deployments, Services]
- BossPhase list: four phases
  - Phase 1: concept = Containers; trigger = combat begins; resolution = DAMAGE_HP_ZERO; `phaseExposureMechanism` = null
  - Phase 2: concept = Pods; trigger = HP threshold (Phase 1); resolution = DAMAGE_HP_ZERO; `phaseExposureMechanism` = null
  - Phase 3: concept = Deployments; trigger = HP threshold (Phase 2); resolution = DAMAGE_HP_ZERO; `phaseExposureMechanism` = null
  - Phase 4: concept = Services; trigger = HP threshold (Phase 3); resolution = DAMAGE_HP_ZERO (final phase); `phaseExposureMechanism` = null
- Entry condition: Stages 1–4 complete

**Result: representable. Four-phase sequential ActBoss, each phase tests a different Act concept.** ✅

---

### Test 3 — The Severed Envoy (Act 2 Boss)

Can this model represent it?

The Severed Envoy is the Act 2 Boss, owned by Act 2. Four phases. Each phase's outcome exposes the next phase's mechanism — this is a consequential chain, not simply sequential. Phase 1 corrects the ConfigMap (stabilises broadcast, exposes physical location and PV). Phase 2 purges the PV (forces displacement, exposes scheduling misplacement). Phase 3 forces eviction (strips stable placement, exposes raw network broadcast). Phase 4 routes the correct packet through NetworkPolicy gates (the kill).

Model representation:
- Owner: Act 2
- Type: ActBoss
- Concept requirements: [ConfigMaps, Volumes, Scheduling, Networking]
- BossPhase list: four phases, consequential chain
  - Phase 1: concept = ConfigMaps; trigger = combat begins; resolution = CORRECT_ANSWER_PRESENTED (identify and restore correct configuration); `phaseExposureMechanism` = "Stabilising broadcast reveals physical location and PV backing store"
  - Phase 2: concept = Volumes; trigger = Phase 1 `phaseExposureMechanism` resolved (PV location exposed); resolution = MECHANIC_APPLIED (identify corrupted PV, purge correctly, prevent re-bind); `phaseExposureMechanism` = "PV purge forces displacement, exposing Node misplacement"
  - Phase 3: concept = Scheduling; trigger = Phase 2 `phaseExposureMechanism` resolved (misplacement exposed); resolution = MECHANIC_APPLIED (identify misplacement, force eviction, deny valid Node); `phaseExposureMechanism` = "Eviction without valid landing exposes raw broadcast mechanism"
  - Phase 4: concept = Networking; trigger = Phase 3 `phaseExposureMechanism` resolved (raw broadcast exposed); resolution = MECHANIC_APPLIED (route correct packet through NetworkPolicy gates); `phaseExposureMechanism` = null (final)
- Entry condition: Stages 5–9 complete

The consequential chain is fully captured by `phaseExposureMechanism` on each phase pointing to the `phaseTriggerCondition` of the next.

**Result: representable. Consequential chain model supports the Severed Envoy's inter-phase dependency without hardcoding it in engine logic.** ✅

---

### Test 4 — The Corrupted Warden (Act 3 Boss)

Can this model represent it?

The Corrupted Warden is the Act 3 Boss. Multi-layer phases, one per security layer. Final phase: does not resolve by HP — resolves when player presents a correct RBAC rule set demonstrating least privilege. The Warden evaluates the answer and stands down.

Model representation:
- Owner: Act 3
- Type: ActBoss
- Concept requirements: [RBAC, ServiceAccount, NetworkPolicy, LeastPrivilege]
- BossPhase list: four phases
  - Phase 1: concept = RBAC; trigger = combat begins; resolution = HYBRID_DAMAGE_AND_ANSWER (identify RBAC layer active, correct identification opens damage window); `phaseExposureMechanism` = null (HP threshold triggers next)
  - Phase 2: concept = ServiceAccount; trigger = HP threshold (Phase 1); resolution = HYBRID_DAMAGE_AND_ANSWER; `phaseExposureMechanism` = null
  - Phase 3: concept = NetworkPolicy; trigger = HP threshold (Phase 2); resolution = HYBRID_DAMAGE_AND_ANSWER; `phaseExposureMechanism` = null
  - Phase 4: concept = LeastPrivilege; trigger = HP threshold (Phase 3); resolution = CORRECT_ANSWER_PRESENTED (evaluationCriteria: least-privilege-satisfied; player constructs minimum-access RBAC rule set; Warden evaluates and stands down if correct); `phaseExposureMechanism` = null (final)
- Entry condition: Stages 10–13 complete
- `requiresMechanic`: RBAC_RULE_CONSTRUCTION (seeded by Stage 13 Dungeon's Privilege Escalator MiniBoss)

The Privilege Escalator (Stage 13 MiniBoss) has `seedsMechanic`: RBAC_RULE_CONSTRUCTION, which connects to the Corrupted Warden's `requiresMechanic`: RBAC_RULE_CONSTRUCTION. The player encounters the mechanic (correct answer ends fight) in the dungeon before the ActBoss requires it.

**Result: representable. CORRECT_ANSWER_PRESENTED resolution with least-privilege evaluation criteria supports the Warden's stand-down mechanic.** ✅

---

## CHALLENGE POOL DEPENDENCY

Decision D-CA-06 (challenge pool architecture) is unresolved. How the Enemy and Boss models depend on that decision:

### Under Option A — Embedded ownership

Challenges are embedded in the entity that uses them. Each enemy owns its challenges directly. Each BossPhase owns its challenges directly. Each MiniChallenge owns its challenge.

**Effect on Enemy model:** Enemy has a `challenges: Challenge[]` field. Challenge content (question, answers, type, difficulty) lives inside the Enemy object. When the Enemy is removed, its challenges are removed with it.

**Effect on Boss model:** BossPhase has a `challenges: Challenge[]` field. Each BossPhase owns its challenge set. This is the simplest authoring path — a boss author defines challenges inline while designing the boss phases.

**Effect on MiniChallenge model:** MiniChallenge has a `challenge: Challenge` field (single challenge, owned directly).

**Tradeoff:** Simple ownership; no reuse. If the same concept is tested in Stage 3 and Stage 8, the challenges are authored twice as completely separate content objects.

### Under Option B — Concept pool

Challenges are owned by the Concept (L0). Each Concept has a ChallengePool with challenges tagged by type and difficulty. Enemies and Bosses draw from the pool by declaring their required concept, difficulty tier, and challenge type.

**Effect on Enemy model:** Enemy has a `challengePoolRef: { conceptId, difficultyTier, challengeType }` field instead of owned challenges. The engine draws the appropriate challenge from the Concept's pool at runtime.

**Effect on Boss model:** BossPhase has a `challengePoolRef: { conceptId, difficultyTier, challengeType }` field. Bosses do not own challenges — they declare selection criteria against the shared pool.

**Effect on MiniChallenge model:** MiniChallenge has a `challengePoolRef` field with the same structure.

**Tradeoff:** High reuse; concepts are the challenge content authority. The same Pod challenge can appear in Stage 2 enemies and the Stage 2 Boss and any later boss that also tests Pods. Authoring is at the Concept level, not the Entity level — requires discipline to keep the Concept pool populated with sufficient variety.

### Under Option C — Campaign pool

Challenges are owned by the Campaign (L1), tagged by concept, difficulty, and other criteria. All entities reference the campaign pool via tags.

**Effect on Enemy model:** Enemy has a `challengePoolFilter: { tags: [], conceptId, difficultyTier }` field. The engine filters the campaign pool by those tags at runtime.

**Effect on Boss model:** BossPhase has a `challengePoolFilter` field. Boss phase challenges are drawn from the campaign pool by tag matching.

**Effect on MiniChallenge model:** MiniChallenge has a `challengePoolFilter` field.

**Tradeoff:** Maximum flexibility; the campaign owns all challenge content in one flat pool. Authoring is centrally managed but requires careful tagging discipline. Cross-stage challenge reuse is possible for any concept without the challenge being owned at platform level.

### What does NOT change under any option

Regardless of D-CA-06 resolution, the following aspects of the Enemy and Boss models are unchanged:

- Enemy concept reference (always exactly one primary Concept — this is independent of challenges)
- Boss concept requirements list (the concepts tested — independent of how challenges are sourced)
- BossPhase structure (phases, ordering, triggers, resolution conditions)
- EncounterTrigger model (entirely independent of challenges)
- MiniBoss mechanic-seeding relationship (independent of challenges)
- ActBoss consequential chain model (phaseExposureMechanism — independent of challenges)
- Boss resolution conditions (DAMAGE_HP_ZERO, CORRECT_ANSWER_PRESENTED, MECHANIC_APPLIED — all independent of challenge pool source)

D-CA-06 only determines **where challenge content lives and how it is referenced**. The structural model of how entities use challenges remains identical across all three options.

---

## UNRESOLVED DECISIONS FOR PHASE 2.8

These decisions arose during Phase 2.5 and cannot be resolved at the conceptual modelling level alone. They require either human input or resolution in a later phase.

| ID | Decision | Impact | Recommended resolution |
|---|---|---|---|
| D-CA-06 | Challenge pool architecture (embedded / concept pool / campaign pool) | Determines how Enemy, Boss, and MiniChallenge reference challenges; affects authoring workflow significantly | Human input required (Phase 2.8) |
| D-CA-08 | Boss phases as sub-objects or separate entities | Recommendation from Phase 2.5 plan: sub-objects (boss phases are never reused; embedding keeps authoring coherent) | Confirm in Phase 2.8 |
| — | MiniBoss resolution condition evaluation | When MiniBoss resolution is CORRECT_ANSWER_PRESENTED, what evaluates the answer? The engine needs to compare the player's submitted answer against the MiniBoss's expected answer. The evaluation model (exact match / principle-match / constructed answer set comparison) is not defined here. | Phase 2.9 validation pass will surface any gaps |
| — | ActBoss encounter placement | ActBoss is owned by Act (L1). Where in the world does the player encounter it? It is not inside a Stage's dungeon — it is after all Act Stages are complete. The location model for ActBoss encounters (a separate "act finale zone"? an extension of the final Stage's portal transition?) needs design. | Phase 2.3 (Quest + NPC) left analogous gaps for multi-stage content; ActBoss location may be resolved when inter-stage transition model is designed |
| — | Dungeon enemy count | The current model says Dungeon references Enemy instances from the Stage's enemy pool. Should a Dungeon have its own enemy set (dungeon-exclusive enemies) in addition to those shared with the open-world stage? The campaign design shows dungeon mini-bosses are unique to the dungeon, but dungeon enemies (like Pod Bugs appearing in the Pod Warrens) seem to be the same enemy type as open-world enemies. This ownership question should be formalised. | Recommend: Dungeon references stage enemies for encounters; stage enemies can declare themselves as dungeon-exclusive via `encounterContext` field |

---

## Cross-references

- `milestones/milestone-02-content-architecture/ai-phase-plan.md §Phase 2.5` — phase objectives and constraints this document fulfils
- `content-architecture/ai-phase-02-01-content-hierarchy.md` — Phase 2.1 hierarchy: Enemy at L2, BossPhase at L3, EncounterTrigger at L3
- `content-architecture/ai-phase-02-02-campaign-act-stage-model.md` — Stage and Act ownership rules; dependency matrices extended by this document
- `game-design/ai-campaign-structure.md` — all enemy designs, dungeon designs, and boss designs this model must represent
- `game-design/ai-gameplay-loop.md §3` — 9-beat arc: Beat 5 (Encounters), Beat 6 (Mini-challenges), Beat 7 (Dungeon), Beat 8 (Boss)
- `game-design/ai-vision.md §5` — Knowledge Doctrine: every enemy must have concept linkage; bosses combine prior concepts only
- `game-design/ai-vision.md §7.1` — Anti-Pattern: no abstract triggers; EncounterTrigger model enforces world-event-only encounters
- `DECISIONS.md` — D-CA-06, D-CA-08 will be resolved here in Phase 2.8
