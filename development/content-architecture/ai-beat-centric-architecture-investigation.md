# Beat-Centric Architecture Investigation

> **Type:** Design spike — analysis only. No final decision. No implementation.
> **Purpose:** Evaluate whether Beat should become a first-class content entity sitting between Stage and all stage-level content types, and whether this changes the canonical hierarchy from Stage → {Quest, NPC, Enemy, ...} to Stage → Beat → {typed content}.
> **Owned by:** AI
> **Input docs:** `ai-phase-02-01-content-hierarchy.md` through `ai-phase-02-06-progression-reward-item-model.md`

---

## The question

The current hierarchy (Phases 2.1–2.6) models a Stage as a container of named, typed entities:

```
Stage
├── KnowledgeBeat[ ]
├── NPC[ ]
├── Quest[ ]
├── Enemy[ ]
├── MiniChallenge[ ]
├── Dungeon
├── Boss
├── Portal
└── StoryBeat[ ]
```

The alternative under investigation models a Stage as a sequence of Beats, where Beat is the first-class entity and all content hangs from it:

```
Stage
└── Beat[ ]  (ordered sequence)
    ├── Beat { type: KNOWLEDGE, payload: KnowledgeBeat }
    ├── Beat { type: QUEST, payload: Quest }
    ├── Beat { type: ENCOUNTER, payload: Enemy }
    ├── Beat { type: MINI_CHALLENGE, payload: MiniChallenge }
    ├── Beat { type: DUNGEON, payload: Dungeon }
    ├── Beat { type: BOSS, payload: Boss }
    └── Beat { type: PORTAL, payload: Portal }
```

The question is not merely structural. It has downstream implications for authoring, editing tooling, AI generation, validation, readability, and the long-term evolution of the platform.

---

## What "Beat as first-class" would mean

A first-class Beat is an entity with its own ID, position in a sequence, type discriminator, and payload. The Stage owns a list of Beats; each Beat owns one typed content object. The 9-beat arc is not a design principle but a literal data structure.

### What changes

1. **Stage structure becomes a sequence, not a bag.** Currently a Stage has named slots (the Dungeon slot, the Boss slot, etc.). With Beat-centric design, a Stage has a positional sequence. Beat 1 is Arrival. Beat 3 is the first KnowledgeBeat. Beat 7 is the Dungeon. Order is an explicit property of the data, not an implicit convention.

2. **Cross-beat operations become possible.** Currently there is no content entity that spans multiple beat types. With Beats, you can ask: "show me all Beats in Act 2 that reference Concept X" — across knowledge beats, enemy encounters, quests, and boss phases — because they share a common container type.

3. **The authoring surface becomes uniform.** An author doesn't "add an NPC to a Stage" and "add an enemy to a Stage" through two different authoring flows. They "add a Beat to a Stage" and then choose a type. One authoring entry point.

4. **A visual campaign editor becomes natural.** A timeline or board UI where each column is a Stage and each row is a Beat type is directly derivable from this structure. The data IS the editor model.

5. **Validation becomes sequence-aware.** Instead of checking "does the Stage have a Boss?" we check "does the Beat sequence contain a BOSS beat before the PORTAL beat?" Ordering rules become data rules.

---

## Evaluation across 7 dimensions

### 1. Authoring simplicity

**Current model (typed slots):**
A content author opens a Stage and sees named sections: Knowledge Beats, NPCs, Quests, Enemies, Dungeon, Boss, Portal. Each section is a well-defined container. Adding an NPC means filling in the NPC section. This is flat and scannable but gives no sense of flow — an author cannot easily see "what order does the player experience these things in?"

**Beat-centric model:**
A content author opens a Stage and sees an ordered list of Beats. Beat 1 is Arrival. Beat 3 is the first knowledge discovery. Beat 5 is the first enemy encounter. The author always knows the player's path. Adding an NPC means inserting a DIALOGUE beat at position N. This is more expressive but more complex — the author must understand the beat sequence model to author correctly.

**Verdict:** Beat-centric is more powerful but carries higher authoring overhead. A non-engineer content author would need better tooling to work fluently with Beat sequences than with named slots. **Advantage: current model for initial authoring; Beat-centric for experienced authors with tooling support.**

---

### 2. Visual editing potential

**Current model:**
A visual editor would need to display 8–10 distinct sections per Stage, each with a different editing interface. The editor knows the types; it maps them to named panels. Functional but disconnected — editing a Quest feels unrelated to editing the Enemy that tests the same concept.

**Beat-centric model:**
A visual editor becomes a **stage timeline** — a horizontal track of ordered beats, each typed and colour-coded. Drag to reorder. Click to expand. The editor and the data model are isomorphic.

This is a significant advantage for long-term tooling. A campaign editor for ForgeMinds — whether AI-assisted or human-operated — would naturally output a Beat sequence. The data structure is designed for visual representation.

**Verdict:** Beat-centric has a substantial advantage here. The timeline editor is the natural UI for this model, and the current model does not have a natural visual equivalent. **Clear advantage: Beat-centric.**

