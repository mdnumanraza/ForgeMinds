# Content System

> Production-grade architecture for dynamic, content-driven world creation.

---

## Philosophy

**The application must never hardcode worlds or learning flows.**

Content is data, not code. Every world, stage, quest, challenge, NPC, boss, and progression path is defined in JSON, validated by strict schemas, and consumed by a generic engine that renders any valid configuration into a playable learning campaign.

This system is the foundation for:
- internal world authoring
- creator ecosystem
- AI-generated worlds
- procedural content generation
- future no-code world editor
- marketplace distribution

---

## 1. JSON Architecture Design

Each learning campaign consists of exactly **two JSON configuration files**:

```
src/content/worlds/{world-id}/
├── world.json       ← GAME EXPERIENCE layer
└── knowledge.json   ← LEARNING EXPERIENCE layer
```

These files are fully independent and combined at runtime by the Content Engine.  
The engine does not know about specific worlds — it only knows the schema contracts.

### Separation of Concerns

| File | Owns | Does NOT own |
|---|---|---|
| `world.json` | Visual theme, biome, atmosphere, NPCs, enemies, boss identity, map structure, soundtrack mood, environmental effects | Learning topics, quests, MCQs, XP values |
| `knowledge.json` | Concepts, quests, challenges, XP rewards, prerequisites, adaptive metadata | Visual presentation, sprite keys, NPC identities, map positions |

This separation means:
- The same `knowledge.json` can be applied to a different world theme
- The same `world.json` can host different knowledge tracks
- AI can generate one without knowledge of the other

---

## 2. Schema Structure

### `world.json` — Full Schema

```json
{
  "$schema": "forgeMinds/world/v1",
  "id": "world-1-javascript-basics",
  "name": "The JavaScript Realm",
  "description": "Master the ancient runes of JavaScript",
  "version": "1.0.0",
  "theme": {
    "biome": "neon-cyber",
    "atmosphere": "dark-city",
    "backgroundKey": "bg-javascript-realm",
    "ambientKey": "ambient-cyber",
    "musicKey": "theme-cyber",
    "colorPalette": ["#0a0a1a", "#f5c842", "#4fc3f7"],
    "environmentEffects": ["rain", "neon-glow", "floating-particles"],
    "difficultyProfile": "beginner"
  },
  "map": {
    "layout": "linear",
    "width": 1200,
    "height": 800,
    "connectionStyle": "path",
    "startPosition": { "x": 100, "y": 400 }
  },
  "stages": [
    {
      "id": "stage-1",
      "name": "The Variable Caves",
      "position": { "x": 200, "y": 400 },
      "nodeIconKey": "node-cave",
      "backgroundKey": "bg-cave",
      "unlockCondition": { "type": "world_start" },
      "hidden": false,
      "optional": false,
      "boss": {
        "id": "boss-undefined",
        "name": "Lord Undefined",
        "spriteKey": "boss-undefined",
        "introText": "You dare invoke me without declaration?",
        "defeatText": "I... have been... defined.",
        "health": 100,
        "attackPattern": "type-error-rain"
      }
    },
    {
      "id": "stage-2",
      "name": "The Function Fortress",
      "position": { "x": 400, "y": 300 },
      "nodeIconKey": "node-fortress",
      "backgroundKey": "bg-fortress",
      "unlockCondition": { "type": "stage_complete", "stageId": "stage-1" },
      "hidden": false,
      "optional": false,
      "boss": {
        "id": "boss-callback",
        "name": "The Callback Wraith",
        "spriteKey": "boss-callback",
        "introText": "You will never escape my nesting.",
        "defeatText": "Promise... me... you'll use async/await...",
        "health": 150,
        "attackPattern": "callback-hell"
      }
    }
  ],
  "npcs": [
    {
      "id": "npc-sage",
      "name": "Sage Brendan",
      "spriteKey": "npc-sage",
      "position": { "x": 80, "y": 380 },
      "role": "mentor",
      "dialogTrigger": "world_enter",
      "dialogLines": [
        "Welcome, young coder. The JavaScript Realm awaits.",
        "Master variables first — they are the building blocks of all magic."
      ]
    }
  ],
  "enemies": [
    {
      "id": "enemy-bug",
      "name": "Syntax Gremlin",
      "spriteKey": "enemy-bug",
      "encounterStages": ["stage-1", "stage-2"],
      "behavior": "patrol"
    }
  ],
  "lore": {
    "worldOrigin": "Long before TypeScript civilized the lands, JavaScript ruled in glorious chaos...",
    "playerRole": "You are a Code Apprentice, sent to tame the wilds of dynamic typing.",
    "antagonist": "The Runtime Errors seek to corrupt every declaration."
  }
}
```

