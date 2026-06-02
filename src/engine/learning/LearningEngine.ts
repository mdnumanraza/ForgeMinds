import type { Campaign, KnowledgeStage, StageDefinition } from '../content/types'

export interface StageContext {
  campaignId: string
  stageId: string
  stageDef: StageDefinition
  knowledgeStage: KnowledgeStage
}

export function resolveStageContext(campaign: Campaign, stageId: string): StageContext | null {
  const stageDef = campaign.world.stages.find((s) => s.id === stageId)
  const knowledgeStage = campaign.knowledge.stages.find((s) => s.stageId === stageId)
  if (!stageDef || !knowledgeStage) return null
  return { campaignId: campaign.id, stageId, stageDef, knowledgeStage }
}

export function getNextStageId(campaign: Campaign, completedStageId: string): string | null {
  for (const stage of campaign.world.stages) {
    const cond = stage.unlockCondition
    if (cond.type === 'stage_complete' && cond.stageId === completedStageId) {
      return stage.id
    }
  }
  return null
}

export function isCampaignComplete(
  campaign: Campaign,
  getStatus: (stageId: string) => string
): boolean {
  return campaign.world.stages.every((s) => getStatus(s.id) === 'completed')
}
