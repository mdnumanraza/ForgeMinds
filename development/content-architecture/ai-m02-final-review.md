# Milestone 02 — Final Review

> **Purpose:** Complete audit of Milestone 02 (Content Architecture) before closure. Reviews consistency, completeness, architectural conflicts, scalability, and readiness for Milestone 03.
> **Status:** v1 — post-Phase 2.8 review.
> **Owned by:** AI

---

## Scope of review

Milestone 02 produced the following canonical documents:

| Phase | Document | Status |
|---|---|---|
| 2.1 | Content Hierarchy | ✅ Complete (v2 — Beat-centric) |
| 2.2 | Campaign + Act + Stage Model | ✅ Complete (v2 — Beat-centric) |
| 2.3 | Quest + NPC + CastMember + Dialogue | ✅ Complete |
| 2.4 | Knowledge + Challenge Model | ✅ Complete |
| 2.5 | Enemy + Boss Model | ✅ Complete |
| 2.6 | Progression + Reward + Item Model | ✅ Complete |
| Beat Model | Canonical Beat definition | ✅ Complete |
| Beat Investigation | Architecture spike | ✅ Complete |
| 2.6.5 | Content Authoring Architecture | ✅ Complete (E3 recommended) |
| 2.6.6 | Authoring Lifecycle | ✅ Complete |
| 2.7 | Theme Variant Architecture | ✅ Complete |
| 2.8 | Decision Lock Review | ✅ Complete |
| Blueprint Viewer | Prototype implementation | ✅ Complete (verified) |
| Entity Inventory | 40 entity types | ✅ Complete |

---

## Critical issues

### CRITICAL-01 — D-CA-06 (Challenge Pool Architecture) is unresolved

**What it is:** The single most consequential unresolved decision in Milestone 02. Whether Challenges are embedded in their user entities (Option A), pooled per Concept (Option B), or pooled per Campaign (Option C) shapes the Milestone 03 schema design for Enemy, BossPhase, MiniChallenge, and Concept.

**Why it is critical:** Milestone 03 cannot design the Concept schema, the Enemy schema, or the Boss schema without knowing how Challenges are owned. Starting Milestone 03 with D-CA-06 unresolved risks building schemas that must be redesigned when the decision is made.

**Who can resolve it:** Human approval required. Phase 2.8 recommends Option B (Concept Pool) with detailed reasoning.

**Blocking:** Milestone 03 schema work on Concept, Enemy, BossPhase, MiniChallenge.

---

### CRITICAL-02 — Authoring format (YAML vs JSON) is unresolved

**What it is:** The E3 authoring architecture (Hybrid E3) defines the file organisation but not the storage format. Phase 2.8 recommends YAML with detailed reasoning, but this requires human confirmation.

**Why it is critical:** The authoring format determines the practical day-to-day experience for content authors. It also shapes validation tooling, AI generation prompts, and the file-to-Campaign adapter in the Blueprint Viewer. Starting Milestone 03 without this decision means the adapter has no format to target.

**Who can resolve it:** Human approval required. Phase 2.8 recommends YAML.

**Blocking:** Milestone 03 adapter design; content authoring tooling.

**Note:** These two are the only Critical issues. Both require human input, not AI analysis. The architecture is otherwise sound.

---

## Significant issues

### SIGNIFICANT-01 — Content entity inventory is not fully reconciled with Beat-centric model

The entity inventory (`ai-content-entity-inventory.md`) was written before the Beat-centric pivot (D-17). It classifies many entities as "L2 — Stage" that are now L3 (Beat payload). The inventory is accurate in listing entity types and their attributes, but its scope-level column is out of date.

**Impact:** Medium. Any future session reading the inventory without cross-checking `ai-beat-model.md` will get incorrect level classifications.

**Proposed fix:** Update the inventory's scope level column to reflect L2 = Beat, L3 = Payload. This is a documentation update, not an architectural change. Can be done at the start of Milestone 03 as a housekeeping task.

---

### SIGNIFICANT-02 — Campaign-scoped quest placement is underspecified

