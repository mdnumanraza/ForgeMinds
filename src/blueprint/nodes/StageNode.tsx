'use client'
import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { Stage, ValidationWarning } from '../data/types'

export const StageNode = memo(function StageNode({ data, selected }: NodeProps) {
  const { stage, warnings } = data as { stage: Stage; warnings: ValidationWarning[] }
  const errorCount = warnings.filter(w => w.severity === 'error').length
  const warnCount = warnings.filter(w => w.severity === 'warning').length

  return (
    <div
      className={`
        bg-gray-800 border-2 rounded-xl px-4 py-3 min-w-[190px] cursor-pointer transition-all
        ${selected ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-900' : ''}
        ${errorCount > 0 ? 'border-red-400' : warnCount > 0 ? 'border-yellow-400' : 'border-emerald-500'}
      `}
    >
      <Handle type="target" position={Position.Left} className="!bg-gray-500" />
      <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">Stage</p>
      <p className="text-white font-semibold text-sm leading-snug">{stage.title}</p>
      <p className="text-gray-400 text-xs mt-1 font-mono">{stage.conceptRef}</p>
      <div className="flex gap-2 mt-2">
        <span className="text-gray-500 text-xs">{stage.beats.length} beats</span>
        {errorCount > 0 && <span className="text-red-400 text-xs">✕ {errorCount}</span>}
        {warnCount > 0 && <span className="text-yellow-400 text-xs">⚠ {warnCount}</span>}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-gray-500" />
    </div>
  )
})
