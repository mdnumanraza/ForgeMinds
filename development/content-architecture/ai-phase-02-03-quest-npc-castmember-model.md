# ForgeMinds — Quest, NPC & CastMember Model

> **Phase:** 2.3 — Quest + NPC + CastMember + Dialogue Ownership
> **Purpose:** Define the conceptual architecture for quests, characters, and dialogue — the systems that carry story, learning, and human connection through every stage of a campaign.
> **Status:** v1 — conceptual only. No schemas, no storage, no implementation.
> **Owned by:** AI
> **Depends on:** `ai-phase-02-01-content-hierarchy.md`, `ai-phase-02-02-campaign-act-stage-model.md`
> **Cites:** `ai-vision.md §4 Pillars 1–4`, `ai-campaign-structure.md §Recurring Cast`, `ai-gameplay-loop.md §3`

---

## Guiding principle

The kingdom is not a quest-generation machine. NPCs are not quest dispensers. Characters remember. The world responds.

Every architectural decision in this phase must hold that principle under pressure — especially when it would be simpler to make an NPC a stateless trigger or a dialogue tree a flat list of strings.

---

## MODEL 1 — Quest

### What a Quest is

A Quest is a structured contract between the player and the world. It has a beginning (a problem made visible), a middle (the player applies what they know), and an end (the world changes because the player acted).

Every quest in ForgeMinds is one of two types — not as a technical distinction, but as a design lens:

| Type | Learning role | Story role |
|---|---|---|
| **Learning quest** | The quest IS the learning mechanism. The player cannot complete it without understanding the concept. | The story explains *why* this matters to someone in the world. |
| **Story quest** | The story is primary; the learning is embedded in solving it. | Advances the narrative, reveals character, changes the world's state. |

These are not separate systems. They are the same Quest structure with different emphasis. A quest about Mira's broken home is both a learning quest (demonstrates Pod co-location) and a story quest (establishes empathy for the campaign's most important mirror character). The system does not need to know which type it is — the content author makes it both.

### Why a Quest exists

Quests exist to give the player a *reason* to use what they have learned. Knowledge without application is information. Application without context is a test. A quest provides context that makes application feel like an adventure, not an exam.

A quest that could be completed without the player understanding the stage's concept has failed its primary purpose — regardless of how good the story is.

### What a Quest is responsible for

- Declaring its **trigger** — the condition that makes this quest available to the player (entering a region, interacting with an NPC, completing a prior quest, reaching a stage beat)
- Declaring its **giver** — the NPC or CastMember who offers the quest (or "none" for discovery quests triggered by world interaction)
- Holding its **steps** — the ordered sequence of objectives the player must accomplish
- Holding its **resolution conditions** — the conditions that determine how the quest ends, including branches based on the player's demonstrated understanding
- Declaring its **reward** — what the player receives on completion
- Declaring its **failure state** — what happens if the quest cannot be completed as designed (optional for quests that cannot fail)
- Declaring its **scope** — whether this quest is contained to one stage or spans multiple stages

### What a Quest explicitly does NOT own

- **Character definitions** — the NPC who gives a quest is not owned by the quest; the quest references the NPC by ID
- **Dialogue content** — the dialogue an NPC speaks when giving or completing a quest is owned by the NPC's DialogueState, not by the quest itself. The quest triggers the dialogue state; it does not contain the words.
- **Stage structure** — quests do not own stage beats, enemies, or the dungeon. They exist alongside these elements.
- **Player knowledge state** — a quest's resolution condition can *check* the player's mastery, but it does not own or modify it directly. Mastery is updated by the engine when knowledge beats are completed and challenges are answered.
- **Progression values** — XP rewards are referenced from the Campaign's progression model, not defined inside the quest.

### Quest scope — the stage vs multi-stage question

**Resolved here:** most quests are stage-scoped. But some quests in ForgeMinds demonstrably span stages — Mira's arc is the clearest example (Stage 2 → Stage 5 → Stage 10 → Final epilogue).

The model handles both through a **scope declaration** on every quest:

```
Quest.scope = "stage"    → owned by a Stage, completed within that Stage
Quest.scope = "campaign" → owned by the Campaign, spans multiple stages
```