### `knowledge.json` — Full Schema

```json
{
  "$schema": "forgeMinds/knowledge/v1",
  "worldId": "world-1-javascript-basics",
  "version": "1.0.0",
  "topic": "JavaScript Fundamentals",
  "prerequisites": [],
  "estimatedHours": 3,
  "difficultyLevel": "beginner",
  "stages": [
    {
      "stageId": "stage-1",
      "estimatedMinutes": 12,
      "prerequisites": [],
      "storyIntro": {
        "title": "The Variable Caves",
        "text": "You descend into darkness. Shapes flicker — undefined forms waiting to be named.",
        "speakerNpcId": "npc-sage"
      },
      "concept": {
        "title": "Variables: Naming the Unnamed",
        "learningObjective": "Understand how to declare and use variables in JavaScript",
        "chunks": [
          {
            "text": "A **variable** is a named container that holds a value. Think of it as a labeled box.",
            "type": "text"
          },
          {
            "text": "Use `const` for values that won't change. Use `let` for values that may change.",
            "type": "text"
          },
          {
            "code": "const name = 'Aria';\nlet level = 1;\nlevel = 2; // ✓ allowed\nname = 'Bob'; // ✗ error!",
            "language": "javascript",
            "type": "code"
          }
        ]
      },
      "quests": [
        {
          "id": "quest-1-1",
          "type": "code-task",
          "title": "Name Your Hero",
          "objective": "Declare a variable called `heroName` and assign your name to it.",
          "hints": [
            "Use the `const` keyword followed by the variable name.",
            "A string value goes inside single or double quotes."
          ],
          "validation": {
            "strategy": "regex",
            "pattern": "(?:const|let)\\s+heroName\\s*=\\s*['\"`]\\w+",
            "successMessage": "Your hero has a name. The cave trembles.",
            "failureMessage": "The darkness remains. Try declaring heroName with const or let."
          }
        }
      ],
      "challenge": {
        "id": "challenge-1-1",
        "type": "mcq",
        "adaptiveDifficulty": true,
        "variants": {
          "easy": [
            {
              "id": "q-easy-1",
              "text": "What does `const` mean?",
              "options": ["A function", "A constant variable", "A class", "A loop"],
              "correctIndex": 1,
              "explanation": "`const` declares a variable whose binding cannot be reassigned."
            }
          ],
          "medium": [
            {
              "id": "q-med-1",
              "text": "Which keyword creates a variable that cannot be reassigned?",
              "options": ["var", "let", "const", "def"],
              "correctIndex": 2,
              "explanation": "`const` creates a read-only binding. Note: object properties can still be mutated."
            }
          ],
          "hard": [
            {
              "id": "q-hard-1",
              "text": "What is the output of: `const x = {}; x.name = 'test'; console.log(x.name);`",
              "options": ["TypeError", "undefined", "test", "null"],
              "correctIndex": 2,
              "explanation": "`const` prevents reassignment of the binding, not mutation of the object itself."
            }
          ]
        }
      },
      "xpReward": 150,
      "xpBreakdown": {
        "base": 100,
        "noHintsBonus": 25,
        "firstAttemptBonus": 15,
        "speedBonus": 10
      },
      "bossObjective": {
        "title": "Defeat Lord Undefined",
        "description": "Declare 5 variables of different types to weaken Lord Undefined.",
        "completionCondition": "quest_complete",
        "victoryText": "Lord Undefined collapses. 'I... am... declared,' he whispers."
      },
      "conceptDependencies": [],
      "skills": ["variable-declaration", "const-vs-let", "string-assignment"]
    }
  ],
  "skillTree": {
    "nodes": [
      { "id": "variable-declaration", "name": "Variable Declaration", "unlockedBy": "stage-1" },
      { "id": "functions", "name": "Functions", "unlockedBy": "stage-2", "requires": ["variable-declaration"] }
    ]
  }
}
```

---

## 3. Validation Strategy

### Tool: Zod (Primary)

Zod is the canonical validation layer for all content.

**Why Zod over alternatives:**
- TypeScript-native — schema IS the type definition
- Runtime validation (not just compile-time)
- Rich error messages with path context
- Composable schemas (reuse sub-schemas)
- Used across API validation too — single validation system

**Why not TypeBox:** Excellent for OpenAPI spec generation; overkill for Phase 1–4.  
**Why not JSON Schema:** Verbose, separate type generation step needed.  
**Why not Prisma Validator:** DB-specific, not content-focused.

### Validation Architecture

```typescript
// engine/content/schemas/world.schema.ts
export const UnlockConditionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('world_start') }),
  z.object({ type: z.literal('stage_complete'), stageId: z.string() }),
  z.object({ type: z.literal('multi_require'), stageIds: z.array(z.string()).min(2) }),
  z.object({ type: z.literal('xp_threshold'), minXP: z.number().int().positive() }),
])

