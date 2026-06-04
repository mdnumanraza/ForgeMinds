'use client'
import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { Campaign, Stage } from '../data/types'
import { campaignToFlow, validateStage } from '../data/adapter'
import { CampaignNode } from '../nodes/CampaignNode'
import { ActNode } from '../nodes/ActNode'
import { StageNode } from '../nodes/StageNode'

const NODE_TYPES: NodeTypes = {
  campaign: CampaignNode as any,
  act: ActNode as any,
  stage: StageNode as any,
}

interface Props {
  campaign: Campaign
  onStageSelect: (stage: Stage) => void
}

export function CampaignView({ campaign, onStageSelect }: Props) {
  const allWarnings = useMemo(
    () => campaign.acts.flatMap(act => act.stages.flatMap(s => validateStage(s))),
    [campaign]
  )

  const { nodes: initNodes, edges: initEdges } = useMemo(
    () => campaignToFlow(campaign, allWarnings),
    [campaign, allWarnings]
  )

  const [nodes, , onNodesChange] = useNodesState(initNodes)
  const [edges, , onEdgesChange] = useEdgesState(initEdges)

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: any) => {
      if (node.type === 'stage') {
        const stage = campaign.acts
          .flatMap(a => a.stages)
          .find(s => s.id === node.id)
        if (stage) onStageSelect(stage)
      }
    },
    [campaign, onStageSelect]
  )

  const totalWarnings = allWarnings.length
  const totalErrors = allWarnings.filter(w => w.severity === 'error').length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2 bg-gray-900 border-b border-gray-700 shrink-0">
        <span className="text-white font-semibold">{campaign.title}</span>
        <span className="text-gray-500 text-sm">Campaign Overview</span>
        <span className="text-gray-600 text-xs ml-1">
          {campaign.acts.length} acts · {campaign.acts.flatMap(a => a.stages).length} stages
        </span>
        {totalWarnings > 0 && (
          <span className="ml-auto text-xs text-yellow-400 bg-yellow-900/40 px-2 py-0.5 rounded">
            {totalErrors > 0
              ? `✕ ${totalErrors} errors · ⚠ ${totalWarnings - totalErrors} warnings`
              : `⚠ ${totalWarnings} warnings`}
          </span>
        )}
        <span className="text-gray-500 text-xs ml-2">Click a stage to open →</span>
      </div>

      {/* Flow canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          className="bg-gray-950"
        >
          <Background color="#374151" gap={20} />
          <Controls className="!bg-gray-800 !border-gray-700" />
        </ReactFlow>
      </div>
    </div>
  )
}
