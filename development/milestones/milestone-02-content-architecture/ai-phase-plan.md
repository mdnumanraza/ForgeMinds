# Milestone 02 — Phase Plan

> **Purpose:** Detailed execution plan for each phase. Future sessions can execute any phase from this document without needing to rediscover context.
> **Status:** Planning complete. Phase 2.1 is the first to execute.
> **Owned by:** AI

---

## How to use this document

Each phase section includes:
- **Objective** — what this phase answers
- **Input** — what must exist before this phase runs
- **Deliverable** — the specific output (file + content description)
- **Key questions** — the design questions this phase must resolve
- **Constraints** — decisions from upstream documents that bound this phase
- **Validation** — how to know this phase is complete
- **Critical decisions** — architecture choices that must be made in or before this phase

---

## Phase 2.1 — Content Hierarchy

**Objective:** Define the ownership tree — what owns what — at every level of ForgeMinds content. This is the skeleton everything else attaches to.

**Input:** `ai-campaign-structure.md`, `ai-gameplay-loop.md`

**Deliverable:** `content-architecture/ai-overview.md` — updated with the full content hierarchy as a tree diagram plus a one-line description of each level.

**Key questions:**
- What is the top-level container? (Platform → Campaign → Act → Stage → ?)
- Does an "Act" exist as a content entity, or is it a grouping convenience?
- Who owns quests — the Stage, or a shared pool? (A quest tied to Stage 7 cannot appear in Stage 3; but a side quest might span stages.)
- Who owns NPCs — the Stage, or the Campaign? (Recurring cast members appear across many stages; local NPCs are stage-specific.)
- Who owns enemies — the Stage, or a shared pool the Stage draws from?

**Constraints:**
- 14 mandatory stages + 3 expandable + 1 Final; structure must accommodate optional stages without a structural change
- 5 recurring cast members appear across multiple stages; their ownership cannot be stage-level
- Knowledge Doctrine: every entity at stage level or below must be relatable to a K8s concept (or explicitly marked as narrative-only)

**Validation:**
- [ ] Every content type from `ai-content-entity-inventory.md` appears somewhere in the hierarchy
- [ ] The hierarchy works for both Kubernetes Kingdom and a hypothetical Linux Realms campaign without modification
- [ ] Recurring cast is clearly distinguished from local NPCs in the hierarchy

**Critical decision for this phase:**
> **D-CA-01: Does "Act" exist as a data entity?**
> Acts are load-bearing narrative containers (Act 1/2/3 have different emotional registers, different content densities, different boss structures). If Acts are just grouping labels on Stages, the model is simpler but loses act-level metadata. If Acts are full entities, the model can store act-level narrative hooks but adds complexity.
> *Recommend: Acts as lightweight entities with minimal required fields (id, label, narrativeTheme, stageRefs[]) — enough to support act-level logic without overbuilding.*

---

## Phase 2.2 — Campaign + Act + Stage Model

**Objective:** Define the conceptual model for the three highest-level containers: Campaign, Act, Stage. These are the backbone of every future campaign.

**Input:** Phase 2.1 hierarchy, `ai-campaign-structure.md`

**Deliverable:** `content-architecture/ai-campaigns-schema.md` and `content-architecture/ai-stages-schema.md` — updated from stubs to full conceptual models (entity description, required fields, optional fields, relationships, theme-variant fields, invariants).

> Note: Do not write JSON/TypeScript yet. Describe the model in plain language with field names and types noted informally.

**Key questions:**
- What fields does a Campaign require vs. support optionally? (ID, title, theme list, act list, player progression scope, etc.)
- What fields does a Stage require? The 9-beat arc defines beat types, but which are required vs. optional?
- How are the 3 expandable regions marked as optional without creating a separate "optional stage" type?
- How does a Stage declare which K8s concept it teaches? (A single concept field? A list? A primary + supplementary split?)
- How does the Stage schema support different visual/story skins per theme without forking the stage?