export const BossSchema = z.object({
  id: z.string(),
  name: z.string(),
  spriteKey: z.string(),
  introText: z.string().max(200),
  defeatText: z.string().max(200),
  health: z.number().int().min(50).max(1000),
  attackPattern: z.string(),
})

export const StageDefinitionSchema = z.object({
  id: z.string().regex(/^stage-[a-z0-9-]+$/),
  name: z.string().max(60),
  position: z.object({ x: z.number(), y: z.number() }),
  nodeIconKey: z.string(),
  backgroundKey: z.string(),
  unlockCondition: UnlockConditionSchema,
  hidden: z.boolean().default(false),
  optional: z.boolean().default(false),
  boss: BossSchema,
})

export const WorldSchema = z.object({
  $schema: z.literal('forgeMinds/world/v1'),
  id: z.string().regex(/^world-[a-z0-9-]+$/),
  name: z.string().max(80),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  theme: WorldThemeSchema,
  map: MapConfigSchema,
  stages: z.array(StageDefinitionSchema).min(1).max(50),
  npcs: z.array(NpcSchema).default([]),
  enemies: z.array(EnemySchema).default([]),
  lore: WorldLoreSchema,
})

export type World = z.infer<typeof WorldSchema>
```

### Validation Modes

| Mode | When | Behavior |
|---|---|---|
| `strict` | Development, CI | Throws on any schema error — fail fast |
| `warn` | Preview/staging | Logs errors, uses defaults where possible |
| `silent` | Never | Not supported — always surface errors |

```typescript
export function validateWorld(raw: unknown, mode: 'strict' | 'warn' = 'strict'): World {
  const result = WorldSchema.safeParse(raw)
  if (!result.success) {
    if (mode === 'strict') throw new ContentValidationError(result.error)
    console.warn('[Content] World validation warnings:', result.error.flatten())
    return WorldSchema.parse({ ...defaults, ...raw })  // partial recovery
  }
  return result.data
}
```

---

## 4. Content Loading Pipeline

```
Content Source
  ↓
ContentResolver (finds the raw JSON by worldId)
  ↓
SchemaValidator (Zod parse + error reporting)
  ↓
ContentNormalizer (fills defaults, resolves references)
  ↓
