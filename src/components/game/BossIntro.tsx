'use client'

import { motion } from 'framer-motion'
import type { KnowledgeStage, StageDefinition } from '@/engine/content/types'
import { Button } from '@/components/ui/Button'

interface BossIntroProps {
  stageDef: StageDefinition
  knowledgeStage: KnowledgeStage
  onBegin: () => void
}

export function BossIntro({ stageDef, knowledgeStage, onBegin }: BossIntroProps) {
  const boss = stageDef.boss

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 py-8 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="w-24 h-24 rounded-full bg-forge-danger/20 border-2 border-forge-danger flex items-center justify-center text-5xl"
      >
        👾
      </motion.div>

      <div>
        <p className="text-xs text-forge-danger uppercase tracking-widest mb-1">Boss Encounter</p>
        <h2 className="font-display text-forge-gold text-2xl">{boss.name}</h2>
        <p className="text-sm text-forge-muted mt-2 max-w-sm">{boss.introText}</p>
      </div>

      <div className="bg-forge-surface border border-forge-border rounded-xl p-4 max-w-sm w-full">
        <p className="text-xs text-forge-muted uppercase tracking-wider mb-1">Objective</p>
        <p className="text-sm text-forge-text">{knowledgeStage.bossObjective.description}</p>
      </div>

      <Button size="lg" onClick={onBegin} className="px-10">
        Begin Boss Fight →
      </Button>
    </motion.div>
  )
}
