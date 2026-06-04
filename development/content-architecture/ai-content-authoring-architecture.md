# Content Authoring Architecture

> **Phase:** 2.6.5 — Content Authoring Architecture
> **Purpose:** Evaluate multiple content authoring models and recommend the canonical approach for ForgeMinds. Answers: "What do content authors edit, and how does that content become playable?"
> **Status:** v1 — conceptual only. No storage technology selected.
> **Owned by:** AI
> **Cites:** `ai-beat-model.md`, `ai-phase-02-02-campaign-act-stage-model.md`, `ai-blueprint-viewer-architecture.md`

---

## The question this phase answers

A content designer wants to create **Ingress Fortress** (Stage 10 of Kubernetes Kingdom) or **Linux Realms** (a new campaign). What files do they edit? What is the source of truth? How does that content travel through the system to become playable?

This phase evaluates five authoring models and recommends one. Storage format (YAML, JSON, database, etc.) is a downstream decision — this phase answers what the *author's mental model* should be.

---

## Context: what we already know

From the Beat-centric architecture (D-17) and the Blueprint Viewer:

- **The canonical hierarchy is:** Platform → Campaign → Act → Stage → Beat → Payload → Atomic
- **Beat is the atomic gameplay unit.** A Stage is an ordered sequence of Beats.
- **The Blueprint Viewer already exists** and consumes a `Campaign` object. Whatever authoring model is chosen must be convertible to that `Campaign` object.
- **AI generation** is a planned future capability. The authoring model must be compatible with AI-produced content.
- **Validation rules** already exist and operate on the `Stage` model. The authoring model must not break validation.

---

## The five models evaluated

---

### Model A — Stage-Centric

**Concept:** One authoring unit per stage. Each stage file owns everything: its beats, NPCs, quests, enemies, dialogue, knowledge panels. Everything is co-located.

**Author experience:**
A designer opens `stage-02-podveil-village` and sees the entire stage — all 11 beats with their full payloads, all NPCs with their dialogue states, all quest steps, all challenge questions. The stage is self-contained.

**Advantages:**
- Lowest cognitive overhead per task. Everything about Stage 2 is in one place.
- Easiest mental model: one stage = one file.
- Easiest to version control per stage: all Stage 2 changes are in one diff.
- Natural fit for AI generation: "generate a complete stage" outputs one object.
- Stage-level validation runs against a complete, self-contained unit.

