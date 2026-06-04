'use client'
import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { Campaign, Stage, Beat } from '../data/types'
import { stageToFlow } from '../data/adapter'
import { validateStage } from '../validation/rules'
import { BeatNode } from '../nodes/BeatNode'
import { StageWarningsNode } from '../nodes/StageWarningsNode'
import { BeatDetailPanel } from '../panels/BeatDetailPanel'

const NODE_TYPES: NodeTypes = {
  beat: BeatNode as any,
  stageWarnings: StageWarningsNode as any,
}

interface Props {
  campaign: Campaign
  stage: Stage
  selectedBeatId: string | null
  onBeatSelect: (beat: Beat | null) => void
  onBack: () => void
}

export function StageView({ campaign, stage, selectedBeatId, onBeatSelect, onBack }: Props) {
  const warnings = useMemo(() => validateStage(stage), [stage])
  const { nodes: initNodes, edges: initEdges } = useMemo(
    () => stageToFlow(stage, warnings),
    [stage, warnings]
  )

  const [nodes, , onNodesChange] = useNodesState(initNodes)
  const [edges, , onEdgesChange] = useEdgesState(initEdges)

  const selectedBeat = useMemo(
    () => stage.beats.find(b => b.id === selectedBeatId) ?? null,
    [stage.beats, selectedBeatId]
  )

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: any) => {
      if (node.type === 'beat') {
        const beat = stage.beats.find(b => b.id === node.id) ?? null
        onBeatSelect(beat)
      }
    },
    [stage.beats, onBeatSelect]
  )

  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-b border-gray-700 shrink-0">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          ← {campaign.title}
        </button>
        <span className="text-gray-600">/</span>
        <span className="text-white text-sm font-medium">{stage.title}</span>
        <span className="text-gray-500 text-xs ml-2 font-mono">{stage.conceptRef}</span>
        {warnings.length > 0 && (
          <span className="ml-auto text-xs text-yellow-400 bg-yellow-900/40 px-2 py-0.5 rounded">
            {warnings.filter(w => w.severity === 'error').length > 0
              ? `✕ ${warnings.filter(w => w.severity === 'error').length} errors`
              : `⚠ ${warnings.length} warnings`}
          </span>
        )}
      </div>

      {/* Flow canvas + detail panel */}
      <div className="flex-1 relative overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onPaneClick={() => onBeatSelect(null)}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          className="bg-gray-950"
        >
          <Background color="#374151" gap={20} />
          <Controls className="!bg-gray-800 !border-gray-700" />
          <MiniMap
            className="!bg-gray-900 !border-gray-700"
            nodeColor={(node) => {
              if (node.type === 'beat') {
                const beat = stage.beats.find(b => b.id === node.id)
                return beat ? '#4b5563' : '#374151'
              }
              return '#374151'
            }}
          />
        </ReactFlow>

        {selectedBeat && (
          <BeatDetailPanel beat={selectedBeat} onClose={() => onBeatSelect(null)} />
        )}
      </div>
    </div>
  )
}
