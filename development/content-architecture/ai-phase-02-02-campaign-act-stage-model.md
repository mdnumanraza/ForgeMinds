# ForgeMinds — Campaign, Act & Stage Model

> **Phase:** 2.2 — Campaign + Act + Stage Model
> **Purpose:** Define the conceptual model for the three highest-level content containers. Every campaign that ForgeMinds will ever ship — Kubernetes Kingdom, Linux Realms, Docker Dominion, and those not yet imagined — must be fully expressible within these models without an engine change.
> **Status:** v2 — Stage model updated for Beat-centric architecture. Stage now owns `Beat[]` (ordered sequence). Named content slots replaced by typed Beats. See `ai-beat-model.md` for the canonical Beat definition.
> **Owned by:** AI
> **Depends on:** `ai-phase-02-01-content-hierarchy.md` (Phase 2.1)
> **Cites:** `ai-vision.md §1, §4, §5, §7.8`, `ai-gameplay-loop.md §3`, `ai-campaign-structure.md`

---

## Guiding principle

The engine knows nothing about Kubernetes. It knows nothing about dragons, villages, or archivists. It knows about Campaigns, Acts, Stages, Beats, and the payloads that Beats carry.

Every campaign-specific concept — "this campaign is about Kubernetes," "this stage teaches Pods," "this boss validates Act 1" — lives entirely in content data, not in engine code.

If this principle is violated — if the engine ever contains the word "Pod" or "Kubernetes" — the architecture has failed.

> **v2 note:** Beat has been added to this hierarchy as a first-class entity between Stage and all content. The engine iterates a Stage's Beat sequence; it does not know the names of content slots.

---

## MODEL 1 — Campaign

### Why it exists

A Campaign is a self-contained learning adventure covering one technical domain. It is the boundary around a complete player experience: one domain, one cast, one progression arc, one set of themes, one beginning and one end.

ForgeMinds is a platform. A Campaign is an instance of that platform applied to a specific domain. The platform never changes when campaigns are added; only content changes.

### What a Campaign is responsible for

- Declaring which technical **domain** it covers (e.g., Kubernetes, Linux, Docker)
- Holding the campaign's **Acts** and defining their order
- Holding the campaign's **recurring cast** (CastMembers)
- Holding the campaign's **player progression model** (ProgressionLevels, XP curve, starting values)
- Holding the campaign's **item library** (Items, Abilities — things that persist across stages)
- Declaring which **Themes** this campaign supports (references to platform-level Theme entities)
- Declaring which platform-level **Concepts** appear in this campaign
- Defining the campaign's **challenge type distribution preferences** (e.g., this campaign leans 60% MCQ, 40% other forms — a content guidance setting, not an engine rule)
- Owning the campaign's **expandable/optional stage registry** — which stages are optional and what conditions unlock them

### What a Campaign explicitly does NOT own

- **Individual stage content** — stages belong to Acts, not directly to the Campaign
- **Player save state** — the engine manages save state; the Campaign defines *what* can be saved (its schema), not the save data itself
- **Theme definitions** — Themes are platform-level (L0). A Campaign *references* themes; it does not define them
- **Concept definitions** — Concepts are platform-level (L0). A Campaign references the subset of Concepts it uses
- **Challenge questions** — Challenges are owned at stage level or in a concept pool (pending D-CA-06). Not at Campaign level
- **UI/rendering decisions** — how the campaign map looks, how menus work, how dialogue is displayed

### Content that can exist inside a Campaign

| Content | Notes |
|---|---|
| Acts | Ordered list; at minimum 1 |
| CastMembers | The recurring cast for this campaign |
| ProgressionLevel definitions | Campaign-specific XP thresholds and unlocks |
| Item definitions | Equipment, key items, consumables scoped to this campaign |
| Ability definitions | Player combat abilities for this campaign |
| Optional stage registry | Stage IDs marked as optional + unlock conditions |
| Campaign-level StoryBeats | Intro, outro, and between-act narrative moments |
| Campaign-level CutsceneEvents | Non-interactive scripted sequences (Final epilogue, act transitions) |
| Theme references | Which themes are available for this campaign |
| Concept references | Which concepts appear across all stages |

### Content that cannot exist inside a Campaign

- Stage-scoped NPCs, Enemies, Quests, Dungeons, Regions — these belong to Stages
- Platform-level entities (Concept definitions, Theme definitions, ChallengeType definitions)
- Player data (health, inventory state, quest state, knowledge mastery records)