---

### 3. Campaign readability

**Current model:**
A campaign in the current model is readable by looking at each Stage's sections. It is clear what each Stage contains, but the *experience flow* — the path through the stage from the player's perspective — requires inference.

**Beat-centric model:**
A campaign in the Beat model reads like a script. Stage 2: Beat 1 (Arrival — Mira is waiting), Beat 2 (Exploration — the village), Beat 3 (Knowledge — Pod scroll), Beat 4 (Quest — Mira's home), Beat 5 (Encounter — Pod Bugs), Beat 6 (Mini-challenge — ordering exercise), Beat 7 (Dungeon — Pod Warrens), Beat 8 (Boss — Pod Tyrant), Beat 9 (Portal — Kestran opens the gate). Reading the Beat sequence IS reading the player's experience.

This has a major benefit for campaign review, AI-assisted authoring, and communication between designers. A campaign presented as a Beat sequence is immediately understandable by anyone — a stakeholder, a writer, a designer, an LLM asked to generate content.

**Verdict:** Beat-centric is significantly more readable as a campaign overview. **Clear advantage: Beat-centric.**

---

### 4. Future visual campaign editor support

The current model was designed for correct content representation, not for editor support. It works. But if ForgeMinds ever needs:

- A visual campaign builder for non-engineers
- An AI assistant that generates stage content
- A playtest simulation that walks through the player's path
- A content quality tool that checks flow and pacing

...the Beat model is the better foundation. These tools want to work with an ordered sequence of typed events, not a bag of labelled containers.

**Verdict:** Beat-centric is the better long-term foundation for tooling. **Clear advantage: Beat-centric.**

---

### 5. Validation capabilities

**Current model:**
Validation checks presence: "does the Stage have a Boss?", "does the Stage have at least one KnowledgeBeat?", "does the Boss reference the Stage's primary Concept?". These are necessary checks. But they cannot check order — the current model has no concept of "KnowledgeBeat must come before Enemy" at the data level.

**Beat-centric model:**
Validation checks sequence: "is there at least one KNOWLEDGE beat before the first ENCOUNTER beat?", "does the BOSS beat come after all QUEST beats?", "is there exactly one PORTAL beat and is it the last beat?". The ordering rules that are currently design conventions become machine-checkable data rules.

This is a significant improvement for content quality assurance. Currently, a content author could accidentally put an enemy encounter before the knowledge discovery and the validation pass would not catch it. With Beat ordering, it would.

**Verdict:** Beat-centric provides meaningfully stronger validation. **Clear advantage: Beat-centric.**

---

### 6. Content reuse

**Current model:**
Content reuse is defined by ownership level. L0 entities (Concepts, Themes) are fully reusable. L2 stage-scoped entities (NPC, Quest, Enemy) are not reusable. This is clear and explicit.

**Beat-centric model:**
Beats are stage-scoped by definition (a Beat belongs to a Stage's sequence). The reuse rules are the same — Beats cannot be shared across stages, any more than a Quest can be shared across stages in the current model. The ownership hierarchy does not change; it just has one more level.

**However:** Beat-centric introduces a subtle reuse opportunity. A Beat *template* — a reusable authoring pattern (e.g., "standard knowledge discovery beat") — could be defined at campaign or platform level, and specific Beats instantiate the template. This would accelerate authoring for stages that follow common patterns. This is not possible in the current model.

**Verdict:** Neither model is strictly better for reuse of individual content. Beat-centric introduces template reuse as a future possibility. **Slight advantage: Beat-centric for template potential; current model for simplicity.**

---

### 7. AI-generated content potential

This is one of the most forward-looking evaluation dimensions. ForgeMinds is an AI-powered platform. Future content generation — AI authoring new stages, AI filling in NPC dialogue, AI generating challenge questions for new Concepts — is a likely part of the platform's evolution.

**Current model:**
An AI asked to generate a new stage must know the Stage schema (all its typed sections), understand which sections are required, and fill them in separately. The output is a populated Stage object with correct sections. Doable but requires the AI to understand the entire Stage model.

**Beat-centric model:**
An AI asked to generate a new stage can output a Beat sequence. The prompt becomes: "generate a 9-beat stage for Concept X in Fantasy theme." The output is an ordered list of typed, payloaded Beats. This is a dramatically simpler, more natural output format for an LLM — sequences are the natural output of language models. The AI can literally write the stage as a story ("first the player arrives, then they discover a scroll, then they meet an NPC...") and each sentence maps to a Beat.

This is not a small advantage. The Beat model is AI-generation-native in a way the current named-slot model is not.

**Verdict:** Beat-centric has a substantial advantage for AI-assisted content generation. **Clear advantage: Beat-centric.**

---

## The case for the current model

Having evaluated Beat-centric on seven dimensions and found it advantageous on five, it is important to state the case for the current model honestly:

**1. It is simpler.** A Stage with named typed sections is easier to understand, easier to implement, and easier to validate without tooling. For a v1 shipped by a small team, this matters.

**2. It does not require a new abstraction.** The 9-beat arc is already a design principle baked into every stage in the campaign. Beat-centric makes it a data structure. That is the right long-term direction — but it is an additional layer that the engine, authoring tools, and all Phase 2.2–2.6 models would need to be updated to reflect.

**3. The types are still there.** In a Beat-centric model, every Beat has a typed payload — a KnowledgeBeat payload is still a KnowledgeBeat. The current model's entity types do not disappear; they just gain a Beat wrapper. The question is whether that wrapper earns its complexity cost.

**4. Query patterns would change.** Currently: "give me Stage 5's enemies." Beat-centric: "give me all ENCOUNTER beats in Stage 5 and extract their payloads." The query is one level deeper. For systems that need to find content quickly, this is a cost.

---

## A hybrid path

The two models are not mutually exclusive. A hybrid approach:

> **Store content in typed slots (current model) but derive a Beat sequence for authoring, editing, and AI generation.**

The canonical representation is the current Stage model — Quest, NPC, Enemy, etc. in named slots. But a Beat sequence is derived from it for tooling purposes: the editor renders a timeline by ordering the stage's entities according to the 9-beat arc convention. The AI generates content as a Beat sequence that is then deserialized into the canonical typed slots.

This is the migration path, not the final state. The current model is built. The Beat sequence is generated from it for UX purposes. If Beat-centric proves its value in practice, the canonical representation migrates over time.

---

## Recommendation

**Adopt Beat as a first-class entity — but not now.**

The evaluation is clear: Beat-centric architecture is better on 5 of 7 dimensions, with the main advantages in visual editor support, validation, campaign readability, and AI generation. These are the dimensions that will matter most as ForgeMinds scales beyond v1.

However:

1. **All Phase 2.2–2.6 models would need updating.** The Stage model, ownership matrices, dependency matrices, and lifecycle rules across 5 documents assume the current named-slot model. Changing now is expensive.

2. **Phase 2.9 (validation pass) is the right forcing function.** Running Kubernetes Kingdom's campaign design through the current model will reveal whether ordering validation gaps are a real problem or a theoretical one. If they are real, the case for Beat-centric strengthens materially.

3. **The hybrid path is available.** The current model can produce a Beat sequence derivation for tooling without changing the canonical representation. This delivers most of the editor/readability benefits at low cost.

### Concrete recommendation

| Decision | Recommendation |
|---|---|
| Adopt Beat as canonical hierarchy now? | **No** — too costly mid-milestone |
| Derive Beat sequence from current model for tooling? | **Yes** — implement as a view, not a structure |
| Revisit Beat-centric before Milestone 06 (engine)? | **Yes** — the engine is the last point where this decision is cheap |
| Flag Beat-centric as planned future migration? | **Yes** — record as a known architectural direction in `DECISIONS.md` |
| Build AI content generation prompts around Beat sequence format? | **Yes** — the AI generation pipeline should output Beat sequences even if the canonical storage is named slots |

---

## If Beat-centric is adopted later: what would need to change

For completeness — if a future session decides to adopt Beat as first-class, here is the scope:

| Document | Change required |
|---|---|
| `ai-phase-02-02-campaign-act-stage-model.md` | Stage model replaces named slots with `beats: Beat[]`; beat ordering becomes a data property |
| `ai-phase-02-01-content-hierarchy.md` | Beat added as L2 wrapper; all current L2 entities become L3 |
| `ai-phase-02-03-quest-npc-castmember-model.md` | Quest, NPC models unchanged in substance; their ownership becomes Beat → Quest (not Stage → Quest) |
| `ai-phase-02-04-knowledge-challenge-model.md` | KnowledgeBeat becomes the payload type of a KNOWLEDGE Beat |
| `ai-phase-02-05-enemy-boss-model.md` | Enemy becomes payload of ENCOUNTER Beat; Boss becomes payload of BOSS Beat |
| `ai-phase-02-06-progression-reward-item-model.md` | Minimal changes — Reward and Checkpoint still belong to beats |
| Validation rules (all phases) | Ordering rules replace presence rules; significantly stronger |
| Engine (Milestone 06) | Content loader must understand Beat sequence before typed payloads |

Estimated scope: a focused revision of 5 phase documents + engine loader design in Milestone 06. Not trivial, but not a rewrite.

---

## Cross-references

- `content-architecture/ai-phase-02-02-campaign-act-stage-model.md` — the Stage model this investigation evaluates
- `milestones/milestone-02-content-architecture/ai-phase-plan.md` — Phase 2.8 (Critical Decisions Review) is where this finding should be formally presented
- `DECISIONS.md` — recommended entry: "Beat-centric architecture identified as preferred long-term direction; adoption deferred to Milestone 06 window"
- `BACKLOG.md` — recommended entry: "Revisit Beat-centric Stage model before Milestone 06 (Core Engine Foundation)"
