# ForgeMinds — Content Hierarchy

> **Phase:** 2.1 — Content Hierarchy
> **Purpose:** Define the ownership tree, dependency rules, reuse rules, and lifecycle rules for all ForgeMinds content entities — before any storage or schema decisions are made.
> **Status:** v2 — updated for Beat-centric architecture pivot. Beat is now a first-class L2 entity. Former L2 stage-content entities are now L3 (Beat-payload level). See `ai-beat-model.md` for the canonical Beat definition.
> **Owned by:** AI
> **Cites:** `ai-vision.md §5` (Knowledge Doctrine), `ai-gameplay-loop.md §3` (9-beat arc), `ai-content-entity-inventory.md` (40 entity types)

---

## 1. The core question this phase answers

ForgeMinds must support multiple campaigns (Kubernetes Kingdom, Linux Realms, Docker Dominion, ...) and multiple visual themes (Fantasy, Space, and future themes) — all driven by content, not code.

That means content must be organised so the engine knows:
- **what it owns** (what to load for a given campaign/stage)
- **what it references** (what to look up from shared pools)
- **what it can reuse** (entities that appear in multiple places)
- **what it cannot share** (entities that are strictly scoped to one owner)
- **what varies by theme** (surface that changes) vs. what never varies (learning core that never changes)

This document answers those questions structurally, as a hierarchy and a set of rules.

---

## 2. The five scope levels

Every content entity in ForgeMinds exists at one of five scope levels. Scope determines who owns it, who can reference it, and what happens to it when a campaign ends.

```
┌─────────────────────────────────────────────┐
│  LEVEL 0 — PLATFORM                         │
│  Shared across all campaigns forever        │
│  Examples: Concept, ChallengeType, Theme    │
├─────────────────────────────────────────────┤
│  LEVEL 1 — CAMPAIGN                         │
│  Owned by one campaign, lives and dies      │
│  with it. Examples: Act, CastMember,        │
│  ProgressionLevel, Item, Ability            │
├─────────────────────────────────────────────┤
│  LEVEL 2 — BEAT                             │
│  A single ordered gameplay moment within    │
│  a Stage. The atomic unit of gameplay,      │
│  narrative, learning, and validation.       │
│  Examples: KNOWLEDGE beat, QUEST beat,      │
│  ENCOUNTER beat, BOSS beat, PORTAL beat     │
├─────────────────────────────────────────────┤
│  LEVEL 3 — BEAT PAYLOAD                     │
│  The typed content entity owned by a Beat.  │
│  Examples: KnowledgeBeat, Quest, NPC,       │
│  Enemy, Dungeon, Boss, StoryBeat, Portal    │
│  (formerly called "Stage content" at L2)    │
├─────────────────────────────────────────────┤
│  LEVEL 4 — ATOMIC                           │
│  Smallest content units. Owned by their     │
│  parent payload. Examples: DialogueLine,    │
│  Challenge, QuestStep, BossPhase,           │
│  KnowledgePanel, ThemeOverride, Checkpoint  │
└─────────────────────────────────────────────┘
```

> **Architecture note (v2):** Beat is now the L2 scope level. A Stage is a container of ordered Beats. Each Beat has a type and a payload (the typed content entity). The hierarchy is now: Platform → Campaign → Act → Stage → Beat → Payload → Atomic. This makes the 9-beat arc a data structure, not a design convention — enabling ordering validation, visual editor support, and AI-native content generation.

**Scope rule:** content at level N can only be *owned* by content at level N-1 or above. Content at any level can *reference* (point to) content at level 0 (platform). This is the fundamental rule that makes campaigns swappable without code changes.

---

## 3. The full ownership tree

Reading this tree: indented items are **owned by** their parent. An arrow (→) means **references** (does not own; the referenced entity is defined elsewhere).

> **v2 change:** Stage now owns `Beat[]` (ordered sequence). Each Beat owns exactly one typed payload. All former "Stage-owned" content entities are now Beat payloads (L3).