A Campaign-scoped quest is owned by the Campaign (L1), not by any single Stage. Stages can *reference* a Campaign-scoped quest to trigger one of its steps. The quest tracks its own progress across those stage interactions.

**Rule Q-1:** A stage-scoped quest cannot reference content in another stage. A campaign-scoped quest can reference any stage's NPCs, regions, and story beats by ID.

**Rule Q-2:** Campaign-scoped quests are held in the Campaign's quest list, not in any Stage's quest list. A Stage that participates in a campaign-scoped quest declares it in a `referencedCampaignQuests[ ]` field — flagging to the engine that this stage has steps belonging to a campaign-level quest.

### Quest lifecycle

```
DORMANT → AVAILABLE → ACTIVE → COMPLETED
                            ↘ FAILED (optional states)
                            ↘ ABANDONED (if the quest is missable)
```

- **DORMANT:** Quest exists in content but is not yet available to the player (trigger condition not met)
- **AVAILABLE:** Trigger has fired; NPC is waiting with quest offer
- **ACTIVE:** Player has accepted the quest; steps are trackable
- **COMPLETED:** All steps done, resolution condition met, reward granted, world state updated
- **FAILED:** Failure condition met (rare — most ForgeMinds quests are completable at any pace)
- **ABANDONED:** Campaign-scoped quest missed due to stage skipping (expandable optional regions)

### Quest resolution conditions — branching on understanding

This is the most architecturally significant property of a Quest. From `ai-vision.md §5.2`:

> "Quest solutions branch on the player's understanding, not their inventory."

A QuestResolutionCondition is a rule that evaluates the player's state at the moment of resolution. It can check:

- **Concept mastery:** has the player demonstrated understanding of Concept X? (Required for all learning quests)
- **Knowledge beat completion:** has the player read KnowledgeBeat Y? (for discovery-gated quests)
- **Quest flag:** has Quest Z been completed? (for quest chains)
- **Stage completion:** has Stage N been completed? (for campaign-scoped quests)
- **NPC dialogue state:** has the player reached DialogueState D with CastMember C? (for relationship-driven quests)

A quest with only inventory conditions ("bring me 3 crystals") violates Pillar 1 (knowledge is the verb) unless the crystals ARE the knowledge (e.g., each crystal is obtained by completing a KnowledgeBeat). The condition type matters.

### Can a Quest exist without an NPC?

Yes. A **discovery quest** is triggered by interacting with a world object (an ancient scroll, a broken machine, an environmental story beat) — no NPC required. The quest's `giver` field is null; the `trigger` is the world interaction.

Example: finding a corrupted scroll in the Hollow Fields could trigger a discovery quest to "understand what this shell once held." No NPC gave it. The world gave it.

### Can an NPC exist without a Quest?

Yes. An NPC can exist purely as an environmental storytelling presence — someone who provides lore, reacts to world state, or demonstrates the emotional consequence of the stage's wound — without ever giving or receiving a quest. Mira in Stage 2 is close to this: she has a quest hook (her broken home), but her primary function is empathy, not quest delivery.

An NPC without a quest is still a meaningful content entity.

---

## MODEL 2 — NPC (Local)

### What a Local NPC is

A Local NPC is a named character scoped to one stage. They have a specific role in that stage's story (quest-giver, knowledge-keeper, practical anchor, lore bearer), a personality that shapes how they speak, and dialogue states that evolve based on the player's progress through the stage.

Local NPCs are not recurring characters. They are the human texture of a specific wound in a specific region. After the player leaves the stage, local NPCs are not forgotten — they are restored (their region is healing, they are still there) — but they do not travel with the player.

### Why local NPCs are separate from CastMembers

A Local NPC and a CastMember are both "characters." The distinction is scope and arc:

| | Local NPC | CastMember |
|---|---|---|
| **Scope** | One stage | Multiple stages across the campaign |
| **Arc** | Begins and ends within one stage | Evolves across acts |
| **Dialogue states** | Pre-quest, mid-quest, post-quest (3–5 states) | Can have 10–30+ states across 15 stage appearances |
| **Ownership** | Stage (L2) | Campaign (L1) |
| **Emotional function** | Regional texture, empathy, quest delivery | Narrative continuity, character growth, player relationship |
| **Example** | Bram (Stage 1), Hadris (Stage 5), Sigrid (Stage 12) | Lyra, Kestran, Voss, Mira |

