# AI System Design

> Architecture for the AI abstraction layer and integration points.

---

## Design Philosophy

AI is behind a clean adapter interface. The game engine never knows which AI provider is active. Swapping providers (Anthropic → OpenAI → local model) requires changing one file.

All AI calls are:
- Async
- Rate-limited per player
- Logged to `ai_interactions`
- Prompt-versioned

---

## AIAdapter Interface

```typescript
interface AIAdapter {
  // Phase 1
  generateHint(context: HintContext): Promise<string>
  
  // Phase 3
  evaluateAnswer(context: EvalContext): Promise<EvalResult>
  generateFeedback(context: FeedbackContext): Promise<string>
  
  // Phase 5
  generateQuestVariant(template: QuestTemplate): Promise<Quest>
}
```

---

## Contexts and Results

```typescript
interface HintContext {
  concept: string          // what is being taught
  challengeText: string    // the specific question
  playerAttempt?: string   // what they tried (optional)
  hintsAlreadyGiven: string[]
}

interface EvalContext {
  question: string
  expectedAnswer: string
  playerAnswer: string
  challengeType: 'mcq' | 'code-task' | 'fill-blank'
}

interface EvalResult {
  correct: boolean
  score: number            // 0-100
  explanation: string      // educational feedback
}

interface FeedbackContext {
  stageName: string
  conceptTitle: string
  performance: PerformanceRecord
}
```

---

## AnthropicProvider

```typescript
class AnthropicProvider implements AIAdapter {
  private client: Anthropic
  
  async generateHint(ctx: HintContext): Promise<string> {
    const prompt = buildHintPrompt(ctx)
    const response = await this.client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }]
    })
    return extractText(response)
  }
}
```

---

## Prompt System

Each prompt is a pure function — no side effects, fully testable.

```typescript
// hint.prompt.ts
export function buildHintPrompt(ctx: HintContext): string {
  return `
You are a wise RPG mentor helping a learner understand: "${ctx.concept}".

The challenge they face: "${ctx.challengeText}"
${ctx.playerAttempt ? `Their attempt: "${ctx.playerAttempt}"` : ''}

Give a short, encouraging hint (2-3 sentences max) that nudges them in the right direction without giving away the answer. 
Speak in a slightly mystical RPG tone.
`.trim()
}
```

### Prompt Versioning
Each prompt file exports a `PROMPT_VERSION` constant:
```typescript
export const PROMPT_VERSION = 'hint-v2'
```
Logged with every AI interaction for quality analysis.

---

## Rate Limiting

Per player, per session:
- 3 hints per challenge
- 10 AI calls per stage
- 50 AI calls per day

Enforced in `/api/ai/route.ts` using a Redis counter (Phase 2+) or in-memory counter (Phase 1).

---

## API Route

```typescript
// POST /api/ai
// Body: { type: 'hint', context: HintContext }
// Response: { data: { text: string } }

export async function POST(req: Request) {
  const body = AIRequestSchema.parse(await req.json())
  const session = await auth()
  
  const adapter = getAIAdapter()   // returns singleton provider
  
  switch (body.type) {
    case 'hint':
      const hint = await adapter.generateHint(body.context)
      await logInteraction({ playerId: session.user.id, ... })
      return json({ data: { text: hint } })
  }
}
```

---

## `getAIAdapter()` Factory

```typescript
// src/lib/ai.ts
let _adapter: AIAdapter | null = null

export function getAIAdapter(): AIAdapter {
  if (!_adapter) {
    _adapter = new AnthropicProvider(process.env.ANTHROPIC_API_KEY!)
  }
  return _adapter
}
```

To swap providers: change the constructor call in this one function.

---

## AI Interaction Log (DB)

```typescript
// ai_interactions table
{
  id: uuid
  player_id: uuid
  stage_id: string
  challenge_id: string
  type: 'hint' | 'evaluate' | 'feedback' | 'generate'
  prompt_version: string
  input_tokens: number
  output_tokens: number
  latency_ms: number
  created_at: timestamp
}
```

Used for: cost tracking, prompt quality analysis, future personalization.

---

## Future: AI-Generated Quests (Phase 5)

```typescript
const quest = await adapter.generateQuestVariant({
  concept: 'closures',
  difficulty: 'hard',
  previousAttempts: 3
})
```

Procedurally generated quest JSON is validated against `QuestSchema` before use.  
If validation fails: fall back to the static quest from `knowledge.json`.