```
Platform
├── Theme (L0)
│   └── ThemeOverride (L4)
│
├── Concept (L0)
│   └── [referenced by KnowledgeBeat, Challenge, Enemy, Boss payloads]
│
├── ChallengeType (L0)
│
└── Campaign (L1)
    ├── → Theme[ ]
    ├── → Concept[ ]
    │
    ├── CastMember[ ] (L1)
    │   └── StageAppearance[ ] (L2-within-Campaign)
    │       └── DialogueState[ ] (L3)
    │           └── DialogueLine[ ] (L4)
    │
    ├── ProgressionLevel[ ] (L1)
    ├── Item[ ] (L1)
    ├── Ability[ ] (L1)
    │
    └── Act[ ] (L1)
        ├── ActBoss (L1)           ← owned by Act, not Stage
        │   ├── → Concept[ ]
        │   └── BossPhase[ ] (L4)
        │       └── → Challenge[ ]
        │
        └── Stage[ ] (L1-within-Act)
            ├── → Concept (primary)
            ├── → CastMember[ ]
            │
            └── Beat[ ] (L2) ← ORDERED SEQUENCE — this is the v2 change
                │
                ├── Beat { type: ARRIVAL, position: 1 }
                │   └── payload: StoryBeat (L3)
                │       └── → CastMember (if cast-driven)
                │
                ├── Beat { type: EXPLORATION, position: 2 }
                │   └── payload: Region (L3)
                │       ├── ExplorationPoint[ ] (L4)
                │       └── EnvironmentalStory[ ] (L4)
                │
                ├── Beat { type: KNOWLEDGE, position: 3..N }
                │   └── payload: KnowledgeBeat (L3)
                │       ├── → Concept
                │       └── KnowledgePanel[ ] (L4)
                │
                ├── Beat { type: QUEST, position: N }
                │   └── payload: Quest (L3)
                │       ├── → NPC (giver)
                │       ├── → CastMember (if cast-driven)
                │       ├── QuestStep[ ] (L4)
                │       ├── QuestResolutionCondition[ ] (L4)
                │       │   └── → Concept (mastery check)
                │       └── → Reward
                │
                ├── Beat { type: ENCOUNTER, position: N }
                │   └── payload: Enemy (L3)
                │       ├── → Concept
                │       ├── EncounterTrigger (L4)
                │       └── → Challenge[ ]
                │
                ├── Beat { type: MINI_CHALLENGE, position: N }
                │   └── payload: MiniChallenge (L3)
                │       └── → Challenge
                │
                ├── Beat { type: DUNGEON, position: N }
                │   └── payload: Dungeon (L3)
                │       ├── → Enemy[ ]
                │       ├── MiniBoss (L4)
                │       │   └── → Challenge[ ]
                │       └── → KnowledgeBeat[ ]
                │
                ├── Beat { type: BOSS, position: N }
                │   └── payload: Boss (L3)
                │       ├── → Concept[ ]
                │       └── BossPhase[ ] (L4)
                │           └── → Challenge[ ]
                │
                ├── Beat { type: NPC_INTERACTION, position: N }
                │   └── payload: NPC (L3)
                │       └── DialogueState[ ] (L4)
                │           └── DialogueLine[ ] (L4)
                │
                ├── Beat { type: CUTSCENE, position: N }
                │   └── payload: CutsceneEvent (L3)
                │
                ├── Beat { type: CHECKPOINT, position: N }
                │   └── payload: Checkpoint (L4)
                │
                └── Beat { type: PORTAL, position: final }
                    └── payload: Portal (L3)
                        └── → Stage (next)
```

> **Key rules in the Beat model:**
> - Every Beat has a unique position within its Stage's sequence
> - Stage validation checks ordering (KNOWLEDGE before ENCOUNTER, BOSS before PORTAL, etc.)
> - A Stage owns its Beats; a Beat owns its payload; payload entities own their children
> - The Beat type is not the payload type — Beat is the envelope; the payload is the content