ContentCache (in-memory, TTL-based for DB content)
  ↓
Engine Consumers (GameEngine, LearningEngine)
```

### ContentResolver

Resolves a `worldId` to raw JSON from any source:

```typescript
interface ContentSource {
  type: 'static' | 'database' | 'api' | 'ai-generated'
  resolve(worldId: string): Promise<{ world: unknown; knowledge: unknown }>
}

class StaticContentSource implements ContentSource {
  type = 'static' as const
  async resolve(worldId: string) {
    const entry = CONTENT_REGISTRY.find(e => e.worldId === worldId)
    if (!entry) throw new ContentNotFoundError(worldId)
    const [world, knowledge] = await Promise.all([entry.worldJson(), entry.knowledgeJson()])
    return { world, knowledge }
  }
}

class DatabaseContentSource implements ContentSource {
  type = 'database' as const
  async resolve(worldId: string) {
    // Phase 4+: load from worlds table in PostgreSQL
  }
}
```

`ContentEngine` selects the appropriate source:
```typescript
function getContentSource(): ContentSource {
  if (process.env.CONTENT_SOURCE === 'database') return new DatabaseContentSource()
  return new StaticContentSource()
}
```

Phase 1: `StaticContentSource` only.  
Phase 4: `DatabaseContentSource` for creator-authored content.

---

## 5. Runtime Rendering Flow

When a player enters a world, the following pipeline executes:

```
Player navigates to /world/[worldId]
  ↓
useWorld(worldId) TanStack Query hook fires
  ↓
GET /api/worlds/[worldId]
  ↓
ContentEngine.loadWorld(worldId)
  │  └── ContentResolver → raw JSON
  │  └── SchemaValidator → typed World object
  │  └── ContentCache.set(worldId, world, TTL: 5min)
  └── returns: World + KnowledgeWorld + PlayerProgress
  ↓
React renders WorldMapPage
  │  └── passes World to <WorldMapCanvas> (PixiJS)
  │  └── passes PlayerProgress to <WorldMapUI> (React HUD)
  ↓
WorldMapScene.init(world)
  └── For each stage in world.stages:
      └── render StageNodeSprite at stage.position
      └── apply stage.nodeIconKey asset
      └── apply unlock status from PlayerProgress
      └── draw connection lines based on unlockCondition chain
```

### Dynamic Stage Node Rendering

The engine does not know what "stage-1" means. It only knows:
1. Place a node at `stage.position`
2. Use `stage.nodeIconKey` for the sprite
3. Evaluate `stage.unlockCondition` against player's progress
4. On click: emit `stageSelected` event with `stage.id`

The Learning Engine then uses `stage.id` to look up the corresponding `knowledge.json` stage entry.

---

## 6. Dynamic World Generation Flow

### For Static Content (Phase 1–3)

```
CONTENT_REGISTRY → dynamic import → Zod parse → typed World
```

### For Database Content (Phase 4+)

```
POST /api/worlds (creator saves world)
  → Zod validate world.json + knowledge.json
  → Store in `worlds` table (world_config JSONB + knowledge_config JSONB)
  → Invalidate content cache for worldId

Player loads world
  → ContentEngine reads from DB (JSONB column)
  → Same Zod validation pipeline
  → Same rendering flow
```

### For AI-Generated Content (Phase 3+)

```
AI generates world/knowledge JSON
  → ContentEngine.validateAndSanitize(aiOutput)
  → If validation passes: use as WorldObject
  → If validation fails: fallback to template world + log failure
  → AI-generated content never bypasses validation
```

### Progression Map Generation

For any world config with a `map.layout` of `'linear'`, `'branching'`, or `'open'`:

```typescript
class ProgressionMapBuilder {
  build(world: World, progress: PlayerProgress): RenderedMap {
    const nodes = world.stages.map(stage => ({
      ...stage,
      status: resolveStageStatus(stage, progress),
      connections: resolveConnections(stage, world.stages)
    }))
    return { nodes, layout: world.map.layout }
  }
}