**Disadvantages:**
- Stage files grow very large. Stage 2 with 11 beats, 3 NPCs each with multiple dialogue states, 2 enemies with challenges, 1 boss with 4 phases — this is several hundred lines of content.
- CastMember content (Lyra, Kestran) would be duplicated across every stage they appear in, or split across the files — neither is clean.
- A global change to Lyra's personality requires editing every stage file she appears in.
- Challenge questions for the same concept are duplicated across multiple stage files (Stage 2 and Stage 7 both teach Pods — they share no challenge pool reference).
- Cross-stage quests (Mira's arc) have no clean home — they span 4 stages but can't live in all of them.

**Blueprint Viewer compatibility:** High. The Campaign View, Stage View, and Beat Detail all read from a Stage object. A Stage-centric authoring model maps directly.

**AI generation compatibility:** High for single stages. Low for cross-stage content (Mira's arc, campaign-wide cast evolution).

**Validation compatibility:** High for stage-level rules. Cannot validate cross-stage rules (Boss concept not introduced in *prior* stages) without loading all stages.

**Scaling characteristic:** Degrades with campaign length. A 14-stage campaign with 11 beats each, 3 NPCs each, and 2–4 dialogue states per NPC produces extremely large per-stage files. Manageable for small campaigns; becomes unwieldy for campaigns of ForgeMinds' scope.

**Future editor compatibility:** Good fit for a Stage Editor. Weak fit for a cross-stage Cast Editor or Campaign-level narrative editor.

---

### Model B — Entity-Centric

**Concept:** Separate files (or directories) per entity type. NPCs live in `npcs/`, quests in `quests/`, enemies in `enemies/`. Stages reference entities by ID rather than owning them inline.

**Author experience:**
To create Stage 2, the designer:
1. Creates `npcs/mira.yaml`, `npcs/sera-the-village-keeper.yaml`, `npcs/old-dorn.yaml`
2. Creates `quests/mira-broken-home.yaml`
3. Creates `enemies/pod-bug.yaml`, `enemies/orphan-shade.yaml`
4. Creates `enemies/warren-knot-mini-boss.yaml`
5. Creates `bosses/pod-tyrant.yaml`
6. Creates `stages/stage-02-podveil-village.yaml` referencing all the above by ID

**Advantages:**
- CastMembers exist once. Lyra is defined in `cast/lyra.yaml`. Every stage references her by ID.
- Global changes to a character affect one file.
- Challenge questions can be defined once per concept and referenced by multiple stages.
- Cross-stage quests (Mira's arc) live in `quests/mira-arc.yaml` with campaign scope.

**Disadvantages:**
- Creating a single stage touches 6–8 files. This is the most fragmented authoring experience.
- The author must hold the entire entity graph in their head to understand what a stage does. Opening `stage-02.yaml` shows only IDs — understanding the stage requires opening 6 other files.
- Reference errors (ID typo, deleted entity) are invisible until validation runs.
- Very poor fit for AI generation: "generate Stage 2" must produce and coordinate output across 6–8 separate entity files.
- The Blueprint Viewer currently receives a resolved `Campaign` object — Entity-Centric requires a resolution step to build that object from scattered entity files.

**Blueprint Viewer compatibility:** Requires an entity resolver before the viewer can receive its data. Not a direct fit.

**AI generation compatibility:** Low. Generating a stage requires coordinating output across many files. AI models work best with cohesive outputs.

**Validation compatibility:** Good for entity-level rules (NPC has required fields), but cross-entity validation (Boss requires concept introduced in stage's Knowledge beats) requires resolving the full stage first.

**Scaling characteristic:** Good for large content libraries where the same entity appears many times. Poor for small focused campaigns where most entities are stage-specific.

**Future editor compatibility:** Good for a dedicated NPC Editor, Enemy Editor, Quest Editor. Poor for a Stage-flow Editor where the author wants to see everything at once.

---

### Model C — Beat-Centric

**Concept:** Every Beat is an authorable object. A Stage is an ordered collection of Beat IDs. Beat files (or Beat objects) own their own payload.

**Author experience:**
To create Stage 2, the designer:
1. Creates Beat objects: `beat-s2-1-arrival.yaml`, `beat-s2-2-exploration.yaml`, etc.
2. Creates `stage-02-podveil-village.yaml` containing only: `beats: [s2-1, s2-2, s2-3, ...]`

**Advantages:**
- Perfect structural alignment with the Beat-centric data model.
- Each Beat is independently authorable and reviewable.
- Beat reordering is trivial (change the stage's Beat ID list).
- AI generation output (`Beat[]`) maps directly to authoring units.
- Validation is Beat-by-Beat and stage-sequence-level.

**Disadvantages:**
- A stage with 11 beats produces 11 Beat files plus 1 stage file — 12 files for one stage.
- Beat files for a single stage are scattered (unless named with stage prefix conventions).
- Similar fragmentation problem to Model B: understanding a stage requires loading 11+ files.
- CastMember content (Lyra's dialogue states) still has no clean home — it's not a Beat but it's referenced by Beats.
- Beat files for an 11-beat stage are too granular for comfortable human authoring (nobody wants to open 11 tiny files to understand a stage).

**Blueprint Viewer compatibility:** Direct. The viewer already consumes Beat sequences. Beat-centric authoring maps 1:1.

**AI generation compatibility:** Very high for individual Beats ("generate a KNOWLEDGE beat for concept:kubernetes:pod"). High for Beat sequences. Lower for the full stage as a coherent narrative.

**Validation compatibility:** High. Each Beat can be validated independently, then the sequence validated as a whole.

**Scaling characteristic:** Granularity becomes a burden at 11+ beats per stage × 14 stages = 154+ Beat files. Manageable with tooling; painful without it.

**Future editor compatibility:** Perfect fit for a visual Beat editor (drag-and-drop Beat cards). Less natural for a narrative-flow editor.

---

### Model D — Campaign-Centric

**Concept:** Large campaign documents. One (or a few) large files define the entire campaign structure. Stages are derived from the campaign document.

**Author experience:**
A designer opens `kubernetes-kingdom.yaml` and sees the complete campaign: all acts, all stage titles and concept references, all beat sequences in outline form. Detail is added in-line.

**Advantages:**
- Entire campaign visible in one document.
- No cross-file reference management.
- Natural for campaign planning and narrative review.
- Easy to get a bird's-eye view of the full campaign arc.

**Disadvantages:**
- Files become enormous (a 14-stage campaign with full beat payloads is thousands of lines).
- Merge conflicts in version control are catastrophic — two authors editing the same stage simultaneously collide in one file.
- Individual stage editing requires navigating a huge document.
- Impossible to assign authoring ownership per stage (one file, one owner).
- Catastrophic for AI generation: generating one stage requires understanding the full campaign context.

**Blueprint Viewer compatibility:** Direct at campaign level. Poor for stage-level editing (no file isolation).

**AI generation compatibility:** Very low. AI models work poorly with massive context-dependent monoliths.

**Validation compatibility:** Easy to run cross-stage validation (everything is in one file). But single-stage validation requires slicing out one stage — adds complexity.

**Scaling characteristic:** Does not scale. A 14-stage campaign is already unwieldy. A platform with 5 campaigns would be unusable.

**Future editor compatibility:** Poor. A visual editor cannot sensibly operate on a monolithic document.

---

### Model E — Hybrid Models

Three hybrid candidates emerge naturally from the analysis above.

---

#### Hybrid E1 — Stage-Centric with Referenced CastMembers

Stage file owns all Beats inline. CastMembers, recurring enemies, and campaign-scoped quests are referenced by ID (not inlined). Everything else lives in the stage.

```
campaign/
├── cast/
│   ├── lyra.yaml         ← defined once, referenced by stage beat triggers
│   ├── kestran.yaml
│   └── mira.yaml
│
└── stages/
    ├── stage-01-hollow-fields.yaml    ← owns all beats inline
    └── stage-02-podveil-village.yaml  ← owns all beats inline, references cast IDs
```

**Why this works:** Stage files are large but coherent — an author can understand a complete stage from one file. CastMember definitions are clean singletons. The overhead of cross-stage entities is minimal (5 cast members) vs the benefit (author coherence).

**Blueprint Viewer:** Stage file → adapter → viewer. Cast resolution is a simple ID lookup.

**AI generation:** "Generate Stage 2" outputs one Stage object with inline beats and referenced cast IDs. Simple and coherent.

**Validation:** Full stage validation is a single file parse + cast ID lookups. Clean.

---

#### Hybrid E2 — Beat-Centric with Stage as Author Unit

Beats are the canonical data structure but the *authoring unit* is still the Stage. A content author authors a Stage object containing a `beats` array (inline Beat definitions). The system internally tracks each Beat by position; Beat-level authoring is exposed through tooling (the Blueprint Viewer), not through per-Beat files.

This is the most important distinction: **the data model is Beat-centric; the authoring surface is Stage-centric.**

```
stages/
└── stage-02-podveil-village/
    ├── stage.yaml        ← metadata, beat sequence order, cast refs
    └── beats.yaml        ← all 11 Beat payloads, in one co-located file
```

Or even simpler:
```
stages/
└── stage-02-podveil-village.yaml   ← complete stage: metadata + Beat sequence inline
```

**Why this works:** The author sees Beats without managing Beat files. The Beat-centric data model (hierarchy, ordering, validation) is fully preserved. The authoring mental model is "I'm editing a stage" (natural) not "I'm managing a Beat file system" (unnatural).

**Blueprint Viewer:** The viewer already works this way — it receives a Stage with `beats: Beat[]`. This is exactly what the file produces.

**AI generation:** "Generate Stage 2" → one cohesive Stage object with a `beats` array. The AI's natural output format matches the authoring format exactly.

**Validation:** Complete stage file → validation rules. No pre-processing required.

---

#### Hybrid E3 — Dual-Layer (Campaign Skeleton + Stage Detail)

Two authoring layers:
1. A Campaign Skeleton (`campaign.yaml`): acts, stage IDs, concept mapping, narrative arc — the structural outline
2. Stage Detail files (`stages/stage-02.yaml`): the full Beat sequences for each stage

```
campaigns/kubernetes-kingdom/
├── campaign.yaml          ← acts, stage list, cast roster, theme refs, progression
└── stages/
    ├── stage-01.yaml      ← full beat content
    ├── stage-02.yaml      ← full beat content
    └── ...
```

**Why this works:** Authors can view the full campaign shape without opening 14 stage files. Stage files are self-contained for editing. The Blueprint Viewer's Campaign View reads `campaign.yaml`; the Stage View reads `stages/stage-N.yaml`.

**Scaling:** Clean separation of campaign structure (stable, rarely edited) from stage content (frequently edited, independently versioned).

---

## Summary evaluation matrix

| | Model A | Model B | Model C | Model D | **E1** | **E2** | **E3** |
|---|---|---|---|---|---|---|---|
| **Files to create a stage** | 1 | 6–8 | 12+ | 1 (huge) | 1–2 | 1 | 1 + campaign update |
| **Author coherence** | High | Low | Medium | High→Unwieldy | High | High | High |
| **CastMember handling** | ✗ Duplicated | ✓ | ✗ | ✗ | ✓ | Inline w/ refs | ✓ |
| **Cross-stage quests** | ✗ | ✓ | ✗ | ✓ | Partial | Campaign-scoped | ✓ |
| **AI generation** | Good | Poor | Good/Beat | Very poor | Excellent | Excellent | Good |
| **Blueprint Viewer fit** | Direct | Needs resolver | Direct | Campaign-only | Direct | Direct | Direct |
| **Validation** | Stage-level | Fragmented | Beat + Stage | Cross-stage easy | Clean | Clean | Clean |
| **Scales to 14 stages** | ✓ (large files) | ✓ | ✓ (154+ files) | ✗ | ✓ | ✓ | ✓ |
| **Future visual editor** | Stage editor | Entity editors | Beat editor | ✗ | Stage editor | Beat + Stage | Campaign + Stage |
| **Merge conflict risk** | Low | Medium | Low | Very High | Low | Low | Low |

---

## Blueprint Viewer impact analysis

The Blueprint Viewer already exists and defines the data contract: it receives a `Campaign` object and renders Campaign View, Stage View, and Beat sequence.

| Authoring model | Campaign View fit | Stage View fit | Beat sequence fit | Future visual edit |
|---|---|---|---|---|
| A (Stage-Centric) | Requires campaign assembly | Direct | Direct (inline) | Stage editor natural |
| B (Entity-Centric) | Requires full resolution | Requires resolution | Requires resolution | Multiple editors |
| C (Beat-Centric files) | Requires assembly | Requires Beat loading | Direct | Beat editor natural |
| D (Campaign-Centric) | Direct | Slice out stage | Slice out beats | Not suitable |
| **E1** (Stage + Cast refs) | Requires campaign assembly | **Direct** | **Direct** | **Stage + Cast editors** |
| **E2** (Beat-in-Stage) | Requires campaign assembly | **Direct** | **Direct** | **Stage + visual Beat editor** |
| **E3** (Campaign skeleton + stages) | **Direct (campaign.yaml)** | **Direct (stage file)** | **Direct** | **Campaign + Stage editors** |

**E3 is the strongest fit for the Blueprint Viewer** because the dual-layer structure maps directly to the viewer's two modes (Campaign View reads the skeleton; Stage View reads stage files).

---

## AI content generation analysis

The most important future compatibility dimension.

| Generation task | Best model | Example prompt output |
|---|---|---|
| Generate a complete stage | E1, E2 | One Stage object with inline beats → one file |
| Generate a Beat sequence | C, E2 | `beats: Beat[]` → inline in stage file |
| Generate a single Beat | C, E2 | One Beat object → inserted at position N in stage |
| Generate an NPC | B, E1, E3 | One NPC object → cast file (if recurring) or beat payload (if local) |
| Generate a new campaign skeleton | E3 | `campaign.yaml` with act/stage placeholders |
| Generate a theme variant | Any | ThemeOverride objects → can be generated for any entity model |

**Winner for AI generation: Hybrid E2 or E3.** The Stage object with inline beats is the natural AI output format. Campaign skeleton (E3) enables AI to generate full campaign outlines without generating all content at once.

---

## Validation impact analysis

Which model makes the existing validation rules easiest to run — and which enables future rules?

| Validation rule | A | B | C | E1 | E2 | E3 |
|---|---|---|---|---|---|---|
| KNOWLEDGE before ENCOUNTER | Single file scan | Needs resolution | Beat sequence scan | Single file | Single file | Single file |
| BOSS concept coverage | Single file scan | Needs resolution | Beat + concept lookup | Single file + cast lookup | Single file | Single file |
| Cross-stage concept prerequisites | Multi-file load | Multi-file resolve | Multi-file | Campaign assembly | Campaign assembly | `campaign.yaml` + stage loads |
| CastMember arc consistency | N/A (duplicated) | Cast file scan | N/A | Cast file scan | Cast file scan | Campaign + cast files |
| Theme completeness | Per stage | Per entity | Per beat | Per stage + cast | Per stage | Per stage + campaign |
| Campaign integrity | Must load all stages | Must resolve all | Must load all | **Load stages + campaign** | **Load stages + campaign** | **campaign.yaml provides map** |

**E3 wins on cross-stage and campaign-integrity validation** because `campaign.yaml` provides a structural map without requiring all stages to be loaded.

---

## Recommended architecture

### **Hybrid E3 — Dual-Layer (Campaign Skeleton + Stage Detail)**

with one refinement: **CastMembers defined at campaign level** (as in E1), not scattered across stage files.

The canonical authoring structure is:

```
campaigns/
└── kubernetes-kingdom/
    ├── campaign.yaml        ← Campaign skeleton: title, domain, theme refs, acts,
    │                           stage list, cast roster, progression model
    ├── cast/
    │   ├── lyra.yaml        ← CastMember definition + all StageAppearances
    │   ├── kestran.yaml
    │   ├── voss.yaml
    │   ├── mira.yaml
    │   └── khaosynth.yaml
    └── stages/
        ├── stage-01-hollow-fields.yaml     ← Full stage: beats inline + cast refs
        ├── stage-02-podveil-village.yaml
        ├── ...
        └── stage-14-dragons-throne.yaml
```

**What each layer owns:**

| File | What it owns | What it references |
|---|---|---|
| `campaign.yaml` | Acts, stage ID list, campaign-scoped quests, progression model, theme refs | Platform-level Concepts, Themes |
| `cast/lyra.yaml` | Lyra's definition + all StageAppearances (her dialogue states per stage) | Stage IDs (for appearance mapping) |
| `stages/stage-02.yaml` | All 11 Beats inline with full payloads, AppearanceTriggers | Cast IDs (Lyra, Kestran, etc.) |

---

### Why E3 wins

1. **Author coherence at the right level.** Stage authors open one file and see the complete stage. Campaign architects open `campaign.yaml` and see the full structure. Cast writers open one cast file and see the full character arc. Each author works at the right altitude.

2. **Direct Blueprint Viewer fit.** Campaign View reads `campaign.yaml`. Stage View reads a stage file. No resolution step required. The viewer's architecture and the authoring architecture are isomorphic.

3. **AI generation compatibility.** "Generate Stage 5" → one Stage file with inline Beats. "Generate campaign skeleton" → `campaign.yaml` with stage placeholders. "Generate Lyra's Stage 7 appearance" → a StageAppearance added to `lyra.yaml`. Each generation task has a clear, bounded output file.

4. **Beat-centric data model fully preserved.** Stage files contain `beats: Beat[]` inline. The Beat model (ordering, type, payload) is the internal structure. Authors see Beats without managing Beat files.

5. **Merge conflict isolation.** Two authors editing different stages never collide. Two authors editing different cast members never collide. The only shared file is `campaign.yaml` — and it changes rarely (only when stages are added/reordered).

6. **Clean validation.** Stage-level rules run on one stage file. Campaign-level rules read `campaign.yaml` to get the stage list, then load individual stage files on demand.

7. **Scales correctly.** A 14-stage campaign is 14 stage files + 5 cast files + 1 campaign file = 20 files. A second campaign is another 20 files. The structure scales linearly with campaign count, not exponentially.

---

### Why alternatives lose

**Model A (Stage-Centric pure):** CastMember content would be duplicated across 14 stage files, or awkwardly split. One change to Lyra's voice requires 14 edits.

**Model B (Entity-Centric):** Creating a single stage touches 6–8 files. Too fragmented. Very poor AI generation compatibility.

**Model C (Beat-Centric files):** 154 Beat files for 14 stages. The data model is correct; Beat files are not a human-friendly authoring surface. Beat-as-data vs Beat-as-file-unit is the key insight: Beats should be the *structure* that authors see, not the *files* they manage.

**Model D (Campaign-Centric):** Does not scale. Merge conflicts. Unusable for AI generation.

**E1 (Stage + Cast refs):** Very close to E3. The only difference is no `campaign.yaml` skeleton — campaign structure is inferred from the stage file list. This loses the Campaign View's direct data source and cross-stage validation map.

**E2 (Beat-in-Stage, no campaign skeleton):** Also very close. Loses the clean Campaign View source.

---

### Migration cost from current state

The current state: a TypeScript mock in `src/blueprint/data/mock-campaign.ts` that matches the `Campaign` type exactly.

Migration to E3:
1. The `Campaign` TypeScript type is already the correct output representation. No change.
2. Add an `adapter layer` that reads `campaign.yaml` + `stages/*.yaml` + `cast/*.yaml` and builds a `Campaign` object. The Blueprint Viewer receives the same `Campaign` object it already receives.
3. The Blueprint Viewer code does not change at all.
4. The validation engine does not change at all.
5. The only new work is: (a) defining the specific fields of `campaign.yaml` and stage files (that is Phase 2.7+ work — schema definition, not architecture), and (b) building the file-to-Campaign adapter.

**Migration cost: Low.** The data model is already correct. E3 is an authoring organisation on top of an already-correct model.

---

### Risks

1. **Cast file complexity.** Lyra's cast file will contain all 15 stage appearances, each with multiple dialogue states. This is large but coherent — far better than scattering her across 15 stage files.

2. **AppearanceTrigger coordination.** Each stage file that Lyra appears in must define AppearanceTriggers pointing to her cast file. If a stage is deleted and its triggers not cleaned from the cast file, orphan references remain. Validation must catch this (rule: every StageID referenced in a cast file must exist in campaign.yaml).

3. **Campaign-scoped quests.** Mira's arc (spans Stages 2, 5, 10, Final) does not cleanly belong to a single stage file. Under E3, campaign-scoped quests live in `campaign.yaml` or a `quests/` subdirectory at campaign level — not in any stage file. This needs to be explicitly designed (Phase 2.7 or Phase 2.8 work).

4. **Storage format not chosen.** E3 defines the authoring *organisation* but not the *format*. That decision (Phase 2.8) will shape the practical author experience significantly. A poorly chosen format (e.g., verbose XML) could undermine E3's authoring advantages regardless of its structural correctness.

---

### Open questions for Phase 2.8

1. **Campaign-scoped quest placement:** Does `campaign.yaml` own campaign-scoped quest definitions inline, or is there a `quests/` directory at campaign level?
2. **Platform-level Concept definitions:** Where do Concept definitions live? A platform-level `concepts/` directory? Separate from campaigns entirely?
3. **Expandable stage registry:** Are optional stages listed in `campaign.yaml` with unlock conditions, or as a flag on the stage file itself?
4. **Storage format:** YAML, JSON, or domain-specific format? (Phase 2.8 decision — requires human input.)

---

## Cross-references

- `ai-authoring-workflow-examples.md` — concrete workflow walkthroughs for each common authoring task
- `content-architecture/ai-beat-model.md` — the Beat data model that E3 preserves
- `content-architecture/ai-phase-02-02-campaign-act-stage-model.md` — Campaign/Stage models
- `content-architecture/ai-phase-02-03-quest-npc-castmember-model.md` — CastMember model driving the cast/ directory
- `src/blueprint/data/types.ts` — the TypeScript types that E3's adapter must produce
- `DECISIONS.md` — record recommended architecture as D-CA-AUTH once approved
