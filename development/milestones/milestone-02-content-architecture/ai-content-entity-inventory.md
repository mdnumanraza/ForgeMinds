# Content Entity Inventory

> **Purpose:** Complete list of every content entity required by ForgeMinds, grouped logically. This is the input to Phase 2.1 (Content Hierarchy) — it answers "what exists?" before Phase 2.1 answers "how does it relate?"
> **Status:** v1 — derived from campaign design and gameplay loop. Add to this list if new entity types are discovered during Phase execution.
> **Owned by:** AI

---

## How to read this document

Each group contains entity types. For each entity:

- **Description** — what it is in one line
- **Campaign design source** — where it appears in existing docs (confirms it is real, not speculative)
- **Platform or campaign-scoped** — does this exist at the ForgeMinds platform level, or is it specific to one campaign?
- **Theme-variant required** — does this entity have visible text/names that differ between Fantasy and Space themes?

---

## Group 1 — Campaign Structure

These entities form the top-level containers.

### Platform
- **Description:** The ForgeMinds game platform. The root entity. Owns all campaigns.
- **Source:** `ai-vision.md §1` — "ForgeMinds is a platform rather than a single game"
- **Scope:** Platform
- **Theme-variant:** No

### Campaign
- **Description:** A self-contained game covering one technical domain (Kubernetes Kingdom, Linux Realms, etc.). Has its own progression scope, themes, and cast.
- **Source:** `ai-campaign-structure.md` — Kubernetes Kingdom is one campaign instance
- **Scope:** Platform (there will be multiple campaigns)
- **Theme-variant:** Yes — campaign has theme-specific title, world name, lore framing

### Act
- **Description:** A narrative grouping of stages sharing an emotional register and a progression phase (Discovery, Responsibility, Mastery).
- **Source:** `ai-campaign-structure.md §Act map` — three acts + Final
- **Scope:** Campaign
- **Theme-variant:** Possibly — act names may vary by theme (e.g., "The Hollow Kingdom" vs "The Broken Cluster")

### Stage
- **Description:** A single region tied to one primary technical concept. Contains all 9 beat types. The main unit of campaign content.
- **Source:** `ai-campaign-structure.md` — 14 stages, each with defined concept, story, NPCs, enemies, dungeon, boss
- **Scope:** Campaign
- **Theme-variant:** Yes — region name, story framing, NPC names differ between themes; concept and challenges do not

### Portal
- **Description:** The transition event that closes a stage and opens the next. Contains story beat and unlock logic.
- **Source:** `ai-gameplay-loop.md §3` — "Portal as ritual"; `ai-campaign-structure.md` — each stage has a portal transition
- **Scope:** Stage
- **Theme-variant:** Yes — portal description differs by theme; unlock condition does not

---

## Group 2 — Characters

### CastMember (Recurring)
- **Description:** A named character who appears in multiple stages and has a campaign-arc. Has a defined role, personality, arc trajectory, and stage-by-stage appearance list.
- **Source:** `ai-campaign-structure.md §Recurring Cast` — Lyra, Kestran, Voss, Mira, Khaosynth
- **Scope:** Campaign
- **Theme-variant:** Possibly — character name and visual description may vary; personality, arc, and dialogue tone do not

### NPC (Local)
- **Description:** A named character scoped to one stage. Has a role, personality, and quest hook. Appears in 1–3 instances per stage.
- **Source:** `ai-campaign-structure.md` — every stage has 1–3 local NPCs with defined role and personality
- **Scope:** Stage
- **Theme-variant:** Yes — NPC name, occupation title, and contextual lore differ by theme; role and quest hook do not

### DialogueState
- **Description:** A specific version of an NPC's dialogue tied to a story condition (pre-quest, mid-quest, post-quest, post-stage-completion, knowledge-gated, etc.).
- **Source:** `ai-vision.md §4 Pillar 2` — "NPCs whose dialogue evolves across quest states"; `ai-campaign-structure.md` — multiple characters have state-specific dialogue
- **Scope:** NPC / CastMember
- **Theme-variant:** Yes — dialogue text differs by theme

### DialogueLine
- **Description:** A single line or short exchange within a DialogueState. Smallest unit of spoken content.
- **Source:** Implied by all NPC dialogue in `ai-campaign-structure.md`
- **Scope:** DialogueState
- **Theme-variant:** Yes

---

## Group 3 — Knowledge System

### Concept
- **Description:** A technical concept the player can discover and demonstrate (e.g., "what a Pod is", "how a Deployment maintains desired state"). The atomic unit of learning content.
- **Source:** `ai-vision.md §5` — "every piece of knowledge must be discoverable through play"; `ai-campaign-structure.md` — each stage teaches one primary concept
- **Scope:** Platform (concepts exist across campaigns — "container" is a concept in Kubernetes Kingdom AND in Docker Dominion)
- **Theme-variant:** No — the concept definition is theme-neutral; only its in-world representation varies