**Constraints:**
- 9-beat arc: Arrival, Exploration, Discovery, Quests, Encounters, Mini-challenges, Dungeon, Boss, Portal. Stage schema must accommodate all 9 as named slots — not a generic `content[]` array.
- Platform-agnostic: "Kubernetes" must not appear as a hardcoded concept in the Stage schema. The stage concept is a reference to a concept ID in the knowledge system.
- Theme invariance: `ai-vision.md §6 Tier C` — same stage in Fantasy and Space produces identical emotional beats. Schema must enforce this structurally.

**Validation:**
- [ ] Can Kubernetes Kingdom Stage 2 (Podveil Village, Pods) be fully described using this model?
- [ ] Can a hypothetical Linux Realms Stage 1 be described using the same model without modification?
- [ ] Is there a clear path for marking a stage as "expandable/optional" without a separate entity type?

**Critical decisions for this phase:**
> **D-CA-02: How are K8s concepts referenced in stages?**
> Option A: Stage has a `primaryConcept: ConceptID` field. Clean, simple, but limits stages to one concept.
> Option B: Stage has `concepts: ConceptID[]` with a `primaryConceptIndex`. Supports multi-concept stages (like the Final Stage) without a special case.
> *Recommend: Option B — the Final Stage and act-boss stages inherently span multiple concepts.*

> **D-CA-03: Required vs optional beats in the 9-beat arc**
> The 9-beat arc is a design principle, not a hard constraint for every stage. The Final Stage, for example, has no "Portal" beat. Should the schema enforce all 9 beats as required, or treat them as optional named slots with validation rules?
> *Recommend: Named optional slots with a `requiredBeats[]` field on the Campaign that specifies which beats are mandatory for this campaign's stage type. Kubernetes Kingdom mandates all 9 except Portal on the Final Stage.*

---

## Phase 2.3 — Quest + NPC Model

**Objective:** Define the conceptual model for quests and NPCs — the two most relationship-dense entity types in ForgeMinds.

**Input:** Phase 2.2 model, `ai-campaign-structure.md` (NPC descriptions, quest examples), `ai-vision.md §4 Pillar 2` (world remembers)

**Deliverable:** `content-architecture/ai-quests-schema.md` and `content-architecture/ai-npcs-schema.md` — updated from stubs to full conceptual models.

