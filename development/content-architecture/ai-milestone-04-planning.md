# Milestone 04 — Content Architecture

> **Purpose:** Planning document for Milestone 04. Defines goals, expected outputs, open questions, and dependencies before design work begins.
> **Status:** Planning only. Milestone not yet open.
> **Owned by:** AI

---

## What this milestone is

Milestone 04 answers the question: **"How does ForgeMinds content exist?"**

Not what happens in the story. Not how the game engine renders it. Not how assets look.

Specifically: how campaign content — stages, quests, NPCs, enemies, bosses, dialogs, questions, rewards, items — is **represented, stored, authored, and loaded**.

This is the content data model. It is the layer between the campaign design (done) and the implementation (future). Getting it right means:
- The same content works in Fantasy theme and Space theme without duplication
- Content can be authored without touching code
- New stages can be added by filling in a schema, not by writing a renderer
- The campaign review's deferred items (E1/E2/E3 expandable regions, enemy naming, Act 2 dialogue) all have a place to live

Getting it wrong means: every content change requires a developer, every theme switch forks the data, every new stage requires a code change.

---

## Milestone goal

Produce a complete, validated content data model for Kubernetes Kingdom that:

1. Represents every content type defined in the campaign design
2. Supports both Fantasy and Space themes without forking content
3. Is authorable by a non-engineer (YAML, JSON, or similar)
4. Has clear relationships between content types (campaign → stage → quest → NPC, etc.)
5. Can accommodate the 3 expandable regions without structural changes

---

## Expected outputs

| Output | File | Description |
|---|---|---|
| Content overview | `content-architecture/ai-overview.md` | High-level content model: types, relationships, authoring approach |
| Campaign schema | `content-architecture/ai-campaigns-schema.md` | Top-level campaign structure (id, theme, stage list, metadata) |
| Stage schema | `content-architecture/ai-stages-schema.md` | Stage definition (concept, region, acts, NPCs, enemies, dungeon, boss, portal) |
| Quest schema | `content-architecture/ai-quests-schema.md` | Quest data model (trigger, steps, branching, rewards, failure states) |
| NPC schema | `content-architecture/ai-npcs-schema.md` | NPC definition (id, dialogue states, quest hooks, theme variants) |
| Enemy schema | `content-architecture/ai-enemies-schema.md` | Enemy definition (type, behavior, knowledge-concept link, encounter context) |
| Boss schema | `content-architecture/ai-bosses-schema.md` | Boss definition (phases, concept requirements, mechanic, narrative role) |
| Dialog schema | `content-architecture/ai-dialogs-schema.md` | Dialogue structure (speaker, condition, theme variant, branches) |
| Questions schema | `content-architecture/ai-questions-schema.md` | Challenge definition (type, concept, correct answer, distractors, difficulty) |
| Rewards schema | `content-architecture/ai-rewards-schema.md` | Reward types (XP, items, progression gates, lore unlocks) |
| Items schema | `content-architecture/ai-items-schema.md` | Item definition (id, effect, rarity, theme variant name) |

All 11 stubs already exist in `content-architecture/`. This milestone fills them.

---

## Dependencies from campaign design

These decisions from the campaign design **directly constrain** the content model. The schema must support all of them:

| Campaign decision | Schema implication |
|---|---|
| Two themes (Fantasy + Space), same learning content | Every content object must have a theme-neutral core and optional theme-specific overrides (name, description, visual tag) — never two separate objects |
| Khaosynth's influence felt throughout (corrupted creatures, broken systems) | Enemies need a `corruptionSource` or `narrativeRole` field linking them to the antagonist arc |
| NPC dialogue evolves across quest states (pre / mid / post) | NPC schema must support at minimum 3 dialogue state slots; ideally N states keyed by conditions |
| Bosses combine concepts from the stage — never introduce new ones | Boss schema needs a `conceptRequirements[]` field listing the concepts a player must have encountered before this boss |
| Knowledge density per stage (4–7 discoveries) | Stage schema needs a `knowledgeBeats[]` array with delivery method (scroll, NPC, dungeon, quest) |
| The 9-beat stage arc | Stage schema must accommodate all 9 beat types as optional named slots, not a generic `content[]` array |
| 3 expandable regions (E1, E2, E3) | Campaign schema must support optional stages without changing the critical path definition |
| Stage 13 Lyra decision moment and Voss ambiguity | NPC schema must support conditional beats (player witnesses an NPC action based on reaching a story checkpoint) |
| Recurring cast (Lyra, Kestran, Voss, Mira, Khaosynth) | Separate `cast` table or recurring-NPC designation in NPC schema — recurring cast behaves differently from local NPCs |