### KnowledgeBeat
- **Description:** A discrete moment of knowledge discovery — a scroll, a crystal, an NPC revealing a concept, a dungeon reveal. Contains the concept content in small, chunked form.
- **Source:** `ai-gameplay-loop.md §1b` — "learning panel opens → read small chunk"; `ai-campaign-structure.md` — knowledge discovery breakdown per stage (4–7 beats per stage)
- **Scope:** Stage
- **Theme-variant:** Yes — the in-world framing (scroll text, NPC speech) differs by theme; the concept content (definition, example, command) does not

### KnowledgePanel
- **Description:** The content displayed in a single knowledge beat panel. Has a title, body text (chunked to ≤5 lines), optionally an analogy, example, or command.
- **Source:** `prompts/prompt2.md §Knowledge Discovery` — "simple explanation, real-world analogy, technical definition, examples, commands, practical use cases, important notes"
- **Scope:** KnowledgeBeat
- **Theme-variant:** Yes — body text framing differs by theme; technical content does not

### ConceptMastery
- **Description:** A record of a player's demonstrated understanding of a concept. Binary per dimension (encountered, demonstrated via challenge, applied via quest, validated via boss). Not a stat — a state.
- **Source:** `ai-vision.md §4 Pillar 1`, `ai-vision.md §7.4` (anti-pattern: knowledge as side stat)
- **Scope:** Player (runtime, not static content — but the mastery dimensions must be defined in the Concept model)
- **Theme-variant:** No

---

## Group 4 — Challenge System

### Challenge
- **Description:** A deterministic question or task the player must answer to power an ability, open a gate, or advance a quest. Has a type, a concept reference, a correct answer, and distractors/alternatives.
- **Source:** `prompts/prompt2.md §Knowledge Combat System` — MCQ, command completion, code recognition, scenario, debugging, matching, ordering
- **Scope:** Platform-level type definition; instance scoped to campaign or concept pool (TBD — D-CA-06)
- **Theme-variant:** The challenge wrapper (framing text) may differ by theme; the correct answer, distractors, and concept linkage do not

### ChallengeType (enum)
- **Description:** The form of the challenge. One of: MCQ, CommandCompletion, CodeRecognition, Scenario, Debugging, Matching, Ordering.
- **Source:** `prompts/prompt2.md §Knowledge Combat System`, `ai-vision.md §7.5` (anti-pattern: subjective challenges rejected)
- **Scope:** Platform
- **Theme-variant:** No

### ChallengeSet
- **Description:** A curated collection of challenges associated with a concept, difficulty tier, or stage context. Used by enemies, dungeons, and bosses to draw from.
- **Source:** Implied by boss multi-phase design — Isolation Wyrm uses challenges from all 4 Act 1 concepts
- **Scope:** Campaign or Concept (TBD — D-CA-06)
- **Theme-variant:** No

---

## Group 5 — Quests

