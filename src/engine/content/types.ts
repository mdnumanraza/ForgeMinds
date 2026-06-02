import type { World } from './schemas/world.schema'
import type { Knowledge } from './schemas/knowledge.schema'
import { WorldSchema } from './schemas/world.schema'
import { KnowledgeSchema } from './schemas/knowledge.schema'
import type { z } from 'zod'

export type { World, StageDefinition, Boss, Npc, UnlockCondition } from './schemas/world.schema'
export type { Knowledge, KnowledgeStage, Quest, Challenge, ChallengeQuestion, ConceptChunk } from './schemas/knowledge.schema'

// Input types (before Zod defaults are applied) — use in static template objects
export type WorldInput = z.input<typeof WorldSchema>
export type KnowledgeInput = z.input<typeof KnowledgeSchema>

export interface Campaign {
  id: string
  name: string
  world: World
  knowledge: Knowledge
  loadedAt: number
}

export interface CampaignSummary {
  id: string
  name: string
  topic: string
  difficulty: string
  estimatedHours: number
  stageCount: number
  loadedAt: number
  lastPlayedAt?: number
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
  source: 'world' | 'knowledge'
}

export type ContentSource = 'user-upload' | 'template' | 'localStorage'
