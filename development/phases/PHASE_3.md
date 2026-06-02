# Phase 3 — AI Compatibility Layer

> Prerequisites: Phase 2 complete.  
> Goal: wire the AI adapter as an optional, isolated layer — off by default, engine runs identically without it.

---

## Goals

- Implement the `AIAdapter` interface that was architecturally reserved since Phase 1
- Deliver hint generation only — narrow, well-defined, easy to audit
- Keep AI entirely optional: feature-flagged, off by default, no engine logic depends on it
- Ship template generation API: AI produces valid JSON pairs users can load directly
- Log AI interactions for future personalization (Phase 5)
- Enforce rate limits and cost controls from day one

---

## What Is NOT In Phase 3

The following AI features are deferred and must not be built in Phase 3:

- `evaluateAnswer()` — AI scoring of free-text or code answers → Phase 5
- `generateFeedback()` — post-challenge narrative feedback → Phase 5
- Adaptive difficulty via AI — adjusting challenge variants dynamically → Phase 5
- Streaming AI responses — SSE / Vercel AI SDK streaming → Phase 5
- A/B prompt testing framework → Phase 5

---

## Deliverables

| # | Deliverable | Notes |
|---|---|---|
| 1 | `AIAdapter` interface implemented | `generateHint()` only; provider: Anthropic Claude |
| 2 | `ENABLE_AI_HINTS` feature flag | Env var, default `false`; engine is identical when unset |
| 3 | "Get AI Hint" button | Shown in challenge phase only when `ENABLE_AI_HINTS=true` |
| 4 | Hint rate limiting | 3 hints per challenge, 10 hints per player per day |
| 5 | `ai_interactions` table | Logs every hint request for cost tracking + future personalization |
| 6 | Template generation API | `POST /api/ai/generate-template` → returns World + Knowledge JSON pair |
| 7 | "Generate with AI" entry point in Campaign Loader | Button opens template generation form; output pre-populates loader |

---

## Architecture: AI Adapter

The `AIAdapter` interface was defined in Phase 1 as a reserved slot. Phase 3 wires the first real implementation.

```typescript
// engine/ai/AIAdapter.ts
interface AIAdapter {
  generateHint(context: HintContext): Promise<string>
  // generateQuestVariant() — Phase 5
  // evaluateAnswer()      — Phase 5
  // generateFeedback()    — Phase 5
}

interface HintContext {
  campaignTopic: string
  stageName: string
  challengePrompt: string
  playerAttempt: string
}
```

### Feature Flag Isolation

```typescript
// lib/ai.ts
export function getAIAdapter(): AIAdapter | null {
  if (process.env.ENABLE_AI_HINTS !== 'true') return null
  return new AnthropicAdapter()
}
```

All call sites check for `null` before invoking — the engine never assumes AI is available:

```typescript
const ai = getAIAdapter()
if (ai) {
  const hint = await ai.generateHint(context)
}
```

### Provider File

```
engine/ai/
├── AIAdapter.ts          ← interface + null factory
├── AnthropicAdapter.ts   ← Anthropic Claude implementation
└── prompts/
    └── hint.prompt.ts    ← buildHintPrompt(ctx: HintContext): string
```

---

## Hint Generation

### API Route

```
POST /api/ai/hint
Body: { campaignId, stageId, challengeId, playerAttempt }
Response: { hint: string }
```

- Route checks `ENABLE_AI_HINTS` — returns `403` if not enabled
- Rate limit enforced before calling Claude: 3 per challenge, 10 per day per player
- Context assembled from the loaded campaign's knowledge.json (topic, stage concept, challenge prompt)
- Claude called via `AnthropicAdapter.generateHint()` with a focused, constrained prompt
- Hint is returned as plain text — no markdown, no spoilers, Socratic style by default

### Rate Limiting

- Tracked in `ai_interactions` table — count queries per `(player_id, challenge_id, day)`
- HTTP 429 returned when limit exceeded with a clear message shown in UI
- Limits are configurable via env vars (`AI_HINTS_PER_CHALLENGE`, `AI_HINTS_PER_DAY`)

---

## Template Generation API

```
POST /api/ai/generate-template
Body: { topic: string, difficulty: "beginner" | "intermediate" | "advanced", stageCount?: number }
Response: { world: WorldJSON, knowledge: KnowledgeJSON }
```

- Claude generates a complete `world.json` + `knowledge.json` pair for the given topic
- Output is validated through `SchemaValidator.ts` before returning to client
- If validation fails: generation is retried once; if it fails again, `500` is returned with a toast in UI
- On success: client pre-populates the Campaign Loader fields with the generated JSON
- User must review and click "Load Campaign" — AI output is never auto-executed
- Logged to `ai_interactions` with `type: 'template_generation'`

### "Generate with AI" Entry Point

- New button in Campaign Loader: "Generate with AI"
- Opens a small form: topic input + difficulty selector + optional stage count
- Submits to `/api/ai/generate-template` with loading state
- On success: JSON fields populated, validation runs, user reviews before loading
- Shown only when `ENABLE_AI_HINTS=true` — otherwise hidden entirely

---

## AI Interaction Logging

Table: `ai_interactions`

```
id            uuid PK
player_id     → players.id
campaign_id   → campaigns.id (nullable)
stage_id      string (nullable)
challenge_id  string (nullable)
type          enum: hint | template_generation
model         string (e.g. "claude-sonnet-4-5")
prompt_hash   string (for deduplication)
input_tokens  integer
output_tokens integer
response_ms   integer
created_at    timestamptz
```

Used for:
- Cost tracking per player and per campaign
- Audit trail for AI output quality
- Personalization data for Phase 5

---

## Risks

| Risk | Mitigation |
|---|---|
| API cost overrun | Hard rate limits per player per day; cost tracked in `ai_interactions`; alert on daily threshold |
| AI-generated JSON fails schema validation | Retry once; show "generation failed" toast; user falls back to manual paste |
| Latency on hint calls | Non-blocking UI — hint button shows spinner, challenge remains interactive |
| Engine accidentally depends on AI | `getAIAdapter()` returns `null` by default; all call sites guard with `if (ai)` |
| PII in hint prompts | Only campaign topic + challenge text passed to Claude — no player names or personal data |

---

## Scalability Notes

- Provider abstraction means Claude → GPT-4 → local LLM is a single file swap in `AnthropicAdapter.ts`
- Feature flag allows staged rollout: enable for beta users only before full release
- `ai_interactions` table powers Phase 5 personalization without schema changes
- Template generation API reused by Phase 4 visual editor's "AI assist" feature

---

## Migration Notes (to Phase 4)

- AI routes remain unchanged in Phase 4
- Visual world editor (Phase 4) calls `POST /api/ai/generate-template` for "AI assist" content generation
- No DB schema changes required for Phase 4
- `evaluateAnswer()` and `generateFeedback()` added to `AIAdapter` interface in Phase 5
