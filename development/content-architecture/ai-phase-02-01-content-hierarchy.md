# ForgeMinds — Content Hierarchy

> **Phase:** 2.1 — Content Hierarchy
> **Purpose:** Define the ownership tree, dependency rules, reuse rules, and lifecycle rules for all ForgeMinds content entities — before any storage or schema decisions are made.
> **Status:** v1 — conceptual only. No schemas, no storage format, no implementation details.
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
│  LEVEL 2 — STAGE                            │
│  Owned by one stage within a campaign.      │
│  Examples: NPC, Enemy, Quest, Dungeon,      │
│  KnowledgeBeat, Region, Boss (stage boss)   │
├─────────────────────────────────────────────┤
│  LEVEL 3 — BEAT                             │
│  Owned by a specific content beat within    │
│  a stage. Examples: QuestStep, BossPhase,   │
│  DialogueState, KnowledgePanel, Portal      │
├─────────────────────────────────────────────┤
│  LEVEL 4 — ATOMIC                           │
│  Smallest content units. Owned by their     │
│  parent beat. Examples: DialogueLine,       │
│  Challenge, ThemeOverride, Checkpoint,      │
│  EnvironmentalStory                         │
└─────────────────────────────────────────────┘
```

**Scope rule:** content at level N can only be *owned* by content at level N-1 or above. Content at any level can *reference* (point to) content at level 0 (platform). This is the fundamental rule that makes campaigns swappable without code changes.

---

## 3. The full ownership tree

Reading this tree: indented items are **owned by** their parent. An arrow (→) means **references** (does not own; the referenced entity is defined elsewhere).

```
Platform
├── Theme (L0)
│   └── ThemeOverride (L4)  ← applied to any entity with theme-variant fields
│
├── Concept (L0)            ← the K8s/Linux/Docker concept being taught
│   └── [linked to by KnowledgeBeat, Challenge, Enemy, Boss]
│
├── ChallengeType (L0)      ← MCQ, CommandCompletion, Debugging, etc. (enum)
│
└── Campaign (L1)
    ├── → Theme[ ]           ← which themes this campaign supports
    ├── → Concept[ ]         ← which concepts appear in this campaign
    │
    ├── CastMember[ ] (L1)   ← Lyra, Kestran, Voss, Mira, Khaosynth
    │   └── DialogueState[ ] (L3)
    │       └── DialogueLine[ ] (L4)
    │
    ├── ProgressionLevel[ ] (L1)
    ├── Item[ ] (L1)
    ├── Ability[ ] (L1)
    │
    └── Act[ ] (L1)
        └── Stage[ ] (L2)
            ├── → Concept (primary)     ← which concept this stage teaches
            ├── → CastMember[ ]         ← which recurring cast appear here
            │
            ├── Region (L2)
            │   ├── ExplorationPoint[ ] (L3)
            │   └── EnvironmentalStory[ ] (L4)
            │
            ├── KnowledgeBeat[ ] (L2)
            │   ├── → Concept            ← which concept this beat reveals
            │   └── KnowledgePanel[ ] (L3)
            │
            ├── NPC[ ] (L2)             ← local NPCs (1–3 per stage)
            │   └── DialogueState[ ] (L3)
            │       └── DialogueLine[ ] (L4)
            │
            ├── Quest[ ] (L2)
            │   ├── → NPC (giver)
            │   ├── → CastMember (if cast-driven)
            │   ├── QuestStep[ ] (L3)
            │   ├── QuestResolutionCondition[ ] (L3)
            │   │   └── → Concept (mastery check)
            │   └── → Reward
            │
            ├── Enemy[ ] (L2)
            │   ├── → Concept            ← concept failure mode this enemy represents
            │   ├── EncounterTrigger (L3)
            │   └── → Challenge[ ]       ← see Challenge pool section (§5)
            │
            ├── MiniChallenge[ ] (L2)
            │   └── → Challenge
            │
            ├── Dungeon (L2)
            │   ├── → Enemy[ ]
            │   ├── MiniBoss (L2)
            │   │   └── → Challenge[ ]
            │   └── → KnowledgeBeat[ ]  ← dungeon-deep knowledge reveals
            │
            ├── Boss (L2 or L1 for act bosses)
            │   ├── → Concept[ ]         ← concepts combined in this boss
            │   └── BossPhase[ ] (L3)
            │       └── → Challenge[ ]
            │
            ├── StoryBeat[ ] (L2)
            │   └── → CastMember (if cast-driven)
            │
            ├── CutsceneEvent[ ] (L2)
            │
            ├── Reward (L2)              ← stage completion reward
            │   └── → Item / Ability / ProgressionLevel
            │
            ├── Portal (L3)
            │   └── → Stage (next)       ← unlock reference
            │
            └── Checkpoint[ ] (L4)
