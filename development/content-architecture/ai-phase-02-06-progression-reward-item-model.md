# ForgeMinds — Progression, Reward & Item Model

> **Phase:** 2.6 — Progression + Reward + Item Model
> **Purpose:** Define the conceptual model for how the player grows within a campaign, what they receive as rewards, and how items and abilities function — as static content entities, not as runtime records.
> **Status:** v1 — conceptual only. No schemas, no storage, no implementation.
> **Owned by:** AI
> **Depends on:** `ai-phase-02-01-content-hierarchy.md`, `ai-phase-02-02-campaign-act-stage-model.md`, `ai-phase-02-03-quest-npc-castmember-model.md`
> **Cites:** `ai-vision.md §2, §3, §4 Pillars 3–4, §7.4, §7.8`, `ai-phase-plan.md §Phase 2.6`

---

## Guiding principle

The player grows in two parallel ways. They accumulate the story-world markers of a hero's journey — levels, abilities, items. And they accumulate genuine understanding of the domain. These two tracks run alongside each other. They are never the same thing. Neither substitutes for the other.

A player at Level 10 who cannot explain Services is not a Level-10 learner. They are a Level-10 adventurer who has not yet understood Services. Both of those facts are true and separately represented in the model. The model must hold both without collapsing them together.

This is the load-bearing design principle of this phase. Every decision below is checked against it.

---

## MODEL 1 — ProgressionLevel

### What a ProgressionLevel is

A ProgressionLevel is a campaign-authored milestone: a named point in the player's XP curve that changes what the player can do, use, or access within the campaign's adventure narrative. Levels are the structure of the hero's journey through the world — they give shape to progression without measuring learning.

A ProgressionLevel is static content. It is authored once and never changes at runtime. It defines the *thresholds and unlocks* of the campaign's progression arc, not the player's current state. The player's current level is runtime data held in PlayerProgress.

### What a ProgressionLevel is responsible for

- Declaring the **XP threshold** — how much XP must be accumulated (since the start of the campaign) to reach this level
- Declaring the **level label** — the named milestone (e.g., "Wanderer," "Scout," "Champion," "Sentinel of the Realm") — themed per campaign, not generic numbers
- Declaring **ability unlocks** — which Ability (if any) becomes available at this level
- Declaring **item unlocks** — which Items (if any) become available at this level (equipment upgrades, cosmetic unlocks)
- Declaring **narrative unlocks** — which story content (if any) becomes accessible at this level (certain CastMember dialogue states, certain optional regions)
- Declaring the **HP baseline** — the maximum HP available at this level (combat durability, not intelligence)
- Optionally declaring a **flavour moment** — a brief in-world narrative line that the engine delivers when the player reaches this level (framed as story recognition, not a grade)

### What a ProgressionLevel does NOT own

- The player's current XP total — that is PlayerProgress
- The player's current level — that is PlayerProgress
- Knowledge mastery — ProgressionLevel has no access to and no influence on ConceptMastery state (Anti-Pattern 7.4: knowledge is not a stat that levels earn)
- Dialogue content — level-unlocked dialogue is owned by the CastMember; the ProgressionLevel declares that the stage appearance trigger condition includes this level
- Challenge difficulty — challenge difficulty is calibrated to stage concept, not to player level. Difficulty is content-authored, not level-gated

### Lifecycle

ProgressionLevel definitions are authored during campaign design and do not change once the campaign is live. They are campaign-scoped (L1). If a campaign is retired, its ProgressionLevel definitions can be archived. A player's *position* within the ProgressionLevel sequence (their current level) is runtime data, not static content.

### Campaign scope enforcement (Anti-Pattern 7.8)

A ProgressionLevel is owned by exactly one Campaign. There is no platform-level ProgressionLevel. There is no "account level" that persists across campaigns. A player who reaches Level 12 in Kubernetes Kingdom begins Linux Realms at Level 1. The ProgressionLevel entities themselves are different objects in different campaigns. The engine never reads a ProgressionLevel from one campaign when loading another.

### How ProgressionLevel interacts with knowledge mastery

These are two separate tracks that the engine maintains simultaneously:

- The player's ProgressionLevel is driven by XP accumulated through adventure activities
- ConceptMastery states are driven by knowledge beats completed and challenges answered correctly