**Special case — Act Boss:** ActBoss is owned by the Act (L1), not by any Stage or Beat. It is unlocked by Act progression, not by a Stage's Beat sequence.

```
Act (L1)
├── Stage[ ]
│   └── Beat[ ] (Stage's sequence, L2)
└── ActBoss (L1)          ← outside any Stage's Beat sequence
    ├── → Concept[ ]
    └── BossPhase[ ] (L4)
        └── → Challenge[ ]
```

---

## 4. Ownership rules

These rules define what "owns" means in this hierarchy and what consequences follow.

### Rule O-1 — Owners are responsible for their children's lifecycle

If a Stage is removed from a campaign, all its Beats are removed, and all Beat payloads are removed with them. Nothing a Stage *owns* (Beats and their payloads) survives its deletion.

Content a Stage or Beat *references* (Concepts, CastMembers, Themes) is not affected.

### Rule O-2 — Only platform-level content (L0) is owned by no one

Concepts, Themes, and ChallengeTypes are platform-level. No single campaign owns them. They persist across all campaigns and are never deleted when a campaign is removed.

### Rule O-3 — Campaign-level content cannot be shared across campaigns

CastMembers, Items, Abilities, and ProgressionLevels are owned by one campaign. Lyra exists in Kubernetes Kingdom only. If Linux Realms wants its own archivist character, that is a new CastMember — it is not Lyra reused.

*Exception: Themes and Concepts are platform-level and ARE shared.*

### Rule O-4 — Beat payloads cannot be shared across Stages

A Quest payload is owned by one Beat in one Stage. An Enemy payload is owned by one Beat in one Stage. A Beat's payload cannot appear in another Stage's Beat sequence.

*The correct design when a local NPC needs to appear in multiple stages: promote them to CastMember at campaign level, then reference them via AppearanceTrigger from the relevant Beats.*

### Rule O-5 — A Beat owns its payload; a payload owns its children

A Beat owns exactly one payload entity. The payload owns its children (QuestStep, BossPhase, KnowledgePanel, etc.). Children do not outlive their payload. The payload does not outlive its Beat.

Payloads can reference upward: a QuestResolutionCondition can reference a Concept (L0) to check mastery state. A DialogueLine can reference a CastMember (L1) for a cast-driven NPC response.

### Rule O-6 — Beats are ordered; order is data, not convention *(v2)*

A Stage's Beats are a sequence, not a bag. Each Beat has an explicit position. The engine validates ordering rules against this sequence. The 9-beat arc pattern (KNOWLEDGE before ENCOUNTER, BOSS before PORTAL, etc.) is enforced by content validation, not by design convention alone.

---

## 5. The Challenge pool — a special ownership case

Challenges are the most consequentially ambiguous entity in the hierarchy. They can logically be owned in three different ways, each with different tradeoffs. This is Decision D-CA-06, flagged in `ai-phase-plan.md §Phase 2.4` as requiring human input. This phase documents the three structural options without choosing between them.

### Option A — Embedded ownership (Challenge owned by its user)

```
Enemy
└── Challenge[ ]  ← enemy owns its challenges directly

Boss
└── BossPhase
    └── Challenge[ ]  ← boss phase owns its challenges

MiniChallenge
└── Challenge  ← owned directly
```

**What this means:** challenges are not reusable. If Concepts are tested differently in Stage 3 vs Stage 8, those are two separate Challenge objects with different content. Simple to author; no reuse.

### Option B — Concept pool (Challenge owned by Concept)

```
Concept (L0)
└── ChallengePool
    └── Challenge[ ]  ← all challenges for this concept, at all difficulty tiers

Enemy → references Concept → draws from ChallengePool (filtered by difficulty, type)
Boss → references Concept[ ] → draws from matching ChallengePools
```

