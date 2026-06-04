'use client'
import { memo } from 'react'
import type { NodeProps } from '@xyflow/react'
import type { ValidationWarning } from '../data/types'

export const StageWarningsNode = memo(function StageWarningsNode({ data }: NodeProps) {
  const { warnings } = data as { warnings: ValidationWarning[] }
  return (
    <div className="bg-gray-900 border border-yellow-700 rounded-lg px-3 py-2 min-w-[220px] max-w-[280px]">
      <p className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2">Stage Warnings</p>
      <div className="space-y-1">
        {warnings.map((w, i) => (
          <div
            key={i}
            className={`text-xs px-2 py-1 rounded flex items-start gap-1 ${
              w.severity === 'error' ? 'bg-red-900/60 text-red-300' : 'bg-yellow-900/60 text-yellow-300'
            }`}
          >
            <span className="shrink-0">{w.severity === 'error' ? '✕' : '⚠'}</span>
            <span>{w.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
})
