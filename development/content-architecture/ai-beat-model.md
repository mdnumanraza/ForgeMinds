# ForgeMinds — Beat Model

> **Purpose:** Canonical definition of the Beat entity — the first-class content unit between Stage and all stage-level content in ForgeMinds.
> **Status:** v1 — canonical. All phase documents from 2.1 onward reference this model.
> **Owned by:** AI
> **Cites:** `ai-beat-centric-architecture-investigation.md` (design spike), `ai-phase-02-01-content-hierarchy.md` (scope levels), `ai-gameplay-loop.md §3` (9-beat arc)

---

## Why Beat exists

The 9-beat arc (`ai-gameplay-loop.md §3`) defines the structure of every stage: Arrival → Exploration → Discovery → Quests → Encounters → Mini-challenges → Dungeon → Boss → Portal. Before Beat-centric architecture, this arc was a design convention — content authors were expected to follow it, but the data structure did not enforce it.

A Beat is what makes the arc a **data structure rather than a convention**. When Beat is a first-class entity:

- Stage ordering is explicit and machine-validatable
- A visual editor maps directly to the data (each Beat = one card in a timeline)
- AI content generation outputs a Beat sequence natively
- Validation checks ordering rules, not just presence
- Cross-beat queries are possible ("all Beats in Act 2 that reference Concept X")

A Beat is **not** a new category of content. It is an **envelope** that carries existing content (KnowledgeBeat, Quest, Enemy, etc.) in a position-aware, type-tagged, ordered structure.

---

## Beat definition

A Beat is the atomic unit of stage structure. It has four properties:

| Property | Description |
|---|---|
| `id` | Unique identifier within the stage |
| `position` | Integer — the Beat's place in the stage sequence. Lower = earlier. Must be unique within a stage. |
| `type` | The category of gameplay moment this Beat represents (see Beat types below) |
| `payload` | The typed content entity this Beat carries — exactly one, always the type indicated by `type` |

A Beat owns its payload. A payload does not exist without a Beat to own it.

---

## Beat types

These are the valid Beat types. Each type has exactly one valid payload type.

| Beat type | Payload type | Description |
|---|---|---|
| `ARRIVAL` | StoryBeat | The stage's opening narrative moment — "something is wrong here" |
| `EXPLORATION` | Region | The world space the player can traverse; contains ExplorationPoints and EnvironmentalStory |
| `KNOWLEDGE` | KnowledgeBeat | A discrete concept discovery moment — scroll, NPC reveal, dungeon reveal |
| `QUEST` | Quest | A structured task that applies the stage's concept to a problem someone in the world has |
| `ENCOUNTER` | Enemy | A knowledge-powered combat encounter with a corrupted creature |
| `NPC_INTERACTION` | NPC | A stage-local character interaction (dialogue, lore, relationship) |
| `MINI_CHALLENGE` | MiniChallenge | A variety challenge beat — no HP cost on failure; different form from combat |
| `DUNGEON` | Dungeon | The deeper zone — escalating encounters, hidden knowledge, mini-boss |
| `BOSS` | Boss | The mastery validation encounter — combines concepts, validates understanding |
| `CUTSCENE` | CutsceneEvent | A non-interactive scripted narrative sequence |
| `CHECKPOINT` | Checkpoint | A save point — placed after satisfying beats, never mid-beat |
| `PORTAL` | Portal | The transition event that closes the stage and opens the next |

---

## Beat responsibilities

A Beat is responsible for:

- **Holding its position** in the stage's sequence
- **Declaring its type** so the engine knows what payload to expect
- **Owning its payload** — the payload's lifecycle is bound to the Beat
- **Carrying AppearanceTriggers** — declarative events that activate CastMember dialogue states when this Beat fires (e.g., "when this BOSS beat begins, activate Kestran's Stage-12 dialogue state")

A Beat is NOT responsible for:

- The logic of what its payload does — that is the payload's concern
- Knowing what came before it or after it — sequence is the Stage's concern, not the Beat's
- Cross-stage references — a Beat is strictly scoped to one Stage

---

## Beat ownership

```
Stage (L1-within-Act)
└── Beat[ ] (L2)          ← Stage owns Beats
    └── payload (L3)      ← Beat owns its payload
        └── children (L4) ← Payload owns its children
```

**Rule B-1:** A Beat is owned by exactly one Stage. It cannot be shared across stages.

**Rule B-2:** A Beat owns exactly one payload. No Beat has zero payloads. No Beat has more than one.

**Rule B-3:** If a Stage is deleted, all its Beats are deleted, and all Beat payloads are deleted with them.

