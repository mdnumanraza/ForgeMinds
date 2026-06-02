import { z } from 'zod'

// ─── Concept Chunk ────────────────────────────────────────────────────────────

export const ConceptChunkSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    text: z.string(),
  }),
  z.object({
    type: z.literal('code'),
    code: z.string(),
    language: z.string().default('text'),
  }),
])

// ─── Quest ────────────────────────────────────────────────────────────────────

export const QuestValidationSchema = z.object({
  strategy: z.enum(['regex', 'includes', 'exact', 'none']).default('none'),
  pattern: z.string().optional(),
  successMessage: z.string().default('Quest complete!'),
  failureMessage: z.string().default('Not quite — try again.'),
})

export const QuestSchema = z.object({
  id: z.string(),
  type: z.enum(['code-task', 'fill-blank', 'instruction']),
  title: z.string(),
  objective: z.string(),
  hints: z.array(z.string()).default([]),
  validation: QuestValidationSchema.default({}),
})

// ─── Challenge Question ───────────────────────────────────────────────────────

export const ChallengeQuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  options: z.array(z.string()).min(2).max(6),
  correctIndex: z.number().int().min(0),
  explanation: z.string(),
})

// ─── Challenge ────────────────────────────────────────────────────────────────

export const ChallengeSchema = z.object({
  id: z.string(),
  type: z.enum(['mcq', 'fill-blank']).default('mcq'),
  adaptiveDifficulty: z.boolean().default(true),
  variants: z.object({
    easy: z.array(ChallengeQuestionSchema).min(1),
    medium: z.array(ChallengeQuestionSchema).min(1),
    hard: z.array(ChallengeQuestionSchema).min(1),
  }),
})

// ─── Knowledge Stage ─────────────────────────────────────────────────────────

export const StoryIntroSchema = z.object({
  title: z.string(),
  text: z.string(),
  speakerNpcId: z.string().optional(),
})

export const ConceptSchema = z.object({
  title: z.string(),
  learningObjective: z.string().default(''),
  chunks: z.array(ConceptChunkSchema).min(1).max(6),
})

export const BossObjectiveSchema = z.object({
  title: z.string(),
  description: z.string(),
  completionCondition: z.string().default('quest_complete'),
  victoryText: z.string().default('The boss has been defeated!'),
  // Phase 1.5 fields
  requiredDiscoveries: z.array(z.string()).optional().default([]),
  scoreThreshold: z.number().min(0).max(1).optional().default(0.75),
})

export const XPBreakdownSchema = z.object({
  base: z.number().int().min(0),
  noHintsBonus: z.number().int().min(0).default(25),
  firstAttemptBonus: z.number().int().min(0).default(15),
  speedBonus: z.number().int().min(0).default(10),
})

export const KnowledgeStageSchema = z.object({
  stageId: z.string(),
  estimatedMinutes: z.number().int().min(1).default(10),
  prerequisites: z.array(z.string()).default([]),
  storyIntro: StoryIntroSchema,
  concept: ConceptSchema,
  quests: z.array(QuestSchema).min(1),
  challenge: ChallengeSchema,
  xpReward: z.number().int().min(10).max(500).default(150),
  xpBreakdown: XPBreakdownSchema.optional(),
  bossObjective: BossObjectiveSchema,
  skills: z.array(z.string()).default([]),
})

// ─── Discovery (Phase 1.5) ───────────────────────────────────────────────────

export const DiscoveryContentSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), text: z.string() }),
  z.object({
    type: z.literal('code'),
    code: z.string(),
    language: z.string().default('text'),
    caption: z.string().optional(),
  }),
])

export const DiscoverySchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['scroll', 'shrine', 'chest']),
  xpReward: z.number().int().min(0).default(25),
  coinReward: z.number().int().min(0).default(10),
  content: DiscoveryContentSchema,
})

// ─── Skill Tree ───────────────────────────────────────────────────────────────

export const SkillNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  unlockedBy: z.string(),
  requires: z.array(z.string()).default([]),
})

// ─── Knowledge Schema (root) ─────────────────────────────────────────────────

export const KnowledgeSchema = z.object({
  $schema: z.string().optional(),
  worldId: z.string().min(1),
  version: z.string().default('1.0.0'),
  topic: z.string(),
  prerequisites: z.array(z.string()).default([]),
  estimatedHours: z.number().positive().default(1),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  stages: z.array(KnowledgeStageSchema).min(1).max(50),
  skillTree: z
    .object({ nodes: z.array(SkillNodeSchema) })
    .default({ nodes: [] }),
  // Phase 1.5 fields
  discoveries: z.array(DiscoverySchema).default([]),
})

export type Knowledge = z.infer<typeof KnowledgeSchema>
export type KnowledgeStage = z.infer<typeof KnowledgeStageSchema>
export type Quest = z.infer<typeof QuestSchema>
export type Challenge = z.infer<typeof ChallengeSchema>
export type ChallengeQuestion = z.infer<typeof ChallengeQuestionSchema>
export type ConceptChunk = z.infer<typeof ConceptChunkSchema>
export type Discovery = z.infer<typeof DiscoverySchema>
export type DiscoveryContent = z.infer<typeof DiscoveryContentSchema>
export type BossObjective = z.infer<typeof BossObjectiveSchema>
