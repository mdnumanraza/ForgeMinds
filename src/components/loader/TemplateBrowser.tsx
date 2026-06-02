'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TEMPLATE_METADATA, loadTemplate } from '@/engine/content/TemplateRegistry'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useUIStore } from '@/store/uiStore'
import { useGameStore } from '@/store/gameStore'
import { useProgressStore } from '@/store/progressStore'
import { saveRecentCampaign, getRecentCampaigns } from '@/lib/localStorage'
import { useRouter } from 'next/navigation'

const difficultyColor: Record<string, string> = {
  beginner: 'text-forge-success border-forge-success/40 bg-forge-success/5',
  intermediate: 'text-forge-gold border-forge-gold/40 bg-forge-gold/5',
  advanced: 'text-forge-ember border-forge-ember/40 bg-forge-ember/5',
}

export function TemplateBrowser() {
  const [loading, setLoading] = useState<string | null>(null)
  const [activeCampaignIds, setActiveCampaignIds] = useState<Set<string>>(() =>
    new Set(getRecentCampaigns().map((s) => s.id))
  )
  const router = useRouter()
  const { setActiveCampaign } = useGameStore()
  const { initCampaign } = useProgressStore()
  const { pushNotification, setLoadingCampaign } = useUIStore()

  useEffect(() => {
    const ids = new Set(getRecentCampaigns().map((s) => s.id))
    setActiveCampaignIds(ids)
  }, [])

  const handleLoad = async (templateId: string) => {
    setLoading(templateId)
    setLoadingCampaign(true)
    try {
      const campaign = await loadTemplate(templateId)
      if (!campaign) {
        pushNotification({ type: 'error', message: 'Failed to load template.' })
        return
      }
      setActiveCampaign(campaign)
      initCampaign(campaign.id, campaign.world.stages[0].id)
      saveRecentCampaign(campaign)
      setActiveCampaignIds(new Set(getRecentCampaigns().map((s) => s.id)))
      pushNotification({ type: 'info', message: `Campaign "${campaign.name}" loaded!` })
      router.push(`/world/${campaign.id}`)
    } finally {
      setLoading(null)
      setLoadingCampaign(false)
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {TEMPLATE_METADATA.map((tmpl, i) => {
        const isActive = activeCampaignIds.has(tmpl.id)
        return (
          <motion.div
            key={tmpl.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className="flex flex-col gap-4 h-full hover:border-forge-border/80 transition-colors group">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-display text-forge-gold text-sm font-semibold group-hover:text-[#f7d060] transition-colors">
                    {tmpl.name}
                  </p>
                  <p className="text-xs text-forge-muted mt-0.5">{tmpl.topic}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border capitalize shrink-0 ${difficultyColor[tmpl.difficulty] ?? 'text-forge-muted border-forge-border'}`}>
                  {tmpl.difficulty}
                </span>
              </div>

              <p className="text-xs text-forge-text/60 flex-1 leading-relaxed">{tmpl.description}</p>

              <div className="flex items-center justify-between pt-3 border-t border-forge-border/50">
                <div className="flex items-center gap-3 text-xs text-forge-muted">
                  <span>{tmpl.stageCount} stages</span>
                  <span className="text-forge-border">·</span>
                  <span>~{tmpl.estimatedHours}h</span>
                </div>
                <div className="relative group/btn">
                  <Button
                    size="sm"
                    onClick={() => handleLoad(tmpl.id)}
                    loading={loading === tmpl.id}
                    disabled={loading !== null || isActive}
                  >
                    {isActive ? 'In Progress' : 'Play'}
                  </Button>
                  {isActive && (
                    <span className="pointer-events-none absolute bottom-full right-0 mb-1.5 whitespace-nowrap rounded bg-forge-void border border-forge-border px-2 py-1 text-xs text-forge-muted opacity-0 group-hover/btn:opacity-100 transition-opacity">
                      Continue from the section above
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