function resolveStageStatus(stage: StageDefinition, progress: PlayerProgress): StageStatus {
  switch (stage.unlockCondition.type) {
    case 'world_start': return 'available'
    case 'stage_complete': return progress.completedStages.has(stage.unlockCondition.stageId) ? 'available' : 'locked'
    case 'multi_require': return stage.unlockCondition.stageIds.every(id => progress.completedStages.has(id)) ? 'available' : 'locked'
    case 'xp_threshold': return progress.totalXP >= stage.unlockCondition.minXP ? 'available' : 'locked'
  }
}
```

---

## 7. Learning Progression Mapping

### Concept Dependency Graph

`knowledge.json` defines a skill dependency graph:

```
variable-declaration
  └── functions (requires: variable-declaration)
        ├── closures (requires: functions)
        └── callbacks (requires: functions)
              └── promises (requires: callbacks)
                    └── async-await (requires: promises)
```

`AdaptiveFlow.ts` reads completed skills from progress and:
1. Determines which skills are eligible to unlock
2. Surfaces skill gaps if prerequisites are missing
3. Recommends remediation stages if a concept is mastered poorly

### Stage Prerequisite Enforcement

Before a stage becomes `available`, the engine checks:
1. `unlockCondition` in `world.json` (game layer) — is the stage unlocked on the map?
2. `prerequisites` in `knowledge.json` (learning layer) — have the required concepts been learned?

Both must pass. This allows a stage to be visually visible but learning-locked if prerequisites aren't met.

---

## 8. Content Versioning Strategy

Every content file carries a `version` field (`"1.0.0"` semver).

### Version Compatibility Rules

| Change Type | Version Bump | Backward Compatible? |
|---|---|---|
| Add optional field | Patch (1.0.x) | Yes — Zod `.default()` handles missing fields |
| Add required field | Minor (1.x.0) | No — migration required |
| Rename/remove field | Major (x.0.0) | No — migration required |
| Change validation rules (stricter) | Minor | No — old content may fail |
| Change validation rules (looser) | Patch | Yes |

### Schema Version Registry

```typescript
// engine/content/versions.ts
export const SCHEMA_VERSIONS = {
  world: {
    'v1': WorldSchemaV1,
    'v2': WorldSchemaV2,   // Phase 4+ when needed
  },
  knowledge: {
    'v1': KnowledgeSchemaV1,
  }
}

export function parseWorldWithVersion(raw: unknown): World {
  const version = (raw as any)?.['$schema']?.split('/')[2] ?? 'v1'
  const schema = SCHEMA_VERSIONS.world[version]
  if (!schema) throw new Error(`Unknown world schema version: ${version}`)
  return schema.parse(raw)
}
```

---

## 9. Migration Strategy

### Content Migration Scripts

When a schema version changes, a migration script transforms old content to new format:

```typescript
// scripts/migrate-content.ts
// Run: npx tsx scripts/migrate-content.ts --from v1 --to v2

async function migrateWorldV1toV2(v1: WorldV1): Promise<WorldV2> {
  return {
    ...v1,
    $schema: 'forgeMinds/world/v2',
    // transform specific changed fields
  }
}
```

### DB Content Migration

For Phase 4+ DB-stored content:
- Schema version stored in `worlds.schema_version` column
- Migration runs as a background job, not a blocking deploy
- Both old and new schema parsers active during migration window
- Completion: bump `MINIMUM_SCHEMA_VERSION` constant; old parser removed

### Backward Compatibility Window

- Major version: 2 phases of backward compatibility (old content continues working)
- Minor version: 1 phase
- Patch: immediate; no compatibility concern

---

## 10. Future Creator Marketplace Architecture

### Phase 4: Creator Portal

Creators author worlds via the in-app editor (Phase 4). Content stored in DB as JSONB.

```
Creator → Visual Editor → JSON output → Zod validate → DB (draft)
                                                           ↓
                                                    Review Queue
                                                           ↓
                                                    Admin Approve
                                                           ↓
                                                  Published (live for players)
