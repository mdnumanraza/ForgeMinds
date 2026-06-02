# Phase 4 — Content Authoring Tools

> Prerequisites: Phase 3 complete.  
> Goal: enable non-developer content creation — world editor, quest builder, knowledge editor.

---

## Goals

- Build an in-app content authoring system for creators
- Visual world map editor (drag-and-drop stage node placement)
- Quest and knowledge content editor with live preview
- AI-assisted content generation (generate quest from topic input)
- Content validation pipeline (Zod schema + human review)
- Preview mode: play a draft world before publishing

---

## Deliverables

| # | Deliverable |
|---|---|
| 1 | Creator portal route (`/creator`) with auth guard |
| 2 | World editor — visual stage node placement on canvas |
| 3 | Stage content editor — story, concept, quest, challenge forms |
| 4 | AI-assisted generation: topic → draft knowledge.json |
| 5 | Content validation UI — shows schema errors inline |
| 6 | Draft/published status per world |
| 7 | Preview mode — play unpublished world as guest |
| 8 | Content export: download world.json + knowledge.json |
| 9 | Creator profile + submission queue |

---

## Architecture

### New Route Group
```
src/app/(creator)/
├── layout.tsx        ← creator shell with sidebar
├── page.tsx          ← dashboard: my worlds
├── world/new/page.tsx
├── world/[worldId]/
│   ├── editor/page.tsx           ← visual map editor (PixiJS canvas)
│   ├── knowledge/page.tsx        ← learning content editor
│   └── stage/[stageId]/
│       └── editor/page.tsx       ← per-stage quest/challenge editor
└── preview/[worldId]/page.tsx
```

### World Editor (JSON ↔ Visual)
- PixiJS canvas reused for drag-and-drop stage node placement
- Node `position.x / position.y` updated in real-time as user drags
- Draw connection arrow between nodes → sets `unlockCondition: { type: 'stage_complete', stageId }`
- Right panel: structured form fields mapping to every `world.json` field (no raw JSON editing)
- Asset picker for `spriteKey`, `backgroundKey`, `musicKey`
- Exports to valid `world.json` via `WorldSchema` serializer
- Live Zod validation — form errors shown inline per field

### Learning Content Editor
- Stage accordion list — expand each stage to edit concept, quests, challenge
- Concept chunk editor: rich text (markdown) + code block components
- Quest editor: type selector (mcq | code-task | fill-blank) + field forms
- Challenge variant editor: separate easy / medium / hard question sets
- XP reward calculator: sliders auto-compute based on estimated completion time
- All saves run through `KnowledgeSchema.safeParse()` — errors shown before save

### AI Content Generation Flow
```
Creator inputs topic + difficulty + world theme
  → POST /api/ai/generate-content { topic, difficulty, worldTheme, targetStageId }
  → Claude generates draft knowledge.json stage JSON
  → KnowledgeStageSchema validates the output
  → If valid: populate editor forms with generated content
  → If invalid: log failure, show "AI generation failed — try again" toast
  → Creator reviews every field before saving (never auto-save AI output)
  → Validated + saved to DB as draft
```

### Content Source Switch (Phase 4 activation)
In `engine/content/ContentResolver.ts`, `CONTENT_SOURCE=database` env flag activates `DatabaseContentSource`.  
Static content remains the fallback for built-in worlds.

---

## Content States

```
draft → review → published → archived
```

- `draft` — creator editing, not visible to players
- `review` — submitted, pending admin approval
- `published` — live for players
- `archived` — hidden from new players, existing progress preserved

---

## Risks

| Risk | Mitigation |
|---|---|
| AI-generated content quality | Mandatory human review before publish |
| Schema drift between editor and player | Single Zod schema shared by both |
| Creator abuse (spam worlds) | Rate limit + review queue |

---

## Scalability Notes

- Creator system is a separate route group with its own layout — zero impact on game routes
- DB content states allow N worlds without game engine changes
- Export/import enables future marketplace (Phase 8)

---

## Migration Notes (to Phase 5)

- Published worlds automatically appear in player World Select after Phase 5 multi-world expansion
- No API changes needed
