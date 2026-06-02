'use client'

import { useEffect, useRef } from 'react'
import { initPixiApp, destroyPixiApp, resizePixiApp, replaceScene, eventBus } from '@/engine/game'
import { WorldMapScene } from '@/engine/game/scenes/WorldMapScene'
import { useProgressStore } from '@/store/progressStore'
import type { Campaign } from '@/engine/content/types'

interface WorldMapCanvasProps {
  campaign: Campaign
  onStageSelect: (stageId: string) => void
}

export function WorldMapCanvas({ campaign, onStageSelect }: WorldMapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<WorldMapScene | null>(null)
  const { getStageStatus } = useProgressStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let cancelled = false
    initPixiApp(canvas).then((app) => {
      if (cancelled) return
      const scene = new WorldMapScene(campaign, (stageId) =>
        getStageStatus(campaign.id, stageId)
      )
      sceneRef.current = scene
      replaceScene(scene)
    })

    const unsubStage = eventBus.on('stageSelected', ({ stageId }) => {
      onStageSelect(stageId)
    })

    return () => {
      cancelled = true
      unsubStage()
      destroyPixiApp()
      sceneRef.current = null
    }
  }, [campaign.id])

  // Rebuild when stage statuses change
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.rebuild((stageId) => getStageStatus(campaign.id, stageId))
    }
  })

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      resizePixiApp(canvas.clientWidth, canvas.clientHeight)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      style={{ touchAction: 'none' }}
    />
  )
}
