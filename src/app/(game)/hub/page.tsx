'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { GameLayout } from '@/components/layout/GameLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TemplateBrowser } from '@/components/loader/TemplateBrowser'
import { getRecentCampaigns, loadCampaignFromStorage, removeCampaignFromStorage } from '@/lib/localStorage'
import { useGameStore } from '@/store/gameStore'
import { useProgressStore } from '@/store/progressStore'
import type { CampaignSummary } from '@/engine/content/types'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/store/uiStore'

export default function HubPage() {
  const [recents, setRecents] = useState<CampaignSummary[]>([])
  const router = useRouter()
  const { setActiveCampaign } = useGameStore()
  const { initCampaign, getCompletionPercent, removeCampaign } = useProgressStore()
  const { pushNotification } = useUIStore()

  useEffect(() => {
    setRecents(getRecentCampaigns())
  }, [])

  const handleContinue = (summary: CampaignSummary) => {
    const campaign = loadCampaignFromStorage(summary.id)
    if (!campaign) {
      pushNotification({ type: 'error', message: 'Campaign data not found. Please reload it.' })
      return
    }
    setActiveCampaign(campaign)
    initCampaign(campaign.id, campaign.world.stages[0].id)
    router.push(`/world/${campaign.id}`)
  }

  const handleRemove = (id: string) => {
    removeCampaignFromStorage(id)
    removeCampaign(id)
    setRecents(getRecentCampaigns())
  }

  return (
    <GameLayout>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-5 py-8 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="font-display text-forge-gold text-3xl font-semibold">Campaign Hub</h1>
            <p className="text-forge-muted text-sm mt-1.5">Choose a campaign to continue, or start a new one.</p>
          </motion.div>

          {recents.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <h2 className="text-forge-text font-semibold text-xs uppercase tracking-widest">Continue Playing</h2>
                <div className="flex-1 h-px bg-forge-border/50" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recents.map((s, i) => {
                  const percent = getCompletionPercent(s.id, s.stageCount)
                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 + i * 0.05 }}
                    >
                      <Card className="flex flex-col gap-4 hover:border-forge-border/80 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-display text-forge-gold font-semibold text-sm truncate">{s.name}</p>
                            <p className="text-xs text-forge-muted mt-0.5 truncate">{s.topic}</p>
                          </div>
                          <span className="text-xs capitalize text-forge-muted bg-forge-void/80 px-2.5 py-1 rounded-full border border-forge-border/60 shrink-0">
                            {s.difficulty}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs text-forge-muted">
                            <span>{percent}% complete</span>
                            <span>{s.stageCount} stages</span>
                          </div>
                          <div className="h-1.5 bg-forge-void rounded-full overflow-hidden border border-forge-border/40">
                            <div
                              className="h-full bg-forge-gold rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 pt-0.5">
                          <Button size="sm" onClick={() => handleContinue(s)} className="flex-1">
                            Continue →
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemove(s.id)}
                            className="w-8 px-0"
                            aria-label="Remove"
                          >
                            ✕
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </motion.section>
          )}

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <h2 className="text-forge-text font-semibold text-xs uppercase tracking-widest shrink-0">Starter Templates</h2>
                <div className="flex-1 h-px bg-forge-border/50" />
              </div>
              <Link href="/load">
                <Button variant="ghost" size="sm">Load custom JSON →</Button>
              </Link>
            </div>
            <TemplateBrowser />
          </motion.section>
        </div>
      </div>
    </GameLayout>
  )
}