```

### Phase 8: Marketplace

```
Published World
  ├── Free (open to all players)
  └── Paid (Stripe checkout → player_purchases table → world unlocked)

Creator Revenue
  └── 70% of sale price → creator wallet → monthly payout via Stripe Connect
```

### Content Discovery API (Phase 8)

```
GET /api/marketplace/worlds?topic=python&difficulty=beginner&sort=rating
→ Returns paginated world cards with: name, creator, rating, price, preview image
```

---

## 11. No-Code Editor Compatibility

The JSON schema is designed to be fully editable by a visual editor:

### Design Constraints That Enable No-Code Editing

1. All positions are numeric `{ x, y }` — drag-and-drop maps to these values directly
2. `unlockCondition` uses a discriminated union — dropdown selector maps to each type
3. `hints` is an array of strings — text inputs in a list
4. `chunks` are typed objects (`text` | `code`) — rich text + code editor components
5. `spriteKey` / `backgroundKey` are strings — asset picker maps to these
6. No embedded logic or functions — everything is declarative data

### Visual World Editor (Phase 4) → JSON

```
Drag stage node to position (200, 400)
  → stage.position = { x: 200, y: 400 }

Draw connection from stage-1 to stage-2
  → stage-2.unlockCondition = { type: 'stage_complete', stageId: 'stage-1' }

Select boss sprite from asset library
  → stage.boss.spriteKey = 'boss-undefined'

Set boss health slider to 150
  → stage.boss.health = 150
