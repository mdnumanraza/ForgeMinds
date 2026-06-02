# Testing Strategy

> Testing approach across unit, integration, and E2E layers.

---

## Philosophy

Test behavior, not implementation.  
Test the most critical paths with the highest confidence.  
Don't test internals — test what the user experiences.

---

## Test Stack

| Type | Tool | Location |
|---|---|---|
| Unit | Vitest | co-located with source (`*.test.ts`) |
| Integration | Vitest + real test DB | `tests/integration/` |
| E2E | Playwright | `tests/e2e/` |
| Component | Vitest + Testing Library | co-located |

---

## Unit Tests

### What to unit test
- `LearningEngine.ts` — state machine transitions
- `ChallengeEngine.ts` — scoring logic, hint counting
- `AdaptiveFlow.ts` — parameter computation from performance records
- `WorldLoader.ts` / `KnowledgeLoader.ts` — Zod validation (valid + invalid inputs)
- XP formula in `progression.ts`
- Utility functions in `src/lib/utils.ts`

### What NOT to unit test
- React components with no logic
- PixiJS scene classes (test via E2E instead)
- Drizzle queries (test via integration)

### Example
```typescript
// engine/learning/LearningEngine.test.ts
describe('LearningEngine', () => {
  it('should transition from STORY_INTRO to CONCEPT on confirmStory', () => {
    const engine = new LearningEngine()
    engine.startStage(mockStage)
    expect(engine.getPhase()).toBe('STORY_INTRO')
    engine.confirmStory()
    expect(engine.getPhase()).toBe('CONCEPT')
  })

  it('should award bonus XP when no hints used', () => {
    // ...
  })
})
```

---

## Integration Tests

Test API routes against a real test database (separate DB from development).

```typescript
// tests/integration/api.test.ts
describe('POST /api/progress', () => {
  it('should persist stage completion and update player XP', async () => {
    const response = await fetch('/api/progress', {
      method: 'POST',
      headers: { Cookie: testSessionCookie },
      body: JSON.stringify({ stageId: 'stage-1', worldId: 'world-1', score: 90, xpEarned: 150 })
    })
    const { data } = await response.json()
    expect(data.xpEarned).toBe(150)
    
    // Verify DB state
    const player = await db.query.players.findFirst(...)
    expect(player.xp).toBe(150)
  })
})
```

Integration test setup:
- `beforeAll`: run migrations on test DB, seed with test player
- `afterEach`: reset mutable tables
- `afterAll`: teardown test DB connection

---

## E2E Tests (Playwright)

Test the critical user journeys end-to-end in a real browser.

### Priority journeys

1. **Full stage flow**: land on world map → select stage → complete story → concept → quest → challenge → XP reward → boss → stage complete
2. **Auth flow**: register → verify email → login → see hub
3. **Hint flow**: fail challenge twice → hint appears → use hint → complete challenge
4. **Level up**: gain enough XP to level up → see level up overlay

```typescript
// tests/e2e/stage-flow.spec.ts
test('full stage flow', async ({ page }) => {
  await page.goto('/hub')
  await page.click('[data-testid="world-card-world-1"]')
  await page.click('[data-testid="stage-node-stage-1"]')
  await expect(page.locator('[data-testid="story-intro"]')).toBeVisible()
  await page.click('[data-testid="continue-btn"]')
  // ... through all phases
  await expect(page.locator('[data-testid="xp-reward"]')).toContainText('+150 XP')
})
```

---

## Test Data Strategy

- Test worlds use a separate content fixture (`tests/fixtures/world-test.json`)
- Test players seeded via `db/seed.ts` with known initial state
- AI calls mocked in all tests below E2E level
- No real AI calls in CI (use `MOCK_AI=true` env flag)

---

## CI Pipeline

```
push / PR →
  1. lint (ESLint + TypeScript)
  2. unit tests (Vitest)
  3. integration tests (Vitest + test DB)
  4. E2E tests (Playwright, headed in CI)
  5. build check (next build)
```

All steps must pass before merge to main.

---

## Coverage Goals

| Layer | Target Coverage |
|---|---|
| Engine modules | 80%+ branch coverage |
| API routes | 100% happy path + auth error |
| Content loaders | 100% schema validation cases |
| Stores | 70%+ (state mutations) |
| React components | Not targeted — use E2E instead |
