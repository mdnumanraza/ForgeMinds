import { WorldSchema } from './schemas/world.schema'
import { KnowledgeSchema } from './schemas/knowledge.schema'
import type { ValidationResult, ValidationError } from './types'
import type { ZodError } from 'zod'

function formatZodErrors(err: ZodError, source: 'world' | 'knowledge'): ValidationError[] {
  return err.errors.map((e) => ({
    field: e.path.join('.') || 'root',
    message: e.message,
    source,
  }))
}

export interface RawPair {
  worldRaw: string
  knowledgeRaw: string
}

export interface ParsedPair {
  worldJson: unknown
  knowledgeJson: unknown
}

export function parseRawJSON(raw: RawPair): { ok: true; parsed: ParsedPair } | { ok: false; errors: ValidationError[] } {
  const errors: ValidationError[] = []
  let worldJson: unknown
  let knowledgeJson: unknown

  try {
    worldJson = JSON.parse(raw.worldRaw)
  } catch {
    errors.push({ field: 'root', message: 'Invalid JSON syntax in World config', source: 'world' })
  }

  try {
    knowledgeJson = JSON.parse(raw.knowledgeRaw)
  } catch {
    errors.push({ field: 'root', message: 'Invalid JSON syntax in Knowledge config', source: 'knowledge' })
  }

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, parsed: { worldJson, knowledgeJson } }
}

export function validateCampaignJSON(parsed: ParsedPair): ValidationResult {
  const errors: ValidationError[] = []

  const worldResult = WorldSchema.safeParse(parsed.worldJson)
  if (!worldResult.success) errors.push(...formatZodErrors(worldResult.error, 'world'))

  const knowledgeResult = KnowledgeSchema.safeParse(parsed.knowledgeJson)
  if (!knowledgeResult.success) errors.push(...formatZodErrors(knowledgeResult.error, 'knowledge'))

  if (errors.length > 0) return { valid: false, errors }

  // Cross-validate: worldId in knowledge must match world id
  const worldId = (parsed.worldJson as { id: string }).id
  const knowledgeWorldId = (parsed.knowledgeJson as { worldId: string }).worldId
  if (worldId !== knowledgeWorldId) {
    errors.push({
      field: 'worldId',
      message: `knowledge.worldId "${knowledgeWorldId}" does not match world.id "${worldId}"`,
      source: 'knowledge',
    })
  }

  return { valid: errors.length === 0, errors }
}
