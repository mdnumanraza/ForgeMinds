# ForgeMinds Blueprint Viewer — Architecture

> **Purpose:** Technical architecture document for the Visual Blueprint Viewer (`/tools/blueprints`).
> **Status:** v1 — Phase 1 (read-only visualisation) complete.
> **Route:** `/tools/blueprints`
> **Stack:** Next.js 15 · React 19 · @xyflow/react 12 · Tailwind CSS 4

---

## What it is

A read-only visual viewer for ForgeMinds campaign content. Turns the Beat-centric content model into an interactive graph that content authors can navigate, review, and use to spot structural problems — without reading documentation.

It is **not** an editor. No persistence, no backend, no authoring. It is the visual surface of the content architecture.

---

## File structure

```
src/
├── app/tools/blueprints/page.tsx    ← Next.js route (/tools/blueprints)
└── blueprint/
    ├── BlueprintViewer.tsx          ← Root component; manages view state
    ├── data/
    │   ├── types.ts                 ← Campaign/Act/Stage/Beat/Payload types
    │   ├── mock-campaign.ts         ← Kubernetes Kingdom mock (Stages 1–2)
    │   └── adapter.ts               ← Campaign model → React Flow nodes/edges
    ├── nodes/
    │   ├── BeatNode.tsx             ← Beat node (all 12 types, colour-coded)
    │   ├── CampaignNode.tsx         ← Campaign overview node
    │   ├── ActNode.tsx              ← Act overview node
    │   ├── StageNode.tsx            ← Stage overview node (shows warning count)
    │   └── StageWarningsNode.tsx    ← Stage-level warning display
    ├── panels/
    │   └── BeatDetailPanel.tsx      ← Right-side panel on beat click
    ├── validation/
    │   └── rules.ts                 ← 7 validation rules; returns ValidationWarning[]
    └── views/
        ├── CampaignView.tsx         ← Campaign → Acts → Stages flow graph
        └── StageView.tsx            ← Stage → Beat sequence flow graph
```

---

## Data flow

```
mock-campaign.ts
     ↓  (Campaign model)
BlueprintViewer.tsx
     ↓  (passes Campaign to view)
CampaignView / StageView
     ↓  (calls adapter.ts)
adapter.ts  +  validation/rules.ts
     ↓  (React Flow nodes + edges + warnings)
@xyflow/react ReactFlow
     ↓  (renders)
Node components (BeatNode, StageNode, etc.)
     ↓  (user clicks beat)
BeatDetailPanel.tsx
```

The adapter is the only place that knows about React Flow. Everything else works with `Campaign` model types.

---

## Beat type colour map

| Beat type | Colour |
|---|---|
| ARRIVAL | Slate |
| EXPLORATION | Emerald |
| KNOWLEDGE | Blue |
| QUEST | Violet |
| ENCOUNTER | Red |
| NPC_INTERACTION | Teal |
| MINI_CHALLENGE | Orange |
| DUNGEON | Dark Red |
| BOSS | Rose/Crimson |
| CUTSCENE | Gray |
| CHECKPOINT | Yellow |
| PORTAL | Indigo |

---

## Validation rules (7)

| Rule ID | Check | Severity |
|---|---|---|
| EMPTY_STAGE | Stage has no beats | error |
| MISSING_ARRIVAL | No ARRIVAL beat | warning |
| MISSING_KNOWLEDGE | No KNOWLEDGE beat | error |
| ENCOUNTER_BEFORE_KNOWLEDGE | ENCOUNTER before first KNOWLEDGE | warning |
| MISSING_BOSS | No BOSS beat | warning |
| PORTAL_WITHOUT_BOSS | PORTAL exists but no BOSS | warning |
| BOSS_CONCEPT_NOT_INTRODUCED | Boss requires concept not in any KNOWLEDGE beat | warning |

Warnings surface in three places:
- Stage nodes in Campaign View (shows count + colour-coded border)
- Beat nodes in Stage View (inline warning chips)
- StageWarningsNode (floating warning card for stage-level issues)

Adding a new rule: add a function to `validation/rules.ts` and append it to `ALL_RULES`. No other changes required.

---

## Extension points (future editor readiness)

| Location | Extension point |
|---|---|
| `BlueprintViewer.tsx` | `// FUTURE: onEdit, onExport, onImport, aiGenerateStage` props |
| `adapter.ts` | `// FUTURE: drag-and-drop positions` — position overrides can be passed in |
| `validation/rules.ts` | `ALL_RULES` array — append new rules without touching existing ones |
| `data/types.ts` | Types mirror content architecture exactly — schema changes propagate here first |
| `data/mock-campaign.ts` | Swap for a real data fetcher (API call, file load) without touching any other file |

Replacing mock data with real data: change `page.tsx` to fetch a `Campaign` object from any source and pass it to `<BlueprintViewer campaign={...} />`. The viewer is data-agnostic.

---

## Future editor roadmap

When ForgeMinds is ready to build a real content editor, the progression is:

1. **Phase 2 — Multi-campaign support:** `page.tsx` accepts a campaign ID param; adapter loads from a real data layer.
2. **Phase 3 — Drag & drop layout persistence:** `adapter.ts` accepts saved node positions; positions are stored separately from content.
3. **Phase 4 — Inline editing:** `BeatNode.tsx` gains an edit mode; edits are dispatched to a content store (Zustand already installed).
4. **Phase 5 — AI generation:** A "Generate Stage" button calls an AI API that returns a `Beat[]` sequence. The Beat model is the natural AI output format.
5. **Phase 6 — Export/Import:** Campaign model is serialised to YAML/JSON and vice versa. Types are already defined; only the serialiser needs writing.
6. **Phase 7 — Validation rules UI:** Rules can be toggled per-campaign. `ALL_RULES` becomes a registry with metadata.

---

## Cross-references

- `content-architecture/ai-beat-model.md` — canonical Beat entity definition this viewer implements
- `content-architecture/ai-phase-02-02-campaign-act-stage-model.md` — Campaign/Act/Stage models
- `game-design/ai-campaign-structure.md` — the source of the mock data
