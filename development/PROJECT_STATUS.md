# PROJECT STATUS

> Last updated: Runtime synthesis complete. Vertical slice defined (Stage 2). MVP production plan written. Reality check done. **Recommendation: begin implementation.**

---

## Current State

| Property | Value |
|---|---|
| **Active milestone** | Milestone 03 — Technical Architecture (in progress) |
| **Current phase** | Runtime synthesis complete — Phase 3.4 or implementation start |
| **Recommendation** | ⚡ **BEGIN IMPLEMENTATION** — see `ai-project-reality-check.md` |
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
- ✅ Phase 3.3 — Content Loading Pipeline (D-27/D-28 locked)
- ✅ Runtime synthesis — `technical-architecture/` (4 documents: runtime architecture, vertical slice, MVP plan, reality check)
- ⬜ Phase 3.4–3.10 — can continue in parallel with implementation
- ⚡ **NEXT: Begin implementation — Phase 1 (First Playable)**

### Immediate next actions (two parallel tracks)
**Track A — Implementation (recommended to start now):**
1. Create `src/app/game/page.tsx` with `PhaserGame.tsx` mounted via `next/dynamic`
2. Create BootScene, PreloaderScene, StageRuntimeScene (empty shells)
3. Load Podveil Village tilemap placeholder, player sprite placeholder
4. Get character moving on screen

**Track B — Architecture (can continue in parallel):**
5. Phase 3.4 — State Management
6. Phase 3.5 — Save System
7. Phase 3.6–3.10 — remaining phases

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