**Rule B-4:** Beat position integers do not need to be consecutive, but they must be unique within a stage and form a valid ordering. Gaps are allowed (positions 1, 3, 7 is valid — the Stage's Beat sequence is sorted by position value).

---

## Beat lifecycle

```
DRAFT → CONTENT_COMPLETE → VALIDATED → PUBLISHED
```

- **DRAFT:** Beat exists in the stage sequence; payload may be incomplete
- **CONTENT_COMPLETE:** Payload is fully authored; required fields are populated
- **VALIDATED:** Ordering rules checked; no broken references; payload passes its own validation
- **PUBLISHED:** Included in a published Stage/Campaign

A Beat's lifecycle is bound to its Stage's lifecycle. A Beat cannot be published without its Stage. A Beat cannot exist after its Stage is deleted.

---

## Beat ordering rules

These rules are checked during Stage validation (Phase 2.9 equivalent). They are data rules, not design conventions.

| Rule | Condition |
|---|---|
| BO-1 | At least one KNOWLEDGE beat must precede the first ENCOUNTER beat |
| BO-2 | At least one KNOWLEDGE beat must precede the first QUEST beat |
| BO-3 | DUNGEON beat must precede the BOSS beat |
| BO-4 | BOSS beat must precede the PORTAL beat (if PORTAL exists) |
| BO-5 | ARRIVAL beat, if present, must be the lowest-position beat |
| BO-6 | PORTAL beat, if present, must be the highest-position beat |
| BO-7 | No two Beats in the same Stage may have the same position value |

**Campaign-configurable:** the Campaign declares which beat types are required for its stages. The engine checks required types are present and that ordering rules are satisfied. A future campaign with a different beat structure declares different required types and different ordering rules — no engine change required.

---

## AppearanceTrigger — how Beats interact with CastMembers

A Beat can carry AppearanceTriggers — declarative bindings that tell the engine "when this Beat fires, activate a specific dialogue state on a Campaign-level CastMember."

```
Beat { type: BOSS, position: 11, payload: Boss }
└── AppearanceTrigger
    ├── castMemberId   → Lyra (Campaign-level)
    ├── event          → "beat-started"
    └── targetStateId  → Lyra.StageAppearance[Stage-12].DialogueState["watching-boss-fight"]
```

AppearanceTriggers live on the Beat, not the payload, not the Stage. This is the clean separation: the Beat is the event context; the CastMember holds the words.

---

## Beat validation

A Beat is valid when:

- [ ] It has a non-empty `id`, a valid `position` integer, and a valid `type`
- [ ] Its `payload` is of the type declared by `type`
- [ ] Its `payload` passes its own entity validation (e.g., Quest payload has at least one QuestStep; KnowledgeBeat payload has a valid Concept reference)
- [ ] All AppearanceTriggers reference valid CastMember IDs and valid DialogueState IDs within that CastMember's StageAppearance for this Stage
- [ ] Its position is unique within its Stage

A Stage is valid when:

- [ ] All Beats in its sequence are individually valid
- [ ] Beat ordering rules BO-1 through BO-7 are satisfied
- [ ] All required beat types (as declared by the Campaign) are present

---

## Beat and the 9-beat arc

The 9-beat arc from `ai-gameplay-loop.md §3` maps to Beat types as follows. Note that a stage may have more than 9 beats — multiple KNOWLEDGE and ENCOUNTER beats are expected.

| Arc beat | Beat type(s) |
|---|---|
| 1. Arrival | `ARRIVAL` |
| 2. Exploration | `EXPLORATION` |
| 3. Discovery | `KNOWLEDGE` (one or more) |
| 4. Quests | `QUEST` (one or more) |
| 5. Encounters | `ENCOUNTER` (one or more) |
| 6. Mini-challenges | `MINI_CHALLENGE` (one or more) |
| 7. Dungeon | `DUNGEON` |
| 8. Boss | `BOSS` |
| 9. Portal | `PORTAL` |

Supporting beats that appear as needed: `NPC_INTERACTION`, `CUTSCENE`, `CHECKPOINT`.

---

## Beat reuse rules

| Reuse | Rule |
|---|---|
| Beat instance | NOT reusable. A Beat belongs to one Stage only. |
| Beat type | Reusable — the same type appears in every stage and in every campaign. The engine knows all Beat types; it never knows campaign-specific content. |
| Beat payload entity | NOT reusable. A Quest payload owned by one Beat cannot appear in another Beat or Stage. |

---

## Beat and AI content generation

The Beat model is the natural format for AI-generated stage content. A generation prompt can request "produce a Beat sequence for a stage teaching [Concept] in [Theme]" and receive a typed, ordered list. Each Beat in the output maps directly to the data model — no post-processing required.

This is the primary motivation for adopting Beat-centric architecture before the engine is built. The generation interface and the data interface are the same shape.

---

## Cross-references

- `content-architecture/ai-beat-centric-architecture-investigation.md` — the design spike that produced this decision
- `content-architecture/ai-phase-02-01-content-hierarchy.md` — Beat is L2 in the scope hierarchy
- `content-architecture/ai-phase-02-02-campaign-act-stage-model.md` — Stage model updated to own `Beat[]`
- `game-design/ai-gameplay-loop.md §3` — the 9-beat arc that Beat-centric architecture encodes as data
- `DECISIONS.md` — record this decision as D-CA-BEAT: "Beat adopted as first-class L2 entity; Stage owns Beat[]; all former Stage-level content entities are now Beat payloads (L3)"
