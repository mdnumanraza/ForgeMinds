# Progression System

> Design for XP, levels, unlocks, and player advancement.  
> Phase 1.5 introduces **per-campaign isolation** — every campaign has completely independent XP, level, coins, and inventory.

---

## Overview

The progression system is the core dopamine loop. Every action has a reward.  
Players feel progress at three timescales:
- **Micro**: XP earned per discovery collected, encounter won, question answered
- **Meso**: Stage completion, level up, new zone unlocked
- **Macro**: Campaign completion, achievement unlocked

### Per-Campaign Isolation (Phase 1.5)

Each campaign has completely independent progression. A player's Linux campaign level never affects their Docker campaign level.

```
Linux Campaign:       Level 7, 1,240 XP, 85 coins
Docker Campaign:      Level 2, 145 XP, 30 coins
Kubernetes Campaign:  Level 11, 3,890 XP, 240 coins
```

This is intentional: learning Docker from scratch should feel like starting a new adventure, not inheriting power from another topic.

---

## XP System

### Earning XP (Phase 1.5)

| Action | XP |
|---|---|
| Discovery collected (scroll/shrine/chest) | Defined in `knowledge.json discoveries[].xpReward` |
| Monster encounter won | Defined in `world.json enemies[].xpReward` |
| Stage completion (base) | Defined in `knowledge.json stages[].xpReward` |
| No hints used bonus | +25 XP |
| First-attempt bonus | +15 XP |
| Speed bonus (< 3 min stage) | +10 XP |
| Boss fight completion | ×1.5 multiplier on stage XP |
| Daily first action | +50 XP |

All XP is scoped to the active campaign:
```typescript
progressStore.awardXP(campaignId, amount)
```

### XP Formula
```
stageFinalXP = baseXP × adaptiveMultiplier + bonusXP
adaptiveMultiplier ∈ [1.0, 1.5]  (set by AdaptiveFlow)
```

### Level Thresholds
```typescript
const LEVEL_XP_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  450,    // Level 4
  700,    // Level 5
  1000,   // Level 6
  1400,   // Level 7
  1900,   // Level 8
  2500,   // Level 9
  3200,   // Level 10
  // ... continues with ~100-200 XP increments per level
]
```

Growth is intentionally front-loaded — early levels are fast to encourage retention.

---

## Coin System (Phase 1.5)

Coins are the secondary currency. Separate from XP, also campaign-scoped.

| Action | Coins |
|---|---|
| Discovery collected | Defined in `knowledge.json discoveries[].coinReward` |
| Monster encounter won | 5–15 coins (based on enemy difficulty) |
| Boss defeated | 50–100 coins |

Coins are used in Phase 4+ for cosmetics, hint purchases, and world editor unlocks.  
In Phase 1.5: just tracked for future use, displayed in HUD.

---

## Per-Campaign Progress Store

```typescript
interface CampaignProgress {
  campaignId: string
  level: number
  xp: number
  xpToNextLevel: number
  coins: number
  completedStages: string[]
  defeatedEnemies: string[]
  collectedDiscoveries: string[]
  unlockedZones: string[]
  bossAttempts: Record<string, number>    // stageId → attempt count
  lastPlayedAt: number
}

// localStorage key: fm:progress:${campaignId}
```

### Store API

```typescript
interface ProgressStore {
  campaigns: Record<string, CampaignProgress>
  activeCampaignId: string | null

  // Getters
  getProgress(campaignId: string): CampaignProgress
  getCompletionPercent(campaignId: string, totalStages: number): number

  // Setters (all campaign-scoped)
  setActiveCampaign(campaignId: string): void
  awardXP(campaignId: string, amount: number): { leveledUp: boolean; newLevel: number }
  awardCoins(campaignId: string, amount: number): void
  markDiscoveryCollected(campaignId: string, discoveryId: string): void
  markEnemyDefeated(campaignId: string, enemyId: string): void
  markStageComplete(campaignId: string, stageId: string): void
  unlockZone(campaignId: string, zoneId: string): void
  recordBossAttempt(campaignId: string, stageId: string): void
}
```

---

## Level Up

When `progress.xp >= LEVEL_XP_THRESHOLDS[progress.level]`:
1. `progressStore.awardXP(campaignId, amount)` detects threshold cross, increments level
2. Returns `{ leveledUp: true, newLevel: N }`
3. EventBus emits `xpAwarded` with `newLevel` populated
4. React HUD shows level-up overlay (full-screen flash, level number animation)
5. Level is always per-campaign — "You reached Level 4 in the Docker Campaign"

---

## Stage Unlock Chain (Phase 1.5)

In tile-based worlds, zones/dungeons unlock when their prerequisite stage is complete:

```
Overworld (always accessible)
  ├── Zone A (unlocks when stage-images complete)
  ├── Zone B (unlocks when zone-a-boss defeated)
  └── Final Dungeon (unlocks when all stages complete)
```

Defined in `world.json zones[].unlockCondition` (same pattern as stage unlock conditions).

---

## Boss Progression

Bosses do NOT block progression permanently — they redirect to exploration.

```
Boss attempt → score < 75% →
  → player cannot re-enter for 60 seconds
  → dialogue hint pointing to specific missing discoveries
  → player can explore, collect, level up, then retry

Boss attempt → score >= 75% →
  → stage marked complete
  → celebration sequence
  → next zone/dungeon gate opens on overworld
```

Boss attempts are counted (for analytics/future achievements) but never penalised.

---

## Mastery System (Phase 5)

Each stage has 3 mastery tiers earned by replaying at higher difficulty:
- ⭐ Bronze — complete with any score
- ⭐⭐ Silver — score ≥ 80, ≤ 1 hint
- ⭐⭐⭐ Gold — score = 100, no hints, under 3 minutes

Mastery stars visible on zone entrances in the world.

---

## Visual Feedback Design

All progression events must have satisfying visual feedback:

| Event | Visual |
|---|---|
| Discovery collected | Item floats up with glow, XP number rises |
| Monster defeated | Enemy defeat animation, coin burst, XP floats |
| Correct answer (battle) | Green pulse, XP float |
| Incorrect answer (battle) | Red shake, HP damage visual |
| Stage complete | Zone entrance glows gold |
| XP reward | XP bar fills with animated segment, number counts up |
| Level up | Full-screen flash, cinematic level number reveal (campaign-named) |
| Boss pass | Boss collapse animation, screen flash, fanfare |
| Boss fail | Screen shake, player ejected, locked gate closes |
| Coin earned | Coin icon bounces in HUD |

---

## Anti-Frustration Design

- Bosses never permanently block — always redirect with helpful hints
- No XP loss for wrong answers — only bonus XP missed
- Discoveries are findable in any order — no rigid path
- Hints available on request in battle (with minor hint penalty to XP bonus)
- 60-second boss cooldown after fail (not punishment, anti-spam protection)
- Campaign can be retried from scratch without losing other campaign progress
