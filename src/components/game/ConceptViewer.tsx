'use client'

import { motion } from 'framer-motion'
import type { KnowledgeStage, ConceptChunk } from '@/engine/content/types'
import { Button } from '@/components/ui/Button'

interface ConceptViewerProps {
  stage: KnowledgeStage
  onContinue: () => void
}

function ChunkBlock({ chunk }: { chunk: ConceptChunk }) {
  if (chunk.type === 'code') {
    return (
      <div className="bg-forge-void border border-forge-border rounded-lg overflow-hidden">
        {chunk.language && (
          <div className="px-3 py-1 text-xs text-forge-muted bg-forge-surface border-b border-forge-border">
            {chunk.language}
          </div>
        )}
        <pre className="px-4 py-3 text-xs font-mono text-forge-frost overflow-x-auto leading-relaxed">
          {chunk.code}
        </pre>
      </div>
    )
  }
  return <p className="text-sm text-forge-text leading-relaxed">{chunk.text}</p>
}

export function ConceptViewer({ stage, onContinue }: ConceptViewerProps) {
  const { concept } = stage
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5"
    >
      <div>
        <p className="text-xs text-forge-muted uppercase tracking-wider mb-1">Concept</p>
        <h3 className="font-display text-forge-gold text-xl">{concept.title}</h3>
        {concept.learningObjective && (
          <p className="text-xs text-forge-muted mt-1">{concept.learningObjective}</p>
        )}
      </div>

      <div className="space-y-4">
        {concept.chunks.map((chunk, i) => (
          <ChunkBlock key={i} chunk={chunk} />
        ))}
      </div>

      <button
        onClick={onContinue}
        className="mt-2 w-full bg-forge-surface border border-forge-border hover:border-forge-gold hover:text-forge-gold text-forge-text rounded-xl py-3 text-sm font-medium transition-all"
      >
        I understand — give me the quest →
      </button>
    </motion.div>
  )
}