### Gameplay purpose

The Campaign is the player's chosen adventure. Selecting a campaign is the player saying: "I want to learn Kubernetes in the context of a broken kingdom." The Campaign provides the frame — the cast, the progression stakes, the themes — inside which every stage's learning content is delivered.

A campaign that could be deleted from the platform without affecting any other campaign or any engine code is correctly designed.

### Narrative purpose

The Campaign defines the world and the people the player will care about. It establishes the dragon, the archivist, the captain, the child. It sets the emotional register that runs from Stage 1 to the Final Stage. The player's relationship to the kingdom is a Campaign-level concern.

### Progression purpose

The Campaign defines the progression arc the player moves through. ProgressionLevels, the ability unlock sequence, and the XP curve are all Campaign properties. A player who completes Kubernetes Kingdom at Level 12 cannot carry that Level 12 into Linux Realms — progression is Campaign-scoped. (Anti-Pattern 7.8.)

### Lifecycle

```
DRAFT → REVIEW → PUBLISHED → LIVE → RETIRED
```

- **DRAFT:** Campaign is being authored. Content may be incomplete.
- **REVIEW:** Campaign is content-complete and undergoing validation (Phase 2.9 equivalent).
- **PUBLISHED:** Campaign is available to players.
- **LIVE:** Campaign is actively played. Content modifications are versioned.
- **RETIRED:** Campaign is no longer offered to new players but save states for existing players are preserved.

### Dependencies

| Depends on | Why |
|---|---|
| Themes (L0) | Campaign references at least one Theme |
| Concepts (L0) | Campaign references the Concepts it uses |
| ChallengeTypes (L0) | Challenge pool is populated with types from this platform-level set |

### Invariants (rules that must always hold for a valid Campaign)

- A Campaign must reference at least one Theme.
- A Campaign must contain at least one Act.
- A Campaign must define a complete progression model (ProgressionLevels with defined thresholds).
- A Campaign's referenced Concepts must exist at platform level before the Campaign can be published.
- A Campaign must have exactly one "final stage" marker (the stage that triggers the campaign-complete flow).
- No CastMember in this Campaign may share an ID with any CastMember in any other Campaign.

---

## MODEL 2 — Act

### Why it exists

An Act is a narrative and progression chapter within a Campaign. It groups a set of Stages that share an emotional register, a learning arc phase (Discovery / Responsibility / Mastery / Reckoning), and a structural identity.

Acts exist because stages without act grouping would be a flat list. A flat list cannot represent narrative momentum, escalating difficulty, act-level climaxes (act bosses), or the emotional shift between "learning what broke" and "defending what was rebuilt."

An Act that could be removed and its Stages absorbed into a flat Campaign structure without any player noticing its absence is not correctly designed.

### What an Act is responsible for

- Declaring its **narrative theme** (the emotional register of its stages)
- Declaring its **learning arc phase** (the campaign-level learning intention for this block of stages)
- Holding its **ordered Stage list**
- Owning its **Act Boss** (if the campaign design includes one) — the culminating boss that tests cross-act concepts
- Holding act-level **StoryBeats** (transition moments between acts, available before the first stage and after the last)
- Defining the **entry condition** — what must be true before the player can enter this Act (previous Act complete; specific stage complete; optional stages required or not)

### What an Act explicitly does NOT own

- **Stage-level content** — stages own their own content
- **Player progression state** — acts do not track XP, only the engine does
- **CastMembers** — these are Campaign-owned
- **Theme selection** — themes are Campaign-level
- **The specific Concepts** for each stage — those are Stage-owned

### Content that can exist inside an Act

| Content | Notes |
|---|---|
| Stages | Ordered list; the act's core content |
| Act Boss | Optional; most acts in Kubernetes Kingdom have one |
| Act-level StoryBeats | Transition narrative between acts |
| Entry condition | What triggers act availability |
| Narrative theme descriptor | The emotional register (used by engine for pacing context) |
| Learning arc phase label | Discovery / Responsibility / Mastery / Reckoning |

### Content that cannot exist inside an Act

- NPCs, Quests, Enemies, Dungeons — these are Stage-level
- CastMember definitions — Campaign-level
- ProgressionLevels — Campaign-level
- Platform-level entities

### Gameplay purpose

