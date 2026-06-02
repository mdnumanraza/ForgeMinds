'use client'

import { motion } from 'framer-motion'
import type { Quest } from '@/engine/content/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface QuestPanelProps {
  quest: Quest
  answer: string
  onAnswerChange: (v: string) => void
  onSubmit: () => void
  submitting?: boolean
  feedback?: string | null
  passed?: boolean
}

export function QuestPanel({
  quest,
  answer,
  onAnswerChange,
  onSubmit,
  submitting,
  feedback,
  passed,
}: QuestPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      <div>
        <p className="text-xs text-forge-muted uppercase tracking-wider mb-1">Quest</p>
        <h3 className="font-display text-forge-gold text-lg">{quest.title}</h3>
        <p className="text-sm text-forge-text mt-1">{quest.objective}</p>
      </div>

      {quest.hints.length > 0 && (
        <details className="text-xs text-forge-muted">
          <summary className="cursor-pointer hover:text-forge-text">Show hint</summary>
          <p className="mt-1 pl-2 border-l border-forge-border text-forge-frost">{quest.hints[0]}</p>
        </details>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-forge-muted uppercase tracking-wider">
          {quest.type === 'code-task' ? 'Your Code' : 'Your Answer'}
        </label>
        <textarea
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          rows={quest.type === 'code-task' ? 8 : 4}
          spellCheck={false}
          placeholder={quest.type === 'code-task' ? '// Write your code here…' : 'Your answer…'}
          className="w-full bg-forge-void border border-forge-border rounded-lg px-4 py-3 text-sm font-mono text-forge-text resize-none focus:outline-none focus:ring-1 focus:ring-forge-gold/50 placeholder:text-forge-muted/40"
        />
      </div>

      {feedback && (
        <Card className={passed ? 'border-forge-success/40 bg-forge-success/10' : 'border-forge-danger/40 bg-forge-danger/10'}>
          <p className={`text-sm font-medium ${passed ? 'text-forge-success' : 'text-forge-danger'}`}>
            {passed ? '✓' : '✗'} {feedback}
          </p>
        </Card>
      )}

      <Button onClick={onSubmit} loading={submitting} disabled={!answer.trim()}>
        Submit Answer
      </Button>
    </motion.div>
  )
}
