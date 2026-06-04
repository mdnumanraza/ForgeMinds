'use client'
import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { Campaign } from '../data/types'

export const CampaignNode = memo(function CampaignNode({ data }: NodeProps) {
  const { campaign } = data as { campaign: Campaign }
  return (
    <div className="bg-gray-900 border-2 border-indigo-500 rounded-xl px-4 py-3 min-w-[180px]">
      <p className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">Campaign</p>
      <p className="text-white font-semibold">{campaign.title}</p>
      <p className="text-gray-400 text-xs">{campaign.domain}</p>
      <Handle type="source" position={Position.Right} className="!bg-indigo-500" />
    </div>
  )
})