Acts create natural session boundaries and provide escalating stakes. Act completion (defeating the act boss, triggering the act-transition story beat) is a major checkpoint that signals the player has mastered a complete phase of the campaign. Without acts, a 14-stage campaign is an undifferentiated list. With acts, it has chapters.

### Narrative purpose

Each Act carries a different emotional register. In Kubernetes Kingdom: Act 1 (Discovery) is about encountering a broken world; Act 2 (Responsibility) is about understanding how the kingdom's systems connect; Act 3 (Mastery) is about defending what was restored. These emotional shifts are Act-level properties — they apply to every stage within the Act.

### Progression purpose

Acts are natural progression gates. Act 2 does not open until Act 1's stages are complete and the Act 1 Boss is defeated. This is not an arbitrary gate — it reflects the prerequisite chain (you cannot understand ConfigMaps without understanding Pods). The Act entry condition encodes the prerequisite relationship between learning phases.

### Lifecycle

```
DRAFT → PUBLISHED (with Campaign)
```

Acts do not have independent lifecycle states. An Act's lifecycle is bound to its Campaign's lifecycle. An Act cannot be published without its Campaign. An Act cannot be retired independently.

### Dependencies

| Depends on | Why |
|---|---|
| Campaign | Acts cannot exist outside a Campaign |
| Stages (its own) | An Act without Stages is malformed |
| Previous Act (if not Act 1) | Entry condition depends on prior Act completion |

### Invariants