**Key questions:**
- How many dialogue states does an NPC need? (Minimum: pre-quest, mid-quest, post-quest. But Lyra has ~15 stage appearances with different states each time.)
- How is the recurring cast distinguished from local NPCs in the data model? Are they the same entity type with a `recurring: true` flag, or a separate type entirely?
- What is the quest lifecycle? (Available → Active → Completed → Failed → Optional branches?)
- Can a quest span multiple stages? (Some quests in the campaign design are stage-contained; others like Mira's arc span stages 2 → 5 → 10 → Final.)
- How does quest branching work? (A quest that ends differently based on what the player understood vs. guessed — is branching a tree structure, a condition check, or a state machine?)
- How do NPCs and quests reference each other? (An NPC gives a quest; completing the quest changes the NPC's dialogue state.)

**Constraints:**
- Pillar 2 (world remembers): NPC dialogue must evolve. Schema must support at minimum pre/mid/post-quest states. Recurring cast requires more.
- Knowledge Doctrine: quest solutions must be able to branch on player's understanding. This is a schema-level requirement — the quest must have a `resolutionCondition` that can reference a knowledge state.
- Anti-Pattern 7.7 (gameplay-narrative disconnect): every quest must have a story reason. Schema should have a required `narrativeContext` field to enforce this.

**Validation:**
- [ ] Can Lyra's full arc (15+ stage appearances, evolving dialogue, shifting relationship to player) be represented using this model?
- [ ] Can a quest that ends differently for a player who understood vs. one who guessed be represented?
- [ ] Can a quest that spans three stages (Mira: Stage 2 → 5 → 10) be represented without duplicating NPC data?

**Critical decisions for this phase:**
> **D-CA-04: Embedded vs referenced NPC dialogue**
> Option A: Dialogue states are embedded in the NPC object. Simple to load; one file per NPC. But for Lyra with 30+ dialogue states across 15 stages, the NPC file becomes very large.
> Option B: Dialogue states are separate objects referenced by ID. NPC file stays small; dialogue objects can be loaded on demand. More indirection.
> *This decision has significant authoring and engine implications. Defer to Phase 2.8 (Critical Decisions Review) with both options fully described.*

> **D-CA-05: Recurring cast as type or flag**
> Option A: Recurring cast (Lyra, Kestran, Voss, Mira, Khaosynth) are a separate entity type `CastMember` with a campaign-level roster. Local NPCs are a separate `NPC` type scoped to a stage.
> Option B: All characters are `NPC` type. Recurring cast has `scope: "campaign"` flag; local NPCs have `scope: "stage"`.
> *Recommend: Option A — recurring cast and local NPCs have structurally different requirements. Forcing them into one type creates a bloated schema.*

---

## Phase 2.4 — Knowledge + Challenge Model

**Objective:** Define the conceptual model for knowledge discovery and the challenge system — the two mechanisms through which players learn and demonstrate understanding.

**Input:** Phase 2.2–2.3 models, `ai-gameplay-loop.md §1b/§1c`, `ai-vision.md §5`

**Deliverable:** A new doc `content-architecture/ai-knowledge-challenge-model.md` — the knowledge-challenge content model (knowledge beats, concept definitions, challenge types, difficulty, and the relationship between them).

> Note: This replaces/supersedes the stub `content-architecture/ai-questions-schema.md` which will be updated to reference this model.

**Key questions:**
- Is a knowledge beat the same type as a combat challenge? (Both involve a K8s concept, but one is delivered through exploration and one through combat. Are they the same entity with a `deliveryContext` field, or separate types?)
- Where do challenge questions "live"? Options: embedded in the enemy that uses them; stored in a per-concept pool that enemies draw from; stored in a global pool that stages curate.
- How is difficulty modelled? (A concept like Containers has beginner challenges and advanced challenges. Is difficulty a property of the challenge, the stage, the enemy, or the player's progress?)
- How is concept mastery tracked? (The model must support "the player demonstrated understanding of Pods" as a queryable state — used by dialogue branching, quest resolution, and traversal gates.)
- How are the 7 challenge types modelled? (MCQ, command completion, code recognition, scenario, debugging, matching, ordering — are these a `type` field on a shared `Challenge` entity, or separate entity types?)

**Constraints:**
- Knowledge Doctrine §5.1: knowledge is discovered through play, never assumed. Schema must make discoverable knowledge explicit — there must be a content object representing the discovery event.
- Knowledge Doctrine §5.2: knowledge must be channelled into one of 5 gameplay channels (combat, exploration, quests, bosses, dialogue). The model must support tagging knowledge/challenges by channel.
- Anti-Pattern 7.1 (quiz-with-a-skin): challenge context is required. Every challenge must have a `worldEventContext` — the in-world event that triggers it. A challenge with no world event context violates Pillar 4.
- Anti-Pattern 7.3 (walls of text): knowledge panel content is chunked. The schema must enforce a maximum content size per knowledge beat object.

**Validation:**
- [ ] Can the Pod Bug encounter from the gameplay loop example be fully represented? (Enemy appears, challenge appears, answer charges ability, outcome plays out.)
- [ ] Can a traversal gate (sealed door that opens when player recognises a valid Pod spec) be represented using this model?
- [ ] Can the Pods stage's knowledge density of 4 discoveries be represented as 4 distinct knowledge beat objects?

**Critical decisions for this phase:**
> **D-CA-06: Shared challenge pool vs. embedded challenges**
> Option A: Challenges are embedded in the entity that uses them (enemy has its own challenges; boss has its own challenges). Simple ownership, easy to author.
> Option B: Challenges are stored in a per-concept pool. Entities reference challenges by ID. Challenges can be reused across enemies and stages.
> Option C: Challenges are in a global pool, tagged by concept, difficulty, and type. Enemies and bosses draw from the pool based on tags.
> *This is the most consequential content architecture decision. Option C is the most flexible but the hardest to author. Option A is simplest but prevents concept reuse. Requires explicit resolution in Phase 2.8.*

> **D-CA-07: Knowledge beat vs combat challenge — same or different types?**
> Knowledge beats (reading a scroll, NPC dialogue revealing a concept) and combat challenges (MCQ that charges a sword) both relate to a K8s concept. But they have different delivery contexts, different formats, and different outcomes.
> *Recommend: Separate types. `KnowledgeBeat` (exploration/discovery) and `Challenge` (active test). Both reference a `Concept` entity. This preserves the distinction between learning and testing.*

---

## Phase 2.5 — Enemy + Boss Model

**Objective:** Define the conceptual model for enemies and bosses — both as content types and in their relationship to the challenge system.

**Input:** Phase 2.4 model, `ai-campaign-structure.md` (enemy/boss designs per stage)

**Deliverable:** `content-architecture/ai-enemies-schema.md` and `content-architecture/ai-bosses-schema.md` — updated from stubs to conceptual models.

**Key questions:**
- How does an enemy's relationship to a K8s concept work in the data model? (Every enemy "represents" a concept failure mode — Shell Beetles represent misconfigured containers. Is this `conceptID` a field, or is it implicit from the stage they appear in?)
- How do bosses reference the concept requirements for their fight? (Bosses combine multiple concepts. Schema needs `requiredConcepts: ConceptID[]`.)
- How are boss phases modelled? (The Isolation Wyrm has 4 phases, each testing a different concept. Are phases sub-objects, or separate entities?)
- How does the enemy model connect to the challenge model? (Given the decision in Phase 2.4, how does an enemy "use" challenges — by embedding them, referencing a pool, or drawing from concept-tagged global challenges?)
- How are act bosses vs stage bosses distinguished? (Isolation Wyrm is an act boss, not a stage boss. It spans all four Act 1 concepts.)

**Constraints:**
- Boss validation principle (from gameplay loop): bosses combine prior concepts; they never introduce new ones. Schema must support `conceptRequirements[]` — concepts the player must have encountered before this boss is unlocked.
- Campaign review finding #1 (deferred): boss phases need concept signposting. The schema must make the concept-per-phase explicit so this can be implemented when Milestone 12 runs.
- Knowledge Doctrine: enemy encounters are a gameplay channel for knowledge application. Every enemy must have a concept linkage.

**Validation:**
- [ ] Can the Isolation Wyrm (4-phase Act 1 boss, spans Containers/Pods/Deployments/Services) be fully represented?
- [ ] Can the Corrupted Warden's stand-down mechanic (presenting a correct permission set ends the fight) be represented at the model level?
- [ ] Can the Privilege Escalator mini-boss (de-escalates via correct permissions) be represented?

**Critical decision for this phase:**
> **D-CA-08: Boss phases as sub-objects or separate entities**
> Option A: Boss has a `phases: BossPhase[]` field. Each phase contains its concept reference, challenge refs, and transition conditions. Boss is one self-contained object.
> Option B: Boss phases are separate `BossPhase` entities referenced by ID from the Boss. More flexible for reuse; more complex to author.
> *Recommend: Option A — boss phases are always specific to one boss and are never reused. Sub-objects keep authoring simple without loss of expressiveness.*

---

## Phase 2.6 — Progression + Reward + Item Model

**Objective:** Define how player progression, rewards, and items are represented as content — per-campaign, not platform-wide.

**Input:** Phase 2.2–2.5 models, `ai-vision.md §7.8` (no cross-game progression), `ai-campaign-structure.md` (reward descriptions)

**Deliverable:** `content-architecture/ai-rewards-schema.md` and `content-architecture/ai-items-schema.md` — updated from stubs to conceptual models. New: `content-architecture/ai-progression-model.md`.

**Key questions:**
- What does player progression consist of? (XP + levels? Knowledge state? Both? Something else?)
- Is XP a content-defined value (each quest awards a fixed amount) or a calculated value (based on challenge performance)?
- Are levels content-defined thresholds or engine-calculated milestones?
- What categories of items exist? (Equipment that affects combat? Consumables? Key items for traversal? Lore items with no mechanical effect?)
- Are rewards stage-driven (completing a stage gives fixed rewards) or quest-driven (rewards are defined per quest), or both?
- How does the per-campaign progression scope work in data? (Anti-Pattern 7.8: no cross-game progression. How does the schema enforce this boundary?)

**Constraints:**
- Anti-Pattern 7.4 (knowledge as a side stat): knowledge is not a stat. "K-points" or "knowledge level" are rejected schema types. Player knowledge state is binary per concept (encountered/not encountered, demonstrated/not demonstrated) — not a numeric accumulation.
- Anti-Pattern 7.8 (no cross-game progression): progression is scoped to the active campaign. Schema must make campaign scope explicit on all progression-related entities.
- Vision §2 (not a power-accumulation fantasy): equipment serves fantasy and combat texture, not accumulation. Item schema should support lore/narrative items without mechanical benefit.

**Validation:**
- [ ] Can Stage 1's knowledge state ("player has encountered Containers") be represented as a queryable progression fact?
- [ ] Can the boss defeat reward (stage completion, portal unlock) be represented without hardcoding it as a special case?
- [ ] Is it impossible in this model to accumulate "knowledge points" as a grindable stat?

---

## Phase 2.7 — Theme Variant Design

**Objective:** Define how theming (Fantasy Kingdom vs Space Galaxy) is applied across all entity types without duplicating content.

**Input:** All Phase 2.1–2.6 models, `ai-vision.md §6 Tier C` (theme invariance requirement)

**Deliverable:** `content-architecture/ai-theme-variant-model.md` — a cross-cutting document describing the theme variant pattern applied to each entity type.

**Key questions:**
- What is the minimum set of fields that vary between themes? (NPC names, location names, enemy names, item names, lore text — probably yes. Concept content, challenge questions, knowledge beats — definitely no.)
- Is theming a field on every entity (`fantasyVariant: {...}, spaceVariant: {...}`) or a separate theme-override file that patches entities by ID?
- How is the theme-neutral core distinguished from the theme-specific skin in authoring?
- What happens to theming in a third future theme? The model must accommodate N themes, not just 2.
- How do recurring cast characters appear in the Space theme? (Lyra as a different archetype? Same character, different name? Same character, different visual description only?)

**Constraints:**
- Vision §6 Tier C: same stage in Fantasy and Space produces identical emotional beats. This is a hard constraint. The theme variant system must never be able to change the pacing, concept linkage, or challenge content of a stage — only its surface (names, descriptions, visual tags).
- Platform requirement: future campaigns (Linux Realms, etc.) may introduce new themes. The model cannot assume exactly 2 themes.

**Validation:**
- [ ] Can Kubernetes Kingdom Stage 2 (Podveil Village, Pods) be represented in both Fantasy and Space themes from a single content object with theme overrides?
- [ ] Does the theme system prevent a content author from accidentally changing the K8s concept a stage teaches while reskinning it?
- [ ] Would adding a third theme (e.g., Steampunk) require changes to the schema, or just a new theme entry?

---

## Phase 2.8 — Critical Decisions Review

**Objective:** Review all open architecture decisions surfaced during Phases 2.1–2.7. Resolve what can be resolved with reasoning; defer what requires human input; record all decisions in `DECISIONS.md`.

**Input:** All Phase 2.1–2.7 deliverables, `DECISIONS.md`, `discovery/open-tensions.md`

**Deliverable:** Updated `DECISIONS.md` with all new content architecture decisions. Updated `BACKLOG.md` for deferred items. Summary section added to `milestones/milestone-02-content-architecture/ai-overview.md`.

**Decisions requiring human input (to resolve before Phase 2.9):**

| Decision | Options | Why human input needed |
|---|---|---|
| D-CA-04: Embedded vs referenced dialogue | Embedded in NPC / Separate objects by ID | Authoring workflow preference, tooling implications |
| D-CA-06: Challenge pool architecture | Embedded / Per-concept pool / Global tagged pool | Largest impact on content authoring workflow and engine complexity |
| Authoring format | YAML / JSON / Custom DSL | Non-technical content author accessibility vs tooling ease |
| Single-file vs split-file content | All stage content in one file / split across files by type | Authoring workflow preference |

**Decisions that can be resolved through reasoning:**
- D-CA-01, D-CA-02, D-CA-03, D-CA-05, D-CA-07, D-CA-08 — recommendations stated in each phase; confirm or adjust.

**Validation:**
- [ ] Every critical decision from Phases 2.1–2.7 has either a resolution with rationale or a formal deferral with a clear owner
- [ ] No schema design in subsequent phases will be blocked by an unresolved decision

---

## Phase 2.9 — Validation Pass

**Objective:** Run the Kubernetes Kingdom campaign design through the content model. Confirm every piece of campaign content can be represented without gaps or workarounds.

**Input:** All Phase 2.1–2.8 deliverables, `ai-campaign-structure.md`

**Deliverable:** `milestones/milestone-02-content-architecture/ai-validation-report.md` — a pass/fail report for each entity type against the campaign design. Any gap found becomes a revision to the relevant schema model.

**Validation checks:**
- [ ] All 14 mandatory stages representable
- [ ] All 3 expandable regions representable without schema modification
- [ ] Recurring cast (5 characters) and local NPCs (1–3 per stage) representable
- [ ] Khaosynth's presence-through-corruption (without direct appearance until Stage 13) representable
- [ ] Knowledge density (4–7 beats per stage) representable with distinct delivery types
- [ ] Voss's conditional Stage 13 action representable (observable NPC behaviour tied to story checkpoint)
- [ ] Lyra's decision moment (Stage 13 audit judgement call) representable
- [ ] Severed Envoy boss (4-phase consequential chain) representable
- [ ] Fantasy and Space themes representable from single content objects

---

## Phase 2.10 — Human Review

**Objective:** Human review of the complete content model before execution of schema writing (which happens in later milestones).

**Input:** All Phase 2.1–2.9 deliverables

**Deliverable:** `milestones/milestone-02-content-architecture/you-content-model-review.md` — human review and sign-off document.

**Review focus:**
- Is the content model authoring-friendly? Could a non-engineer create a new stage by reading this model?
- Are the critical decisions (especially authoring format and challenge pool architecture) correct?
- Are there content types that are missing from the entity inventory?
- Does the model support the kinds of future campaigns envisioned (Linux Realms, Docker Dominion)?
- Is anything over-engineered for ForgeMinds v1 that should be simplified?

---

## Execution order note

Phases 2.1–2.3 are sequential (each builds on the prior). Phases 2.4–2.6 can be executed in parallel once 2.3 is complete. Phase 2.7 requires 2.1–2.6 complete. Phases 2.8–2.10 are sequential after 2.7.

```
2.1 → 2.2 → 2.3 → [2.4, 2.5, 2.6 in parallel] → 2.7 → 2.8 → 2.9 → 2.10
```