**What this means:** all challenges for "Pod" concepts live in one pool. Enemies and bosses reference the pool rather than owning challenges directly. Challenges are reusable across any enemy or stage that teaches Pods. More complex to author; high reuse.

### Option C — Campaign pool (Challenge owned by Campaign, tagged by concept + difficulty)

```
Campaign (L1)
└── ChallengePool
    └── Challenge[ ]  ← tagged: concept, difficulty, type, stage-range

Stage → references Campaign pool, filters by concept + difficulty
Enemy → same
Boss → same
```

**What this means:** one flat pool per campaign. Everything draws from it via tags. Maximum flexibility; highest authoring complexity.

**Structural note for Phase 2.4:** whichever option is chosen, the Challenge entity itself has the same structure — concept reference, challenge type, correct answer, distractors, difficulty tier, world context. Only the ownership and lookup mechanism differs.

---

## 6. Reference rules (what can point to what)

References are non-ownership links. Referenced content is not affected when the referencing entity is deleted.

| Entity | Can reference | Cannot reference |
|---|---|---|
| Stage | Concept (L0), CastMember (L1), Theme (L0) | Other stages (except via Portal), content owned by other stages |
| NPC (local) | Concept (via quest condition), Quest (it gives) | CastMember data directly — local NPCs are not cast members |
| Quest | NPC (giver), CastMember (if cast-driven), Concept (mastery check), Reward | Quests in other stages |
| Boss | Concept[ ] (multiple), Challenge[ ] | Stage-owned NPCs, stage-owned quests |
| CastMember | — (no outbound refs from cast definition itself) | — |
| DialogueState | CastMember (for cast-to-cast dialogue), Concept (for knowledge-gated branches), Quest (for quest-state conditions) | Content in other stages |
| PortalTransition | Stage (next stage ID) | Content owned by the destination stage |
| Reward | Item (L1), Ability (L1), ProgressionLevel (L1) | Platform-level content directly — rewards are campaign-scoped |

---

## 7. Reuse rules — what can be reused and what cannot

### Can be reused (platform-level, L0)

| Entity | Reuse scope |
|---|---|
| Concept | Reusable across all campaigns. "Container" is a concept in Kubernetes Kingdom AND Docker Dominion. |
| Theme | Reusable across all campaigns. Fantasy Kingdom can apply to any future campaign. |
| ChallengeType | Reusable across all campaigns and all challenge instances. |

### Can be reused within a campaign (campaign-level, L1)

| Entity | Reuse scope |
|---|---|
| CastMember | Appears in multiple stages within one campaign. Lyra appears in Stages 1–13. Not reusable in other campaigns. |
| Item | Can be rewarded in multiple quests/stages within one campaign. |
| Ability | Player's abilities persist across stages within one campaign. |
| ProgressionLevel | Thresholds apply campaign-wide. |
| ActBoss | Referenced from the act; appears at act completion, not tied to one stage. |

### Cannot be reused — strictly stage-scoped (L2)

| Entity | Why not reusable |
|---|---|
| NPC (local) | Persona, quest hook, and personality are specific to one stage's narrative. Promote to CastMember if multi-stage appearance is needed. |
| Quest | Stage-specific story context. A quest from Stage 5 cannot appear in Stage 3 without breaking narrative sequencing. |
| KnowledgeBeat | Tied to a specific discovery event in a specific stage. The same concept is introduced differently in each stage context. |
| Dungeon | Every dungeon is architecturally specific to its stage's concept. |
| Region | World locations are stage-specific. |
| Enemy (instance) | Enemy instances are stage-specific. Enemy *types* can inspire similar enemies in other stages, but they are separate content objects. |
| Stage Boss | Boss is specific to the stage it validates. |

### Can be reused — with care (requires explicit design decision per case)