- An Act must contain at least one Stage.
- An Act's Stage list must be ordered (the engine needs to know the intended sequence).
- An Act must have a defined entry condition (even if Act 1's condition is simply "Campaign started").
- An Act Boss must reference at least two Concepts from within the Act's stages (act bosses are cross-concept by design).
- An Act Boss's required concepts must all appear in KnowledgeBeats within the Act's stages before the boss is reached.

---

## MODEL 3 — Stage

### Why it exists

The Stage is the primary unit of content and learning in ForgeMinds. Every other content entity exists to support the Stage or to be organised above it. A Stage is a complete, self-contained arc: a wound in the world, a concept to learn, a cast of characters, challenges to overcome, a dungeon, a boss, and an exit.

A Stage is one region, one concept, one hero's journey in miniature.

### What a Stage is responsible for *(v2 — Beat-centric)*

- Declaring its **primary Concept** (and optionally secondary concepts for cross-concept beats)
- Declaring **which CastMembers appear** in this stage (references to Campaign-level CastMembers)
- Declaring its **recommended player level range**
- Declaring its **knowledge density target** (how many KNOWLEDGE beats it aims for)
- Declaring whether it is **optional** (expandable region flag)
- **Owning an ordered sequence of Beats** — the stage's content is expressed entirely as a Beat sequence. Every piece of stage-level content (region, knowledge beats, NPCs, quests, enemies, dungeon, boss, portal) is a typed Beat in this sequence.

### What a Stage explicitly does NOT own *(v2)*

- **CastMember definitions** — Campaign-level. Stage references them via Beat AppearanceTriggers.
- **Beat payload content directly** — the Stage owns Beats; Beats own payloads. Stage never reaches past a Beat to access its payload directly.
- **Player progression state** — stages contribute to progression but do not hold it.
- **Themes** — stages are theme-neutral. ThemeOverrides apply to Beat payloads via the Theme system.
- **Platform-level Concepts** — a Stage references a Concept; it does not define it.
- **Act-level content** — the Stage does not know which Act it belongs to.
- **Challenges** — Beat payloads (Enemy, Boss, etc.) use challenges; whether they own them depends on D-CA-06.

### The Beat sequence as Stage structure *(v2)*

A Stage is an ordered sequence of Beats. The Stage is not a named-slot container — it is a typed sequence. Every Beat has a position, a type, and exactly one payload.

```
Stage
└── beats: Beat[]  (ordered by position)
    ├── Beat { position: 1,   type: ARRIVAL,         payload: StoryBeat }
    ├── Beat { position: 2,   type: EXPLORATION,     payload: Region }
    ├── Beat { position: 3,   type: KNOWLEDGE,       payload: KnowledgeBeat }
    ├── Beat { position: 4,   type: KNOWLEDGE,       payload: KnowledgeBeat }
    ├── Beat { position: 5,   type: QUEST,           payload: Quest }
    ├── Beat { position: 6,   type: ENCOUNTER,       payload: Enemy }
    ├── Beat { position: 7,   type: ENCOUNTER,       payload: Enemy }
    ├── Beat { position: 8,   type: NPC_INTERACTION, payload: NPC }
    ├── Beat { position: 9,   type: MINI_CHALLENGE,  payload: MiniChallenge }
    ├── Beat { position: 10,  type: DUNGEON,         payload: Dungeon }
    ├── Beat { position: 11,  type: BOSS,            payload: Boss }
    └── Beat { position: 12,  type: PORTAL,          payload: Portal }
```

Multiple Beats of the same type are valid and expected (multiple KNOWLEDGE beats, multiple ENCOUNTER beats). The position field establishes the authoritative order.

**Which beats are required?** The Campaign declares its required beat types. For Kubernetes Kingdom, the required types are: ARRIVAL, EXPLORATION, at least one KNOWLEDGE, at least one QUEST, at least one ENCOUNTER, DUNGEON, BOSS, PORTAL (except the Final Stage). This is validated against the Stage's Beat sequence.

### Content that can exist inside a Stage *(via Beats)*

All stage content is owned by Beats. The Stage owns Beats; Beats own their payloads.

| Beat type | Payload | Notes |
|---|---|---|
| ARRIVAL | StoryBeat | Exactly one per stage |
| EXPLORATION | Region | Exactly one per stage |
| KNOWLEDGE | KnowledgeBeat | 4–7 per stage (knowledge density target); multiple KNOWLEDGE beats allowed |
| QUEST | Quest | One or more; stage-scoped (multi-stage quests at Campaign level) |
| ENCOUNTER | Enemy | 2–3 types per stage; multiple ENCOUNTER beats allowed |
| NPC_INTERACTION | NPC (local) | 1–3 per stage; stage-scoped only |
| MINI_CHALLENGE | MiniChallenge | One or more per stage |
| DUNGEON | Dungeon | Exactly one per stage |
| BOSS | Boss (stage boss) | Exactly one per stage |
| CUTSCENE | CutsceneEvent | Optional |
| CHECKPOINT | Checkpoint | Multiple allowed; where saves land |
| PORTAL | Portal | Exactly one per stage (except Final Stage) |

### Content that cannot exist inside a Stage

- CastMember definitions (these are Campaign-level)
- Act Bosses (these are Act-level)
- ProgressionLevel definitions (Campaign-level)
- Item definitions (Campaign-level)
- Platform-level entities (Concepts, Themes, ChallengeTypes)

### Gameplay purpose

The Stage is where the player lives. It is the region they explore, the NPCs they meet, the enemies they fight, the dungeon they navigate, and the boss they defeat. Every gameplay loop — moment-to-moment, session, stage-arc — plays out within a Stage. The Stage is the container that makes the gameplay loop concrete.

### Narrative purpose

Each Stage is a distinct wound in the world. Stage 2 is a village where people cannot find each other. Stage 6 is a sealed fortress where private things have been read. The narrative identity of a stage is specific, memorable, and tied to its concept. A player who completes Stage 2 should remember Mira, Podveil Village, and the feeling of reconnection — not just "I learned about Pods."

### Progression purpose

Completing a Stage advances the player's level, adds to their knowledge mastery state, and unlocks the next stage. The Stage's Reward entity defines what the player receives on completion. Knowledge mastery is updated when knowledge beats are read and concepts are demonstrated — both of which happen inside the Stage, but the mastery record lives in player state, not in the Stage.

### Lifecycle

```
DRAFT → CONTENT_COMPLETE → VALIDATED → PUBLISHED (with Campaign)
```

- **DRAFT:** Stage is being authored. Beat sequence may be incomplete.
- **CONTENT_COMPLETE:** All required beat types are present. Knowledge density target met. Beat sequence is complete.
- **VALIDATED:** Stage Beat sequence has been run through the validation pass — ordering rules satisfied, no broken concept references, no missing challenge content.
- **PUBLISHED:** Included in a published Campaign.

A Stage can be added to a live Campaign as a content update (for expandable optional stages). It cannot be removed from a live Campaign without a migration plan for players who have already completed it.

### Dependencies

| Depends on | Why |
|---|---|
| Act | Stages exist inside Acts |
| Concepts (L0) | Stage declares its primary concept |
| CastMember[ ] (Campaign L1) | Stage references cast members who appear here |
| Previous Stage (soft dep.) | Portal unlocks can be conditional on prior stage completion |
| Challenge pool (pending D-CA-06) | Stage enemies and bosses need challenges |

### Invariants

- A Stage must declare exactly one primary Concept.
- A Stage must have at least one KnowledgeBeat that introduces the primary Concept.
- A Stage Boss must reference the primary Concept of the Stage (and optionally others).
- A Stage Boss must not reference Concepts that have not appeared in any KnowledgeBeat within the Stage or prior Stages in the Act.
- A Stage's Portal must reference a valid Stage ID (or be the Final Stage marker).
- A Stage must have at least one Enemy that references the Stage's primary Concept.
- Knowledge density (number of KnowledgeBeats) must meet the Campaign's defined minimum per stage.
- An optional Stage must appear in the Campaign's optional stage registry; a mandatory Stage must not.

---

## OWNERSHIP MATRIX

Who owns what at each level.

| Entity | Owned by | Level |
|---|---|---|
| Platform | — (root) | L0 |
| Theme | Platform | L0 |
| Concept | Platform | L0 |
| ChallengeType | Platform | L0 |
| Campaign | Platform | L1 |
| CastMember | Campaign | L1 |
| ProgressionLevel | Campaign | L1 |
| Item | Campaign | L1 |
| Ability | Campaign | L1 |
| Campaign-level StoryBeat | Campaign | L1 |
| Campaign-level CutsceneEvent | Campaign | L1 |
| Act | Campaign | L1 |
| Act Boss | Act | L1 |
| Act-level StoryBeat | Act | L1 |
| Stage | Act | L1-within-Act |
| **Beat** | **Stage** | **L2** |
| Region | Beat (EXPLORATION payload) | L3 |
| KnowledgeBeat | Beat (KNOWLEDGE payload) | L3 |
| NPC (local) | Beat (NPC_INTERACTION payload) | L3 |
| Quest | Beat (QUEST payload) | L3 |
| Enemy | Beat (ENCOUNTER payload) | L3 |
| MiniChallenge | Beat (MINI_CHALLENGE payload) | L3 |
| Dungeon | Beat (DUNGEON payload) | L3 |
| Boss (stage boss) | Beat (BOSS payload) | L3 |
| Stage-level StoryBeat | Beat (ARRIVAL/CUTSCENE payload) | L3 |
| CutsceneEvent | Beat (CUTSCENE payload) | L3 |
| Portal | Beat (PORTAL payload) | L3 |
| KnowledgePanel | KnowledgeBeat | L3 |
| QuestStep | Quest | L3 |
| QuestResolutionCondition | Quest | L3 |
| BossPhase | Boss | L3 |
| DialogueState | NPC / CastMember | L3 |
| ExplorationPoint | Region | L3 |
| EncounterTrigger | Enemy | L3 |
| Checkpoint | Stage (beat-level) | L4 |
| DialogueLine | DialogueState | L4 |
| EnvironmentalStory | Region | L4 |
| Challenge | Pending D-CA-06 | L3 or L1 or L0 |
| ThemeOverride | Theme | L4 |

---

## DEPENDENCY MATRIX

What depends on what (references without ownership).

| Entity | Depends on (references) |
|---|---|
| Campaign | Theme[ ] (L0), Concept[ ] (L0) |
| Act | Campaign, previous Act (entry condition) |
| Stage | Act, Concept (primary, L0), CastMember[ ] (L1) |
| Portal | Stage (next — reference by ID) |
| KnowledgeBeat | Concept (L0) |
| Quest | NPC (giver), CastMember (if cast-driven), Concept (mastery check) |
| QuestResolutionCondition | Concept (mastery state), Quest flags |
| Enemy | Concept (L0), Challenge (pool ref — pending D-CA-06) |
| Boss | Concept[ ] (L0), Challenge (pool ref) |
| BossPhase | Concept (L0), Challenge |
| MiniChallenge | Challenge |
| DialogueState | Concept (for knowledge-gated branches), Quest flags, CastMember (for cast dialogue) |
| Reward | Item (L1), Ability (L1), ProgressionLevel (L1) |
| Act Boss | Concept[ ] (L0) — all concepts tested in act |
| ThemeOverride | Entity (any theme-variant entity, referenced by ID) |

---

## LIFECYCLE MATRIX

| Entity | States | Notes |
|---|---|---|
| Platform | Permanent | Never deleted while campaigns exist |
| Concept | Permanent | Never deleted while any campaign references it |
| Theme | Permanent | Never deleted while any campaign references it |
| ChallengeType | Permanent | Platform enum; additive only |
| Campaign | DRAFT → REVIEW → PUBLISHED → LIVE → RETIRED | Full independent lifecycle |
| Act | Bound to Campaign | Cannot be published/retired independently |
| Stage | DRAFT → CONTENT_COMPLETE → VALIDATED → PUBLISHED | Can be added to a live Campaign as content update (optional stages) |
| CastMember | Bound to Campaign | Definition lives and dies with Campaign |
| NPC (local) | Bound to Stage | Cannot exist outside its Stage |
| Quest | Bound to Stage | Cannot exist outside its Stage |
| Enemy | Bound to Stage | Cannot exist outside its Stage |
| Boss (stage) | Bound to Stage | Cannot exist outside its Stage |
| Act Boss | Bound to Act | Cannot exist outside its Act |
| KnowledgeBeat | Bound to Stage | Cannot exist outside its Stage |
| Item | Bound to Campaign | Can be awarded in multiple stages, deleted with Campaign |
| Ability | Bound to Campaign | Same as Item |
| ProgressionLevel | Bound to Campaign | Same as Item |
| Challenge | Pending D-CA-06 | Lifecycle depends on ownership model |
| ThemeOverride | Bound to Theme | Exists for as long as the Theme exists |

---

## REUSE RULES

| Entity | Reuse rule |
|---|---|
| Concept | Reusable across all campaigns and all stages. "Container" concept can be referenced by Kubernetes Kingdom Stage 1, Docker Dominion Stage 3, and any future campaign. |
| Theme | Reusable across campaigns. Fantasy Kingdom theme can apply to any campaign. |
| ChallengeType | Reusable universally. MCQ is MCQ in every campaign. |
| CastMember | Reusable within one campaign only. Lyra cannot appear in Linux Realms. |
| Item | Reusable within one campaign (can be rewarded in multiple stages). Not across campaigns. |
| Ability | Reusable within one campaign. Not across campaigns. |
| ProgressionLevel | Reusable within one campaign (the same level definition applies to all stages). Not across campaigns. |
| NPC (local) | NOT reusable. One Stage, one NPC. If a local NPC needs to appear in another stage, promote to CastMember. |
| Quest | NOT reusable. Stage-scoped. |
| Enemy | NOT reusable. Stage-scoped. Enemy *type* can inspire a similar enemy in another stage, but they are separate content objects. |
| KnowledgeBeat | NOT reusable. The same Concept introduced in Stage 2 is introduced differently in Stage 5 — different world context, different discovery object, different panel framing. |
| Stage Boss | NOT reusable. Stage-specific. |
| Act Boss | NOT reusable. Act-specific. |
| Challenge | Reuse pending D-CA-06. Under pool model: challenges for a given Concept are reusable across any enemy or boss that references that Concept. Under embedded model: not reusable. |

---

## VALIDATION RULES

These are the rules a content validation pass (Phase 2.9) must check before any Campaign, Act, or Stage is marked VALIDATED.

### Campaign-level validation

- [ ] Campaign references at least one Theme that exists at platform level
- [ ] Campaign contains at least one Act
- [ ] Campaign defines a complete ProgressionLevel sequence (no gaps in XP thresholds)
- [ ] Every Concept referenced by this Campaign exists at platform level
- [ ] Every Stage referenced in the optional stage registry is marked optional in the Stage itself
- [ ] The Campaign has exactly one Final Stage marker
- [ ] No CastMember ID in this Campaign collides with a CastMember ID in any other Campaign

### Act-level validation

- [ ] Act contains at least one Stage
- [ ] Act has a defined entry condition
- [ ] Act Boss (if present) references ≥ 2 Concepts from within the Act's stages
- [ ] All Concepts referenced by the Act Boss appear in KnowledgeBeats within the Act's stages
- [ ] Act's Stage list is ordered (no duplicate positions)

### Stage-level validation

- [ ] Stage declares exactly one primary Concept
- [ ] Stage has at least one KnowledgeBeat introducing the primary Concept
- [ ] Stage Boss references the primary Concept
- [ ] Stage Boss references only Concepts that have appeared in KnowledgeBeats in this Stage or earlier Stages in the Act
- [ ] Stage has at least one Enemy referencing the primary Concept
- [ ] Stage's Portal references a valid Stage ID (or is a Final Stage terminal marker)
- [ ] Knowledge density (KnowledgeBeat count) meets the Campaign's minimum requirement
- [ ] All CastMember references in this Stage are valid Campaign-level CastMember IDs
- [ ] Every required beat (as defined by Campaign's required-beat configuration) is present in the Stage
- [ ] Optional Stages appear in the Campaign's optional stage registry

### Cross-cutting validation (Campaign-wide pass)

- [ ] The Stage order through all Acts forms a valid DAG (no circular Portal dependencies)
- [ ] Every Concept referenced across all Stages is included in the Campaign's Concept reference list
- [ ] No Stage has a Boss that references a Concept not yet introduced in the campaign's prior stages

---

## FUTURE CAMPAIGN COMPATIBILITY CHECK

Before this model is accepted, it must answer: can it represent Linux Realms, Docker Dominion, and campaigns not yet imagined — without a single engine change?

Hypothetical Linux Realms sanity check:

| Kubernetes Kingdom feature | Linux Realms equivalent | Same model? |
|---|---|---|
| "Kubernetes" as domain | "Linux" as domain | ✅ Campaign references Concepts (L0). Domain is just a label + concept set. |
| Pods, Deployments, Services as Concepts | Processes, Files, Permissions, Users as Concepts | ✅ New Concept objects at platform level. No engine change. |
| Lyra the archivist | Different recurring cast | ✅ New CastMember objects in Linux Realms Campaign. No engine change. |
| Dragon as final boss | Different antagonist | ✅ ActBoss and Campaign CutsceneEvents hold this. Fully content-driven. |
| Fantasy + Space themes | Same themes, or new themes | ✅ Campaign references existing Themes or new ones. Theme definitions are platform-level. |
| 14 stages across 3 acts | Different stage count or act count | ✅ Campaign holds Act list. Act holds Stage list. Engine iterates whatever is there. |
| 9-beat stage arc | Same or different arc | ✅ Campaign's required-beat configuration defines which beats are required. Engine enforces whatever the Campaign declares. |

**Result:** the model supports future campaigns without engine changes. ✅

---

## UNRESOLVED DECISIONS FOR PHASE 2.8

These decisions arose during Phase 2.2 and could not be resolved at this conceptual level. They require either human input or deeper analysis in the appropriate later phase.

| ID | Decision | Impact | Phase |
|---|---|---|---|
| D-CA-06 | Challenge pool architecture (embedded / concept pool / campaign pool) | Affects Stage model (does Stage own Challenges or reference a pool?), Boss model, Enemy model, and content authoring workflow | Phase 2.8 (human input required) |
| D-CA-01 | Does Act exist as a data entity? (Recommendation: yes, lightweight) | Affects Act-level StoryBeat ownership, Act Boss ownership | Phase 2.8 (confirm recommendation) |
| D-CA-03 | Required beats per Stage — who declares them? (Recommendation: Campaign-level configuration) | Affects Stage validation rules | Phase 2.8 (confirm recommendation) |
| — | Multi-stage quest ownership | Some quests in the campaign span multiple stages (Mira's arc). The Stage model owns quests, but multi-stage quests cannot be stage-owned. Should multi-stage quests be Campaign-level? | Phase 2.3 (Quest + NPC Model will resolve) |
| — | CastMember dialogue state trigger model | DialogueStates are owned by CastMember (Campaign-level), but they are *triggered* by stage-level events (entering a stage, completing a quest). How does the trigger live in Stage content without the state living in Stage? | Phase 2.3 (Quest + NPC Model will resolve) |
| — | Authoring format | YAML / JSON / Custom DSL — affects how all of the above is written by content authors | Phase 2.8 (human input required) |
| — | Single-file vs split-file content | All stage content in one file vs split by entity type | Phase 2.8 (human input required) |

---

## Cross-references

- `milestones/milestone-02-content-architecture/ai-phase-plan.md` — Phase 2.3 (Quest + NPC Model) is next
- `milestones/milestone-02-content-architecture/ai-content-entity-inventory.md` — all entities mapped to models above
- `content-architecture/ai-phase-02-01-content-hierarchy.md` — Phase 2.1 hierarchy that this model builds on
- `game-design/ai-campaign-structure.md` — the campaign design this model must represent
- `game-design/ai-vision.md §7.8` — Anti-Pattern: no cross-campaign progression; Campaign boundary rules derived from this
- `game-design/ai-gameplay-loop.md §3` — 9-beat arc drives Stage beat-slot structure
- `DECISIONS.md` — unresolved decisions will be recorded here once Phase 2.8 resolves them
