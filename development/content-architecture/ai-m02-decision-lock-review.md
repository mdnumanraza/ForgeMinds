# Milestone 02 — Decision Lock Review

> **Phase:** 2.8 — Critical Decisions Review
> **Purpose:** Consolidate all unresolved architectural decisions from Milestone 02 (Phases 2.1–2.7). For each decision: establish context, enumerate alternatives, state a recommendation with reasoning, quantify tradeoffs, project long-term impact, and assign a status (LOCK NOW / NEEDS HUMAN APPROVAL / DEFER).
> **Status:** ✅ FULLY RESOLVED — all decisions locked. D-CA-06 (Option B) and Authoring Format (YAML) approved by human on 2026-06-04. Recorded as D-18 and D-19 in `DECISIONS.md`.
> **Owned by:** AI
> **Input:** Phases 2.1–2.7 deliverables, `DECISIONS.md` (D-01 through D-17)
> **Output:** Feeds directly into `DECISIONS.md` updates and `BACKLOG.md` deferrals.

---

## How to use this document

- **✅ LOCK NOW** — Recommendation is clear, no human input needed. These entries are written in DECISIONS.md format and should be appended there verbatim.
- **🔵 NEEDS HUMAN APPROVAL** — A recommendation is stated but the decision has authoring, tooling, or design implications that only the human can confirm. The question is framed so it can be answered in one sentence.
- **⏳ DEFER** — Belongs to a later milestone or requires engine/combat system design inputs not yet available.

Decisions are grouped by their source phase, but the status hierarchy (LOCK NOW first, then NEEDS HUMAN APPROVAL, then DEFER) makes it easy to action each category.

---

## LOCK NOW decisions — full DECISIONS.md entries

These are ready to be appended to `DECISIONS.md`. They are written in the same format as D-01 through D-17.

---

### D-CA-01 — Act exists as a first-class data entity

**Status:** ✅ LOCK NOW
**Risk level:** Low

**Context:**
The platform hierarchy is Platform → Campaign → Act → Stage → Beat. The question was whether "Act" is merely a grouping label on Stages (a display convention with no engine-visible state) or a proper data entity with its own fields, lifecycle, and payload capacity. Acts in Kubernetes Kingdom have different emotional registers (Act 1: Fundamentals, Act 2: Orchestration, Act 3: Mastery), different content densities, and distinct boss structures (each Act has one ActBoss). Without Act as an entity, act-level metadata — the ActBoss, the act-completion reward, the narrative theme, and the entry/exit story beats — has nowhere to live.

**Alternatives considered:**
- Option A: Act is a display grouping — a label on a Stage's metadata (`act: "1"`) with no parent entity. Simple. Loses act-level payload capacity entirely.
- Option B: Act is a lightweight entity with minimal fields — ID, label, narrative theme, stage ID list, ActBoss reference, act-completion Reward. This is enough to carry act-level content without over-engineering.
- Option C: Act is a full entity with its own rich schema matching Campaign's complexity. Over-engineered for v1; Act's payload is small and predictable.

**Recommendation:** Option B — Act as a lightweight entity. Required fields: `id`, `label`, `narrativeTheme`, `stageIds[]`, `actBoss` (optional — not all campaigns must have one), `completionReward` (optional), `entryStoryBeat` (optional), `exitStoryBeat` (optional). No other fields are required by the current campaign design.

**Tradeoffs:**
- Gained: Act-level metadata has a clean home. ActBoss can be owned by Act (not inferred from Stage order). Act-completion rewards are authored in one place. Cross-stage validation can use Act boundaries.
- Lost: Slightly more content to author (one act file per act), versus zero files if acts were just labels.

**Long-term impact:**
Milestone 03 (Technical Architecture) needs to know the exact hierarchy. Locking Act as a lightweight entity now prevents Milestone 03 from having to reverse-engineer this from Stage metadata conventions. Future campaigns that have no natural act structure can still use a single Act containing all stages — the entity is flexible enough.

**DECISIONS.md entry:**
> D-CA-01 | Act is a first-class data entity (lightweight) with fields: id, label, narrativeTheme, stageIds[], optional actBoss, optional completionReward, optional entryStoryBeat/exitStoryBeat. Acts are L1, owned by Campaign. ActBoss is owned by Act. | Locked | 2026-06-04 | Act-level metadata (ActBoss, act-completion reward, narrative arc) requires a parent entity. Grouping labels on Stage metadata cannot carry act-level payloads. See `content-architecture/ai-phase-02-02-campaign-act-stage-model.md`.

---

### D-CA-03 — Required vs optional beats: campaign-level configuration

**Status:** ✅ LOCK NOW
**Risk level:** Low

**Context:**
The 9-beat arc (Arrival, Exploration, Discovery, Quests, Encounters, Mini-challenges, Dungeon, Boss, Portal) is a design principle, not a hard constraint for every stage. The Final Stage in Kubernetes Kingdom has no Portal beat. Some expandable optional regions have compressed beat sequences. The question was whether to enforce all 9 beats as required schema fields, treat them as optional named slots, or let the Campaign declare which beats are required for its stage type.

**Alternatives considered:**
- Option A: All 9 beats required in the schema. Simple validation. But the Final Stage, boss-only stages, and optional side regions all need structural exceptions — this forces workarounds.
- Option B: All 9 beats are optional named slots with no required set. Loses the architectural guarantee that a stage has the structural elements the 9-beat design requires.
- Option C: The Campaign defines a `requiredBeats[]` configuration for each stage type (standard stages, boss stages, optional regions, final stage). Each stage type declares which of the 9 beat types are mandatory. Validation checks each stage against its declared type's required set.

**Recommendation:** Option C — Campaign-level required beat configuration by stage type. Kubernetes Kingdom declares:
- Standard stage: requires [ARRIVAL, KNOWLEDGE, QUEST, ENCOUNTER, DUNGEON, BOSS, PORTAL]
- Final Stage: requires [ARRIVAL, KNOWLEDGE, BOSS] — no Portal, no Dungeon
- Optional/expandable stage: requires [ARRIVAL, KNOWLEDGE] — minimum viable stage

The Campaign's stage type configuration is authored once and applies to all stages of that type. Individual stages declare their type; validation uses the Campaign's type config to check them.

