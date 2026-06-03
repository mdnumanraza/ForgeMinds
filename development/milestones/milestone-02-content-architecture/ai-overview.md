# Milestone 02 — Content Architecture

> **Purpose:** Design the complete content data model for ForgeMinds — how every piece of game content is represented, organised, related, and made authorable for future campaigns without code changes.
> **Status:** Planning complete. Ready to execute Phase 1.
> **Owned by:** AI
> **Cites:** `game-design/ai-vision.md` §5 (Knowledge Doctrine), §4 (Pillars 1–4), §7 (Anti-Patterns)

---

## What this milestone is

This milestone answers one question: **how does ForgeMinds content exist?**

Not how it renders. Not how it is stored in a database. Not what technology loads it. Those are implementation concerns that belong to later milestones.

This milestone produces the **conceptual content model** — the entities, their attributes, and their relationships — that all future ForgeMinds content must conform to. It is the blueprint that makes campaigns data-driven rather than code-driven.

The distinction matters because ForgeMinds must support future campaigns (Linux Realms, Docker Dominion, Networking Galaxy, etc.) **without code changes**. If content is embedded in code, every new campaign requires engineering work. If content conforms to a well-defined model, new campaigns are authoring work — which is correct.

---

## Why this milestone comes before implementation

The campaign design (Milestone 01) defines *what happens* in Kubernetes Kingdom. The content architecture (this milestone) defines *how to represent what happens* in a form that:

1. A game engine can read without knowing which campaign it is loading
2. A content author can write without knowing how the engine works
3. A theme engine can transform without duplicating the underlying learning content
4. A future campaign creator can follow without modifying any existing code

Without this model, every system in the engine would have to be built around assumptions specific to Kubernetes Kingdom. With it, the engine builds against the model and campaigns are just data.

---

## Goals

1. **Identify every content entity** required by ForgeMinds across all systems
2. **Define the relationships** between entities (campaign owns stages, stages own quests, quests own NPCs, etc.)
3. **Make the model theme-agnostic** — Fantasy and Space are skins, not separate data
4. **Make the model campaign-agnostic** — Kubernetes Kingdom is an instance, not the definition
5. **Surface the critical design decisions** that must be made before schemas can be written
6. **Produce a complete phase plan** that future sessions can execute without rediscovery

---

## Success Criteria

This milestone is complete when:

- [ ] Every content entity in ForgeMinds is identified and grouped
- [ ] The relationships between all entities are diagrammed or described
- [ ] All critical design decisions are identified, framed, and (where possible) resolved
- [ ] The content hierarchy is defined (what owns what)
- [ ] Each phase has a clear deliverable, owner, and validation criteria
- [ ] A human review has confirmed the model is complete before Phase 1 execution begins
- [ ] The model explicitly supports: future campaigns, two themes, knowledge-as-mechanic, 9-beat stage arc, NPC state evolution, boss multi-concept synthesis

---

## What this milestone does NOT do

- Does **not** write JSON schemas, TypeScript interfaces, or database schemas — those are implementation
- Does **not** design the game engine or content loader — that is Milestone 06
- Does **not** write actual game content (scroll text, dialogue lines, question banks) — that is content authoring
- Does **not** finalise asset descriptions or visual specifications — that is Milestone 05
- Does **not** design save file format — that is Milestone 13

---

## Dependencies

**Upstream (must exist before this milestone):**

| Document | What it constrains |
|---|---|
| `game-design/ai-vision.md` | Knowledge Doctrine (§5) constrains how knowledge is represented; Pillars constrain what can and cannot be content-driven; Anti-Patterns constrain what schema types must not exist |
| `game-design/ai-gameplay-loop.md` | The 9-beat stage arc defines the required beat types in the stage schema; pacing rules constrain content density |
| `game-design/ai-campaign-structure.md` | 14 stages, 5 recurring cast, 3 themes, boss requirements, NPC state requirements, expandable region structure |
| `game-design/ai-campaign-review-resolution.md` | Deferred items that become this milestone's direct inputs (expandable region hooks, enemy naming, Stage 7 emotional anchor, Act 2 dialogue threading) |

**Downstream (blocked until this milestone delivers):**

