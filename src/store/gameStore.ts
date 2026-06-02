import { create } from 'zustand'
import type { Campaign } from '@/engine/content/types'

export type StagePhase =
  | 'IDLE'
  | 'STORY_INTRO'
  | 'CONCEPT'
  | 'QUEST'
  | 'CHALLENGE'
  | 'XP_REWARD'
  | 'BOSS_FIGHT'
  | 'COMPLETE'

interface GameState {
  activeCampaign: Campaign | null
  activeStageId: string | null
  stagePhase: StagePhase
  setActiveCampaign: (campaign: Campaign) => void
  setActiveStage: (stageId: string) => void
  setPhase: (phase: StagePhase) => void
  clearCampaign: () => void
}

export const useGameStore = create<GameState>()((set) => ({
  activeCampaign: null,
  activeStageId: null,
  stagePhase: 'IDLE',

  // Always reset stagePhase when switching campaigns
  setActiveCampaign: (campaign) => set({ activeCampaign: campaign, stagePhase: 'IDLE', activeStageId: null }),
  setActiveStage: (stageId) => set({ activeStageId: stageId, stagePhase: 'IDLE' }),
  setPhase: (phase) => set({ stagePhase: phase }),
  clearCampaign: () => set({ activeCampaign: null, activeStageId: null, stagePhase: 'IDLE' }),
}))