| Entity | Condition for reuse |
|---|---|
| Challenge | Depends on pool decision (D-CA-06). Under Option B or C, challenges can be reused across stages for the same concept. Under Option A, they cannot. |
| DialogueState | A CastMember's dialogue states span multiple stages (Lyra has a state for each stage appearance). This is reuse of the *container* (the CastMember), not of the states themselves. |
| StoryBeat | Specific story beats (the Khaosynth intercept in Stage 13) are unique. But a generic story beat *type* (NPC reaction to stage completion) can be parameterised and instantiated per stage. |

---

## 8. Theme rules — what varies and what never varies

### The invariant core (never changes between themes)

These fields of any entity must be identical regardless of which theme is active:

- Concept references
- Challenge questions, correct answers, and distractors
- Quest resolution conditions (especially mastery checks)
- Boss phase concept requirements
- Knowledge panel technical content (definitions, examples, commands)
- Progression thresholds and reward values (XP, HP recovery, etc.)
- Gameplay flags (quest unlock conditions, stage completion triggers)
- Concept mastery state definitions

**Rule T-1:** No theme override may touch any field in the invariant core. A theme can rename a region but cannot change which concept it teaches. A theme can rename an enemy but cannot change which challenge type it uses.

### The theme surface (varies by theme)

These fields are overridable per theme:

- All visible names (region name, NPC name, enemy name, item name, ability name, stage title, campaign title, act title, boss name)
- All descriptive text (region description, NPC personality framing, lore text, portal narrative)
- Visual tags (region visual type, NPC visual archetype, enemy visual type)
- Audio tags (music theme ID, ambient sound ID)
- Knowledge panel framing text (the *narrative wrapper* around a concept, not the concept itself — e.g., "scrolls" in Fantasy become "data tablets" in Space)

**Rule T-2:** ThemeOverride is additive only. It does not replace the base entity; it patches specific fields. The base entity (theme-neutral) always exists. Themes layer on top.

**Rule T-3:** Every entity with theme-variant fields must have a complete base (theme-neutral) version. A themed version cannot exist without a valid theme-neutral base.

**Rule T-4:** Adding a third theme requires only new ThemeOverride objects — it does not require any change to the base entity definitions.

### Theme hierarchy diagram

```
Entity (base — theme-neutral)
├── invariantCore: { conceptRef, challenges, questConditions, ... }  ← NEVER overridden
└── themeVariantFields: { name, description, visualTag, ... }        ← base values

ThemeOverride (Fantasy)
└── patches themeVariantFields for entity X

ThemeOverride (Space)
└── patches themeVariantFields for entity X

ThemeOverride (Future)
└── patches themeVariantFields for entity X
```

At runtime: engine loads base entity + the active theme's overrides for that entity.

---

## 9. Lifecycle rules

### Creation

A content entity is created when its parent is authored. A Stage is created by a content author filling in the campaign's stage list. An NPC is created by filling in a stage's NPC list. A Challenge is created by filling in an enemy's challenge configuration (or a concept pool, depending on D-CA-06).

Platform-level entities (Concepts, Themes, ChallengeTypes) are created when a new concept or theme is added to the platform. They are not campaign-authored.

### Modification

Any entity can be modified freely before the campaign is released. After release, modifications to invariant-core fields (concept references, challenge answers, mastery conditions) require a versioned content update. Theme surface modifications are lower-risk and can be updated more freely.

**Rule L-1:** Modifying a Concept definition (the thing the player is learning) is a platform-level change and cascades to all campaigns that reference that concept. This must be tracked carefully.

### Deletion

**Rule L-2:** Deleting an entity deletes everything it owns (Rule O-1). This cascade is always explicit — content systems must confirm before deleting a Stage, because it removes all nested content.

**Rule L-3:** Platform-level entities (Concepts, Themes, ChallengeTypes) are never deleted while any campaign references them. Removing a Concept requires removing all its KnowledgeBeat references, Challenge references, and QuestResolutionCondition references first.

### Retirement (for live campaigns)

After a campaign ships, content may be retired (hidden from players) rather than deleted, to preserve save state integrity. A retired Stage is not shown in the campaign but its PlayerProgress records remain valid.