Phase 2.6.5 identifies campaign-scoped quests (like Mira's arc) as living in `campaign.yaml` or a `quests/` subdirectory. Phase 2.8 defers this to the content authoring phase. But Phase 2.3 defines the quest model without specifying where multi-stage quests live in the E3 file structure.

**Impact:** Medium. A content author creating Mira's arc today would have no clear guidance.

**Proposed fix:** Record the decision in the authoring architecture doc and Phase 2.8 as: campaign-scoped quests live in `campaign.yaml` inline (for ≤5 quests) or `campaigns/name/quests/` subdirectory (for campaigns with more). Simple threshold rule. Can be locked without human input.

---

### SIGNIFICANT-03 — Blueprint Viewer types are not yet sourced from canonical architecture docs

The Blueprint Viewer's `types.ts` was written during Phase 2.11 (the implementation sprint) and defines types that closely mirror the architecture but were not formally reconciled against the final Phase 2.7 and 2.8 decisions. Specifically:

- `types.ts` does not yet have a `themeOverrides` field on Beat payloads (Phase 2.7 requirement)
- `types.ts` does not yet include a `lifecycleState` field (Phase 2.6.6 requirement)
- `types.ts` does not yet support campaign-scoped quests

**Impact:** Low for the current Blueprint Viewer prototype (it uses mock data). High if Milestone 03 builds the real adapter against the current `types.ts` without reconciling.

**Proposed fix:** At the start of Milestone 03, formally reconcile `types.ts` with the final architecture. This is expected work, not a defect.

---

## Minor issues

### MINOR-01 — Phase 2.6.6 lifecycle states are slightly misaligned with Phase 2.2 Stage lifecycle

Phase 2.2 defines Stage lifecycle as `DRAFT → CONTENT_COMPLETE → VALIDATED → PUBLISHED`. Phase 2.6.6 defines entity lifecycle as `DRAFT → REVIEW → APPROVED → PLAYABLE → DEPRECATED`. These are compatible but use different vocabulary.

**Resolution:** Phase 2.6.6 is the canonical lifecycle model. Phase 2.2's Stage lifecycle (`CONTENT_COMPLETE`, `VALIDATED`, `PUBLISHED`) maps to Phase 2.6.6's (`REVIEW`, `APPROVED`, `PLAYABLE`) respectively. A cross-reference note in Phase 2.2 resolves the apparent conflict. Minor doc update.

---

### MINOR-02 — StageWarningsNode in Blueprint Viewer uses non-canonical beat type "stageWarnings"

The Blueprint Viewer registers a node type `stageWarnings` which is a UI concern, not a Beat type. This is correct — it is purely a display element — but the node type registration alongside Beat types could confuse a future engineer who reads the code.

**Resolution:** Add a code comment clarifying it is a UI-only node, not a Beat type. One-line fix.

---

### MINOR-03 — "Act" field in Phase 2.2 Stage lifecycle says "Stage does not know which Act it belongs to"

This is architecturally correct (the Act owns Stages, not vice versa), but the Phase 2.2 text could be clearer: in E3 authoring, a stage file knows its Act implicitly (it lives in a campaign whose `campaign.yaml` maps it to an Act). The stage file itself has no Act reference field, but the system can derive it.

**Resolution:** A clarifying sentence in Phase 2.2. Minor doc update.

---

## Future risks

### RISK-01 — Cast files grow large (Medium risk)

Lyra's cast file will contain 14–15 StageAppearances, each with 3–5 DialogueStates, each with multiple DialogueLines, plus ThemeOverrides for each. This file will be several hundred lines. Without tooling, editing it becomes unwieldy.

**Mitigation:** The Blueprint Viewer's future Cast Editor mode will provide a structured interface. The file format remains the source of truth; the editor is a view into it. Risk is managed by tooling, not by architecture change.

---

### RISK-02 — D-CA-06 Option B (Concept Pool) requires a new Platform-level authoring concept (Low-Medium risk)

If Option B is chosen, the Platform layer gains a new first-class authoring concern: maintaining ChallengePool files per Concept. This is good architecture but requires a clear answer to "who authors platform-level Concepts and their challenge pools?" before implementation.

**Mitigation:** Phase 2.8 addresses this (D-CA-16: AI-authored, human-reviewed, minimum 15 challenges per Concept). Risk is known and managed.

---

### RISK-03 — Theme authoring is the highest-volume content work (Low risk, known)

The Kubernetes Galaxy transformation requires ~800 ThemeOverride field values. This is understood and expected — it is the cost of having a theme system. The risk is that this work is underestimated and themes become a bottleneck.

**Mitigation:** Theme authoring is deferred to Milestone 14 (Theme Engine). By then, AI-assisted authoring tools will be available. Risk is long-dated.

---

### RISK-04 — Blueprint Viewer mock data and real data diverge (Low risk)

As the architecture evolves in Milestone 03+, the TypeScript mock in `mock-campaign.ts` may drift from the real content model.

**Mitigation:** The mock should be replaced with a real data adapter early in Milestone 06 (Core Engine). Until then, the mock is explicitly a prototype and not a source of truth. Risk is managed by documentation.

---

## Consistency audit

### Hierarchy consistency ✅

The hierarchy Campaign → Act → Stage → Beat → Payload → Atomic is consistent across:
- Phase 2.1 (scope levels diagram)
- Phase 2.2 (Stage model)
- Beat Model doc
- Blueprint Viewer types
- Phase 2.7 (ThemeOverride placement)
- Phase 2.6.6 (lifecycle floors)

No contradictions found.

### Ownership consistency ✅

Ownership rules from Phase 2.1 are consistent with:
- Phase 2.3 (CastMember at Campaign L1, NPC at Beat-payload L3)
- Phase 2.5 (ActBoss at Act L1, Stage Boss at Beat-payload L3)
- E3 authoring architecture (files map to ownership levels)

One apparent inconsistency noted (MINOR-01 above) is vocabulary, not structure.

### Validation rule consistency ✅

Validation rules from Phase 2.1 (ordering rules BO-1 through BO-7) are consistent with Phase 2.2 (Stage lifecycle VALIDATED state) and Phase 2.6.6 (REVIEW state validation requirements).

The seven existing Blueprint Viewer validation rules are a subset of the full rule set — they will be extended in Milestone 03.

### AI generation compatibility ✅

The E3 authoring model (Phase 2.6.5), the Beat sequence structure (Beat Model), and the lifecycle model (Phase 2.6.6) are all consistent with AI generation workflows. AI generates bounded, coherent outputs that map directly to files. Human review is required at the REVIEW → APPROVED gate.

### Blueprint Viewer compatibility ✅

The Blueprint Viewer prototype successfully renders the Campaign model from `types.ts`. All three views (Campaign, Stage, Beat sequence) work correctly. The architecture docs map cleanly to the viewer's data contract.

The two gaps (ThemeOverride fields, lifecycle state fields in types.ts) are expected and documented (SIGNIFICANT-03).

---

## Architecture score

| Dimension | Score | Notes |
|---|---|---|
| Internal consistency | 9/10 | One vocabulary mismatch (MINOR-01); no structural contradictions |
| Future scalability | 9/10 | E3 scales linearly; Beat model scales to any campaign size |
| AI generation compatibility | 10/10 | Stage-as-file with Beat sequence is AI-native format |
| Blueprint Viewer compatibility | 9/10 | Direct fit; types.ts reconciliation needed at M03 start |
| Future editor compatibility | 9/10 | E3 + Beat model = optimal editor foundation |
| Validation capability | 8/10 | Strong stage-level rules; cross-stage rules need Milestone 03 implementation |
| Content author experience | 8/10 | Stage file is coherent; cast file may need tooling at scale |
| Platform scalability (multi-campaign) | 10/10 | E3 adds one directory per campaign; zero coupling |

**Overall: Strong. No architectural redesign required. Two critical decisions (D-CA-06 and authoring format) require human input before Milestone 03 begins.**

---

## Cross-references

- `content-architecture/ai-m02-decision-lock-review.md` — decision status for all open decisions
- `content-architecture/ai-beat-model.md` — canonical Beat definition
- `milestones/milestone-02-content-architecture/ai-milestone-closure.md` — closure document
