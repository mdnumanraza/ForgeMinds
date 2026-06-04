'use client'
import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { Act } from '../data/types'

export const ActNode = memo(function ActNode({ data }: NodeProps) {
  const { act } = data as { act: Act }
  return (
    <div className="bg-gray-800 border-2 border-violet-500 rounded-xl px-4 py-3 min-w-[180px]">
      <Handle type="target" position={Position.Left} className="!bg-violet-500" />
      <p className="text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">Act</p>
      <p className="text-white font-semibold text-sm leading-snug">{act.title}</p>
      <p className="text-gray-400 text-xs mt-1">{act.stages.length} stages</p>
      <Handle type="source" position={Position.Right} className="!bg-violet-500" />
    </div>
  )
})