The separation is not arbitrary. If both types were the same entity, every local NPC would need the infrastructure to track campaign-wide arc state — which they don't need and never use. And every CastMember would need to declare which stage "owns" them — which is wrong, because they belong to the Campaign.

### What a Local NPC is responsible for

- Declaring its **role** in the stage (quest-giver, knowledge-keeper, practical demonstration, lore bearer, community anchor)
- Declaring its **personality** in one or two lines (the essence of how they speak and behave)
- Holding its **DialogueStates** — the versioned dialogue available at each stage-progress checkpoint
- Declaring its **quest hook** — which quest(s) this NPC is involved in (as giver, mid-quest contact, or completion receiver)
- Declaring its **theme-variant name and description** — what they are called and what they look like in each theme

### What a Local NPC does NOT own

- Quest content — the NPC triggers and receives quests, but quest steps and conditions are owned by the Quest
- Stage structure — NPCs are content within a stage, not owners of stage beats
- Knowledge beats — an NPC can *deliver* a knowledge beat through dialogue, but the KnowledgeBeat entity is owned by the Stage

### How many DialogueStates does a Local NPC need?

Minimum three, by Pillar 2 (the world remembers):

1. **Pre-quest** — before the player has triggered the quest the NPC is involved in
2. **Mid-quest** — while the quest is active
3. **Post-quest** — after the quest is resolved