---

## Open questions for this milestone

These need answers before or during schema design. Some require human input; some can be resolved through design reasoning.

**Requires human decision:**
1. **Authoring format:** YAML, JSON, or a custom DSL? YAML is most readable for non-engineers; JSON is easier for tooling. A custom DSL is flexible but requires a parser. *Pick before designing schemas.*
2. **Single-file vs. split-file content:** Is a stage defined in one file (all its NPCs, enemies, quests inline) or across multiple files linked by ID? Single-file is easier to author; split-file is easier to reuse content across stages.
3. **Theme override granularity:** Does theming apply at the field level (just change the NPC name) or at the object level (swap the whole NPC for a theme-specific version)? Field-level is simpler; object-level is more flexible.

**Can be resolved through design:**
4. **Knowledge beat delivery:** How are scrolls, NPC-dialogue discoveries, dungeon reveals, and quest reveals represented differently in the schema? Should they all be `knowledgeBeat` objects with a `deliveryType` field, or separate types?
5. **Boss phase representation:** Are boss phases sub-objects within the boss schema, or separate linked objects? Given that Act bosses span multiple concepts, this affects how concept requirements are listed.
6. **Dialogue branching depth:** Stage 13's Lyra decision moment requires a conditional NPC action triggered by a story checkpoint. How deep should the dialogue branching system go at schema level vs. runtime level?

---

## Design principles for this milestone

Imported from `game-design/ai-vision.md` — these constrain schema decisions:

- **Knowledge is the verb:** the schema must make explicit which K8s concept each knowledge beat, enemy, and boss is linked to. Concept linkage is not a nice-to-have; it is structurally required.
- **The world remembers:** NPC dialogue states are a schema-level requirement, not a runtime concern. The schema must support pre/mid/post-quest NPC states at minimum.
- **Adventure first, lesson second:** knowledge beats are delivered through world events (scrolls, NPCs, encounters). The schema must enforce this — there should be no schema type for "lesson screen" or "study mode content."
- **Theme engine requirement:** every content object with a visible name, description, or lore text must have a theme-variant field. No exceptions.

---

## Milestone phases (to be detailed when milestone opens)

| Phase | Deliverable |
|---|---|
| 4.1 | Content type inventory — list every content type, its attributes, and its relationships |
| 4.2 | Authoring format decision — pick YAML/JSON/DSL and justify |
| 4.3 | Core schemas — campaign, stage, quest (the three load-bearing types) |
| 4.4 | Supporting schemas — NPC, enemy, boss, dialog (four types with cross-references) |
| 4.5 | Knowledge and challenge schemas — questions, knowledge beats, delivery types |
| 4.6 | Economy schemas — rewards, items |
| 4.7 | Theme variant design — how theming is applied across all schema types |
| 4.8 | Validation — run the Kubernetes Kingdom campaign design through the schema and confirm everything can be represented |
| 4.9 | Human review — content model review with human stakeholder |

---

## What this milestone does NOT do

- Does not write actual content (the K8s scrolls, NPC dialogue lines, question text). That is content authoring, which happens after schemas are defined.
- Does not design the game engine or content loading system. That is Milestone 06.
- Does not finalise asset names or visual descriptions. That is Milestone 05.
- Does not design the save system. That is Milestone 13.

---

## Cross-references

- `game-design/ai-campaign-structure.md` — the campaign design all schemas must accommodate
- `game-design/ai-vision.md` §5 (Knowledge Doctrine) — constraints on schema design
- `DECISIONS.md` D-10 (campaign scope), D-14 (two themes), D-02 (knowledge-as-mechanic) — all constrain schema
- `BACKLOG.md` — deferred items from campaign review that become content-architecture concerns (E1/E2/E3 expandable regions, enemy naming, Act 2 dialogue)
- `milestones/milestones-02-to-15.md` — Milestone 04 stub with human review reference