**Tradeoffs:**
- Gained: The architecture accommodates the full diversity of stage structures seen in the campaign design without special-casing or schema hacks. Validation remains strict (it checks against the declared type's requirements) while allowing intentional variation.
- Lost: One extra configuration layer (the Campaign's stage type config). Authors must declare which type a stage is.

**Long-term impact:**
Future campaigns with different structural conventions (a campaign without boss mechanics, a campaign where all stages are open-world exploration) can declare their own stage type configurations without engine changes. This is critical for the platform to be truly content-driven.

**DECISIONS.md entry:**
> D-CA-03 | Required beats in the 9-beat arc are declared at the Campaign level per stage type (standard stage, final stage, optional region, etc.). A Campaign defines a `requiredBeats[]` set for each stage type. Individual stages declare their type; validation checks them against the Campaign's type config. This replaces any global "all 9 beats required" rule. | Locked | 2026-06-04 | The Final Stage and optional regions require different beat structures. Campaign-level type configuration enforces the arc design without hard-coding it. See `content-architecture/ai-phase-02-02-campaign-act-stage-model.md`.

---

### D-CA-05 — CastMember as a separate type from local NPC

**Status:** ✅ LOCK NOW
**Risk level:** Low

**Context:**
Kubernetes Kingdom has two distinct categories of character: five recurring CastMembers (Lyra, Kestran, Voss, Mira, Khaosynth) who appear across multiple stages and have campaign-spanning arcs, and local NPCs (Bram, Hadris, Sigrid, etc.) who are stage-specific. The question was whether these should be one entity type with a `scope: "campaign" | "stage"` flag, or two separate types.

**Alternatives considered:**
- Option A: Two separate types — `CastMember` (Campaign L1) and `NPC` (Stage L3 payload). Distinct schemas, distinct authoring files, distinct ownership rules.
- Option B: One `NPC` type with a `scope` flag. Simpler type system but requires the NPC schema to carry fields that are irrelevant for one scope or the other: local NPCs would have empty `stageAppearances[]` arrays; CastMembers would have a `stageId` ownership field they never use.

**Recommendation:** Option A — two separate types. The structural differences are load-bearing:
- CastMembers have `stageAppearances[]` (multi-stage arc tracking), `arcSummary`, and are owned at Campaign L1.
- Local NPCs have 3–5 `DialogueStates` tied to quest progression, are owned at Stage L3 (Beat payload), and are never promoted to other stages without explicit reclassification.
- Merging them into one type creates a schema where half the fields are inapplicable depending on the scope flag — a classic anti-pattern that leads to validation noise and authoring confusion.

**Tradeoffs:**
- Gained: Clean schemas. CastMember promotion path (local NPC → CastMember) is explicit. Authoring tools can present the right interface for the right type. Validation rules are unambiguous.
- Lost: Two entity types to maintain. Authors must know which type to use when creating a character.

**Long-term impact:**
Milestone 03 schema definitions will be cleaner with two types. The visual editor (future) can present a Stage NPC editor and a Campaign Cast editor as separate tools. AI content generation benefits from clear type boundaries: "generate a local NPC for Stage 5" and "generate a StageAppearance for Lyra at Stage 5" are distinct, well-scoped prompts.

**DECISIONS.md entry:**
> D-CA-05 | Recurring characters (CastMembers) and stage-local characters (NPCs) are separate entity types. CastMember is L1 (Campaign-owned), holds `stageAppearances[]` with full arc tracking. NPC is L3 (Beat payload, Stage-scoped), holds 3–5 DialogueStates tied to quest progression. Merging into one type with a scope flag is rejected — the structural requirements diverge too significantly. | Locked | 2026-06-04 | CastMembers require campaign-wide arc infrastructure that local NPCs never use. Type separation keeps both schemas clean and validation unambiguous. See `content-architecture/ai-phase-02-03-quest-npc-castmember-model.md`.

---

### D-CA-07 — KnowledgeBeat and Challenge are separate types

**Status:** ✅ LOCK NOW
**Risk level:** Low

**Context:**
Both KnowledgeBeat and Challenge involve a K8s Concept and are triggered by world events. The question arose whether they should be merged into a single content type with a mode flag (`deliveryMode: "teach" | "test"`).

**Alternatives considered:**
- Option A: Single `KnowledgeEvent` type with a mode field. Fewer types to manage, but conditional fields multiply: `correctAnswer`, `distractors`, `hintText`, and `difficulty` are meaningless on a teach-mode event; `analogy`, `example`, `command`, and `practicalNote` are meaningless on a test-mode event.
- Option B: Separate `KnowledgeBeat` (discovery, passive reception, ENCOUNTERED mastery dimension) and `Challenge` (active response, HP risk, DEMONSTRATED mastery dimension) types.

**Recommendation:** Option B — separate types, as documented in Phase 2.4. The player mode distinction is fundamental: KnowledgeBeat is passive discovery (knowledge-discovery mode); Challenge is active response (combat/test mode). Their ownership, consequence, and authoring requirements differ. A merged type would require conditional validation logic equivalent to maintaining two separate types, without the benefit of clear authoring intent.

**Tradeoffs:**
- Gained: Unambiguous authoring. "One teaches, one tests" is a rule that content authors can hold in their head without consulting a mode field.
- Lost: Two types instead of one. Minor.

**Long-term impact:** Already reflected in the D-CA-06 decision space and the Challenge pool architecture. No schema ambiguity in Milestone 03.

**DECISIONS.md entry:**
> D-CA-07 | KnowledgeBeat (discovery, passive, sets ENCOUNTERED mastery dimension) and Challenge (active test, HP risk, sets DEMONSTRATED mastery dimension) are separate content types. They both reference a Concept and require a world-event trigger, but their ownership, player mode, consequences, and schemas are structurally distinct. Merging them into one type is rejected. | Locked | 2026-06-04 | Resolves the open question from Phase 2.4. See `content-architecture/ai-phase-02-04-knowledge-challenge-model.md §MODEL 7`.

---

### D-CA-08 — Boss phases as sub-objects, not separate entities

**Status:** ✅ LOCK NOW
**Risk level:** Low

**Context:**
The Stage Boss and ActBoss models require phase-by-phase content (concept per phase, challenge references per phase, transition conditions, resolution conditions). The question was whether BossPhases should be separate entities referenced by ID from the Boss, or owned sub-objects embedded within the Boss.

**Alternatives considered:**
- Option A: BossPhase as sub-objects owned by the Boss (`phases: BossPhase[]`). Boss is one self-contained object. Phases are never reused.
- Option B: BossPhase as separate entities referenced by ID. More indirection. Would allow reuse — but BossPhases are never reused: Phase 1 of the Isolation Wyrm is always and only Phase 1 of the Isolation Wyrm.

**Recommendation:** Option A — BossPhase as sub-objects. The authoring advantage of embedding (the full boss is one coherent object; phases are authored alongside the boss context) is unambiguous. The supposed advantage of Option B (reuse) is never realised in practice — boss phases are architecturally bound to their boss.

**Tradeoffs:**
- Gained: Boss objects are self-contained. A boss author reads one object and has the full fight. Validation is straightforward (no foreign key lookups for phases). AI generation outputs one Boss object with phases inline.
- Lost: Nothing practical. Boss phases are not reused. The indirection of Option B adds complexity without benefit.

**Long-term impact:** BossPhase sub-objects are already modelled this way in Phase 2.5 (all four boss validation tests pass with this model). Milestone 03 schemas will be cleaner with embedded phases.

**DECISIONS.md entry:**
> D-CA-08 | Boss phases (BossPhase) are sub-objects owned by their Boss or ActBoss — not separate entities referenced by ID. Boss has `phases: BossPhase[]`. BossPhases are never authored, referenced, or reused outside their parent Boss. Sub-object ownership keeps boss content self-contained and eliminates foreign key dependencies for phases. | Locked | 2026-06-04 | Boss phases are architecturally bound to one boss and never reused. Sub-objects are simpler to author, validate, and generate. See `content-architecture/ai-phase-02-05-enemy-boss-model.md §MODEL 6`.

---

### D-CA-14 — Maximum DialogueLine branch depth: 3 levels

**Status:** ✅ LOCK NOW
**Risk level:** Low

**Context:**
DialogueLines can branch (a line leads to another DialogueLine for multi-exchange conversations). The question was how deep this branching can go before it becomes unmaintainable and incompatible with the adventure-first principle. Flat (depth 1, no branching), shallow tree (2–3 levels), or arbitrary depth were the options.

**Alternatives considered:**
- Option A: Flat — no branching at all. Every DialogueLine is a complete exchange. Simple authoring, but makes multi-exchange conversations impossible (Lyra's teaching moments, Kestran's self-disclosure) without splitting them across multiple DialogueStates, which creates state management overhead.
- Option B: Max depth 2 — one question and one follow-up. Covers most NPC interactions but is limiting for CastMember dialogue.
- Option C: Max depth 3 — one primary line, one response, one follow-up. Covers all identified dialogue patterns in the campaign design. Lyra's longest single-beat exchanges are three turns.
- Option D: Arbitrary depth. Authoring complexity scales without bound. Violates the "5-line rule" spirit (KP-1): content should be chunked, not deep-nested.

**Recommendation:** Max depth 3. This covers all known dialogue patterns in Kubernetes Kingdom without opening the authoring surface to arbitrarily complex conversation trees. If a dialogue needs more than 3 levels of branching, the design needs more DialogueStates, not deeper nesting.

**Tradeoffs:**
- Gained: All campaign dialogue patterns are expressible. Authoring surface is bounded and predictable. Validation can check depth without infinite recursion risk.
- Lost: Edge cases requiring depth 4+ must be redesigned as multiple DialogueStates. This is a design constraint, not a limitation — it enforces the "world remembers through state, not through deep trees" principle.

**Long-term impact:** The visual dialogue editor (future milestone) can be designed with a known maximum depth. AI content generation prompts can specify "max 3 dialogue turns" as a structural constraint.

**DECISIONS.md entry:**
> D-CA-14 | Maximum DialogueLine branch depth is 3 levels (primary line → response → follow-up). Dialogue requiring more depth must be split into multiple named DialogueStates. This is enforced by content validation. The constraint aligns with the "adventure first" principle — characters exchange, they do not lecture. | Locked | 2026-06-04 | All identified dialogue patterns in Kubernetes Kingdom fit within depth 3. Arbitrary depth creates unmaintainable authoring trees. See `content-architecture/ai-phase-02-03-quest-npc-castmember-model.md §MODEL 4`.

---

### D-CA-15 — Challenge difficulty tiers: three tiers, stage-level distribution configured by Campaign

**Status:** ✅ LOCK NOW
**Risk level:** Low

**Context:**
Challenges have a `difficulty` field. The question was how many difficulty tiers should exist and who configures the distribution of tiers within a stage. The three candidates from Phase 2.4 were INTRODUCTORY, INTERMEDIATE, and ADVANCED.

**Alternatives considered:**
- Option A: Two tiers (STANDARD and ADVANCED). Simpler but loses the introductory context: Stage 1's first enemy encounter and Stage 13's boss phase should not be the same "standard" difficulty.
- Option B: Three tiers (INTRODUCTORY / INTERMEDIATE / ADVANCED). Maps cleanly to the act structure: Act 1 emphasises INTRODUCTORY challenges, Act 2 uses INTERMEDIATE, Act 3 uses ADVANCED as the primary tier.
- Option C: Five or more numeric tiers. Over-granular for content authoring; authors would need a difficulty rubric, not a simple tier. Also incompatible with the pool model (D-CA-06 under Option B or C), which must filter challenges by tier — more tiers means sparser pools at each tier.

**Recommendation:** Three tiers. The Campaign-level stage type configuration (from D-CA-03) includes a `defaultDifficultyTier` and an `allowedDifficultyTiers[]` per stage type. Standard stages in Act 1 default to INTRODUCTORY with INTERMEDIATE as the maximum for boss phases. Act 3 defaults to ADVANCED. The Campaign configures the distribution; individual content entities declare their tier; validation checks that declared tiers are within the Campaign's allowed range for that stage type.

**Tradeoffs:**
- Gained: Three tiers map naturally to the three acts. The Campaign-level configuration provides structural guardrails without requiring each content author to recalibrate per stage. The challenge pool (under Option B or C for D-CA-06) remains practical — three tiers means each concept pool has three filtered subsets.
- Lost: Fine-grained difficulty variation within a tier (INTRODUCTORY_HARD) is not expressible. If this is needed, a fourth tier or a difficulty modifier can be added in a later milestone.

**Long-term impact:** Three tiers are enough for Kubernetes Kingdom. Future campaigns may need to override the distribution — the Campaign-level configuration model makes this possible without engine changes.

**DECISIONS.md entry:**
> D-CA-15 | Challenge difficulty uses three tiers: INTRODUCTORY, INTERMEDIATE, ADVANCED. The Campaign declares a defaultDifficultyTier and allowedDifficultyTiers[] per stage type. Content entities declare their tier within the allowed range. Validation enforces conformance. This maps naturally to the three-act structure and keeps challenge pools practical. | Locked | 2026-06-04 | Three tiers cover all difficulty variation in Kubernetes Kingdom. More tiers create sparse pools; fewer tiers lose the introductory-to-advanced progression arc. See `content-architecture/ai-phase-02-04-knowledge-challenge-model.md`.

---

### D-CA-16 — Challenge pool seeding: AI-authored, human-reviewed

**Status:** ✅ LOCK NOW
**Risk level:** Low

**Context:**
When a new Concept is added to the platform, who authors its initial challenge pool? The challenge pool (under Option B, Concept-level pool) needs challenges authored at the time the Concept is created — it cannot wait for a campaign to create them.

**Alternatives considered:**
- Option A: Human authors write all challenges manually. Quality baseline is high but creates a bottleneck: every new Concept requires dedicated challenge authoring work before any campaign can reference it.
- Option B: AI generates challenge pool entries, which are then reviewed and approved by a human before the Concept is published. This scales with the platform's Concept count (AI can draft 20 challenges for a new Concept quickly) without eliminating human quality control.
- Option C: Campaigns author challenges for their own Concept references and contribute them to the platform pool. Leads to uneven pool quality and inconsistent challenge framing across campaigns.

**Recommendation:** Option B — AI-authored, human-reviewed. The AI drafts an initial pool covering all 7 challenge types at all 3 difficulty tiers for a new Concept. A human reviewer approves or revises each challenge before the Concept moves from DRAFT to PUBLISHED. The Concept's lifecycle gate (DRAFT → PUBLISHED) enforces this: no Concept can be published without a reviewed challenge pool of minimum N challenges (recommend: minimum 5 per difficulty tier × 3 tiers = 15 minimum per Concept).

**Tradeoffs:**
- Gained: Platform scales with the Concept catalogue without manual authoring bottlenecks. AI generation produces consistent challenge framing. Human review catches factual errors and ensures world-context quality.
- Lost: Human review is still required — this is not zero-effort. The review process must be designed as part of the content ops workflow (Milestone 03+ planning).

**Long-term impact:** This establishes the content ops model for the platform's Concept catalogue. It should be documented as part of the content authoring workflow (in `ai-authoring-workflow-examples.md`).

**DECISIONS.md entry:**
> D-CA-16 | Challenge pool seeding for new Concepts: AI drafts an initial pool (all 7 challenge types × 3 difficulty tiers, minimum 15 challenges), a human reviewer approves before the Concept is published. The Concept lifecycle gate DRAFT → PUBLISHED requires a reviewed challenge pool. This scales the platform's Concept catalogue without eliminating quality review. | Locked | 2026-06-04 | Manual-only authoring is a bottleneck at platform scale. AI-authored challenges without human review risk factual errors. AI-authored + human-reviewed is the correct balance. See `content-architecture/ai-phase-02-04-knowledge-challenge-model.md §UNRESOLVED DECISIONS`.

---

### D-CA-17 — Authoring model: Hybrid E3 (Campaign Skeleton + Stage Detail files)

**Status:** ✅ LOCK NOW
**Risk level:** Low

**Context:**
Phase 2.6.5 evaluated five authoring models and three hybrid variants for how content authors interact with campaign content. The choice determines the file organisation, how the Blueprint Viewer receives its data, how AI generation produces content, and how validation runs. This decision is architectural and has downstream implications for the adapter layer in Milestone 03.

**Alternatives considered:**
(Full analysis in `ai-content-authoring-architecture.md`. Summary here.)
- Model A (Stage-Centric): One file per stage. Good coherence, but CastMembers duplicated across 14 stage files. No clean home for cross-stage quests.
- Model B (Entity-Centric): Separate files per entity type. Creating one stage touches 6–8 files. Poor AI generation compatibility.
- Model C (Beat-Centric files): 154 Beat files for 14 stages. Correct data model; wrong authoring surface.
- Model D (Campaign-Centric): One large file per campaign. Does not scale. Catastrophic merge conflicts.
- Hybrid E1 (Stage + Cast refs): Very close to E3, but no `campaign.yaml` skeleton — loses direct Blueprint Viewer Campaign View source.
- Hybrid E2 (Beat-in-Stage, no skeleton): Loses the cross-stage validation map.
- **Hybrid E3 (Campaign Skeleton + Stage Detail):** Two authoring layers: `campaign.yaml` (structural outline, act/stage list, cast roster, campaign-scoped quests) + `stages/stage-N.yaml` (full Beat sequences inline) + `cast/character.yaml` (CastMember with all StageAppearances).

**Recommendation:** Hybrid E3. Reasons:
1. Author coherence at the right level: stage authors work in one stage file; campaign architects work in `campaign.yaml`; cast writers work in one cast file.
2. Direct Blueprint Viewer fit: Campaign View reads `campaign.yaml`; Stage View reads a stage file. No resolution step required.
3. AI generation compatibility: "Generate Stage 5" → one stage file; "Generate campaign skeleton" → `campaign.yaml`; "Generate Lyra's Stage 7 appearance" → addition to `lyra.yaml`.
4. Beat-centric data model fully preserved: stage files contain `beats: Beat[]` inline.
5. Merge conflict isolation: stage authors and cast authors and campaign architects never collide.
6. Clean validation: stage rules run on one file; campaign rules use `campaign.yaml` as the structural map.
7. Migration cost from current state is Low — the adapter layer is new work, but the TypeScript types and Blueprint Viewer do not change.

**Tradeoffs:**
- Gained: Every authoring concern has exactly the right file. No duplication. No fragmentation. AI generation outputs map directly to files.
- Lost: One additional file type to learn (`campaign.yaml` vs. just stage files). The campaign skeleton can feel like overhead for a very small campaign — but even a 3-stage campaign benefits from the structural separation.

**Long-term impact:** This is the single most far-reaching content-authoring decision of Milestone 02. It directly determines what Milestone 03 must build: the adapter layer (reads campaign.yaml + stages/ + cast/, builds Campaign object). Everything downstream — schema definitions, validation tooling, AI generation prompts, future visual editor design — is shaped by this choice.

**DECISIONS.md entry:**
> D-CA-17 | Content authoring model: Hybrid E3 — Campaign Skeleton (`campaign.yaml`) + Stage Detail files (`stages/stage-N.yaml`) + CastMember files (`cast/character.yaml`). `campaign.yaml` owns: acts, stage ID list, campaign-scoped quests, cast roster, progression model, theme refs. Stage files own: all Beats inline with full payloads, AppearanceTriggers. Cast files own: CastMember definition + all StageAppearances. An adapter layer (Milestone 03 work) reads this structure and produces the Campaign object the Blueprint Viewer already consumes. | Locked | 2026-06-04 | E3 provides author coherence at the right level for each author role, direct Blueprint Viewer compatibility, excellent AI generation compatibility, and clean validation. Five alternative models were evaluated. See `content-architecture/ai-content-authoring-architecture.md`.

---

### D-CA-18 — Campaign-scoped quest placement: quests/ subdirectory at campaign level

**Status:** ✅ LOCK NOW
**Risk level:** Low

**Context:**
Campaign-scoped quests (like Mira's arc, which spans Stages 2, 5, 10, and the Final Stage) are owned by the Campaign (L1), not by any individual Stage. Under E3, `campaign.yaml` owns the structural outline. The question was whether campaign-scoped quest definitions should be inline in `campaign.yaml` or in a `quests/` subdirectory at the campaign level.

**Alternatives considered:**
- Option A: Inline in `campaign.yaml`. Simple. But `campaign.yaml` becomes very large if it contains full quest definitions. Mira's arc has steps, resolution conditions, and rewards spread across 4 stages — that is significant content.
- Option B: `quests/` subdirectory at campaign level. Each campaign-scoped quest is a separate file (`quests/mira-arc.yaml`). `campaign.yaml` references quest IDs. Quest files are self-contained.

**Recommendation:** Option B — `quests/` subdirectory. `campaign.yaml` holds a `campaignQuests: [questId1, questId2, ...]` reference list. Each quest lives in `campaigns/kubernetes-kingdom/quests/mira-arc.yaml`. The E3 file structure becomes:

```
campaigns/kubernetes-kingdom/
├── campaign.yaml
├── cast/
│   └── lyra.yaml, kestran.yaml, ...
├── quests/
│   └── mira-arc.yaml, voss-pact.yaml, ...
└── stages/
    └── stage-01.yaml, stage-02.yaml, ...
```

**Tradeoffs:**
- Gained: `campaign.yaml` stays structurally clean (it describes structure, not quest content). Campaign-scoped quests are independently authorable and versionable. AI generation of a new campaign quest is a single bounded file output.
- Lost: One more directory type. Quest IDs in `campaign.yaml` must match quest file names — a validation rule is needed to enforce this.

**Long-term impact:** This is the correct pattern for any campaign-level content that is substantial enough to not fit comfortably inline in `campaign.yaml`. Future campaigns may also have campaign-level cutscenes, campaign-level StoryBeats, or campaign-level event definitions — the `quests/` directory establishes the pattern for a campaign's "L1 content library."

**DECISIONS.md entry:**
> D-CA-18 | Campaign-scoped quest definitions live in a `quests/` subdirectory at campaign level (`campaigns/kubernetes-kingdom/quests/`). Each quest is a separate file. `campaign.yaml` holds a `campaignQuests: []` reference list of quest IDs. This keeps `campaign.yaml` structurally clean and makes campaign-scoped quests independently authorable. | Locked | 2026-06-04 | Inline quest definitions in `campaign.yaml` would grow unmanageably. The quests/ directory pattern scales with campaign complexity. Follows from D-CA-17 (E3 authoring model). See `content-architecture/ai-content-authoring-architecture.md §Open questions`.

---

### D-CA-19 — Platform-level Concept definitions: platform/concepts/ directory

**Status:** ✅ LOCK NOW
**Risk level:** Low

**Context:**
Concepts are L0 (platform-level) entities. They are not owned by any campaign. Under the E3 authoring model, campaign content lives in `campaigns/`. Concept definitions need a location that is clearly outside any campaign.

**Alternatives considered:**
- Option A: `concepts/` at the repository root. Simple, visible.
- Option B: `platform/concepts/` — a `platform/` directory that also holds Themes and ChallengeType definitions. Concepts are not the only platform-level entity; grouping them under `platform/` keeps the structure coherent as the platform grows.

**Recommendation:** Option B — `platform/concepts/` directory. Platform-level entities (Concepts, Themes, ChallengeType definitions) live under `platform/`, with each type in its own subdirectory. The root structure becomes:

```
platform/
├── concepts/
│   └── kubernetes/pod.yaml, kubernetes/deployment.yaml, ...
├── themes/
│   └── fantasy-kingdom.yaml, space-galaxy.yaml
└── challenge-types/
    └── mcq.yaml, command-completion.yaml, ...
campaigns/
└── kubernetes-kingdom/
    └── campaign.yaml, cast/, stages/, quests/
```

**Tradeoffs:**
- Gained: Platform-level entities are clearly separated from campaign content. The root directory communicates the architecture at a glance: `platform/` is shared; `campaigns/` is per-campaign.
- Lost: One more directory level for concepts (`platform/concepts/kubernetes/pod.yaml` vs `concepts/kubernetes/pod.yaml`). Negligible.

**Long-term impact:** When Linux Realms and Docker Dominion campaigns are authored, they reference `platform/concepts/linux/` and `platform/concepts/docker/`. The structure scales directly.

**DECISIONS.md entry:**
> D-CA-19 | Platform-level Concept definitions live in `platform/concepts/` (e.g., `platform/concepts/kubernetes/pod.yaml`). Themes live in `platform/themes/`. ChallengeType definitions live in `platform/challenge-types/`. This separates platform entities from campaign content and scales cleanly as the Concept catalogue and campaign catalogue grow. | Locked | 2026-06-04 | Concepts are platform-level (L0), not campaign-owned. They must live outside any campaign directory. The `platform/` grouping establishes a clean structural convention for all L0 entities. Follows from D-CA-17 (E3 authoring model).

---

### D-CA-20 — Expandable stage registry: declared in campaign.yaml with unlock conditions

**Status:** ✅ LOCK NOW
**Risk level:** Low

**Context:**
Kubernetes Kingdom has three expandable optional regions in addition to the 14 mandatory stages. These optional stages need to be discoverable by the engine (so it can offer them to the player when conditions are met) but should not look like mandatory stages in the campaign's stage sequence. The question was whether optional stages are declared in `campaign.yaml` with their unlock conditions, or flagged on the stage files themselves.

**Alternatives considered:**
- Option A: A flag (`optional: true`, `unlockCondition: ...`) on each stage file. The engine scans all stage files to build the optional registry. Simple per-file authoring but requires loading all stage files to discover which ones are optional.
- Option B: `campaign.yaml` contains an `optionalStages` section listing optional stage IDs and their unlock conditions. The engine reads `campaign.yaml` to know the optional registry without scanning all stage files. Stage files themselves are unmodified by this decision.

**Recommendation:** Option B — declared in `campaign.yaml`. The unlock conditions (which stages must be completed, which knowledge must be demonstrated) are campaign-structural information — they belong in the campaign's structural document, not distributed across 3 optional stage files. This also means `campaign.yaml` is a complete structural map: a reader can understand the full campaign shape from `campaign.yaml` alone.

**Tradeoffs:**
- Gained: `campaign.yaml` is the complete campaign structural reference. Engine needs only `campaign.yaml` to know all mandatory and optional stages and their unlock conditions. Stage files contain content; structural decisions stay in `campaign.yaml`.
- Lost: Adding an optional stage requires editing both `campaign.yaml` (to add it to the optional registry) and creating the stage file. This is the correct two-step process — adding a stage is a structural change and a content creation step.

**Long-term impact:** Future campaigns with large optional content networks (a campaign with 10+ side quests, each unlocking a different optional stage) are well-served by this model: `campaign.yaml` is the navigable map; stage files are the content.

**DECISIONS.md entry:**
> D-CA-20 | Expandable/optional stages are declared in `campaign.yaml` in an `optionalStages` section: `{ stageId, unlockCondition }`. The engine reads `campaign.yaml` to discover the optional stage registry without scanning stage files. Stage files contain content; structural unlock decisions belong in the campaign structural document. | Locked | 2026-06-04 | Optional stages are structural decisions about the campaign; unlock conditions reference other stages and knowledge mastery — campaign-level information that belongs in `campaign.yaml`. Follows from D-CA-17 and D-CA-03. See `content-architecture/ai-content-authoring-architecture.md §Open questions`.

---

## NEEDS HUMAN APPROVAL decisions

---

### D-CA-06 — Challenge pool architecture

**Status:** 🔵 NEEDS HUMAN APPROVAL
**Risk level:** High

**Context:**
This is the most consequential unresolved decision in Milestone 02. It determines where Challenge content lives in the ownership hierarchy, and everything in the engine that touches challenges — authoring workflow, AI generation, runtime lookup, cross-campaign reuse — depends on the answer.

A Challenge is the active test the player faces during combat and dungeon encounters. It has a concept reference, a difficulty tier, a type (MCQ, CommandCompletion, etc.), a correct answer, and a worldEventContext. The question is: who owns Challenge instances?

Every entity that uses challenges — Enemy, BossPhase, MiniChallenge, MiniBoss — must either own its challenges directly, reference a concept-level pool, or reference a campaign-level pool. The ownership model determines the reuse surface, the authoring workflow, and the engine's challenge lookup path.

**Alternatives in full:**

**Option A — Embedded (Challenge owned by its user)**
Each entity that uses challenges owns them directly inline. An Enemy has `challenges: Challenge[]`. A BossPhase has `challenges: Challenge[]`. A MiniChallenge has `challenge: Challenge`.

- Authoring: author writes challenge questions while writing the enemy. Self-contained. Stage-02 Pod Bug has its own MCQ about Pod networking, authored inline.
- Reuse: none. If Stage 3 also has enemies testing Pods, those challenges are separate objects with similar-or-identical content.
- Engine: trivial — challenge is in the entity. No pool lookup.
- Content duplication: high. 14 stages × 2–4 enemies per stage × 2–3 challenges per enemy ≈ 100+ embedded challenge objects for one campaign, many testing the same concepts.
- AI generation: excellent for single-entity generation — "generate an enemy with its challenges" is one bounded output.
- Migration cost if architecture needs to change later: High. Moving from embedded to pooled requires extracting challenges from dozens of entities.
- Verdict: Only acceptable for a prototype. The long-term platform cannot sustain this model.

**Option B — Concept Pool (Challenge owned by Concept)**
All challenges for a given Concept live in that Concept's pool at platform level (L0). `platform/concepts/kubernetes/pod.yaml` contains `challengePool: Challenge[]` filtered by type and difficulty. Entities do not own challenges — they declare selection criteria: `{ conceptId, difficultyTier, challengeType }`. The engine draws from the pool at load time or runtime.

- Authoring: challenge authors work in the Concept file. Stage content declares what kind of challenge it needs; the pool supplies it. Campaign authors never write challenge questions.
- Reuse: maximum. A Pod MCQ at INTERMEDIATE difficulty can be used by any stage's enemies, any boss phase, and any future campaign that teaches Pods — without duplication.
- Engine: moderate. Engine must filter pool by difficulty and type. At load time, content-addressable lookup is straightforward (`conceptId:type:difficulty → Challenge[]`). The engine selects from the filtered set (randomly, or by variant rotation to avoid repetition).
- Content duplication: none. One Pod MCQ serves all stages and all campaigns.
- AI generation: good for pool population ("generate 5 MCQ challenges for concept:kubernetes:pod at INTERMEDIATE difficulty"). Less natural for "generate a complete stage" (stage content does not specify challenge questions, only selection criteria).
- Pool maintenance: platform team owns concept pools. When a new Concept is published, its pool must be seeded before any campaign can reference it (D-CA-16 addresses this).
- Challenge variety concern: if the platform is large (50+ Concepts), pools must be large enough to avoid the same challenge appearing too frequently. Minimum pool sizes per concept must be enforced (D-CA-16: minimum 15 challenges per concept).
- Verdict: Best long-term model for a growing platform with multiple campaigns. The challenge is that the platform must commit to maintaining concept pools as a first-class content concern.

**Option C — Campaign Pool (Challenge owned by Campaign)**
All challenges for a campaign live in one pool at campaign level (L1). `campaigns/kubernetes-kingdom/challenges.yaml` holds all challenges tagged by `{ conceptId, difficultyTier, stageRange, type }`. Entities filter the campaign pool by tags.

- Authoring: campaign challenge author maintains one pool file for the whole campaign. Stage content declares tag filters; the pool is curated at campaign level.
- Reuse: within campaign only. Stage 2 and Stage 8 challenges for Pods can be shared within Kubernetes Kingdom, but Linux Realms must author its own Pod challenges.
- Engine: similar to Option B — pool filter at load time.
- Content duplication: low within one campaign; high across campaigns (each campaign maintains its own challenges for shared concepts).
- AI generation: good — "generate all challenge content for Kubernetes Kingdom" is one scoped task.
- Campaign author control: high. A campaign author can curate exactly which challenges appear, how many, and in what contexts, without being bound by platform-level pool decisions.
- Verdict: A strong middle path. The campaign author has full control. The platform does not need to maintain concept pools. The cost is that cross-campaign concept coverage is not shared, and a second campaign (Linux Realms) that also teaches Pods must re-author Pod challenges.

**Recommendation:**
**Option B (Concept Pool) is recommended** as the platform's long-term model, for these reasons:

1. **ForgeMinds is explicitly a platform.** Multiple campaigns (Kubernetes Kingdom, Linux Realms, Docker Dominion) will teach overlapping concepts. Option B eliminates challenge duplication across those campaigns. The same high-quality Pod MCQ serves all of them.

2. **Option B aligns with Concept lifecycle rules.** Concepts have a formal lifecycle (DRAFT → PUBLISHED → DEPRECATED). Challenge pools are a natural extension of the Concept definition — they are what makes the Concept "complete" from a testing perspective. D-CA-16 already establishes that pool seeding is part of Concept publication.

3. **Option C is a stepping stone, not a destination.** If the platform ships only one campaign forever, Option C is fine. But the architecture documents plan for multiple campaigns from the start. Option C requires challenge re-authoring per campaign for shared concepts — a burden that grows as the campaign catalogue grows.

4. **Option A is rejected.** Content duplication at scale is an anti-pattern that creates maintenance debt. Changing a factually incorrect challenge answer requires editing it everywhere it is embedded. Under Option B, a correction to `pod.yaml`'s challenge pool propagates everywhere instantly.

**The human decision this requires:**
> Do you accept Option B (Concept Pool) as the challenge ownership model, accepting that: (a) platform concept pools become a first-class content management concern, (b) the minimum pool size rule (D-CA-16) must be enforced before Concepts can be published, and (c) campaign stage content will specify challenge selection criteria rather than writing challenge questions inline?
>
> If not, Option C (Campaign Pool) is the recommended fallback, accepting that each campaign must re-author challenges for shared concepts.

**Tradeoffs at a glance:**

| Dimension | Option A (Embedded) | Option B (Concept Pool) | Option C (Campaign Pool) |
|---|---|---|---|
| Cross-campaign reuse | None | Full | Campaign-scoped only |
| Authoring simplicity | Highest (inline) | Moderate (pool + criteria) | Moderate (tag filter) |
| Content duplication | High | None | Low within campaign |
| Engine complexity | Lowest | Moderate | Moderate |
| Platform maintenance | Per-entity | Platform team owns pools | Per-campaign |
| AI generation | Easy (inline) | Pool seeding + criteria | Campaign pool generation |
| Future-proofing | Poor | Strong | Medium |

**Long-term impact:**
D-CA-06 is the dependency that every entity in the challenge system (Enemy, BossPhase, MiniChallenge, MiniBoss) resolves against. Milestone 03 schema definitions for all these entities will be written differently depending on this decision. It is the single largest blocker for Milestone 03 to begin schema work on challenge-consuming entities.

---

### D-CA-04 — Embedded vs referenced NPC dialogue

**Status:** 🔵 NEEDS HUMAN APPROVAL
**Risk level:** Medium

**Context:**
Local NPC dialogue (DialogueStates and DialogueLines) can either be embedded inline in the NPC object or stored as separate objects referenced by ID. For local NPCs with 3–5 dialogue states (the common case), the decision is low-stakes. But CastMembers like Lyra can have 40–60 DialogueLines across 14 StageAppearances. The question is whether those lines are all embedded in Lyra's cast file or referenced externally.

**Alternatives considered:**

**Option A — Embedded dialogue (DialogueStates inline in NPC/CastMember)**
All dialogue content lives inside the owning character object. `lyra.yaml` contains all 14 StageAppearances, each with all DialogueStates, each with all DialogueLines. One file per character; all their words are there.

- Authoring: open one file, see all of a character's dialogue. Complete character arc in one place.
- File size: Lyra's file is large — 14 appearances × ~4 states × ~5 lines = ~280 DialogueLine objects. Not unmanageable for a YAML file, but substantial.
- Engine: load one file to access all dialogue. No additional lookups.
- AI generation: "Generate Lyra's Stage 7 appearance" → add a StageAppearance block to `lyra.yaml`. Self-contained.

**Option B — Referenced dialogue (DialogueStates as separate objects)**
NPC/CastMember holds `dialogueStateRefs: [id1, id2, ...]`. DialogueState objects live in separate files or a dialogue registry. Engine loads character → fetches referenced states → resolves dialogue.

- Authoring: more indirection. Understanding Lyra requires opening her character file plus however many dialogue state files she references.
- Engine: two-step loading. More joins.
- AI generation: less cohesive — generating a character appearance requires generating both the StageAppearance object and the referenced DialogueState objects.

**Recommendation:** Option A — embedded dialogue. The file-size concern for Lyra's file is real but manageable. YAML files with 300–400 lines are well within normal tool capabilities. The authoring coherence advantage (all of Lyra in one place) directly supports the "author coherence" principle that drove the E3 authoring model choice. Option B adds indirection without a proportional benefit.

**The human decision this requires:**
> Do you accept embedded dialogue (Option A), where each character file contains all their dialogue inline, accepting that Lyra's cast file will be ~300–400 lines of content? Or do you prefer referenced dialogue (Option B) with separate dialogue state files, accepting greater authoring indirection?

**Long-term impact:**
This decision affects the cast file format definition in Milestone 03. If embedded, cast files have a known maximum size (bounded by the number of StageAppearances and DialogueStates, which are campaign-design-constrained). If referenced, the adapter layer in Milestone 03 must resolve dialogue state references when building the Campaign object.

---

## DEFER decisions

---

### D-CA-09 — Exact XP values for each quest, boss, and stage reward

**Status:** ⏳ DEFER to content authoring phase
**Risk level:** Low (content tuning, not architecture)

**Context:**
The Progression model (Phase 2.6) defines XP as the player's adventure currency — earned by completing quests, defeating bosses, exploring, and engaging with KnowledgeBeats. The exact XP values for each reward are content authoring decisions, not architectural decisions.

**Why deferred:** XP values require playtest data to calibrate. Setting them now (before any playable version exists) is premature design. The architectural decisions are complete: XP exists, rewards grant XP, ProgressionLevel thresholds are Campaign-authored, the two-track model (XP vs. ConceptMastery) is locked. The exact numbers are content.

**Owner for resolution:** Campaign content author, post-playtest (Milestone 06+). The content authoring guide (`ai-authoring-workflow-examples.md`) should include a section on XP calibration guidance when it is written.

---

### D-CA-10 — Whether currency (Restored Fragments) is included in v1

**Status:** ⏳ DEFER to content scope decision
**Risk level:** Low

**Context:**
Phase 2.6 described a campaign currency (Restored Fragments) for optional merchant interactions. The currency system is fully modelled — it adds no new architectural complexity. The question is whether it is included in the first playable version of Kubernetes Kingdom.

**Why deferred:** This is a scope decision, not an architecture decision. The content model supports currency. Whether to author a merchant NPC, define currency rewards, and include a trading system in v1 is a content and design prioritisation decision. It should be resolved when the Milestone 06 (Content Sprint 1) scope is defined.

---

### D-CA-11 — Consumable loss on death (Position B confirmed or reversed)

**Status:** ⏳ DEFER to combat system design
**Risk level:** Low

**Context:**
Phase 2.6 adopted Position B: consumables used before death are consumed; consumables held but unused are preserved. This is the correct direction but needs confirmation from the combat system design perspective.

**Why deferred:** The combat system (Milestone 04 territory) will define the full death loop. The consumable loss policy needs to be validated against the dungeon design: if consumables are used frequently in dungeon sequences (the primary usage context), and dungeon sequences have checkpoints, then consumables used before the last checkpoint may need different treatment. This cannot be finalised without the checkpoint and dungeon room design in hand.

---

### D-CA-12 — Maximum inventory size

**Status:** ⏳ DEFER to UX/UI design
**Risk level:** Low

**Context:**
Phase 2.6 left open whether the player's inventory is unlimited or has a soft cap. The vision ("not a power-accumulation fantasy") suggests unlimited inventory is safer, but the question should be resolved alongside the inventory UI design.

**Why deferred:** This is a UI/UX decision as much as an architecture decision. The inventory screen design (Milestone 05 territory) will determine whether a cap is meaningful or just adds friction. The content model supports both.

---

### D-CA-13 — Ability charge carry-over on dungeon floor transition

**Status:** ⏳ DEFER to combat system design
**Risk level:** Low

**Context:**
Phase 2.6 Rule A-1 states ability charge does not persist between encounters. The question is whether "encounters" means individual enemy fights (charge resets between each enemy) or dungeon room clears (charge resets between dungeon rooms, but persists across enemies in the same room).

**Why deferred:** This is a combat system balance question. It cannot be answered without knowing how many enemies appear in a dungeon room, how much charge a full room clear generates, and whether boss phases count as a single encounter or multiple. Milestone 04 (Combat System Design) resolves this.

---

### Progression level count and XP curve

**Status:** ⏳ DEFER to content authoring phase
**Risk level:** Low

**Context:**
Phase 2.6 uses ~14 progression levels as illustrative. The exact count and XP thresholds are content design decisions that require playtest calibration.

**Why deferred:** Same reason as D-CA-09. The architecture is complete. The numbers need playtesting.

---

## Decision summary table

| ID | Decision | Status | Risk |
|---|---|---|---|
| D-CA-01 | Act as a lightweight first-class entity | ✅ LOCK NOW | Low |
| D-CA-03 | Required beats: Campaign-level type configuration | ✅ LOCK NOW | Low |
| D-CA-04 | Embedded vs referenced NPC dialogue | 🔵 NEEDS HUMAN APPROVAL | Medium |
| D-CA-05 | CastMember as a separate type from NPC | ✅ LOCK NOW | Low |
| D-CA-06 | Challenge pool architecture (Embedded / Concept Pool / Campaign Pool) | 🔵 NEEDS HUMAN APPROVAL | High |
| D-CA-07 | KnowledgeBeat and Challenge are separate types | ✅ LOCK NOW | Low |
| D-CA-08 | Boss phases as sub-objects, not separate entities | ✅ LOCK NOW | Low |
| D-CA-09 | Exact XP values per reward | ⏳ DEFER | Low |
| D-CA-10 | Currency in v1 | ⏳ DEFER | Low |
| D-CA-11 | Consumable loss on death | ⏳ DEFER | Low |
| D-CA-12 | Maximum inventory size | ⏳ DEFER | Low |
| D-CA-13 | Ability charge carry-over on dungeon floor transition | ⏳ DEFER | Low |
| D-CA-14 | Max DialogueLine branch depth: 3 | ✅ LOCK NOW | Low |
| D-CA-15 | Three difficulty tiers, Campaign-level distribution config | ✅ LOCK NOW | Low |
| D-CA-16 | Challenge pool seeding: AI-authored, human-reviewed | ✅ LOCK NOW | Low |
| D-CA-17 | Authoring model: Hybrid E3 | ✅ LOCK NOW | Low |
| D-CA-18 | Campaign-scoped quests in quests/ subdirectory | ✅ LOCK NOW | Low |
| D-CA-19 | Platform-level Concepts in platform/concepts/ | ✅ LOCK NOW | Low |
| D-CA-20 | Optional stage registry in campaign.yaml | ✅ LOCK NOW | Low |
| — | ProgressionLevel count + XP curve | ⏳ DEFER | Low |

**Counts:** 12 LOCK NOW · 2 NEEDS HUMAN APPROVAL · 6 DEFER

---

## Milestone 03 readiness

The following decisions are blockers for Milestone 03 (Technical Architecture) to begin schema definitions. They are listed here so Phase 2.9 and Phase 2.10 can confirm readiness.

**Blocked until D-CA-06 is resolved (NEEDS HUMAN APPROVAL):**
- Enemy schema: `challenges` field (embedded vs. reference criteria vs. pool reference)
- BossPhase schema: same
- MiniChallenge schema: same
- Concept schema: presence/absence of `challengePool` array
- Campaign schema: presence/absence of `challengePool` array

**Unblocked regardless of D-CA-06:**
- Campaign schema: all non-challenge fields
- Act schema: fully unblocked (D-CA-01 locked)
- Stage schema: fully unblocked (D-CA-03 locked)
- Beat schema: fully unblocked (D-17 previously locked)
- CastMember schema: fully unblocked (D-CA-05, D-CA-04 recommendation stated)
- NPC schema: fully unblocked
- Quest schema: fully unblocked
- Boss schema: fully unblocked (D-CA-08 locked, challenge field pending D-CA-06)
- ProgressionLevel schema: fully unblocked
- Item and Ability schemas: fully unblocked

D-CA-04 (dialogue embedded vs. referenced) affects the cast file format but does not block any schema other than CastMember/NPC — and the recommendation is stated clearly enough that Milestone 03 can proceed with the embedded model pending confirmation.

---

## Cross-references

- `DECISIONS.md` — all LOCK NOW entries should be appended here
- `development/BACKLOG.md` — DEFER entries should be added here with their stated owners and milestone targets
- `content-architecture/ai-phase-02-04-knowledge-challenge-model.md` — D-CA-06 context
- `content-architecture/ai-content-authoring-architecture.md` — D-CA-17 context (E3 evaluation)
- `content-architecture/ai-phase-02-03-quest-npc-castmember-model.md` — D-CA-04, D-CA-05 context
- `content-architecture/ai-phase-02-02-campaign-act-stage-model.md` — D-CA-01, D-CA-03 context
- `content-architecture/ai-phase-02-05-enemy-boss-model.md` — D-CA-08 context
- `content-architecture/ai-phase-02-06-progression-reward-item-model.md` — D-CA-09 through D-CA-13 context
- `milestones/milestone-02-content-architecture/ai-phase-plan.md` — Phase 2.8 objectives this document fulfils