Optional extensions:
- **Knowledge-gated** — a new state unlocked when the player demonstrates mastery of the stage concept (the NPC says something they couldn't have said before, because the player now understands)
- **Post-stage** — a state for when the player returns to the stage after completing it (the region is healing; the NPC's world has changed)

Five dialogue states for a local NPC is sufficient and complete. More than five risks over-engineering for content that the player may not revisit.

### Can a Local NPC be promoted to CastMember?

Yes — this is the correct path when a local NPC needs to appear in multiple stages. Promotion means:

1. The NPC is moved from Stage ownership (L2) to Campaign ownership (L1)
2. Its dialogue state model expands to support multi-stage arc tracking
3. Its DialogueStates are reorganised by stage-appearance (Stage 6 appearance, Stage 7 appearance, etc.) rather than by quest-progress only

The campaign review resolution log already documents one case where this logic applies: if a local NPC from Act 2 were to thread through later acts for emotional continuity, they should be promoted. The architecture makes this possible without rewriting the character.

---

## MODEL 3 — CastMember

### What a CastMember is

A CastMember is a named character owned by the Campaign who appears across multiple stages and has a defined arc — a character trajectory that changes because of what the player does and what the world becomes.

CastMembers carry emotional continuity across the entire campaign. They are the reason the player cares about the kingdom between acts. They are not quest systems. They are people.

### How recurring characters are represented

A CastMember's content is organised in two layers:

**Layer 1 — Permanent definition (does not change during play)**
- Name and identity (role, personality, arc summary)
- Stage appearance list (which stages they appear in and in what capacity)
- Theme-variant names and descriptions
- Arc trajectory summary (where they begin, where they end — the arc shape)

**Layer 2 — Stage-appearance content (authored per stage)**
For each stage the CastMember appears in, the CastMember holds a **StageAppearance** — a container of the dialogue states and story beats for that specific stage visit.

```
CastMember (Campaign L1)
├── definition (permanent)
│   ├── name
│   ├── role
│   ├── personality
│   ├── arcSummary
│   └── themeVariants
│
└── stageAppearances[ ]  (one per stage where they appear)
    └── StageAppearance
        ├── stageId           ← which stage this is for
        ├── capacity          ← how they appear (primary, secondary, referenced, off-screen)
        ├── DialogueState[ ]  ← the dialogue states available during this stage visit
        │   └── DialogueLine[ ]
        ├── StoryBeat[ ]      ← specific narrative moments tied to this appearance
        └── arcBeat           ← what changes in the character's arc during this stage visit
```

This structure means:
- Lyra's Stage 1 appearance and Lyra's Stage 12 appearance are both authored under Lyra — not scattered across two Stage files.
- When loading Stage 5, the engine asks: "which CastMembers have a StageAppearance for Stage 5?" and loads only those appearances. Stage 5 does not contain Lyra's content; it references it.
- Lyra's arc is readable in its entirety from Lyra's CastMember definition + her StageAppearances in order.

### Why CastMembers must not be tied to individual quests

Lyra's arc across 15 stage appearances involves dozens of dialogue states, several story beats, and a gradual shift from overconfident guide to genuine intellectual peer. None of this arc is a quest. There is no "complete Lyra's arc quest." Her arc is what happens when the player does everything else.

**Rule CM-1:** A CastMember's arc progression is driven by stage completion events, not by quest triggers. A CastMember's StageAppearance for Stage N becomes available when Stage N is loaded — not when a specific quest is completed.

**Rule CM-2:** A CastMember may participate in quests (Lyra might be referenced as a mid-quest contact; Kestran might give the player a mission). But quest completion does not advance their arc. Stage completion does.

**Rule CM-3:** A CastMember's dialogue states can reference quest state as a condition (Lyra may say different things depending on whether the player has completed a specific quest), but she is not owned by or bound to any quest.

### The four Kubernetes Kingdom CastMembers as design tests

These four must all be representable without a CastMember becoming a quest-or-stage-specific object:

**Lyra — primary guide, intellectual arc**
- Appears in all 14 stages
- Arc: overconfident guide → researcher with intellectual humility → decision-maker
- 14 StageAppearances, each with 3–5 DialogueStates
- Key arc beats: Stage 7 (first hypothesis), Stage 9 (hypothesis confirmed), Stage 11 (asks player to teach her), Stage 13 (makes irreversible judgement call)
- *Does this work?* ✅ Each arc beat lives in a StageAppearance for that stage. The arc is readable, the dialogue is stage-contextual, and no quest owns her.

**Kestran — sceptic-to-ally, military competence arc**
- Appears in 8 stages (2, 4, 6, 9, 11, 13, Final + seeded in Stage 3 without a formal appearance)
- Arc: silent assessment → gruff acknowledgement → genuine ally → self-disclosure
- Each appearance has a different capacity (Stage 3: observed behaviour as seed; Stage 4: first direct order; Stage 12: reveals why he stayed)
- *Does this work?* ✅ The Stage 3 "seed" is an observable behaviour in the stage design — not a CastMember appearance per se, but a StoryBeat referencing Kestran. His formal StageAppearances begin at Stage 4.

**Voss — calculated ambiguity throughout**
- Appears in Stages 6, 7, 9, 10, 13, Final
- Arc: deliberately unresolved — useful but untrustworthy
- Arc beats must NEVER resolve the ambiguity. His StageAppearances must be authored to sustain two valid interpretations.
- *Does this work?* ✅ The CastMember model does not require an arc to have a clear direction. `arcSummary` can say "deliberately unresolved — two valid interpretations sustained throughout." Each StageAppearance adds information without resolving ambiguity.

**Mira — mirror character, grows in parallel to player**
- Appears in Stages 2, 5, 10, 12 (indirect in 13), Final epilogue
- Arc: patient child waiting → curious learner helping → researcher in her own right
- Infrequent appearances that must land with emotional weight each time
- *Does this work?* ✅ Five StageAppearances spanning the campaign. The model supports sparse appearances as well as dense ones.

---

## MODEL 4 — Dialogue Ownership

### Who owns dialogue?

Dialogue content is owned by the character who speaks it — always.

- A Local NPC's dialogue is owned by the NPC (L2, within the Stage)
- A CastMember's dialogue is owned by the CastMember (L1, Campaign level), organised into StageAppearances

**Never owned by:**
- A Quest (quests reference dialogue trigger events; they do not contain words)
- A Stage (stages reference which characters appear; they do not contain character lines)
- A StoryBeat (story beats can trigger dialogue state transitions, but the dialogue text lives in the character)

### Who triggers dialogue?

Dialogue is triggered by world events. These triggers are declared in the stage or quest content, but the trigger only changes *which* dialogue state is active — it does not contain dialogue.

Trigger types:

| Trigger | What changes |
|---|---|
| Player enters Stage | CastMember's StageAppearance for this Stage becomes active; default dialogue state loads |
| Quest becomes AVAILABLE | NPC's `pre-quest` DialogueState activates |
| Quest becomes ACTIVE | NPC's `mid-quest` DialogueState activates |
| Quest reaches COMPLETED | NPC's `post-quest` DialogueState activates |
| KnowledgeBeat completed | If NPC/CastMember has a knowledge-gated DialogueState for this Concept, it becomes available |
| Stage completed | NPC's `post-stage` DialogueState activates (if defined); CastMember's next StageAppearance becomes available |
| Player demonstrates ConceptMastery | DialogueStates gated on this mastery become available |
| CutsceneEvent fires | StoryBeat executes its scripted sequence using the referenced character's current dialogue state |

**Rule D-1:** Triggers live in Stage content, Quest content, and CastMember StageAppearances. Dialogue text lives in DialogueStates. The trigger and the dialogue are always in separate entities.

**Rule D-2:** A trigger never creates a dialogue state. It activates a pre-authored one. The engine cannot generate or interpolate dialogue — it selects from states the content author provided.

### Who controls dialogue progression?

The engine controls which dialogue state is *currently active* for a character at any moment. The content author defines which states exist and what activates them. The player interacts with the currently active state.

This is the separation of concerns:

```
Content author → defines states and transitions
Engine        → tracks current state per character
Player        → interacts with active state
```

No part of this loop requires another part to own what it doesn't. The engine never writes dialogue. The content author never tracks runtime state. The player never sees the state machine.

### Dialogue state model — how states work

A DialogueState is a named, condition-gated version of a character's dialogue. Characters have multiple states; only one is active at any time per character-per-stage-visit.

States are **additive**, not replacement. When a state becomes active, it does not erase the previous state — it supplements or overrides specific lines. A character who has reached `post-quest` state can still say their `mid-quest` contextual lines if the player asks the right question.

```
DialogueState
├── name          (e.g., "pre-quest", "mid-quest", "post-quest", "mastery-gated")
├── condition     (what must be true for this state to be available)
├── priority      (which state takes precedence if multiple are active)
└── DialogueLine[ ]
    ├── trigger   (what player action surfaces this line — approach, interact, ask)
    ├── text      (what the character says)
    ├── themeName (theme-variant text for Space theme, etc.)
    └── branch    (optional: leads to another DialogueLine for multi-exchange conversations)
```

**Rule D-3:** A DialogueLine is the atomic unit. It is never reused between characters or between DialogueStates. Every character says their own words in their own state.

**Rule D-4:** Theme variants are at the DialogueLine level (or DialogueState level for complete rewrites). The concept meaning of what the character says is theme-invariant. The vocabulary, metaphors, and names are theme-variant.

### The dialogue trigger model for CastMember StageAppearances

This resolves the open question from Phase 2.2: *"how does the trigger live in Stage content without the state living in Stage?"*

**Answer:** The Stage holds **appearance triggers** — declarative references that tell the engine "when X happens in this Stage, activate this DialogueState in this CastMember's StageAppearance for this Stage."

```
Stage (L2)
└── castAppearanceTriggers[ ]
    └── AppearanceTrigger
        ├── castMemberId      (references Campaign-level CastMember)
        ├── event             (e.g., "stage-entered", "quest-completed:quest-5b", "knowledgebeat-completed:kb-03")
        └── targetStateId     (which DialogueState in the CastMember's Stage-N StageAppearance to activate)
```

The Stage does not own the DialogueState. It only says: "when this happens, tell Lyra's Stage-5 appearance to activate state X." The words remain Lyra's.

This is the clean separation that makes CastMember arcs campaign-owned while stage events remain stage-owned.

---

## OWNERSHIP MATRIX (Phase 2.3 additions)

| Entity | Owned by | Level |
|---|---|---|
| Quest (stage-scoped) | Stage | L2 |
| Quest (campaign-scoped) | Campaign | L1 |
| QuestStep | Quest | L3 |
| QuestResolutionCondition | Quest | L3 |
| NPC (local) | Stage | L2 |
| DialogueState (NPC) | NPC | L3 |
| DialogueLine | DialogueState | L4 |
| CastMember | Campaign | L1 |
| StageAppearance | CastMember | L2 (within Campaign) |
| DialogueState (CastMember) | StageAppearance | L3 |
| AppearanceTrigger | Stage | L3 |

---

## DEPENDENCY MATRIX (Phase 2.3)

| Entity | Depends on (references) |
|---|---|
| Quest (stage-scoped) | NPC (giver), Concept (mastery check), Reward, prior Quest (if chained) |
| Quest (campaign-scoped) | Stage[ ] (steps occur in these stages), CastMember[ ] (participants), Concept[ ] |
| QuestResolutionCondition | Concept (mastery state), Quest flags, DialogueState (relationship check) |
| NPC (local) | Quest[ ] (hook into), Concept (if knowledge-gated dialogue) |
| CastMember | Stage[ ] (appears in), Concept[ ] (knowledge-gated dialogue branches) |
| StageAppearance | Stage (which stage this is for) |
| DialogueState | Concept (mastery gate), Quest (quest-state gate), CastMember (cast-to-cast dialogue) |
| AppearanceTrigger | CastMember, DialogueState (target), event (stage or quest event) |

---

## LIFECYCLE MATRIX (Phase 2.3)

| Entity | Lifecycle |
|---|---|
| Quest (stage-scoped) | DORMANT → AVAILABLE → ACTIVE → COMPLETED / FAILED / ABANDONED; bound to Stage lifecycle |
| Quest (campaign-scoped) | DORMANT → AVAILABLE → ACTIVE (across multiple stages) → COMPLETED; bound to Campaign lifecycle |
| NPC (local) | Bound to Stage lifecycle; exists from Stage DRAFT through Campaign RETIRED |
| DialogueState (NPC) | Bound to NPC; states are authored once and triggered at runtime |
| CastMember | Bound to Campaign lifecycle; exists from Campaign DRAFT through Campaign RETIRED |
| StageAppearance | Bound to CastMember; authored per stage, becomes "active" when Stage is loaded during play |
| DialogueState (CastMember) | Bound to StageAppearance; becomes activatable when player enters the Stage |
| AppearanceTrigger | Bound to Stage; fires once when its event condition is met |

---

## REUSE RULES (Phase 2.3)

| Entity | Reuse rule |
|---|---|
| Quest (stage-scoped) | NOT reusable. Stage-specific by definition. |
| Quest (campaign-scoped) | Campaign-scoped; spans stages within one campaign. Not reusable across campaigns. |
| NPC (local) | NOT reusable across stages. Promote to CastMember if multi-stage appearance is needed. |
| CastMember | Reusable within one campaign only. Lyra is Kubernetes Kingdom's Lyra; Linux Realms has its own cast. |
| DialogueState (NPC) | NOT reusable. Every state is authored for a specific character's specific situation. |
| DialogueLine | NOT reusable. Atomic character-specific content. |
| StageAppearance | NOT reusable across campaigns. A CastMember's Stage 5 appearance is specific to Campaign + Stage 5. |
| AppearanceTrigger | NOT reusable. Stage-and-event specific. |

**One nuance:** the *pattern* of a quest (NPC presents problem → player investigates → player demonstrates understanding → world changes) is reusable as a content authoring template. But instances are never shared.

---

## VALIDATION RULES (Phase 2.3)

### Quest validation

- [ ] Every stage-scoped quest's NPC giver is a valid Stage-owned NPC or Campaign-owned CastMember
- [ ] Every quest's ResolutionCondition references a valid Concept (platform L0)
- [ ] Campaign-scoped quests are owned by the Campaign and appear in the Campaign's quest list — not in any Stage's quest list
- [ ] Every stage that participates in a campaign-scoped quest declares that quest in its `referencedCampaignQuests[ ]`
- [ ] No quest whose scope is "stage" references an NPC, KnowledgeBeat, or content from another Stage
- [ ] Every quest that references a Concept as a mastery check must have a KnowledgeBeat introducing that Concept earlier in the same Stage (or a prior Stage in the Act)
- [ ] Quest reward references valid Campaign-level Reward entities (Item, Ability, ProgressionLevel)

### NPC validation

- [ ] Every local NPC has at least one DialogueState
- [ ] Every local NPC has at minimum a `pre-quest` DialogueState if it has any quest involvement
- [ ] Every local NPC with quest involvement has a `post-quest` DialogueState (the world remembers)
- [ ] No local NPC appears in more than one Stage without being reclassified as a CastMember

### CastMember validation

- [ ] Every CastMember has at least one StageAppearance
- [ ] Every StageAppearance references a valid Stage ID in the Campaign
- [ ] Every StageAppearance has at least one DialogueState
- [ ] Every Stage referenced in a CastMember's StageAppearances must include a corresponding AppearanceTrigger for that CastMember
- [ ] CastMember IDs are unique across the entire Campaign (no ID collisions)
- [ ] The arc beat described in each StageAppearance is consistent with the CastMember's arcSummary trajectory

### Dialogue validation

- [ ] Every AppearanceTrigger in a Stage references a valid CastMember ID and a valid DialogueState ID within that CastMember's StageAppearance for that Stage
- [ ] No DialogueState references a Concept that has not been introduced earlier in the campaign
- [ ] Theme-variant DialogueLines exist for every Theme the Campaign supports
- [ ] No DialogueLine text exceeds the knowledge panel length limit (~5 lines) — extended exchanges must be split into multiple DialogueLines as a branching conversation

---

## DECISIONS RESOLVED IN THIS PHASE

These were open decisions from Phase 2.2. Resolved here.

### Resolved: Multi-stage quest ownership

**Decision:** Two quest scopes. Stage-scoped quests are owned by a Stage (L2). Campaign-scoped quests are owned by the Campaign (L1). Stages *reference* campaign-scoped quests they participate in but do not own them.

Mira's arc is a campaign-scoped quest. Stage 2, Stage 5, Stage 10, and the Final Stage each declare they participate in it. The quest itself lives at the Campaign level and tracks its own progress.

### Resolved: CastMember dialogue trigger model

**Decision:** The Stage holds AppearanceTrigger objects — declarative event-to-state bindings that tell the engine which DialogueState to activate on a CastMember's StageAppearance when a specific stage event fires. The Stage does not own the DialogueState. The dialogue words remain with the CastMember. The trigger authority belongs to the Stage.

---

## UNRESOLVED DECISIONS FOR PHASE 2.8

| ID | Decision | Impact | Phase |
|---|---|---|---|
| D-CA-06 | Challenge pool architecture (embedded / concept / campaign) | Affects how Quests reference knowledge-test challenges | Phase 2.8 (human input) |
| D-CA-04 | Embedded vs referenced NPC dialogue | Affects whether DialogueStates are inline in NPC objects or stored separately by ID | Phase 2.8 (human input) |
| — | Maximum DialogueLine branch depth | How many nested exchanges should the system support? Flat (1 depth), shallow tree (2–3), or arbitrary? Affects authoring complexity. | Phase 2.8 |
| — | Authoring format (YAML / JSON / DSL) | Affects all of the above in terms of how it is written | Phase 2.8 (human input) |

---

## Cross-references

- `milestones/milestone-02-content-architecture/ai-phase-plan.md` — Phase 2.4 (Knowledge + Challenge Model) is next in the parallel block
- `content-architecture/ai-phase-02-01-content-hierarchy.md` — hierarchy this model builds on
- `content-architecture/ai-phase-02-02-campaign-act-stage-model.md` — Stage model that AppearanceTrigger extends
- `game-design/ai-campaign-structure.md §Recurring Cast` — the four CastMembers this model must support
- `game-design/ai-vision.md §4 Pillar 2` — "The world remembers" — the architectural constraint driving NPC dialogue states
- `DECISIONS.md` — multi-stage quest ownership and dialogue trigger model to be recorded here