### Quest
- **Description:** A structured task given to the player by an NPC or triggered by world exploration. Has a trigger, steps, resolution conditions (branching on understanding), and rewards.
- **Source:** `ai-gameplay-loop.md §3` — "Quests: the concept is applied to a small problem someone has"; `ai-campaign-structure.md` — quest examples per stage
- **Scope:** Stage (most quests) or Campaign (multi-stage quests like Mira's arc)
- **Theme-variant:** Yes — quest title, NPC speech, and context framing differ by theme; resolution conditions and rewards do not

### QuestStep
- **Description:** A single objective within a quest (explore the area, find the scroll, defeat the enemy, return to NPC).
- **Source:** `prompts/prompt2.md §Quest System` — "player explores, finds scrolls, learns, encounters, defeats, returns"
- **Scope:** Quest
- **Theme-variant:** Yes — step description text differs by theme

### QuestResolutionCondition
- **Description:** A condition that determines how a quest resolves — can reference player's concept mastery state, inventory, story flags, or NPC dialogue choices.
- **Source:** `ai-vision.md §5.2` — "quest solutions branch on player's understanding, not inventory"; `ai-gameplay-loop.md §3`
- **Scope:** Quest
- **Theme-variant:** No

---

## Group 6 — Enemies

### Enemy
- **Description:** A corrupted creature that represents a failure mode of a K8s concept. Has a concept reference, encounter context, challenge configuration, and narrative role.
- **Source:** `ai-campaign-structure.md` — 2–3 enemy types per stage, each with a named concept linkage
- **Scope:** Campaign (enemies are campaign-specific, but their concept linkage is platform-level)
- **Theme-variant:** Yes — enemy name and visual description differ by theme; concept linkage and challenge refs do not

### EncounterTrigger
- **Description:** The world condition that causes an enemy encounter to begin (walking into a zone, interacting with a corrupted object, NPC quest step, dungeon traversal).
- **Source:** `ai-gameplay-loop.md §1c` — "encounter triggers"; Anti-Pattern 7.1 (must be world-event triggered, never "click to begin combat")
- **Scope:** Enemy instance / Stage
- **Theme-variant:** No

### MiniChallenge
- **Description:** A challenge that is not part of standard combat — given by an NPC, found in the environment, or presented as a dungeon puzzle. Different from a combat Challenge in that failure has no HP cost.
- **Source:** `ai-gameplay-loop.md §3` — "Mini-challenges: the concept is bent and recombined in new ways"; `ai-campaign-structure.md` — mini-challenge examples per stage
- **Scope:** Stage
- **Theme-variant:** Yes — framing text differs by theme; challenge content does not

---

## Group 7 — Dungeons and Bosses

### Dungeon
- **Description:** The structured deeper zone within a stage. Contains escalating encounters, hidden knowledge, a mini-boss, and leads to the stage boss.
- **Source:** `ai-gameplay-loop.md §3` — "Dungeon: the concept's harder edges and depth"; every stage in `ai-campaign-structure.md`
- **Scope:** Stage
- **Theme-variant:** Yes — dungeon name and lore framing differ by theme

### MiniBoss
- **Description:** A named mid-dungeon encounter that is harder than standard enemies and may introduce a mechanic variation. Distinct from the stage boss.
- **Source:** `ai-campaign-structure.md` — each dungeon has a named mini-boss (Silo Hulk, Warren Knot, etc.)
- **Scope:** Dungeon
- **Theme-variant:** Yes — name and visual description differ by theme

### Boss
- **Description:** The stage or act boss. Validates mastery by combining multiple concepts. Has phases, concept requirements, a mechanic concept, and a narrative role.
- **Source:** `ai-campaign-structure.md` — every stage and act has a boss with defined narrative role and mechanic concept; `ai-gameplay-loop.md §3`
- **Scope:** Stage or Act (act bosses are shared across multiple stages)
- **Theme-variant:** Yes — boss name and lore framing differ by theme; phases, concept requirements, and mechanics do not

### BossPhase
- **Description:** A single phase of a multi-phase boss fight. References the concept being tested, the challenge configuration, and the transition condition to the next phase.
- **Source:** `ai-campaign-structure.md` — Isolation Wyrm (4 phases), Severed Envoy (4 phases), Corrupted Warden (multi-layer)
- **Scope:** Boss
- **Theme-variant:** No (phase descriptions may have minor theme text, but mechanics are theme-neutral)

---

## Group 8 — Progression and Rewards

### PlayerProgress
- **Description:** The runtime record of a player's state within a campaign: current stage, completed quests, discovered knowledge beats, demonstrated concept mastery, inventory, HP/level.
- **Source:** `ai-gameplay-loop.md §5` — "knowledge state preserved across death"; Anti-Pattern 7.8 (per-campaign scope)
- **Scope:** Player × Campaign (runtime, not static content — but schema must define its structure)
- **Theme-variant:** No

### ProgressionLevel
- **Description:** A player level defined for a campaign — a milestone marker as the player advances through stages. Has an XP threshold and optional unlock (ability, item, dialogue branch).
- **Source:** `prompts/prompt2.md §Progression System` — "player gains XP, levels, coins, equipment, abilities"
- **Scope:** Campaign
- **Theme-variant:** No (level thresholds are mechanical; any associated flavour text is theme-variant)

### Reward
- **Description:** Something the player receives upon completing a quest, defeating a boss, or reaching a milestone. Types: XP, currency, item, ability, story progression flag.
- **Source:** `prompts/prompt2.md §Quest System` — "reward: XP, coins, items, progression"
- **Scope:** Quest / Boss / Stage
- **Theme-variant:** Partially — reward item names differ by theme; XP/currency values do not

### Item
- **Description:** A collectible object with a type (equipment, consumable, key item, lore item) and optional mechanical effect. Equipment provides combat texture; key items gate traversal; lore items have no mechanical effect.
- **Source:** `ai-campaign-structure.md` — items referenced as dungeon rewards; `ai-vision.md §3` (anti-pattern: power-accumulation greed rejected — items serve narrative, not accumulation)
- **Scope:** Campaign
- **Theme-variant:** Yes — item name, description, and visual tag differ by theme; mechanical effect does not

### Ability
- **Description:** A player combat capability (sword, shield, spell, special). Powered by knowledge. Has a base power and a charge mechanic linked to challenge performance.
- **Source:** `prompts/prompt2.md §Boss Combat Idea` — "sword, shield, spell, special ability"; `ai-gameplay-loop.md §1c`
- **Scope:** Campaign
- **Theme-variant:** Yes — ability name and description differ by theme; charge mechanics do not

---

## Group 9 — World and Environment

### Region
- **Description:** The visual and navigational container for a stage. Has a type (village, forest, ruins, cave, etc.), environmental description, and explorable areas.
- **Source:** `ai-campaign-structure.md` — every stage has a region type
- **Scope:** Stage
- **Theme-variant:** Yes — region name and visual description differ heavily by theme

### ExplorationPoint
- **Description:** A specific interactive location within a region — where a knowledge beat, NPC, chest, or environmental story beat is placed.
- **Source:** `ai-gameplay-loop.md §1a` — "every screen has at least one thing worth approaching"; `ai-vision.md §3.2 Wonder`
- **Scope:** Region
- **Theme-variant:** Yes — description differs by theme

### EnvironmentalStory
- **Description:** A non-interactive world detail that conveys lore or character history without triggering a quest or knowledge beat (a broken cradle, a half-finished repair, a note on a wall).
- **Source:** `ai-vision.md §3.4 Empathy` — "environmental storytelling that pre-dates the player"; `ai-campaign-structure.md` — multiple such details per stage
- **Scope:** Region
- **Theme-variant:** Yes

---

## Group 10 — Themes

### Theme
- **Description:** A visual and narrative skin for a campaign. Has an ID, a display name, and a set of field overrides applied to theme-variant entities.
- **Source:** `ai-campaign-structure.md §Campaign Shape` — Fantasy Kingdom + Space Galaxy; `ai-vision.md §6 Tier C`
- **Scope:** Platform (themes are reusable across campaigns — a future campaign might also use Fantasy Kingdom)
- **Theme-variant:** N/A (Theme IS the theming system)

### ThemeOverride
- **Description:** A set of field-value replacements for a specific entity instance in a specific theme. Applied on top of the theme-neutral content.
- **Source:** `ai-campaign-structure.md §Theme System` — "Pods → magical summons (Fantasy) / habitat modules (Space)"
- **Scope:** Theme × Entity
- **Theme-variant:** N/A

---

## Group 11 — Story and Cutscenes

### StoryBeat
- **Description:** A scripted narrative moment — an NPC line, a cutscene trigger, a world event description — that advances the story without being a quest or a knowledge beat.
- **Source:** `ai-campaign-structure.md` — portal transitions, stage arrivals, intercept moment in Stage 13
- **Scope:** Stage / CastMember
- **Theme-variant:** Yes

### CutsceneEvent
- **Description:** A non-interactive scripted sequence (boss introduction, act transition, final epilogue). Has a trigger condition, a sequence of events, and a completion flag.
- **Source:** `ai-campaign-structure.md` — Khaosynth intercept in Stage 13; Final Stage movements; Mira epilogue
- **Scope:** Campaign / Stage
- **Theme-variant:** Yes — dialogue and descriptions differ by theme; trigger conditions and sequence logic do not

---

## Group 12 — Platform / Save

### SaveState
- **Description:** A snapshot of a player's full progress state: campaign, stage, quests, knowledge, inventory, HP, last checkpoint.
- **Source:** `ai-gameplay-loop.md §2` — checkpoint discipline; "failure never erases learning"; `ai-vision.md §4 Pillar 3`
- **Scope:** Player × Campaign
- **Theme-variant:** No

### Checkpoint
- **Description:** A defined save point within a stage — after a major beat completion (quest complete, dungeon cleared, boss defeated). Never mid-beat.
- **Source:** `ai-gameplay-loop.md §2` — "no mid-beat saves"; "saving lands after exploration completes, after combat resolves"
- **Scope:** Stage
- **Theme-variant:** No

---

## Summary counts

| Group | Entity types |
|---|---|
| Campaign Structure | 5 |
| Characters | 4 |
| Knowledge System | 4 |
| Challenge System | 3 |
| Quests | 3 |
| Enemies | 3 |
| Dungeons and Bosses | 4 |
| Progression and Rewards | 5 |
| World and Environment | 3 |
| Themes | 2 |
| Story and Cutscenes | 2 |
| Platform / Save | 2 |
| **Total** | **40 entity types** |

---

## Entities deliberately excluded from v1 scope

These were considered and excluded. They may become relevant in later milestones or future campaigns:

| Excluded entity | Reason |
|---|---|
| Achievement / Trophy | Out of scope for v1 per `ai-vision.md §8` (no social features) |
| Leaderboard entry | Same |
| Multiplayer session | Same |
| Crafting recipe | Not part of the ForgeMinds item/reward model |
| Skill tree node | Progression is per-campaign XP + levels; no branching skill tree in v1 |
| Faction / Reputation | Not part of Kubernetes Kingdom design; potential future campaign feature |
| World map tile | Rendering concern, not content concern; belongs to Milestone 07 |
| Audio cue | Asset concern; belongs to Milestone 05 |
| Particle effect | Same |