---

## 10. Campaign boundary rules

These rules define where one campaign ends and another begins.

### Rule CB-1 — Campaigns share platform content, nothing else

Two campaigns share: Concepts (L0), Themes (L0), ChallengeTypes (L0). They share nothing at L1 or below.

### Rule CB-2 — Player progress does not cross campaign boundaries

A player's ConceptMastery state, ProgressionLevel, Inventory, and quest completion are scoped to one campaign. Completing Kubernetes Kingdom Stage 3 does not affect Linux Realms in any way. (Anti-Pattern 7.8.)

### Rule CB-3 — A campaign is a closed namespace

A Quest in Campaign A can never reference an NPC from Campaign B. A Boss in Campaign A can never draw challenges from Campaign B's pool (if Campaign pool model is chosen). The campaign boundary is a hard namespace boundary.

### Rule CB-4 — The engine loads one campaign at a time

The engine does not need to hold more than one campaign in memory. Platform-level content (Concepts, Themes) is always loaded. The rest is campaign-specific and loaded on campaign selection.

---

## 11. Progression-specific content

Progression content is campaign-scoped but cuts across stage boundaries.

```
Campaign
├── ProgressionLevel[ ]     ← XP thresholds that apply campaign-wide
├── Ability[ ]              ← player's combat abilities, unlocked as they progress
├── Item[ ] (key items)     ← items that persist across stages (e.g., dungeon keys, quest items)
└── CastMember[ ]           ← recurring cast persists across all stages
```

