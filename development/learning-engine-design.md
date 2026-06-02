# Learning Engine Design

> Architecture for the stage flow orchestration and learning loop.  
> Phase 1.5 adds monster encounter evaluation, boss 75% threshold, discovery-gated boss entry, and per-campaign progress isolation.

---

## Responsibility

The Learning Engine:
- Manages the stage flow state machine (Phase 1 modal flow)
- Evaluates monster encounter MCQ battles
- Enforces boss arena entry conditions (discovery count check)
- Evaluates boss fight MCQ sequences (75% pass threshold)
- Handles boss fail redirect logic
- Calculates and awards XP per action (discovery, encounter win, stage complete)
- Triggers adaptive difficulty adjustments

It does NOT:
- Render any UI
- Touch Phaser.js directly
- Call the database directly

---

## Phase 1.5 Learning Events

```
Discovery collected → awardDiscoveryXP(discoveryId, campaignId)

Monster encounter →
  evaluateEncounterQuestion(challengeId, answer)
    ├── Correct → awardEncounterXP, signal battleWon
    └── Wrong → signal battleDamage (retry or flee)

Boss entry attempted →
  canEnterBossArena(stageId, campaignId)
    ├── TRUE  → enter, begin boss fight sequence
    └── FALSE → return hint: what to find before retrying

Boss fight →
  evaluateBossFight(questions[], answers[])
    score = correct / total
    ├── score >= 0.75 → bossPassed, markStageComplete
    └── score < 0.75  → bossFailed, return redirect hints
```

---

## Stage Flow State Machine (Phase 1 Modal Flow)

Still used when a campaign JSON does not include a tilemap (Phase 1 legacy flow).

```
IDLE
  ↓ startStage()
STORY_INTRO → CONCEPT → QUEST → CHALLENGE → XP_REWARD → BOSS_FIGHT → COMPLETE
```

---

## BossEvaluator (Phase 1.5)

```typescript
interface BossFightResult {
  score: number          // 0.0 – 1.0
  passed: boolean        // score >= 0.75
  correctCount: number
  totalQuestions: number
  redirectHints: string[]   // populated only on fail
}

function evaluateBossFight(
  questions: ChallengeQuestion[],
  answers: string[]
): BossFightResult
```

### Pass Condition

```
score = correctAnswers / totalQuestions
passed = score >= 0.75
```

### Fail Redirect

On fail, the engine returns up to 3 redirect hints. These are generated from:
1. The specific questions the player got wrong (reference the concept key)
2. `knowledge.json bossObjective.completionCondition` as a hint template
3. Linked `discovery` items in the zone that cover those concepts

```typescript
function generateRedirectHints(
  wrongQuestions: ChallengeQuestion[],
  discoveries: DiscoveryDefinition[]
): string[]
// Returns: ["Seek the Scroll of Multi-Stage Builds in the Foundry Cavern",
//           "Talk to Ironhands about image layer optimization"]
```

---

## EncounterEvaluator (Phase 1.5)

```typescript
interface EncounterResult {
  correct: boolean
  xpReward: number
  coinReward: number
  explanation: string
}

function evaluateEncounterQuestion(
  challengeId: string,
  questionIndex: number,
  answer: string,
  campaign: Campaign
): EncounterResult
```

Encounter questions are sourced from `challenge.variants.easy` for standard enemies, `medium` for mini-bosses.

---

## BossEntryGuard (Phase 1.5)

```typescript
interface BossEntryCheck {
  canEnter: boolean
  missingDiscoveries: string[]    // IDs of required discoveries not yet collected
  hintMessage: string
}

function canEnterBossArena(
  stageId: string,
  campaignId: string,
  progressStore: ProgressStore
): BossEntryCheck
```

Required discoveries for a stage = `knowledgeStage.bossObjective.requiredDiscoveries[]` (optional field; if empty, no gate).

---

## ChallengeEngine (Phase 1 + 1.5)

Manages the formal challenge phase (Phase 1 modal flow) AND encounter challenges.

```typescript
class ChallengeEngine {
  start(challenge: Challenge, variant: 'easy' | 'medium' | 'hard'): ChallengeSession
  submit(session: ChallengeSession, questionIndex: number, answer: string): AnswerResult
  getScore(): number   // 0-100
  hintsRemaining(): number
}
```

---

## AdaptiveFlow

```typescript
interface AdaptationParams {
  hintDelayMs: number
  challengeDifficulty: 'easy' | 'medium' | 'hard'
  xpMultiplier: number
}

class AdaptiveFlow {
  compute(history: PerformanceRecord[]): AdaptationParams
}
```

Phase 1.5: discovery count and encounter win rate factor into adaptive difficulty.  
If player is winning all encounters → serve `medium` variant.  
If player is losing encounters frequently → serve `easy` variant + show more hints.

---

## XP Formula (Phase 1.5)

```
Discovery XP:    discovery.xpReward (from knowledge.json discoveries[])
Encounter XP:    enemy.xpReward (from world.json enemies[])
Stage complete:  stage.xpReward × adaptiveMultiplier + noHintBonus(25)
Boss complete:   stage.xpReward × 1.5

All XP is campaign-scoped:
  progressStore.awardXP(campaignId, amount)
```

---

## Integration with Stores

All progress mutations are campaign-scoped:

```typescript
// On discovery collected:
progressStore.markDiscoveryCollected(campaignId, discoveryId)
progressStore.awardXP(campaignId, discovery.xpReward)
progressStore.awardCoins(campaignId, discovery.coinReward)

// On encounter won:
progressStore.markEnemyDefeated(campaignId, enemyId)
progressStore.awardXP(campaignId, enemy.xpReward)

// On boss passed:
progressStore.markStageComplete(campaignId, stageId)
progressStore.awardXP(campaignId, stage.xpReward * 1.5)

// On boss failed:
// No progress marked — player tries again
progressStore.recordBossAttempt(campaignId, stageId)  // for analytics only
```

