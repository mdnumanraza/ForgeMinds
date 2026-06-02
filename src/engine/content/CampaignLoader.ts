import { nanoid } from 'nanoid'
import { WorldSchema } from './schemas/world.schema'
import { KnowledgeSchema } from './schemas/knowledge.schema'
import { parseRawJSON, validateCampaignJSON } from './SchemaValidator'
import type { Campaign, ValidationResult } from './types'

export interface LoadResult {
  ok: true
  campaign: Campaign
}
export interface LoadError {
  ok: false
  validation: ValidationResult
}

export function loadCampaignFromRaw(
  worldRaw: string,
  knowledgeRaw: string,
  nameFallback = 'My Campaign'
): LoadResult | LoadError {
  const parseResult = parseRawJSON({ worldRaw, knowledgeRaw })
  if (!parseResult.ok) return { ok: false, validation: { valid: false, errors: parseResult.errors } }

  const validation = validateCampaignJSON(parseResult.parsed)
  if (!validation.valid) return { ok: false, validation }

  const world = WorldSchema.parse(parseResult.parsed.worldJson)
  const knowledge = KnowledgeSchema.parse(parseResult.parsed.knowledgeJson)

  const campaign: Campaign = {
    id: nanoid(10),
    name: world.name || nameFallback,
    world,
    knowledge,
    loadedAt: Date.now(),
  }

  return { ok: true, campaign }
}

export function loadCampaignFromObjects(worldObj: unknown, knowledgeObj: unknown): LoadResult | LoadError {
  return loadCampaignFromRaw(JSON.stringify(worldObj), JSON.stringify(knowledgeObj))
}
