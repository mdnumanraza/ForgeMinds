# PROJECT STATUS

> **Read this + README.md to understand the full project in under 5 minutes.**
> Last updated: Milestone 02 Phase 2.1 (Content Hierarchy) complete. Phase 2.2 is next.

---

## Current State

| Property | Value |
|---|---|
| **Active milestone** | Milestone 02 — Content Architecture |
| **Current phase** | Phase 2.2 — Campaign + Stage Model (NEXT) |
| **Campaign design** | ✅ CLOSED |
| **Blocking item** | Human review of Milestone 02 planning before Phase 2.1 execution begins |
| **Next action** | Review `milestones/milestone-02-content-architecture/ai-overview.md` + `ai-phase-plan.md`, then approve Phase 2.1 |

---

## What's Done

### Campaign design (CLOSED)
- ✅ Working style and collaboration rules (`working-style.md`)
- ✅ Master roadmap — 15 milestones (`milestones/ai-master-roadmap.md`)
- ✅ Game Vision v1 (`game-design/ai-vision.md`)
- ✅ Gameplay loop v1 (`game-design/ai-gameplay-loop.md`)
- ✅ Kubernetes Kingdom campaign — 14 stages + 3 expandable (`game-design/ai-campaign-structure.md`)
- ✅ Act Transition document (`game-design/ai-act-transition.md`)
- ✅ Campaign review — 20 issues, 7 resolved, 12 deferred (`game-design/ai-kubernetes-campaign-review.md`)
- ✅ Campaign review resolution — stabilisation pass (`game-design/ai-campaign-review-resolution.md`)
- ✅ Marketing story — 4 narrative files (`story/`)
- ✅ Documentation refactor — ~107 → ~55 files

### Milestone 01 — Game Discovery (partial, not blocking)
- ✅ Phase 1.1 — Vision document
- ⬜ Phases 1.2–1.7 — deferred, not blocking M02

### Milestone 02 — Content Architecture (active)
- ✅ Planning: `ai-overview.md` — purpose, goals, success criteria, phases, risks, dependencies
- ✅ Planning: `ai-phase-plan.md` — 10 phases with objectives, inputs, deliverables, critical decisions
- ✅ Planning: `ai-content-entity-inventory.md` — 40 entity types across 12 groups
- ✅ Phase 2.1 — Content Hierarchy (`content-architecture/ai-phase-02-01-content-hierarchy.md`)
- ⬜ Phase 2.2 — Campaign + Stage Model (NEXT)
- ⬜ Phase 2.3 — Quest + NPC Model
- ⬜ Phases 2.4–2.6 — Knowledge/Challenge, Enemy/Boss, Progression/Reward models (parallel)
- ⬜ Phase 2.7 — Theme Variant Design
- ⬜ Phase 2.8 — Critical Decisions Review (requires human input on 4 decisions)
- ⬜ Phase 2.9 — Validation Pass
- ⬜ Phase 2.10 — Human Review

---

## Next Actions

### Immediate
1. **Human:** Review Milestone 02 planning documents:
   - `milestones/milestone-02-content-architecture/ai-overview.md`
   - `milestones/milestone-02-content-architecture/ai-phase-plan.md`
   - `milestones/milestone-02-content-architecture/ai-content-entity-inventory.md`
2. **Human:** Confirm 4 decisions that need human input before Phase 2.8 (can answer now or during execution):
   - Authoring format: YAML / JSON / Custom DSL
   - Single-file vs split-file content organisation
   - Embedded vs referenced NPC dialogue (D-CA-04)
   - Challenge pool architecture (D-CA-06): embedded / per-concept pool / global tagged pool
3. **AI (on approval):** Execute Phase 2.1 — Content Hierarchy

### Upcoming
- Phases 2.2 and 2.3 (sequential after 2.1)
- Phases 2.4, 2.5, 2.6 in parallel after 2.3
- Phase 2.8 requires human input on the 4 decisions above

---

## Open Blockers

| Blocker | Owner | Priority |
|---|---|---|
| Milestone 02 planning review and approval | Human | High — blocks Phase 2.1 |
| Authoring format decision | Human | High — needed before Phase 2.8 |
| Challenge pool architecture decision | Human + AI | High — needed before Phase 2.8 |
| Vision document sign-off (M01) | Human | Low — not blocking M02 |

---

## Human Tasks

| Task | File | Status |
|---|---|---|
| Review M02 planning and approve | `milestones/milestone-02-content-architecture/` | Pending |
| Decide authoring format | Discussion → `DECISIONS.md` | Needed for M02 Phase 2.8 |
| Decide challenge pool architecture | Discussion → `DECISIONS.md` | Needed for M02 Phase 2.8 |
| Review and sign off on Game Vision | `milestones/milestone-01-game-discovery/you-vision-review.md` | Pending (not blocking) |
| Asset collection — Fantasy + Space themes | `assets/*/you-asset-collection-tracker.md` | Not started (M05) |

---

## Critical Architecture Decisions Queued (Phase 2.8)

| ID | Decision | Current recommendation | Human input needed? |
|---|---|---|---|
| D-CA-01 | Does "Act" exist as a data entity? | Yes — lightweight entity with id, label, stageRefs | No |
| D-CA-02 | How are K8s concepts referenced in stages? | `concepts: ConceptID[]` with primaryConceptIndex | No |
| D-CA-03 | Required vs optional beats in 9-beat arc | Named optional slots with campaign-level requiredBeats[] | No |
| D-CA-04 | Embedded vs referenced NPC dialogue | Two options — needs human input | **Yes** |
| D-CA-05 | Recurring cast as type or flag | Separate CastMember type | No |
| D-CA-06 | Challenge pool architecture | Three options — needs human input | **Yes** |
| D-CA-07 | KnowledgeBeat vs Challenge — same or different? | Separate types | No |
| D-CA-08 | Boss phases as sub-objects or entities | Sub-objects | No |
| — | Authoring format (YAML/JSON/DSL) | No recommendation yet | **Yes** |
| — | Single-file vs split-file content | No recommendation yet | **Yes** |

---

## Milestone Progress

| # | Milestone | Status |
|---|---|---|
| 01 | Game Discovery | 🔄 Partial (Phase 1.1 done; 1.2–1.7 deferred) |
| **02** | **Content Architecture** | **🔄 Planning done — executing** |
| 03 | Design Decisions | ⬜ Not started |
| 04–15 | Remaining milestones | ⬜ Not started |

---

## Campaign Design Status: CLOSED

All campaign-level decisions are locked. No further campaign work expected before Content Architecture completion.
