# API Design

> REST API specification for ForgeMinds backend (Next.js Route Handlers).

---

## Conventions

- All endpoints under `/api/`
- JSON request and response bodies
- Response envelope: `{ data: T } | { error: string, code: string }`
- Authentication: session cookie (Better Auth)
- Validation: Zod on all inputs
- HTTP status codes: 200, 201, 400, 401, 403, 404, 500

---

## Authentication

```
POST /api/auth/sign-in        ← Better Auth
POST /api/auth/sign-up
POST /api/auth/sign-out
GET  /api/auth/session
POST /api/auth/oauth/google
```

Managed by Better Auth handler at `app/api/auth/[...all]/route.ts`.

---

## Campaigns

Campaigns are the primary domain. A campaign is a validated combination of a user-supplied (or template) `world.json` and `knowledge.json`, persisted and ready to play.

```
POST /api/campaigns
Body: { worldJson: object, knowledgeJson: object, name: string }
```
Validates both JSONs with Zod (same schemas used by the Campaign Engine). On success: saves to `campaigns` table as JSONB columns. Returns the new campaign.  
Response: `{ data: { campaignId: string, name: string, stageCount: number } }`

```
GET  /api/campaigns
```
Returns the authenticated player's saved campaigns, ordered by `last_played_at` descending.  
Response: `{ data: Campaign[] }` where each item includes `id`, `name`, `lastPlayed`, `completionPercent`, `stageCount`.

```
GET  /api/campaigns/:campaignId
```
Returns full campaign config (world + knowledge JSON) plus the player's current progress for it.  
Response: `{ data: { campaign: CampaignConfig, progress: CampaignProgress } }`

```
DELETE /api/campaigns/:campaignId
```
Soft-deletes the campaign record. Player progress is preserved (cascade not triggered; `deleted_at` set on campaigns row only).  
Response: `{ data: { deleted: true } }`

```
GET  /api/campaigns/templates
```
Returns the list of starter templates from `TemplateRegistry` (name, topic, difficulty, preview image).  
**Public — no auth required.**  
Response: `{ data: CampaignTemplate[] }`

```
GET  /api/campaigns/templates/:templateId
```
Returns the full `world.json` + `knowledge.json` for a specific template. Use this to prefill the Campaign Loader UI before submitting.  
**Public — no auth required.**  
Response: `{ data: { worldJson: object, knowledgeJson: object } }`

---

## JSON Validation

```
POST /api/validate
Body: { type: 'world' | 'knowledge', json: object }
```
Runs Zod validation against the appropriate schema and returns either a success confirmation or a structured list of field-level errors.  
**Public — no auth required.** Used by the frontend validator UI before the user submits a campaign.  
Response on success: `{ data: { valid: true } }`  
Response on error: `{ data: null, error: 'VALIDATION_ERROR', details: ZodFlatError }`

---

## Player

```
GET  /api/player
```
Returns the current player's profile (XP, level, avatar, streak).  
Response: `{ data: PlayerProfile }`

```
PATCH /api/player
Body: { username?: string, avatarKey?: string }
```
Updates player profile.

---

## Progress

```
GET  /api/progress
Query: ?campaignId=<uuid>
```
Returns all stage progress for the specified campaign.  
Response: `{ data: StageProgress[] }`

```
POST /api/progress
Body: {
  stageId: string,
  campaignId: string,
  score: number,
  challengeAttempts: number,
  hintsUsed: number,
  timeMs: number,
  xpEarned: number
}
```
Records a stage completion. Upserts `stage_progress`, inserts `quest_completions`, updates player XP.  
Response: `{ data: { xpEarned: number, newLevel: number | null, levelUp: boolean } }`

---

## Quests

```
GET  /api/quests
Query: ?stageId=stage-1&campaignId=<uuid>
```
Returns quest completion history for a stage within a campaign.  
Response: `{ data: QuestCompletion[] }`

---

## AI (Phase 3+)

> **Phase 3+ only.** These endpoints are not active in Phase 1 or Phase 2. All AI routes require `ENABLE_AI_HINTS=true` in the environment. When the flag is false (the default), all `/api/ai` requests return `403 FORBIDDEN`.

```
POST /api/ai
Body: {
  type: 'hint' | 'evaluate' | 'feedback',
  context: HintContext | EvalContext | FeedbackContext
}
```
Proxies AI request through server-side adapter (API key is never exposed to the client).  
Response: `{ data: { text: string } }` or `{ data: EvalResult }`

Rate limited: 3 hints per challenge, 50 calls per player per day.

---

## Error Codes

| Code | Meaning |
|---|---|
| `UNAUTHORIZED` | No valid session |
| `FORBIDDEN` | Session exists but lacks permission |
| `NOT_FOUND` | Resource doesn't exist |
| `VALIDATION_ERROR` | Request body failed Zod validation |
| `INVALID_JSON_SCHEMA` | User-supplied JSON failed campaign schema validation; `details` contains `ZodFlatError` with field-level errors |
| `RATE_LIMITED` | Too many AI requests |
| `AI_ERROR` | Upstream AI provider error |

---

## Request/Response Types (Zod)

```typescript
// src/types/api.types.ts

export const CampaignPostSchema = z.object({
  name: z.string().min(1).max(100),
  worldJson: z.record(z.unknown()),      // deep-validated by CampaignEngine schemas
  knowledgeJson: z.record(z.unknown()),  // deep-validated by CampaignEngine schemas
})

export const ValidatePostSchema = z.object({
  type: z.enum(['world', 'knowledge']),
  json: z.record(z.unknown()),
})

export const ProgressPostSchema = z.object({
  stageId: z.string(),
  campaignId: z.string().uuid(),
  score: z.number().min(0).max(100),
  challengeAttempts: z.number().min(1),
  hintsUsed: z.number().min(0),
  timeMs: z.number().min(0),
  xpEarned: z.number().min(0)
})

export const AIRequestSchema = z.object({
  type: z.enum(['hint', 'evaluate', 'feedback']),
  context: z.record(z.unknown())   // typed per handler
})
```

---

## Phase 2+ Routes (not in Phase 1)

```
GET  /api/leaderboard           ← global XP ranking
GET  /api/achievements          ← player's unlocked achievements
POST /api/achievements/check    ← trigger achievement evaluation
```

---

## Service Layer Pattern

Route handlers are thin. Business logic lives in `src/lib/services/`:

```typescript
// app/api/campaigns/route.ts
export async function POST(req: Request) {
  const session = await requireAuth()
  const body = CampaignPostSchema.parse(await req.json())
  const result = await campaignService.createCampaign(session.user.id, body)
  return json({ data: result }, { status: 201 })
}

// lib/services/campaign.service.ts
export async function createCampaign(
  userId: string,
  input: CampaignPostInput
): Promise<CreateCampaignResult> {
  // Zod-validate world + knowledge JSON via CampaignEngine schemas
  // Persist to campaigns table
  // Return campaignId, name, stageCount
}
```

```typescript
// app/api/progress/route.ts
export async function POST(req: Request) {
  const session = await requireAuth()
  const body = ProgressPostSchema.parse(await req.json())
  const result = await progressService.completeStage(session.user.id, body)
  return json({ data: result })
}

// lib/services/progress.service.ts
export async function completeStage(
  userId: string,
  input: ProgressPostInput
): Promise<StageCompletionResult> {
  // DB operations, XP calculation, level-up check
}
```
