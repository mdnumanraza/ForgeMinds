# Phase 5 — Expansion: Multi-World, Quest Branching, Achievements

> Prerequisites: Phase 4 complete.  
> Goal: dramatically expand content depth and player progression systems.

---

## Goals

- Multi-world hub with categorized world catalog
- Quest branching (player choices affect stage path)
- Achievement system with animated unlock notifications
- Mastery system (re-complete stages at higher difficulty for mastery stars)
- Daily quest system (login reward, daily challenge)
- World seasons (limited-time event worlds)

---

## Deliverables

| # | Deliverable |
|---|---|
| 1 | World catalog UI (filter by topic, difficulty, rating) |
| 2 | Quest branching engine in `LearningEngine.ts` |
| 3 | Achievement definitions + unlock triggers |
| 4 | Achievement notification component (animated overlay) |
| 5 | Mastery system (3-star per stage) |
| 6 | Daily quest endpoint + UI widget |
| 7 | Season system (world.json `seasonStart/seasonEnd` fields) |
| 8 | World rating + review system |
| 9 | Expanded player profile: achievement wall, mastery grid |

---

## Architecture Changes

### Quest Branching
```typescript
// knowledge.json quest node
{
  "id": "quest-3a",
  "type": "branching",
  "choices": [
    { "label": "Path A: Recursion", "nextStageId": "stage-4a" },
    { "label": "Path B: Iteration", "nextStageId": "stage-4b" }
  ]
}
```

`LearningEngine.ts` reads `nextStageId` from player's chosen path.  
Progress table stores `chosenPath` per stage completion.

### Achievement Engine
```typescript
interface Achievement {
  id: string
  trigger: AchievementTrigger   // 'stage_complete' | 'no_hints' | 'streak' | ...
  condition: Record<string, unknown>
  xpReward: number
  badge: string                 // sprite asset key
}
```

Trigger evaluation runs after every stage completion event.

### Mastery System
- Stage has 3 mastery tiers: bronze / silver / gold
- Each tier requires higher score threshold or fewer hints
- Mastery stars displayed on stage nodes on world map

---

## New Tables

- `achievements` — achievement definitions (seeded)
- `player_achievements` — player × achievement unlock timestamp
- `daily_quests` — rotated daily, with completion tracking
- `world_ratings` — 1-5 stars + optional text review

---

## Risks

| Risk | Mitigation |
|---|---|
| Branching graph complexity | Limit to 2-way branches in Phase 5; N-way in Phase 7+ |
| Achievement trigger performance | Evaluate triggers async, after stage save |
| Daily quest generation | Manual authored rotation for Phase 5; AI-generated in Phase 6 |

---

## Scalability Notes

- Achievement engine is data-driven — adding new achievements requires no code changes
- Quest branching is fully JSON-defined — no engine changes for new branch types
- Season system is config-only in world.json

---

## Migration Notes (to Phase 6)

- Phase 6 is pure optimization — no feature additions
- All Phase 5 systems become targets for caching and performance improvements
