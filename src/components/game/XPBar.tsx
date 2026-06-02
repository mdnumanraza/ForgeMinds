'use client'

import { motion } from 'framer-motion'
import { usePlayerStore } from '@/store/playerStore'
import { formatXP } from '@/lib/utils'
import { LEVEL_THRESHOLDS } from '@/store/playerStore'

export function XPBar() {
  const { xp, level } = usePlayerStore()

  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const progress = nextThreshold > currentThreshold
    ? ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    : 100

  return (
    <div className="flex items-center gap-3 min-w-[160px]">
      <div className="text-forge-gold font-display text-sm font-bold whitespace-nowrap">
        Lv.{level}
      </div>
      <div className="flex-1 h-2 bg-forge-surface rounded-full overflow-hidden border border-forge-border">
        <motion.div
          className="h-full bg-forge-gold rounded-full"
          initial={false}
          animate={{ width: `${Math.min(100, progress)}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <div className="text-forge-muted text-xs whitespace-nowrap">{formatXP(xp)} XP</div>
    </div>
  )
}