| Milestone | What it needs from this milestone |
|---|---|
| Milestone 05 — Asset Strategy | Asset categories are derived from content entity types (what kinds of NPCs, enemies, environments exist) |
| Milestone 06 — Core Engine | Engine loads content; must know the schema it is loading against |
| Milestone 08 — NPC Interactions | NPC dialogue system design requires the NPC content model |
| Milestone 09 — Quest System | Quest system design requires the quest content model |
| Milestone 10 — Learning System | Knowledge delivery system requires knowledge beat content model |
| Milestone 11 — Enemy Encounters | Encounter design requires the enemy and challenge content models |
| Milestone 12 — Boss Battles | Boss design requires boss + challenge pool content models |
| Milestone 14 — Theme Engine | Theme skinning requires a defined theme-variant field structure in all entities |

---

## Risks

1. **Over-designing the model.** The most common failure mode. Producing a schema so complex that authoring new content requires understanding the entire model. *Mitigation:* every phase asks "could a non-engineer author this with only this phase's output?"

2. **Under-constraining the model.** Leaving too many decisions to implementation. If the schema is vague, every engine implementation will resolve the ambiguity differently. *Mitigation:* every phase identifies the minimum set of fields that are non-negotiable vs. those that can vary.

3. **Coupling content to Kubernetes Kingdom.** Accidentally building Kubernetes-specific assumptions into what should be a platform-level model. *Mitigation:* Phase 1 explicitly checks every entity against "does this work for Linux Realms without modification?"

4. **Theme complexity underestimated.** The two-theme requirement (same content, Fantasy and Space skins) is structurally non-trivial. If theme variants are not designed into the model from the start, retrofitting them later is expensive. *Mitigation:* Phase 7 is dedicated to theme variant design and must validate against every entity type defined in Phases 2–6.

5. **Knowledge model and challenge model diverging.** The knowledge discovery system and the combat challenge system both involve "the player encounters a K8s concept" — but they are different interactions. If they share the same content type, the model is simple but potentially constraining. If they are separate types, the model is flexible but potentially duplicative. *Mitigation:* Phase 5 addresses this as its primary design decision.

---

## Phases

| # | Phase | Deliverable | Owner |
|---|---|---|---|
| 2.1 | Content Hierarchy | Entity map — what owns what, at every level | AI |
| 2.2 | Campaign + Act + Stage Model | Core campaign container schemas (conceptual) | AI |
| 2.3 | Quest + NPC Model | Quest lifecycle and NPC state system (conceptual) | AI |
| 2.4 | Knowledge + Challenge Model | Knowledge beats, challenge types, and their relationship | AI |
| 2.5 | Enemy + Boss Model | Encounter and boss content types (conceptual) | AI |
| 2.6 | Progression + Reward + Item Model | Player progression and reward content types | AI |
| 2.7 | Theme Variant Design | How theming is applied across all entity types | AI |
| 2.8 | Critical Decisions Review | All open architecture decisions framed and resolved or deferred | AI + Human |
| 2.9 | Validation Pass | Run Kubernetes Kingdom campaign design through the model; confirm everything can be represented | AI |
| 2.10 | Human Review | Human review of the complete content model before schemas are written | Human |

---

## Exit Criteria

- [ ] All 10 phases complete with deliverables
- [ ] Human review (Phase 2.10) signed off
- [ ] Every content entity in `ai-content-entity-inventory.md` has a home in the model
- [ ] All critical decisions in `ai-phase-plan.md` are either resolved with rationale or formally deferred with justification
- [ ] The model successfully represents all 14 Kubernetes Kingdom stages and 3 expandable regions
- [ ] The model explicitly confirms it works for a hypothetical Linux Realms campaign without modification
- [ ] No implementation details (storage format, engine API, database schema) appear in any deliverable

---

## Cross-references

- `game-design/ai-vision.md` — canonical vision constraints
- `game-design/ai-campaign-structure.md` — the campaign data this model must represent
- `milestones/milestone-02-content-architecture/ai-phase-plan.md` — phase-by-phase execution plan
- `milestones/milestone-02-content-architecture/ai-content-entity-inventory.md` — complete entity list
- `content-architecture/` — where the output schemas will eventually live (currently stubs)
- `DECISIONS.md` — architecture decisions will be recorded here as they are resolved