```

**Special case — Act Boss:** Act bosses (Isolation Wyrm, Severed Envoy, Corrupted Warden) are owned by the Act, not a single Stage. They span multiple stages' concepts and are unlocked by Stage completion, not by Stage ownership.

```
Act (L1)
├── Stage[ ] (L2)
│   └── Boss (stage boss — L2, owned by Stage)
└── ActBoss (L1, owned by Act)
    ├── → Concept[ ]  ← all act concepts combined
    └── BossPhase[ ]
        └── → Challenge[ ]
```

---

## 4. Ownership rules

These rules define what "owns" means in this hierarchy and what consequences follow.

### Rule O-1 — Owners are responsible for their children's lifecycle

If a Stage is removed from a campaign, all content it owns is removed with it: its NPCs, quests, enemies, dungeon, boss, knowledge beats, region, story beats, checkpoints. Nothing it *owns* survives its deletion.

Content it *references* (Concepts, CastMembers, Themes) is not affected.

### Rule O-2 — Only platform-level content (L0) is owned by no one

Concepts, Themes, and ChallengeTypes are platform-level. No single campaign owns them. They persist across all campaigns and are never deleted when a campaign is removed.

### Rule O-3 — Campaign-level content cannot be shared across campaigns

CastMembers, Items, Abilities, and ProgressionLevels are owned by one campaign. Lyra exists in Kubernetes Kingdom only. If Linux Realms wants its own archivist character, that is a new CastMember — it is not Lyra reused.

*Exception: Themes and Concepts are platform-level and ARE shared. A future campaign can use the Fantasy theme. A future campaign can teach the "container" concept.*

### Rule O-4 — Stage content cannot be shared across stages within a campaign

A local NPC is owned by one stage. The quest is owned by one stage. The dungeon is owned by one stage. Stage 5's Hadris cannot appear as a quest-giver in Stage 7 without becoming a referenced CastMember (L1), which changes her scope.

*The correct design when a local NPC needs to appear in multiple stages: promote them to CastMember at campaign level.*

### Rule O-5 — A Beat owns its children, but a Beat can reference up

A QuestStep is owned by its Quest. A BossPhase is owned by its Boss. A KnowledgePanel is owned by its KnowledgeBeat. Children do not outlive their beat container.

Beat-level content can reference upward: a QuestResolutionCondition can reference a Concept (L0) to check mastery state. A DialogueLine can reference a CastMember (L1) for a cast-driven NPC response.

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

## 12. The 9-beat arc in the hierarchy

The gameplay loop defines 9 beats per stage. In the content hierarchy, these beats map to owned entities as follows:

| Beat | Owner | Content entity type |
|---|---|---|
| 1. Arrival | Stage | StoryBeat (arrival variant) |
| 2. Exploration | Stage / Region | ExplorationPoint[ ], EnvironmentalStory[ ] |
| 3. Discovery | Stage | KnowledgeBeat[ ] → KnowledgePanel[ ] |
| 4. Quests | Stage | Quest[ ] → QuestStep[ ], QuestResolutionCondition[ ] |
| 5. Encounters | Stage | Enemy[ ] → EncounterTrigger, → Challenge[ ] |
| 6. Mini-challenges | Stage | MiniChallenge[ ] → Challenge |
| 7. Dungeon | Stage | Dungeon → Enemy[ ], MiniBoss, → KnowledgeBeat[ ] |
| 8. Boss | Stage (stage boss) or Act (act boss) | Boss → BossPhase[ ] → Challenge[ ] |
| 9. Portal | Stage | Portal → Stage (next, reference only) |

**Rule B-1:** Beats are not separate entity types. They are the named slots in the Stage's content. The Stage "has a Dungeon," "has KnowledgeBeats," "has Quests" — these are the beats. There is no abstract "Beat" entity.

**Rule B-2:** Not all beats are required in every stage. The Final Stage has no Portal. Some stages may have no Mini-challenges. The beat model is a named-slot system with campaign-defined requirements, not a mandatory list.

---

## 13. Summary: the seven structural answers

| Question | Answer |
|---|---|
| **Top-level entities** | Platform → Campaign → Act → Stage. Plus platform-level singletons: Concept, Theme, ChallengeType. |
| **What owns what** | Platform owns Campaigns and platform-level entities. Campaign owns Acts, CastMembers, Items, Abilities, ProgressionLevels. Act owns Stages (and ActBosses). Stage owns everything below it. |
| **What references what** | Stage references Concepts (L0), CastMembers (L1), and the next Stage via Portal. Beat-level content references Concepts for mastery checks and Challenges from pools. |
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