```

The editor serializes to valid `world.json`. No code generation — pure config.

---

## 12. AI Generation Compatibility Strategy

### Design Principles for AI-Friendly Schemas

1. **Flat where possible** — deeply nested JSON confuses language models
2. **Enum-constrained fields** — `type: 'mcq' | 'code-task' | 'fill-blank'` not free-form strings
3. **Clear field names** — `learningObjective` not `lo` or `obj`
4. **Example-rich prompts** — each generation prompt includes a valid example JSON

### AI Generation Flow

```typescript
async function generateStageContent(topic: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<KnowledgeStage> {
  const prompt = buildStageGenPrompt({ topic, difficulty, exampleStage: EXAMPLE_STAGE_JSON })
  const raw = await aiAdapter.generateJSON(prompt)
  
  const result = KnowledgeStageSchema.safeParse(raw)
  if (!result.success) {
    // Log failure with the validation errors for prompt improvement
    await logAIGenerationFailure({ topic, errors: result.error.flatten() })
    throw new AIContentGenerationError('Generated content failed schema validation')
  }
  
  return result.data
}
```

### Prompt Template Structure

```
You are a world-class educational game designer.

Generate a `knowledge.json` stage for the following:
- Topic: {topic}
- Difficulty: {difficulty}
- World theme: {worldTheme}

Output ONLY valid JSON matching this exact schema:
{schema_summary}

Here is an example of a valid stage:
{example_json}

Rules:
1. concept.chunks must have 2–4 items
2. challenge.variants.{difficulty} must have exactly 3 questions
3. xpReward must be between 100–250
4. All string fields must be in English
5. Do not include any explanation outside the JSON
```

### Validation-First AI Pipeline

AI content is **never used without passing Zod validation**.  
On failure: log the error + return a templated fallback stage.  
This ensures the game engine never receives malformed content regardless of AI quality.

---

## 13. Phase 1.5 Schema Extensions (World JSON v1.5)

Phase 1.5 adds optional fields to `world.json` and `knowledge.json` to support the 2D RPG exploration layer. All new fields are **optional** — Phase 1 JSON without these fields continues to work (falls back to node-map view).

### `world.json` — New Optional Fields

```json
{
  "tilemap": {
    "tilemapKey": "world-docker-basics",
    "tilemapPath": "/content/tilemaps/docker-basics/world.tmj",
    "tilesetKey": "tileset-forge",
    "tilesetPath": "/content/tilesets/forge.png",
    "spawnPoint": { "x": 320, "y": 480 },
    "tileSize": 16,
    "scale": 2
  },
  "zones": [
    {
      "id": "zone-foundry",
      "name": "The Image Foundry",
      "type": "dungeon",
      "linkedStageId": "stage-images",
      "entranceTile": { "x": 10, "y": 15 },
      "tilemapPath": "/content/tilemaps/docker-basics/zone-foundry.tmj",
      "bgmKey": "bgm-dungeon",
      "unlockCondition": { "type": "world_start" }
    }
  ],
  "interactables": [
    {
      "id": "interactable-scroll-1",
      "type": "scroll",
      "position": { "x": 256, "y": 128 },
      "linkedDiscoveryId": "discovery-image-layers",
      "spriteKey": "sprite-scroll",
      "glowColor": "#f7d060"
    },
    {
      "id": "interactable-shrine-1",
      "type": "shrine",
      "position": { "x": 480, "y": 320 },
      "linkedDiscoveryId": "discovery-multistage",
      "spriteKey": "sprite-shrine"
    },
    {
      "id": "interactable-chest-1",
      "type": "chest",
      "position": { "x": 192, "y": 416 },
      "linkedDiscoveryId": "discovery-prune",
      "spriteKey": "sprite-chest"
    }
  ]
}
```

New NPC fields:
```json
{
  "npcs": [
    {
      "id": "npc-mentor-ironhands",
      "position": { "x": 320, "y": 240 },
      "zone": "overworld",
      "patrolPath": [
        { "x": 300, "y": 240 },
        { "x": 380, "y": 240 }
      ]
    }
  ]
}
```

New enemy fields:
```json
{
  "enemies": [
    {
      "id": "enemy-dangling-image",
      "spawnZone": "zone-foundry",
      "spawnCount": 3,
      "roamRadius": 64,
      "encounterType": "mcq",
      "linkedChallengeId": "challenge-images-mcq"
    }
  ]
}
```

### `knowledge.json` — New `discoveries` Array

```json
{
  "discoveries": [
    {
      "id": "discovery-image-layers",
      "title": "Image Layers",
      "type": "scroll",
      "xpReward": 25,
      "coinReward": 10,
      "content": {
        "type": "text",
        "text": "Each RUN, COPY, and ADD instruction creates a new read-only layer."
      }
    },
    {
      "id": "discovery-multistage",
      "title": "Multi-Stage Build Secret",
      "type": "shrine",
      "xpReward": 50,
      "coinReward": 25,
      "content": {
        "type": "code",
        "code": "FROM node:18 AS builder\nRUN npm run build\n\nFROM node:18-alpine\nCOPY --from=builder /app/dist ./dist",
        "language": "dockerfile",
        "caption": "Copy artifacts between stages — build tools never reach production."
      }
    }
  ]
}
```

New `bossObjective` field (Phase 1.5 extension):
```json
{
  "bossObjective": {
    "title": "Defeat The Bloated Image",
    "description": "Demonstrate mastery of clean Dockerfile practices.",
    "completionCondition": "score_threshold",
    "scoreThreshold": 0.75,
    "requiredDiscoveries": ["discovery-image-layers", "discovery-multistage"],
    "victoryText": "The Bloated Image collapses. Its layers scatter like dust.",
    "failRedirectHint": "Seek the scrolls in the Foundry Cavern before challenging the Bloated Image again."
  }
}
```

### Graceful Degradation Rules

| JSON has... | Engine behaviour |
|---|---|
| No `tilemap` field | Falls back to Phase 1 PixiJS node-map view |
| `tilemap` present, no `zones` | Renders single overworld tilemap only |
| `zones` present, no `interactables` | Zones accessible, no discovery objects |
| `discoveries` present | Discovery objects spawned in world |
| No `discoveries` | Boss fight has no entry gate, always accessible |
