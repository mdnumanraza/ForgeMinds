import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type StageStatus = 'locked' | 'available' | 'completed'

export interface StageProgressEntry {
  status: StageStatus
  bestScore: number
  timesPlayed: number
  completedAt?: number
}

export interface CampaignProgress {
  campaignId: string
  // per-campaign RPG stats (Phase 1.5)
  xp: number
  level: number
  coins: number
  collectedDiscoveries: string[]
  defeatedEnemies: string[]
  unlockedZones: string[]
  bossAttempts: Record<string, number>
  // stage tracking
  stages: Record<string, StageProgressEntry>
  startedAt: number
  lastPlayedAt: number
}

const XP_PER_LEVEL = 200

function xpToLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

function defaultCampaignProgress(campaignId: string, firstStageId: string): CampaignProgress {
  return {
    campaignId,
    xp: 0,
    level: 1,
    coins: 0,
    collectedDiscoveries: [],
    defeatedEnemies: [],
    unlockedZones: [],
    bossAttempts: {},
    stages: { [firstStageId]: { status: 'available', bestScore: 0, timesPlayed: 0 } },
    startedAt: Date.now(),
    lastPlayedAt: Date.now(),
  }
}

interface ProgressState {
  campaigns: Record<string, CampaignProgress>

  initCampaign: (campaignId: string, firstStageId: string) => void
  removeCampaign: (campaignId: string) => void
  markStageComplete: (campaignId: string, stageId: string, score: number) => void
  unlockStage: (campaignId: string, stageId: string) => void
  getStageStatus: (campaignId: string, stageId: string) => StageStatus
  getCampaignProgress: (campaignId: string) => CampaignProgress | undefined
  getCompletionPercent: (campaignId: string, totalStages: number) => number

  // Phase 1.5 mutations
  awardXP: (campaignId: string, amount: number) => void
  awardCoins: (campaignId: string, amount: number) => void
  markDiscoveryCollected: (campaignId: string, discoveryId: string) => void
  markEnemyDefeated: (campaignId: string, enemyId: string) => void
  unlockZone: (campaignId: string, zoneId: string) => void
  recordBossAttempt: (campaignId: string, stageId: string) => void

  // Phase 1.5 reads
  getCampaignXP: (campaignId: string) => number
  getCampaignLevel: (campaignId: string) => number
  getCampaignCoins: (campaignId: string) => number
  isDiscoveryCollected: (campaignId: string, discoveryId: string) => boolean
  isEnemyDefeated: (campaignId: string, enemyId: string) => boolean
  isZoneUnlocked: (campaignId: string, zoneId: string) => boolean
  getBossAttempts: (campaignId: string, stageId: string) => number
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      campaigns: {},

      initCampaign: (campaignId, firstStageId) => {
        const existing = get().campaigns[campaignId]
        if (existing) {
          // Migrate stale records that are missing Phase 1.5 fields
          const needsMigration =
            existing.xp === undefined ||
            existing.level === undefined ||
            existing.coins === undefined ||
            existing.collectedDiscoveries === undefined ||
            existing.defeatedEnemies === undefined ||
            existing.unlockedZones === undefined ||
            existing.bossAttempts === undefined

          if (needsMigration) {
            set((s) => ({
              campaigns: {
                ...s.campaigns,
                [campaignId]: {
                  // Spread existing first, then fill missing fields with defaults
                  ...existing,
                  xp: existing.xp ?? 0,
                  level: existing.level ?? 1,
                  coins: existing.coins ?? 0,
                  collectedDiscoveries: existing.collectedDiscoveries ?? [],
                  defeatedEnemies: existing.defeatedEnemies ?? [],
                  unlockedZones: existing.unlockedZones ?? [],
                  bossAttempts: existing.bossAttempts ?? {},
                },
              },
            }))
          }
          return
        }
        set((s) => ({
          campaigns: {
            ...s.campaigns,
            [campaignId]: defaultCampaignProgress(campaignId, firstStageId),
          },
        }))
      },

      removeCampaign: (campaignId) => {
        set((s) => {
          const next = { ...s.campaigns }
          delete next[campaignId]
          return { campaigns: next }
        })
      },

      markStageComplete: (campaignId, stageId, score) => {
        set((s) => {
          const cp = s.campaigns[campaignId]
          if (!cp) return s
          const prev = cp.stages[stageId] ?? { status: 'available', bestScore: 0, timesPlayed: 0 }
          return {
            campaigns: {
              ...s.campaigns,
              [campaignId]: {
                ...cp,
                lastPlayedAt: Date.now(),
                stages: {
                  ...cp.stages,
                  [stageId]: {
                    status: 'completed',
                    bestScore: Math.max(prev.bestScore, score),
                    timesPlayed: prev.timesPlayed + 1,
                    completedAt: Date.now(),
                  },
                },
              },
            },
          }
        })
      },