A player at Level 8 who has not demonstrated mastery of Stage 7's concept is a valid system state. It means the player has been active (gaining XP through exploration, combat, quest completion) but has not yet clicked with Stage 7's concept. The system's response is not to block their level. It is to ensure that Stage 7's mastery-gated content (certain dialogue branches, certain traversal gates, the Stage 7 quest's understanding-branch) does not trigger. Their level does not give them mastery. Their mastery gates certain content regardless of their level.

This is the cleanest statement of the two-track principle: levels and mastery coexist, never substitute, and gate different things.

### Kubernetes Kingdom ProgressionLevel sequence (example content, not schema)

The Kubernetes Kingdom campaign defines approximately 14 progression levels across its arc (one per stage, broadly, with room for granularity). Named markers give them narrative weight:

| Approximate level | Name (Fantasy theme) | When it lands |
|---|---|---|
| 1 | Wanderer | Start of campaign |
| 3 | Field Scout | Stage 1 completion zone |
| 5 | Village Protector | Stage 2 completion zone |
| 7 | March Defender | Stage 3 completion zone |
| 9 | Crossroads Keeper | Stage 4 completion zone |
| 11 | Vault Seeker | Mid-Act 2 |
| 13 | Sanctum Challenger | Act 3 entry zone |
| 15 | Sentinel of the Realm | Final Stage entry |

The exact thresholds and count are campaign design decisions (Phase 2.8 and later). This is illustrative.

---

## MODEL 2 — PlayerProgress (runtime record)

### What PlayerProgress is

PlayerProgress is the engine's record of the player's full state within one campaign session. It is NOT static content — it is runtime data. But its *structure* must be defined here because every content entity in the campaign system (dialogue branches, quest resolution conditions, traversal gates) must be able to query it. PlayerProgress is the shared language that content and engine use to communicate player state.

It is defined here as a conceptual contract: these are the dimensions the engine will track, and these are the dimensions the content system will query.

### Dimensions PlayerProgress tracks

**Narrative progression dimensions:**

- **currentStageId** — the Stage the player is currently in
- **completedStages[ ]** — ordered list of Stage IDs the player has completed
- **currentActId** — which Act the player is currently in
- **completedActs[ ]** — which Acts have been fully completed
- **questStates[ ]** — for each Quest the player has encountered: its current lifecycle state (DORMANT / AVAILABLE / ACTIVE / COMPLETED / FAILED / ABANDONED) and which steps have been completed
- **campaignScopedQuestProgress** — for campaign-scoped quests (like Mira's arc): which steps have been completed across which stages

**Knowledge and mastery dimensions:**

- **encounteredConcepts[ ]** — which Concepts the player has seen at least one KnowledgeBeat for (this is the "discovered" state — not mastery, just encounter)
- **conceptMasteryStates[ ]** — for each Concept encountered: the ConceptMastery state record (as defined in Phase 2.4; this is a state, not a number; values like NOT_ENCOUNTERED / ENCOUNTERED / DEMONSTRATED / DEEPLY_DEMONSTRATED)

These two knowledge dimensions are read-only from the reward and progression system's perspective. Rewards do not write mastery states. Only challenge completion and knowledge beat interaction writes mastery states. This separation is architecturally enforced.

**Inventory dimensions:**

- **inventory[ ]** — list of Item instances the player holds (referencing Campaign-level Item definitions)
- **equippedItems[ ]** — which equipment slots are filled with which Items
- **consumablesUsed[ ]** — a record of consumed Consumable items (for audit and statistics; does not affect mastery)

**Ability dimensions:**

- **unlockedAbilities[ ]** — which Abilities the player has unlocked (references Campaign-level Ability definitions)
- **abilityChargeStates[ ]** — runtime charge levels for each equipped ability (0 to max; driven by challenge performance in the current encounter)

**Combat and survival dimensions:**

- **currentHP** — the player's current health points in the active session
- **maxHP** — the HP ceiling at the player's current ProgressionLevel
- **currentXP** — total XP accumulated in this campaign
- **currentLevel** — the ProgressionLevel index the player has reached (derived from currentXP vs. ProgressionLevel thresholds, but cached here for fast access)

**Save and checkpoint dimensions:**

- **lastCheckpointId** — the most recently activated Checkpoint within the current Stage
- **lastCompletedStageId** — for inter-session restore (if the player closes the app mid-stage)
- **sessionTimestamp** — when this save was last updated

### What PlayerProgress explicitly does NOT track

- **Challenge answers** — which specific answer the player gave to a specific challenge. This is not tracked. The system tracks whether mastery was demonstrated, not the answer history. (Anti-Pattern 7.4: no grading memory.)
- **Combat statistics** — kill counts, damage totals, accuracy percentages. These serve leaderboard and achievement mechanics that ForgeMinds explicitly does not include. (Vision §2: not a power-accumulation fantasy. Vision §3: no competitiveness.)
- **Time spent in each region** — not tracked. This would enable an LMS-style "time on task" metric, which is incompatible with Anti-Pattern 7.2.
- **"Knowledge score"** — there is no numeric field representing how much the player "knows." ConceptMastery states are enumerated states, not numbers that accumulate.
- **Hint usage count** — hints are Pillar 3 (failure teaches), not a metric to count. Using hints does not penalise or flag the player.
- **Cross-campaign data** — PlayerProgress is scoped to one Campaign. The engine never queries one campaign's PlayerProgress when loading another. (Anti-Pattern 7.8.)

### Queryable dimensions for content

Content entities (dialogue branches, quest resolution conditions, traversal gates) query PlayerProgress through a defined set of read-only predicates. These predicates are:

| Predicate | Used by | What it answers |
|---|---|---|
| `hasCompletedStage(stageId)` | Portal unlock, quest trigger, CastMember dialogue gate | Has the player fully completed this stage? |
| `hasEncounteredConcept(conceptId)` | Dialogue gate, NPC knowledge-gated state | Has the player seen at least one KnowledgeBeat for this concept? |
| `hasDemonstratedMastery(conceptId)` | Quest resolution condition, traversal gate, boss unlock | Has the player answered challenges correctly for this concept? |
| `questIs(questId, state)` | Quest chain trigger, NPC dialogue state, CastMember state | Is this quest in this lifecycle state? |
| `hasItem(itemId)` | Quest step, traversal gate (key items) | Is this item in the player's inventory? |
| `hasAbility(abilityId)` | Combat system, CastMember dialogue | Has this ability been unlocked? |
| `isAtLevel(level)` | Narrative unlock trigger | Has the player reached at least this ProgressionLevel? |
| `hasCompletedQuestStep(questId, stepId)` | Campaign-scoped quest progress | Has this specific quest step been completed? |

The content system never reads raw PlayerProgress fields directly. It only invokes predicates. This keeps the contract stable: if the internal representation of PlayerProgress changes, the predicate API is the boundary that protects content from breaking.

---

## MODEL 3 — Reward

### What a Reward is

A Reward is a content-authored declaration of what the player receives upon completing a quest, defeating a boss, reaching a stage milestone, or triggering a specific story event. Rewards are authored as part of the quest/boss/stage content — not hardcoded in the engine.

A Reward is the bridge between a narrative event and a change in PlayerProgress. It tells the engine: "when this event concludes, do these things to the player's state."

### What a Reward is responsible for

- Declaring the **event type** that triggers it (quest completion, boss defeat, stage completion, story beat, act completion, discovery)
- Declaring one or more **reward components** — the actual things granted
- Declaring the **narrative framing** — how the reward is surfaced to the player in-world (not a stat sheet; a story moment)

### Reward components — types

A Reward is composed of one or more components. Each component is one of the following types:

**XP grant**
A fixed or formula-driven quantity of experience points. Added to the player's currentXP. May trigger a level-up. The value is content-authored (e.g., Stage 2 completion grants 400 XP). XP is the player's adventure currency — it measures how much they have done, not how much they understand.

**Currency grant** (if the campaign uses it)
A quantity of the campaign's in-world currency. Kubernetes Kingdom uses a resource called "Restored Fragments" — shards of the kingdom's archived knowledge that have been recovered. The currency is thematic, not abstract. It is spent at the campaign's optional merchant or trade NPC. Currency is campaign-scoped and does not transfer. (Anti-Pattern 7.8.)

**Item grant**
A specific Item (by Item ID, from the Campaign's Item library) added to the player's inventory. The Item is identified by reference, not by embedding the item definition in the Reward.

**Ability unlock**
A specific Ability (by Ability ID, from the Campaign's Ability library) added to the player's unlockedAbilities. An ability unlock is a significant, rare reward — typically reserved for boss defeats, act completions, or major quest resolutions.

**Story progression flag**
A named flag added to PlayerProgress's `questStates` or a campaign-level story state record. Examples: `"mira-home-restored"`, `"voss-pact-accepted"`, `"warden-spared"`. These flags are the mechanism through which the world remembers (Pillar 2). They do not affect stats. They affect dialogue branches, NPC states, and optional narrative moments.

**HP restoration**
A partial or full restore of the player's currentHP. Typically granted after boss defeats and at act completion moments. Framed in-world as rest, healing, or the kingdom's gratitude.

### What a Reward explicitly does NOT grant

- **Mastery state changes** — no Reward type writes to conceptMasteryStates. Mastery is not rewarded; it is demonstrated. (Anti-Pattern 7.4.) If the engine grants mastery via a reward, the architecture has failed.
- **"Knowledge points" or K-points** — this reward type does not exist and must not be added. (Anti-Pattern 7.4.)
- **Cross-campaign items or XP** — all reward components are scoped to the active campaign. (Anti-Pattern 7.8.)
- **Numerical "understanding rating"** — no reward component expresses the player's comprehension as a score. A reward tells the world that the player acted heroically, not that the player scored 87%.

### Authoring ownership

Rewards are authored inline with the content that triggers them:

| Trigger entity | Where the Reward is authored |
|---|---|
| Quest (stage-scoped) | Inside the Quest definition, as part of its resolution block |
| Quest (campaign-scoped) | Inside the Campaign-scoped Quest, keyed to the step that triggers it |
| Stage completion | Inside the Stage definition, as the Stage's `completionReward` |
| Boss defeat | Inside the Boss definition, as the Boss's `defeatReward` |
| Act completion | Inside the Act definition, as the Act's `completionReward` |
| Story beat (significant) | Inside the StoryBeat definition, as an optional `triggerReward` |

Rewards are never authored in a separate global reward table. They live with the content that earns them. This means a content author writing a boss knows exactly what defeating that boss grants, without consulting a separate system.

### Narrative framing — the adventure vs. grading tension (design resolution)

The way rewards are surfaced to the player is as important as what they contain. A reward that appears as a stat update ("XP +400, Level Up! Knowledge: 87%") is an LMS pattern regardless of what XP represents (Anti-Pattern 7.2).

The resolution is this: **rewards are surfaced as story moments, not stat updates.** The engine delivers rewards through the world, not through a UI panel.

Specific framing rules:

- **XP and level-up:** When the player gains enough XP to level up, the engine does not show a level-up screen. It shows a brief in-world recognition — the flavour moment authored in the ProgressionLevel definition. Lyra might say something. The world might visually shift slightly. The level label appears as a story title, not a number. No XP bar is shown during or after quests.
- **Item grants:** Items appear in the player's hands or pouch, delivered by an NPC or found in the environment. The UI acknowledges receipt in an inventory note (a non-intrusive indicator), not a full-screen reward panel.
- **Ability unlocks:** Ability unlocks are scripted moments — Lyra reconstructs a technique from the recovered scrolls; the player channels the kingdom's restored knowledge. The UI indicates the unlock through combat tutorial context, not through a "New Ability Unlocked!" notification during quest resolution.
- **Story flags:** Story flags are silent. They produce no UI. They are the engine's internal record that the world changed. The player will discover the result of a story flag when an NPC says something new, or a path is passable that wasn't before.
- **Currency grants:** Currency is handed over by an NPC with a line of dialogue or found in the environment. The inventory updates. No floating "+50 Fragments" number.
- **HP restoration:** Framed as rest, a meal provided by a grateful NPC, or a healing object in the environment.

**Rule R-1:** No reward component may produce a numerical display during quest or boss resolution. Numbers appear only in inventory screens and combat UI where they have clear gameplay function. They do not appear in the narrative resolution of story content.

**Rule R-2:** No reward component may produce a "completion certificate" aesthetic — no percentage scores, no stars, no "Grade: A" UI. The player completed a quest. That is the thing that happened. The reward components serve the adventure; they do not evaluate performance.

**Rule R-3:** The absence of a "grade" for a quest does not mean the quest's quality is invisible to the engine. ConceptMastery states track whether the player demonstrated understanding (via challenges within the quest's resolution). But mastery states are not shown at quest completion time as a score. They inform future dialogue branches and traversal gates silently.

### The Mira Stage 2 quest reward — a specific case

When the player completes the quest associated with restoring Mira's family home (Stage 2), what do they receive?

The reward is:
- An **XP grant** (content-authored; the quest is a full learning quest, so the XP value is meaningful)
- A **story progression flag**: `"mira-home-restored"` — this will influence Mira's Stage 5 and Stage 10 dialogue states, and produces one beat in the Final Stage epilogue
- Optionally a small **currency grant** (Sera, the Village Keeper, gives the player a recovered fragment she found in the rubble — framed as gratitude, not payment)
- No item. No ability. No level-up at this exact moment (level-ups are driven by XP thresholds, not individual quest triggers).

How it is delivered:
Mira's home lights up. The two containers reconnect. Mira stands at the doorway. Lyra says nothing for once. The XP grant fires silently. The story flag is written. The village's ambient audio softens. Sera appears a moment later with the fragment. There is no reward screen.

The player feels story resolution. The system records the mechanical consequences. These are not the same moment and should not look like the same moment.

---

## MODEL 4 — Item

### What an Item is

An Item is a collectible, holdable, usable or equippable campaign-scoped object. Items exist in the Campaign's Item library (L1) and are granted to the player through Rewards. They represent the material tokens of the player's adventure — not the depth of their understanding.

Items have four types, each with distinct mechanical rules.

### Item Type 1 — Equipment

**What it is:** Wearable or equippable objects that affect the player's combat presentation and provide minor mechanical modifiers. Examples: a reinforced satchel, a reconstructed shield charm, a commander's insignia.

**Mechanical effect:** Equipment provides combat texture — small modifiers to HP ceiling, ability charge rate, or starting charge — that make the player feel more capable as they progress. They do not affect knowledge challenges. They do not affect mastery detection. A player with the best equipment still fails challenges they do not understand.

**How it is framed:** Equipment names and descriptions are theme-specific (Fantasy: "The Archivist's Binding"; Space: "Lyra's Signal Brace"). The underlying mechanical modifier is theme-invariant (Rule T-1 from Phase 2.1).

**Acquisition:** Equipment is granted via boss defeat rewards and significant quest completions. It is never sold — it is found, earned, or received as gratitude. This preserves adventure framing (Anti-Pattern 7.4: equipment is not a knowledge proxy).

**Rule I-1:** Equipment mechanical effects do not scale with the player's knowledge state. A sword does not deal more damage because the player demonstrated mastery of ConfigMaps. The two tracks are separated even in mechanical effect.

### Item Type 2 — Consumable

**What it is:** Single-use items that are applied in the moment and then gone. Examples: a healing draught, a focus crystal that temporarily increases ability charge gain, a ward-scroll that reduces the next enemy encounter's challenge difficulty by one tier.

**Mechanical effect:** Consumables are used and depleted. They affect the immediate encounter or moment, not the permanent state of PlayerProgress. Consuming a healing draught restores HP. Consuming a focus crystal raises ability charge gain for the duration of the next dungeon room.

**Acquisition:** Found during exploration, purchased with currency, or occasionally granted as minor quest rewards. Consumables are plentiful enough to be useful but not so plentiful that players never feel resource pressure in dungeon sequences.

**Rule I-2:** No consumable may grant mastery or provide XP by being consumed. Consuming a "knowledge scroll" consumable does not grant a ConceptMastery state change. The name "knowledge scroll" is valid as flavour; the mechanical effect must be something other than mastery (e.g., HP restoration, ability charge restoration). Content validation must enforce this.

### Item Type 3 — Key Item

**What it is:** Items that gate traversal or trigger specific world events. They are not equippable and not consumable in the traditional sense — they are held and used in a specific context. Examples: the Warden's Seal (opens a dungeon's sealed gate), a restored scroll fragment (triggers a KnowledgeBeat when brought to Lyra), a forged pass (required to enter a locked region).

**Mechanical effect:** Key items are checked by `hasItem(itemId)` predicates in traversal gates and quest steps. They are "consumed" by the interaction that uses them — or they persist if the quest/gate is designed to keep them (some key items mark permanent access). Whether a key item is consumed on use or retained is authored in the key item's definition.

**Acquisition:** Key items are always quest or story rewards, never random drops. They are authored as part of the quest or region that requires them.

**Rule I-3:** Key items are not a substitute for knowledge gates. A door that requires both the Warden's Seal AND demonstrated mastery of Security is a valid design. A door that requires only the Warden's Seal with no knowledge component violates Pillar 1 unless the item itself represents demonstrated understanding (e.g., Lyra reconstructed the seal because the player explained what the permission model was — in that case, the key item IS the proof of knowledge, just materialised).

### Item Type 4 — Lore Item

**What it is:** Collectible objects with no mechanical effect. Their only function is narrative depth — they are fragments of the kingdom's history, pieces of recovered knowledge, environmental storytelling tokens. Examples: a fragment of the kingdom's original deployment manifest, a corrupted crystal recording Khaosynth's first broadcast, a child's drawing found in Podveil that shows Mira's home before the attack.

**Mechanical effect:** None. Lore items do not affect combat, HP, mastery, or XP. They can be examined to reveal lore text. They are stored in the player's inventory as a collection.

**Why they exist:** Vision §2 ("not a power-accumulation fantasy") and Vision §3.2 (Wonder). Lore items serve exploration curiosity and emotional investment. Finding a lore item rewards a player who looked in a corner they didn't have to look in. The kingdom is denser for them. This satisfies Wonder without providing any power advantage that would undermine the knowledge-as-verb principle.

**Rule I-4:** Lore items must never be required for quest completion or traversal. If a lore item becomes load-bearing (the player must have it to progress), it must be reclassified as a key item.

### Theme rules for Items

Item names and descriptive text are theme-variant. Mechanical effects are theme-invariant (Rule T-1). "The Archivist's Binding" in Fantasy and "Lyra's Signal Brace" in Space provide identical mechanical bonuses. The campaign's Item library holds the base definition (theme-neutral name, mechanical effect) plus ThemeOverride objects for each supported theme.

---

## MODEL 5 — Ability

### What an Ability is

An Ability is a player combat capability unlocked through progression or quest rewards. Abilities represent the player wielding recovered knowledge of the kingdom — they are the materialisation of Pillar 1 (knowledge is the verb) at the combat layer.

Abilities are campaign-scoped (L1). They are defined in the Campaign's Ability library. A player's unlocked abilities do not transfer to another campaign.

### Ability archetypes — four types

The combat system supports four ability archetypes. These are design types, not a rigid classification — a campaign might define all four or only some.

**Sword (offensive):**
A direct-damage ability. Charged by answering challenges correctly. The sword is the knowledge-as-weapon fantasy made literal: the more the player demonstrates understanding, the more force the sword carries. In Kubernetes Kingdom Fantasy theme: a blade of reconstructed knowledge. In Space theme: a coherence beam. The mechanical function (charge from challenges, discharge as damage) is theme-invariant.

**Shield (defensive):**
A damage-mitigation ability. Charged by recognising and correctly identifying knowledge patterns under pressure. In combat, it reduces incoming HP damage from enemy attacks. Framed as the player using understanding to deflect the consequences of misconfiguration — the enemy's attack is a failure mode; the shield is the correct understanding that nullifies it.

**Spell (utility/area):**
A multi-target or environmental effect. In Kubernetes Kingdom: abilities that affect multiple enemies simultaneously, representing the player's understanding of system-wide properties (e.g., a knowledge of networking allows disrupting all network-corruption enemies in an encounter). More complex to charge — requires demonstrating understanding across multiple challenge types or concepts.

**Special (unique):**
Campaign or Act-specific abilities that represent the player's mastery of a particular knowledge domain. Charged by demonstrating deep mastery of a concept rather than completing a single challenge. In Kubernetes Kingdom: "Cluster Insight" — an ability unlocked after the Act 2 boss defeat that lets the player inspect an enemy's knowledge weakness before engaging. Framed as the player's growing systemic understanding giving them strategic foresight.

### Ability charge model

Abilities are charged by correct challenge responses during combat. The charge mechanism is described in detail in the combat system documents. For this content model, the relevant rule is:

**Rule A-1:** Ability charge does not persist between encounters. At the start of each new enemy encounter, ability charge resets to zero. This prevents the player from accumulating charge by grinding and coasting through a boss on prior charge. Every encounter is a fresh demonstration of understanding.

**Rule A-2:** Ability charge is combat-session runtime data, not saved in PlayerProgress between sessions. The saved state is `unlockedAbilities[ ]` (permanent) and `abilityChargeStates[ ]` (current-encounter only, not saved to disk).

**Rule A-3:** Ability charge is not a knowledge score. A fully-charged sword means "the player answered challenges correctly in this encounter." It does not mean "the player understands Pods at a rating of 100%." The charge is a transient combat resource.

### Ability unlock path

Abilities are unlocked in two ways:

1. **ProgressionLevel unlock** — reaching a specific ProgressionLevel unlocks a defined Ability (authored in the ProgressionLevel definition)
2. **Reward unlock** — a Quest or Boss defeat Reward contains an ability unlock component

In Kubernetes Kingdom, the path is roughly:
- Basic sword: available at start (no unlock needed; the player arrives capable of fighting, not yet strong)
- Shield: unlocked by early ProgressionLevel (Stage 1–2 zone)
- Spell: unlocked by boss defeat (Act 1 Boss reward, or mid-Act 2)
- Special: unlocked at Act 2 Boss defeat (earned by progressing through the Orchestration act)

Campaign-specific abilities beyond these four archetypes are possible and are authored as additional Ability definitions in the Campaign library.

---

## MODEL 6 — XP and ConceptMastery — two parallel non-fungible tracks

### The core distinction

These two tracks answer different questions:

| Track | Question it answers | Who writes it | How it changes |
|---|---|---|---|
| XP | "How much has this player done?" | Engine, from Reward grants | Increases via completed quests, boss defeats, exploration events, challenge completion |
| ConceptMastery | "What does this player understand?" | Engine, from challenge outcomes and KnowledgeBeat interaction | Changes state (ENCOUNTERED → DEMONSTRATED → DEEPLY_DEMONSTRATED) via knowledge beats and correct challenge answers |

These are parallel. They both increase over a successful campaign session. But they are not correlated by design — a player can accumulate XP without gaining mastery, and a player can demonstrate mastery without gaining proportional XP.

### How XP is earned (non-exhaustive)

- Completing a stage-scoped quest: XP grant authored in the Quest's Reward
- Defeating a stage boss: XP grant authored in the Boss's Reward
- Completing a dungeon: XP grant authored in the Dungeon's completion Reward
- Defeating enemies: small XP grants authored in the Enemy definitions
- Completing a MiniChallenge: small XP grant
- Exploring an ExplorationPoint for the first time: small XP grant
- Completing a KnowledgeBeat: small XP grant (the XP for reading a scroll comes from doing the adventure, not from the knowledge itself — the distinction is that the XP grant is on the event, not on the concept)

Note that completing a KnowledgeBeat grants a small amount of XP because the player did something in the world. It is NOT awarded as "knowledge XP" — it is awarded as "the player spent time engaging with this region." The concept is not what earns the XP. The act of engagement is.

**Rule XP-1:** No XP grant may be labelled "knowledge XP," "concept XP," or any variant that frames the XP as a measure of understanding. The label matters for content authoring conventions. An XP grant on a KnowledgeBeat is "exploration reward" in authoring terminology, not "learning reward."

### How ConceptMastery is earned

ConceptMastery states are not earned — they are demonstrated. The engine transitions a concept's mastery state when:

1. The player interacts with a KnowledgeBeat for a Concept: state moves to ENCOUNTERED
2. The player answers challenge questions about a Concept correctly (meeting a threshold): state moves to DEMONSTRATED
3. The player demonstrates understanding across multiple challenge types and in a high-stakes context (e.g., correctly answering boss-phase challenges for this concept): state may move to DEEPLY_DEMONSTRATED

ConceptMastery state changes are never triggered by Reward grants. A Reward cannot say "set Pods mastery to DEMONSTRATED." Only gameplay interaction with knowledge content and challenges can change mastery states.

**Rule CM-1:** ConceptMastery transitions are driven by gameplay mechanics (KnowledgeBeat interaction, challenge outcomes), not by content-authored reward components. There is no Reward type that writes a mastery state.

**Rule CM-2:** ConceptMastery is never shown to the player as a number or percentage. It is revealed through the world's response: NPCs with new things to say, paths that become passable, bosses that change behaviour. The player infers their mastery from the world's response, not from a meter.

### The non-fungible guarantee

XP cannot be converted to ConceptMastery. ConceptMastery cannot be converted to XP. They are non-fungible by design.

A content author cannot write: "grant mastery of Pods" as a reward. The field does not exist.
A content author cannot write: "grant 500 XP for demonstrating mastery." They can write "grant 500 XP for completing the mastery-check quest step" — but that XP is for completing the quest step (an adventure action), not for the mastery itself.

This distinction is fine but load-bearing. The XP is always attached to the doing, not the knowing.

---

## MODEL 7 — Reward design tension: adventure vs. grading — resolution

### The tension

Pillar 4 (adventure first) requires that rewards feel like story resolution, not course completion.

Anti-Pattern 7.4 (knowledge as a side stat) prohibits any numeric representation of understanding.

Anti-Pattern 7.2 (LMS UI patterns) prohibits "modules completed" dashboards, progress bars over learning completion, or anything resembling a grade report.

But players still receive XP and items. They still level up. These are visible signs of accumulation. How do they coexist with the adventure-first requirement?

### The resolution

**The resolution is to decouple reward acknowledgement from reward evaluation.**

When a player completes Mira's quest:
- The world changes visibly (Mira's home lights up, her dialogue changes, Lyra looks at the player differently)
- A brief in-world recognition fires (not a UI panel — a world event)
- XP is granted silently (no floating number, no progress bar animation)
- Story flag is written silently
- Optional currency is handed over by an NPC in dialogue

What does NOT happen:
- No quest completion screen
- No XP bar animation
- No "Quest Complete: 400 XP" notification
- No list of "things learned" in this quest
- No mastery percentage
- No star rating for how well the player answered

The player knows the quest is done because the world changed — Mira's home is lit, Sera speaks to them differently, Kestran nods. These are world-responses, not UI-responses.

**The critical framing rule:** rewards are the world recognising the player's actions, not the system evaluating the player's performance. There is no performance to evaluate. There is an adventure that was had, and a world that changed because of it.

This resolves the tension: accumulation is present (XP grows, items accumulate, abilities unlock) but it is surfaced through world-change and inventory-state, not through grade-report UI. The player can check their inventory. They can see their level label. They cannot see their "learning progress." That is the line.

### The Corrupted Warden boss defeat reward — a specific case

The Corrupted Warden (Act 3 Boss, Stage 13 — Security concept) is defeated by the player demonstrating understanding of Kubernetes RBAC and security principles.

The reward:
- A significant **XP grant** (the largest single XP reward in Act 3)
- An **ability unlock**: "Warden's Gaze" — a Special ability that lets the player detect permission vulnerabilities in an enemy before engaging (themed in Fantasy as reading an enemy's corrupted authorisation sigil)
- A **story progression flag**: `"warden-defeated"` — influences Voss's final Stage 13 scene and Kestran's pre-Final Stage briefing
- **HP full restoration** — framed as the Sanctum's corruption lifting; the player can breathe again
- Optionally a **lore item**: the Warden's Broken Seal — the corrupted permission token at the heart of the boss. No mechanical function; a narrative trophy.

How it is delivered:
The Sanctum's walls stop seething. Kestran lowers his weapon. Lyra exhales audibly. The Warden's form disperses — not violently, but quietly, like a misunderstanding corrected. Voss, who has been watching from the shadows, steps forward. He looks at what remains. He says nothing for three seconds. Then: "You actually understood it. I didn't think you would." The ability unlock fires as a tutorial moment — Lyra explains that the player has absorbed something from the Warden's own knowledge. The XP fires silently. The story flag is written. The HP restores as part of the ambient animation of the Sanctum beginning to clear.

No reward screen. The player feels triumph because the world responded to what they did, not because a number went up.

---

## MODEL 8 — Death boundary rules

### What death means in ForgeMinds

Death (HP reaching zero) is a gameplay event, not a narrative event. It means the player's current attempt at the encounter failed. Per Pillar 3: failure teaches, never punishes. "Dying resets position and HP. It never resets understanding."

### What is preserved on death

**Always preserved, regardless of death:**

- **conceptMasteryStates[ ]** — the player's mastery states are never rolled back. A player who demonstrated mastery of Pods before dying still has demonstrated mastery of Pods after the respawn. (Pillar 3 / Anti-Pattern 7.6.)
- **encounteredConcepts[ ]** — all discovered knowledge is preserved. Reading a scroll that the player read before dying is not required again.
- **completedStages[ ]** and **questStates[ ]** (COMPLETED entries) — completed content is never un-completed by death.
- **unlockedAbilities[ ]** — unlocked abilities are permanent and never lost to death.
- **campaign-scoped quest progress** — steps completed in a multi-stage quest are preserved.
- **KnowledgeBeat completion records** — knowledge beats do not reset.

**Preserved between sessions (app close / reopen):**

All of the above, plus:
- **currentLevel** and **currentXP** — level and XP are preserved across sessions.
- **inventory[ ]** — items (including consumables held) are preserved across sessions.
- **lastCheckpointId** — the player resumes from their last checkpoint.

### What resets on death (within session)

**Resets to the last Checkpoint:**

- **currentHP** — resets to the maxHP value for the player's current level
- **abilityChargeStates[ ]** — combat charges reset (per Rule A-2)
- **Position** — the player resumes from the last activated Checkpoint in the current Stage

**Under consideration — items:**

This is a design decision that is not fully resolved but is framed here. Two positions:

- **Position A (no item loss on death):** Items are never lost. Death is a position reset only. This is the most consistent with Pillar 3 and with the "not a power-accumulation fantasy" principle — if items are never lost, the player is not grinding for items, and the emotional weight of loss is absent from item mechanics.
- **Position B (consumables may be lost on death):** Consumables used during the attempt that ended in death are still consumed (they were used; they are gone). Consumables held but not yet used are preserved. This preserves the risk texture of consumable use in dungeons without punishing the player's permanent state.

**Resolution for this model:** Position B is adopted for Kubernetes Kingdom. Consumables used before death are consumed (not restored on respawn). Consumables held but unused are preserved. All other item types (Equipment, Key Items, Lore Items) are never lost to death. This is the death boundary for items.

**Rule D-1:** Death never results in loss of Equipment, Key Items, or Lore Items.
**Rule D-2:** Consumables used before death are consumed. Consumables not yet used are preserved.
**Rule D-3:** Death never results in loss of XP or ProgressionLevel.
**Rule D-4:** Death never results in mastery state rollback.
**Rule D-5:** The player respawns at the last activated Checkpoint. If no Checkpoint has been activated in the current Stage, they respawn at the Stage entry point.

### The ProgressionLevel 8 / Stage 7 mastery gap — a specific case

A player has reached ProgressionLevel 8 but has not demonstrated mastery of Stage 7's primary concept. Is this valid?

**Yes, this is a valid and expected state.** It means the player has been active in the world — completing quests, exploring, fighting enemies, reaching the Stage 7 region — but the Stage 7 concept has not clicked yet. They may have encountered it (ENCOUNTERED state) without demonstrating it (DEMONSTRATED state not yet reached).

**What the system does:**

- The player's ProgressionLevel is not rolled back. They are Level 8. That is the record of what they have done.
- Stage 7's mastery-gated content does not activate for them. Certain dialogue branches (NPC knowledge-gated states), certain traversal options, and the Stage 7 quest's understanding-branch remain inaccessible.
- The Stage 7 Boss remains available to attempt (bosses are not locked by mastery — they are the mastery-validation event). Failing the boss provides the teaching feedback that Pillar 3 requires.
- The system does not flag this state as an error or anomaly. It is normal. Some players will race through the XP curve and hit the boss before they fully understand the concept. The boss fight is the moment of reckoning.

**What the system does NOT do:**

- It does not pop a notification: "Your knowledge of Stage 7 is incomplete."
- It does not reduce the player's level.
- It does not block the player from progressing in other areas.
- It does not show the player a "mastery gap report."

The world reflects this gap through closed doors and unchanged NPC dialogue. The player encounters the world's response without being lectured about it.

---

## OWNERSHIP MATRIX (Phase 2.6 additions)

| Entity | Owned by | Level |
|---|---|---|
| ProgressionLevel | Campaign | L1 |
| Item (all types) | Campaign | L1 |
| Ability | Campaign | L1 |
| Reward (stage) | Stage | L2 |
| Reward (quest — stage-scoped) | Quest | L3 |
| Reward (quest — campaign-scoped) | Campaign Quest | L2 (within Campaign) |
| Reward (boss) | Boss | L2 or L1 (for Act Boss) |
| Reward (act completion) | Act | L1 |
| PlayerProgress | Engine / Runtime | Not static content |

---

## DEPENDENCY MATRIX (Phase 2.6 additions)

| Entity | Depends on (references) |
|---|---|
| ProgressionLevel | Ability[ ] (unlock references), Item[ ] (unlock references) |
| Reward (any) | Item[ ] (grant), Ability (unlock), StoryFlag (named, campaign-defined) |
| Item | Campaign (scoping); ThemeOverride (for theme-variant name/description) |
| Ability | Campaign (scoping); ThemeOverride (for theme-variant name/description); ProgressionLevel or Reward (unlock path) |
| PlayerProgress | ProgressionLevel[ ] (to resolve currentLevel from currentXP), Concept[ ] (mastery state keys), Quest[ ] (state keys), Item[ ] (inventory refs), Ability[ ] (unlock refs), Checkpoint (lastCheckpointId) |

---

## LIFECYCLE MATRIX (Phase 2.6 additions)

| Entity | States | Notes |
|---|---|---|
| ProgressionLevel | Bound to Campaign | Authored in Campaign DRAFT; fixed on Campaign PUBLISHED; archived on Campaign RETIRED |
| Item | Bound to Campaign | Authored in Campaign DRAFT; fixed on Campaign PUBLISHED; retained in archived form for save state integrity on Campaign RETIRED |
| Ability | Bound to Campaign | Same as Item |
| Reward (component) | Bound to parent content entity | A Quest's Reward lives and dies with the Quest |
| PlayerProgress | Active during play session | Created on campaign start; updated continuously; persisted on session close; archived on campaign completion |

---

## REUSE RULES (Phase 2.6 additions)

| Entity | Reuse rule |
|---|---|
| ProgressionLevel | Reusable within one campaign only. Level 5 "Village Protector" applies to all stages in Kubernetes Kingdom. Not reusable across campaigns. A future campaign authors its own ProgressionLevels with their own names and thresholds. |
| Item | Reusable within one campaign (an Item can be granted as a reward in multiple quests or stages). Not reusable across campaigns. |
| Ability | Reusable within one campaign. An Ability unlocked in Act 1 persists through Act 3. Not reusable across campaigns. |
| Reward (as a template) | Reward *patterns* can be used as content authoring templates. Reward instances are specific to the content entity that authors them. |
| PlayerProgress | Never reused. One per player per campaign. On campaign restart (new game), a fresh PlayerProgress record is created. |

---

## VALIDATION RULES (Phase 2.6 additions)

### ProgressionLevel validation

- [ ] ProgressionLevel thresholds form a strictly increasing sequence (no two levels share an XP threshold)
- [ ] Every Ability referenced in a ProgressionLevel unlock exists in the Campaign's Ability library
- [ ] Every Item referenced in a ProgressionLevel unlock exists in the Campaign's Item library
- [ ] ProgressionLevel count is at least 1; the sequence begins at XP = 0

### Item validation

- [ ] Every Item has a defined type (equipment / consumable / key item / lore item)
- [ ] No consumable Item has a mechanical effect that writes a ConceptMastery state (Anti-Pattern 7.4 enforcement)
- [ ] Every Key Item referenced in a traversal gate or quest step exists in the Campaign's Item library
- [ ] Every Item has theme-variant name and description for every Theme the Campaign supports (Rule T-2 from Phase 2.1)

### Ability validation

- [ ] Every Ability has a defined archetype (sword / shield / spell / special)
- [ ] Every Ability referenced in a Reward or ProgressionLevel unlock exists in the Campaign's Ability library
- [ ] Every Ability has theme-variant name and description for every Theme the Campaign supports

### Reward validation

- [ ] No Reward component includes a mastery-state-change directive (Rule CM-1)
- [ ] No Reward component is typed as "knowledge XP" or any knowledge-measurement variant (Rule XP-1 / Anti-Pattern 7.4)
- [ ] Every Item referenced in a Reward grant exists in the Campaign's Item library
- [ ] Every Ability referenced in a Reward unlock exists in the Campaign's Ability library
- [ ] Every Reward has a defined trigger (the content entity that contains it is the trigger; this is an authoring sanity check — a Reward with no parent content entity is orphaned and invalid)

### PlayerProgress validation (runtime checks, not content validation)

- [ ] currentLevel is consistent with currentXP against the Campaign's ProgressionLevel sequence
- [ ] No ConceptMastery state in conceptMasteryStates[ ] references a Concept not in the Campaign's referenced Concept list
- [ ] All Item IDs in inventory[ ] reference valid Campaign-level Item definitions

---

## UNRESOLVED DECISIONS FOR PHASE 2.8

| ID | Decision | Impact | Phase |
|---|---|---|---|
| D-CA-09 | Exact XP values for each quest/boss/stage reward in Kubernetes Kingdom | Affects pacing, level-up timing, and balance. Must be authored per reward and validated against the stage sequence. | Phase 2.8 / Content authoring |
| D-CA-10 | Whether currency (Restored Fragments) is included in Kubernetes Kingdom v1 or deferred | Adds merchant / trade NPC design requirements. If included, the optional merchant NPC needs to be designed and scoped. | Phase 2.8 (human input) |
| D-CA-11 | Consumable loss on death — is Position B (consumables used before death are consumed, held consumables preserved) the right balance? | If the campaign leans toward fewer consumables overall, the distinction may not matter enough to design around. | Phase 2.8 (human input) |
| D-CA-12 | Maximum inventory size | Does the player have infinite inventory (no cap, no burden) or a soft cap that creates occasional choices? The vision ("not a power-accumulation fantasy") suggests unlimited inventory is safer, but this needs confirmation. | Phase 2.8 (human input) |
| D-CA-13 | Ability charge carry-over on dungeon floor transition | Does ability charge reset between dungeon rooms, or only between combat encounters? Finer-grained than Rule A-1 — needs combat system design input. | Phase 2.8 / Combat system phase |
| — | ProgressionLevel count and XP curve for Kubernetes Kingdom | 14 levels, or more granularity? Affects how often the adventure fantasy of "levelling up" fires. | Phase 2.8 (human input) |

---

## Cross-references

- `content-architecture/ai-phase-02-01-content-hierarchy.md` — §11 (Progression-specific content), Rules P-1 through P-3
- `content-architecture/ai-phase-02-02-campaign-act-stage-model.md` — Campaign model (ProgressionLevel, Item, Ability ownership)
- `content-architecture/ai-phase-02-03-quest-npc-castmember-model.md` — Quest Reward authoring, mastery condition references
- `game-design/ai-vision.md §2` — player fantasy (not power-accumulation); §3.2 (Wonder — lore items serve this); §3.5 (Triumph — boss defeat reward framing); §4 Pillars 3–4; §7.4 (Anti-Pattern: knowledge as stat); §7.8 (Anti-Pattern: cross-game progression)
- `milestones/milestone-02-content-architecture/ai-phase-plan.md §Phase 2.6` — this phase's objective and validation criteria
- `ai-phase-02-04-knowledge-challenge-model.md` *(not yet written)* — ConceptMastery state definitions that PlayerProgress depends on
- `ai-phase-02-05-enemy-boss-model.md` *(not yet written)* — Boss defeat Reward authoring location
