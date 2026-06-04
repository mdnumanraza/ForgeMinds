# PROJECT STATUS

> Last updated: Milestone 04 (Vertical Slice) planning complete. **Next action: T-01 — Phaser mounts in Next.js.**

---

## Current State

| Property | Value |
|---|---|
| **Active milestone** | Milestone 04 — Vertical Slice (planning complete) |
| **Current phase** | Phase A — First Playable World |
| **Next action** | ⚡ **T-01: Phaser mounts in Next.js** — start coding |
| **Campaign design** | ✅ CLOSED |
| **Milestone 02** | ✅ FULLY CLOSED (2026-06-04) |
| **Next action** | Begin Milestone 03 Phase 3.1 |

---

## ✅ Milestone 02 fully closed — all decisions locked

| ID | Decision | Locked |
|---|---|---|
| D-18 | Challenge Pool: **Option B — Concept Pool** | 2026-06-04 |
| D-19 | Authoring Format: **YAML** | 2026-06-04 |

See `DECISIONS.md` for complete decision record (D-01 through D-19).

---

## Milestone 03 — Technical Architecture

**Status:** Active. Planning phase.

**Objective:** Translate the content architecture (Milestone 02) into concrete technical decisions — engine selection, rendering pipeline, content loading, state management, save system design, validation pipeline.

**Primary inputs from Milestone 02:**
- Beat-centric hierarchy (D-17): Campaign → Act → Stage → Beat → Payload
- E3 authoring model (D-CA-AUTH): YAML files in `campaigns/name/` + `cast/` + `stages/`
- Challenge Pool B (D-18): Concept-level pools, referenced by enemies/bosses
- All 19 locked decisions in `DECISIONS.md`

**Milestone 03 planning doc:** `milestones/milestone-03-design-decisions/ai-overview.md`

---

## What's Done

### Campaign Design (CLOSED)
- ✅ Game vision, gameplay loop, Kubernetes Kingdom campaign (14 stages)
- ✅ Campaign review, stabilisation pass, marketing story (4 act narrative files)

### Milestone 01 — Game Discovery (Partial)
- ✅ Phase 1.1 — Vision document (`game-design/ai-vision.md`)
- ⬜ Phases 1.2–1.7 — deferred (not blocking Milestone 03)

### Milestone 02 — Content Architecture (✅ FULLY CLOSED 2026-06-04)
- ✅ All 14 phase documents complete
- ✅ Beat-centric architecture pivot (D-17)
- ✅ Visual Blueprint Viewer (live at `/tools/blueprints`)
- ✅ Content Authoring Architecture (E3 — YAML, D-CA-AUTH, D-19)
- ✅ Authoring Lifecycle, Theme Variant Architecture, Decision Lock Review
- ✅ Milestone Review and Closure
- ✅ D-18 (Challenge Pool B) and D-19 (YAML) — human approved

### Milestone 03 — Technical Architecture (🔄 ACTIVE)
- ✅ Planning: `ai-overview.md` — 10 phases, success criteria, 7 open questions, risks
- ✅ Planning: `ai-phase-plan.md` — phase-by-phase detail, critical decisions, validation checklists
- ✅ Phase 3.1 — Technology Evaluation locked (D-20/D-20A/D-21/D-22 Hybrid/D-23)
- ✅ Phase 3.2 — Engine Architecture (D-24A/B/C + D-25/D-26 locked)
### Milestone 04 — Vertical Slice (🔄 ACTIVE — READY TO CODE)
- ✅ Planning: `ai-overview.md`, `ai-implementation-plan.md`, `ai-task-breakdown.md` (34 tasks)
- ✅ Planning: `ai-definition-of-done.md`, `ai-risk-register.md`, `ai-development-order.md`
- ⚡ **Phase A — First Playable World (START HERE)**
  - T-01: Phaser mounts in Next.js ← **NEXT**
  - T-02: BootScene + PreloaderScene
  - T-03: StageRuntimeScene skeleton
  - T-04: Player movement + camera
  - T-05: Podveil Village tilemap
  - T-06: Tilemap collision
- ⬜ Phase B — First Interaction
- ⬜ Phase C — First Knowledge Loop
- ⬜ Phase D — First Combat Loop
- ⬜ Phase E — First Boss Loop
- ⬜ Phase F — First Complete Stage

---

## Decisions Locked (Milestone 02)

| ID | Decision |
|---|---|
| D-17 | Beat is first-class L2 entity. Stage owns `Beat[]`. |
| D-CA-01 | Act is a lightweight first-class entity |
| D-CA-03 | Required beats declared at Campaign level |
| D-CA-05 | CastMember is a separate type from local NPC |
| D-CA-07 | KnowledgeBeat ≠ Challenge (separate types) |
| D-CA-08 | BossPhase is a sub-object within Boss |
| D-CA-AUTH | Hybrid E3 authoring (Campaign Skeleton + Cast files + Stage files) |
| D-CA-TV-1/2/3 | Theme rules: invariant core inviolable; arcs invariant; ThemeOverride additive only |
| D-CA-LC-1/2 | AI content must pass human REVIEW gate; lifecycle floors enforced downward |

## Decisions Pending Human Approval

| ID | Decision | Recommendation |
|---|---|---|
| D-CA-06 | Challenge Pool (Embedded / Concept Pool / Campaign Pool) | **Option B — Concept Pool** |
| — | Authoring Format (YAML / JSON / DSL) | **YAML** |

## Decisions Deferred

| Decision | Deferred to |
|---|---|
| Challenge difficulty configuration | Milestone 10 |
| DialogueLine branch depth | Milestone 08 |
| Campaign-scoped quest placement | Milestone 09 |
| Platform Concept definition tooling | Milestone 03 |
| Expandable stage registry | Milestone 04 |

---

## Milestone Progress

| # | Milestone | Status |
|---|---|---|
| 01 | Game Discovery | 🔄 Partial (Phase 1.1 done; 1.2–1.7 deferred) |
| **02** | **Content Architecture** | **✅ FULLY CLOSED (2026-06-04)** |
| **03** | **Technical Architecture** | **🔄 ACTIVE — planning phase** |
| 04–15 | Remaining milestones | ⬜ Not started |