      unlockStage: (campaignId, stageId) => {
        set((s) => {
          const cp = s.campaigns[campaignId]
          if (!cp || cp.stages[stageId]) return s
          return {
            campaigns: {
              ...s.campaigns,
              [campaignId]: {
                ...cp,
                stages: {
                  ...cp.stages,
                  [stageId]: { status: 'available', bestScore: 0, timesPlayed: 0 },
                },
              },
            },
          }
        })
      },

      getStageStatus: (campaignId, stageId) => {
        const cp = get().campaigns[campaignId]
        return cp?.stages[stageId]?.status ?? 'locked'
      },

      getCampaignProgress: (campaignId) => get().campaigns[campaignId],

      getCompletionPercent: (campaignId, totalStages) => {
        const cp = get().campaigns[campaignId]
        if (!cp || totalStages === 0) return 0
        const completed = Object.values(cp.stages).filter((s) => s.status === 'completed').length
        return Math.round((completed / totalStages) * 100)
      },

      // ── Phase 1.5 mutations ────────────────────────────────────────────────

      awardXP: (campaignId, amount) => {
        set((s) => {
          const cp = s.campaigns[campaignId]
          if (!cp) return s
          const newXP = cp.xp + amount
          return {
            campaigns: {
              ...s.campaigns,
              [campaignId]: { ...cp, xp: newXP, level: xpToLevel(newXP), lastPlayedAt: Date.now() },
            },
          }
        })
      },

      awardCoins: (campaignId, amount) => {
        set((s) => {
          const cp = s.campaigns[campaignId]
          if (!cp) return s
          return {
            campaigns: {
              ...s.campaigns,
              [campaignId]: { ...cp, coins: cp.coins + amount, lastPlayedAt: Date.now() },
            },
          }
        })
      },

      markDiscoveryCollected: (campaignId, discoveryId) => {
        set((s) => {
          const cp = s.campaigns[campaignId]
          if (!cp || cp.collectedDiscoveries.includes(discoveryId)) return s
          return {
            campaigns: {
              ...s.campaigns,
              [campaignId]: {
                ...cp,
                collectedDiscoveries: [...cp.collectedDiscoveries, discoveryId],
                lastPlayedAt: Date.now(),
              },
            },
          }
        })
      },

      markEnemyDefeated: (campaignId, enemyId) => {
        set((s) => {
          const cp = s.campaigns[campaignId]
          if (!cp || cp.defeatedEnemies.includes(enemyId)) return s
          return {
            campaigns: {
              ...s.campaigns,
              [campaignId]: {
                ...cp,
                defeatedEnemies: [...cp.defeatedEnemies, enemyId],
                lastPlayedAt: Date.now(),
              },
            },
          }
        })
      },

      unlockZone: (campaignId, zoneId) => {
        set((s) => {
          const cp = s.campaigns[campaignId]
          if (!cp || cp.unlockedZones.includes(zoneId)) return s
          return {
            campaigns: {
              ...s.campaigns,
              [campaignId]: {
                ...cp,
                unlockedZones: [...cp.unlockedZones, zoneId],
                lastPlayedAt: Date.now(),
              },
            },
          }
        })
      },

      recordBossAttempt: (campaignId, stageId) => {
        set((s) => {
          const cp = s.campaigns[campaignId]
          if (!cp) return s
          const prev = cp.bossAttempts[stageId] ?? 0
          return {
            campaigns: {
              ...s.campaigns,
              [campaignId]: {
                ...cp,
                bossAttempts: { ...cp.bossAttempts, [stageId]: prev + 1 },
                lastPlayedAt: Date.now(),
              },
            },
          }
        })
      },

      // ── Phase 1.5 reads ────────────────────────────────────────────────────

      getCampaignXP: (campaignId) => get().campaigns[campaignId]?.xp ?? 0,
      getCampaignLevel: (campaignId) => get().campaigns[campaignId]?.level ?? 1,
      getCampaignCoins: (campaignId) => get().campaigns[campaignId]?.coins ?? 0,
      isDiscoveryCollected: (campaignId, discoveryId) =>
        get().campaigns[campaignId]?.collectedDiscoveries.includes(discoveryId) ?? false,
      isEnemyDefeated: (campaignId, enemyId) =>
        get().campaigns[campaignId]?.defeatedEnemies.includes(enemyId) ?? false,
      isZoneUnlocked: (campaignId, zoneId) =>
        get().campaigns[campaignId]?.unlockedZones.includes(zoneId) ?? false,
      getBossAttempts: (campaignId, stageId) =>
        get().campaigns[campaignId]?.bossAttempts[stageId] ?? 0,
    }),
    { name: 'fm:progress' }
  )
)