**Rule P-1:** Progression state (player's current level, discovered knowledge, inventory) is never owned by a Stage. Stages contribute to progression (completing a stage awards XP, adds knowledge, gives items) but do not own the player's progression record.

**Rule P-2:** Knowledge mastery state is the most important progression data. It is the foundation of every knowledge-gated dialogue, traversal unlock, and quest resolution condition. It must be queryable at any point during a session.

**Rule P-3:** XP and levels are mechanics that serve the adventure fantasy. They are not a "knowledge score" (Anti-Pattern 7.4). A player who grinds enemies without understanding concepts may gain XP, but they will fail mastery-gated content. The two tracks are parallel and non-fungible.

---

## 12. The 9-beat arc in the hierarchy *(v2 — Beat-centric)*

The gameplay loop defines 9 beat types per stage. In the Beat-centric model, each beat type is a typed Beat in the Stage's ordered sequence. Beat is the owner; the content entity is its payload.

| Beat type | Beat level | Payload type | Payload children |
|---|---|---|---|
| ARRIVAL | L2 | StoryBeat (L3) | → CastMember (if cast-driven) |
| EXPLORATION | L2 | Region (L3) | ExplorationPoint[ ] (L4), EnvironmentalStory[ ] (L4) |
| KNOWLEDGE | L2 | KnowledgeBeat (L3) | KnowledgePanel[ ] (L4) |
| QUEST | L2 | Quest (L3) | QuestStep[ ] (L4), QuestResolutionCondition[ ] (L4) |
| ENCOUNTER | L2 | Enemy (L3) | EncounterTrigger (L4), → Challenge[ ] |
| MINI_CHALLENGE | L2 | MiniChallenge (L3) | → Challenge |
| DUNGEON | L2 | Dungeon (L3) | MiniBoss (L4), → Enemy[ ], → KnowledgeBeat[ ] |
| BOSS | L2 | Boss (L3) | BossPhase[ ] (L4) → Challenge[ ] |
| NPC_INTERACTION | L2 | NPC (L3) | DialogueState[ ] (L4) → DialogueLine[ ] (L4) |
| CUTSCENE | L2 | CutsceneEvent (L3) | — |
| CHECKPOINT | L2 | Checkpoint (L4) | — |
| PORTAL | L2 | Portal (L3) | → Stage (next, reference only) |

**Rule B-1 (v2):** Beat IS a first-class entity type. It is not a named slot or a design convention. A Stage owns a `Beat[]` sequence. Each Beat has: an ID, a position (integer), a type (from the list above), and exactly one typed payload. See `ai-beat-model.md` for the full Beat entity definition.

**Rule B-2:** Not all beat types are required in every stage. The Campaign declares its required beat types per stage. The Final Stage has no PORTAL beat. Some stages may have no MINI_CHALLENGE beats. Validation checks required beat types are present and in valid ordering.

**Rule B-3 (v2):** Beat ordering is validated data, not convention. The engine enforces that KNOWLEDGE beats precede the first ENCOUNTER beat; that the BOSS beat precedes the PORTAL beat; that DUNGEON precedes BOSS. These rules are declared in the Campaign's beat-ordering configuration.

---

## 13. Summary: the seven structural answers *(v2 — Beat-centric)*

| Question | Answer |
|---|---|
| **Top-level entities** | Platform → Campaign → Act → Stage → Beat. Plus platform-level singletons: Concept, Theme, ChallengeType. |
| **What owns what** | Platform owns Campaigns and platform-level entities. Campaign owns Acts, CastMembers, Items, Abilities, ProgressionLevels. Act owns Stages (and ActBosses). **Stage owns Beats. Beat owns its payload. Payload owns its children.** |
| **What references what** | Stage references Concepts (L0), CastMembers (L1). Beat payloads reference Concepts for mastery checks and Challenges from pools. Portal payload references next Stage. |
| **What can be reused** | L0 entities (Concept, Theme, ChallengeType) — reusable across all campaigns. L1 entities (CastMember, Item, Ability) — reusable within one campaign. Challenges — reuse depends on D-CA-06 decision. |
| **What cannot be reused** | L2 stage-scoped entities: NPC, Quest, KnowledgeBeat, Dungeon, Region, Enemy, Stage Boss. These are stage-specific and do not transfer. |
| **Campaign-specific content** | Everything at L1 (Campaign, Act, CastMember, ProgressionLevel, Item, Ability) and below. Nothing in one campaign is accessible from another. |
| **Engine-wide content** | L0 entities only: Concept, Theme, ChallengeType. Loaded once at startup; shared across all campaigns. |
| **Theme-specific content** | ThemeOverride objects that patch the theme surface of any entity. Theme-neutral base always exists. Invariant core never overridden. |
| **Progression-specific content** | ProgressionLevel, Ability, and Item at campaign level (L1). KnowledgeMastery state is player-runtime data, not static content — but its schema is defined by the Concept model. |

---

## 14. Open decisions carried forward to Phase 2.2

Phase 2.1 surfaces three decisions that were identified but not resolved here. They belong to later phases as specified:

| Decision | Phase | Status |
|---|---|---|
| D-CA-06 — Challenge pool architecture (embedded / concept pool / campaign pool) | Phase 2.4 | Open — requires human input |
| D-CA-01 — Does Act exist as a data entity (recommendation: yes, lightweight) | Phase 2.8 | Recommendation made; confirm in decisions review |
| D-CA-05 — CastMember as separate type vs NPC with flag (recommendation: separate type) | Phase 2.8 | Recommendation made; confirm in decisions review |

---

## Cross-references

- `milestones/milestone-02-content-architecture/ai-content-entity-inventory.md` — the 40 entity types this hierarchy organises
- `milestones/milestone-02-content-architecture/ai-phase-plan.md` — Phase 2.2 (Campaign + Stage Model) is the next to execute, building on this hierarchy
- `game-design/ai-vision.md §5` — Knowledge Doctrine constraints honoured throughout
- `game-design/ai-gameplay-loop.md §3` — 9-beat arc mapped to entity slots in §12 above
- `game-design/ai-campaign-structure.md` — the campaign data this hierarchy must represent
- `DECISIONS.md` — D-CA decisions will be recorded here once resolved in Phase 2.8
