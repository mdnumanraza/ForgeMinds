# ForgeMinds — Development

> **New to this project? Read this file + `PROJECT_STATUS.md`. That's all you need to be oriented.**

---

## What is ForgeMinds?

ForgeMinds is a **story-driven RPG learning platform**. Players learn real technical skills — Kubernetes, Linux, Docker — by playing an adventure game, not by taking a course. The first game is **Kubernetes Kingdom**: a retro JRPG where a summoned hero restores a wounded kingdom by understanding how it works.

The core principle: **knowledge becomes gameplay**. Kubernetes concepts are the wounds in the world. Learning them is how the player heals it.

---

## Current Project State

**Phase:** Game design complete. Documentation structured. Ready for architecture and implementation planning.

**What exists:**
- ✅ Game vision, gameplay loop, and full campaign design (14 stages)
- ✅ Campaign review with prioritised issues
- ✅ Marketing narrative (4-act story)
- ✅ 15-milestone production roadmap

**What's next:** See `PROJECT_STATUS.md`

---

## Where to Start Reading

| If you want to... | Read... |
|---|---|
| Understand the project quickly | This file + `PROJECT_STATUS.md` |
| Understand what we're building | `game-design/ai-vision.md` |
| Understand the gameplay | `game-design/ai-gameplay-loop.md` |
| Understand the full campaign | `game-design/ai-campaign-structure.md` |
| Understand what's been decided | `DECISIONS.md` |
| Understand what needs doing | `PROJECT_STATUS.md` |
| Read the story (non-technical) | `story/` |
| Understand how we collaborate | `working-style.md` |

---

## Folder Structure

```
development/
│
├── PROJECT_STATUS.md        ← START HERE: current state, next actions, blockers
├── CHANGELOG.md             ← Major decisions and changes log
├── DECISIONS.md             ← All locked design decisions (ADR-style)
├── BACKLOG.md               ← Deferred work and future ideas
├── working-style.md         ← Collaboration rules (mandatory reading)
│
├── game-design/             ← CANONICAL GAME DESIGN DOCUMENTS
│   ├── ai-vision.md             ← Highest-priority doc. All decisions cite this.
│   ├── ai-gameplay-loop.md      ← Three-scale loop design
│   ├── ai-campaign-structure.md ← Full Kubernetes Kingdom campaign (14 stages)
│   ├── ai-act-transition.md     ← Character arc map across acts
│   ├── ai-kubernetes-campaign-review.md  ← Post-design review (20 issues)
│   └── [system stubs]           ← Boss, dialogue, enemy, quest, etc. — fill per milestone
│
├── milestones/              ← MILESTONE EXECUTION
│   ├── ai-master-roadmap.md     ← 15-milestone executive summary
│   ├── milestone-01-game-discovery/  ← Active milestone (phase files inside)
│   └── milestones-02-to-15.md   ← Stubs for unopened milestones
│
├── story/                   ← MARKETING NARRATIVE (no technical terms)
│   ├── act-1-the-hollow-kingdom.md
│   ├── act-2-the-long-restoration.md
│   ├── act-3-the-deep-kingdom.md
│   └── final-the-reckoning.md
│
├── content-architecture/    ← CONTENT SCHEMAS (fill in Milestone 04)
├── assets/                  ← ASSET STRATEGY (fill in Milestone 05)
│   ├── fantasy/
│   └── space/
│
├── discovery/               ← OPEN DESIGN TENSIONS
│   └── open-tensions.md         ← 3 tensions: 1 resolved, 1 partial, 1 open
│
└── prompts/                 ← PLANNING PROMPTS (archive)
    ├── prompt1.md through prompt4.md
```

---

## Current Milestone

**Milestone 03 — Technical Architecture** · Runtime synthesis complete · ⚡ Implementation recommended.

**Vertical slice target:** Stage 2 — Podveil Village (Pods concept, ~2–4 weeks to playable).
**Build plan:** `milestones/milestone-03-technical-architecture/technical-architecture/ai-mvp-production-plan.md`
**Reality check:** `milestones/milestone-03-technical-architecture/technical-architecture/ai-project-reality-check.md`

## Next steps

**Two parallel tracks:**
1. **Implementation** — Phase 1 (First Playable): Phaser + React canvas, player movement
2. **Architecture** — Phases 3.4–3.10 can continue alongside implementation

---

## Canonical Documents

These are the load-bearing documents. Every other file is either a stub, a review, or a working log.

| Document | What it is | Priority |
|---|---|---|
| `game-design/ai-vision.md` | Game vision — all decisions cite this | 🔴 Highest |
| `game-design/ai-campaign-structure.md` | Full campaign design | 🔴 Highest |
| `game-design/ai-gameplay-loop.md` | Three-scale gameplay loop | 🟠 High |
| `milestones/ai-master-roadmap.md` | 15-milestone plan | 🟠 High |
| `DECISIONS.md` | All locked decisions | 🟠 High |
| `PROJECT_STATUS.md` | Current state + next actions | 🟡 Always current |
| `milestones/milestone-02-content-architecture/ai-overview.md` | M02 goals, phases, dependencies | 🟡 Active milestone |
| `content-architecture/ai-beat-model.md` | Canonical Beat entity definition (L2 in hierarchy) | 🟡 Active milestone |

---

## Ownership

| Owner | Responsibility |
|---|---|
| **AI** | All `ai-*.md` files — design docs, stubs, reviews, roadmap |
| **Human** | All `you-*.md` files — reviews, approvals, asset collection, playtesting |
| **Both** | `PROJECT_STATUS.md`, `DECISIONS.md`, `BACKLOG.md`, `CHANGELOG.md` |

`working-style.md` defines the full collaboration contract.

---

## Current Milestone

**Milestone 01 — Game Discovery**
Phase 1.1 complete. Phases 1.2–1.7 pending. Human sign-off on vision document required.

Detail: `milestones/milestone-01-game-discovery/ai-overview.md`

## Next Milestone

**Milestone 02 — Architecture Discovery**
Not started. Opens when Milestone 01 exit criteria are met.

Detail: `milestones/milestones-02-to-15.md`

---

## File Naming

- `ai-*.md` — created and maintained by AI
- `you-*.md` — requires human action (review, decision, collection, playtesting)
- `ALL_CAPS.md` — project control files (always kept current)

---

## Conventions

- **One topic per file.** If a file covers two things, split it.
- **Update docs in the same change as the content they describe.** Stale docs are worse than no docs.
- **Decisions are recorded in `DECISIONS.md`.** Not in prose, not in passing comments.
- **`PROJECT_STATUS.md` is always current.** Update it at the end of every working session.
