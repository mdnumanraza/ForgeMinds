'use client'
import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { Beat, ValidationWarning } from '../data/types'

interface BeatNodeData {
  beat: Beat
  warnings: ValidationWarning[]
  colourClass: string
  label: string
}

export const BeatNode = memo(function BeatNode({ data, selected }: NodeProps) {
  const { beat, warnings, colourClass, label } = data as unknown as BeatNodeData
  const hasError = warnings.some(w => w.severity === 'error')
  const hasWarning = warnings.some(w => w.severity === 'warning')

  return (
    <div
      className={`
        rounded-lg border-2 min-w-[200px] cursor-pointer transition-all
        ${selected ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-900' : ''}
        ${hasError ? 'border-red-400' : hasWarning ? 'border-yellow-400' : 'border-transparent'}
        bg-gray-800
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-500" />

      {/* Beat type header */}
      <div className={`${colourClass} px-3 py-1.5 rounded-t-lg flex items-center justify-between`}>
        <span className="text-white text-xs font-bold uppercase tracking-wider">{label}</span>
        <span className="text-white/60 text-xs">#{beat.position}</span>
      </div>

      {/* Payload title */}
      <div className="px-3 py-2">
        <p className="text-white text-sm font-medium leading-snug">{beat.payload.title}</p>
        {beat.payload.conceptRef && (
          <p className="text-blue-400 text-xs mt-1 font-mono truncate">{beat.payload.conceptRef}</p>
        )}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="px-3 pb-2 space-y-1">
          {warnings.map((w, i) => (
            <div
              key={i}
              className={`text-xs px-2 py-1 rounded flex items-start gap-1 ${
                w.severity === 'error' ? 'bg-red-900/60 text-red-300' : 'bg-yellow-900/60 text-yellow-300'
              }`}
            >
              <span>{w.severity === 'error' ? '✕' : '⚠'}</span>
              <span>{w.message}</span>
            </div>
          ))}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-gray-500" />
    </div>
  )
})
