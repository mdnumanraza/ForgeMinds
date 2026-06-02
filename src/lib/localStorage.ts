import type { Campaign, CampaignSummary } from '@/engine/content/types'

const CAMPAIGNS_KEY = 'fm:campaigns'
const CAMPAIGN_KEY = (id: string) => `fm:campaign:${id}:data`

export function saveRecentCampaign(campaign: Campaign): void {
  try {
    const summaries = getRecentCampaigns()
    const entry: CampaignSummary = {
      id: campaign.id,
      name: campaign.name,
      topic: campaign.knowledge.topic,
      difficulty: campaign.knowledge.difficultyLevel,
      estimatedHours: campaign.knowledge.estimatedHours,
      stageCount: campaign.world.stages.length,
      loadedAt: campaign.loadedAt,
      lastPlayedAt: Date.now(),
    }
    const filtered = summaries.filter((s) => s.id !== campaign.id)
    const updated = [entry, ...filtered].slice(0, 10)
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(updated))
    // Persist full campaign JSON for reload
    localStorage.setItem(CAMPAIGN_KEY(campaign.id), JSON.stringify(campaign))
  } catch {
    // localStorage unavailable — silently skip
  }
}

export function getRecentCampaigns(): CampaignSummary[] {
  try {
    const raw = localStorage.getItem(CAMPAIGNS_KEY)
    if (!raw) return []
    const parsed: CampaignSummary[] = JSON.parse(raw)
    // Deduplicate by id, keeping first occurrence (most recent)
    const seen = new Set<string>()
    return parsed.filter((s) => {
      if (seen.has(s.id)) return false
      seen.add(s.id)
      return true
    })
  } catch {
    return []
  }
}

export function loadCampaignFromStorage(campaignId: string): Campaign | null {
  try {
    const raw = localStorage.getItem(CAMPAIGN_KEY(campaignId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function removeCampaignFromStorage(campaignId: string): void {
  try {
    localStorage.removeItem(CAMPAIGN_KEY(campaignId))
    const summaries = getRecentCampaigns().filter((s) => s.id !== campaignId)
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(summaries))
  } catch {}
}
