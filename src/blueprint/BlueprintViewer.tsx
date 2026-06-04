'use client'
import { useState } from 'react'
import type { Campaign, Stage, Beat } from './data/types'
import { CampaignView } from './views/CampaignView'
import { StageView } from './views/StageView'

type ViewMode = 'campaign' | 'stage'

interface Props {
  campaign: Campaign
  // FUTURE: onEdit, onExport, onImport, aiGenerateStage — extension points
}

export function BlueprintViewer({ campaign }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('campaign')
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null)
  const [selectedBeatId, setSelectedBeatId] = useState<string | null>(null)

  const handleStageSelect = (stage: Stage) => {
    setSelectedStage(stage)
    setSelectedBeatId(null)
    setViewMode('stage')
  }

  const handleBeatSelect = (beat: Beat | null) => {
    setSelectedBeatId(beat?.id ?? null)
  }

  const handleBack = () => {
    setViewMode('campaign')
    setSelectedStage(null)
    setSelectedBeatId(null)
  }

  return (
    <div className="h-screen w-screen bg-gray-950 text-white flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 h-10 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="text-sm font-bold text-white">ForgeMinds Blueprint</span>
        </div>
        <span className="text-gray-600 text-xs">— read-only visualisation</span>

        {/* View toggle */}
        <div className="ml-auto flex gap-1">
          <button
            onClick={() => viewMode === 'stage' && handleBack()}
            className={`text-xs px-3 py-1 rounded transition-colors ${
              viewMode === 'campaign'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Campaign
          </button>
          {selectedStage && (
            <button
              className={`text-xs px-3 py-1 rounded transition-colors ${
                viewMode === 'stage'
                  ? 'bg-emerald-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {selectedStage.title}
            </button>
          )}
        </div>
      </header>

      {/* Main view */}
      <main className="flex-1 overflow-hidden">
        {viewMode === 'campaign' && (
          <CampaignView campaign={campaign} onStageSelect={handleStageSelect} />
        )}
        {viewMode === 'stage' && selectedStage && (
          <StageView
            campaign={campaign}
            stage={selectedStage}
            selectedBeatId={selectedBeatId}
            onBeatSelect={handleBeatSelect}
            onBack={handleBack}
          />
        )}
      </main>
    </div>
  )
}
