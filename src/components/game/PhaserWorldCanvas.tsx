'use client'

import { useEffect, useRef } from 'react'
import type { World } from '@/engine/content/schemas/world.schema'
import type { Knowledge } from '@/engine/content/schemas/knowledge.schema'
import { PhaserApp } from '@/engine/phaser/PhaserApp'
import { phaserBridge } from '@/engine/phaser/EventBridge'

interface Props {
  world: World
  knowledge: Knowledge
  campaignId: string
}

export function PhaserWorldCanvas({ world, knowledge, campaignId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef(true)
  const launchedRef = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    activeRef.current = true
    launchedRef.current = false
    phaserBridge.clear()

    async function launch(width: number, height: number) {
      if (launchedRef.current || !activeRef.current) return
      launchedRef.current = true

      const { WorldScene } = await import('@/engine/phaser/scenes/WorldScene')
      const { BossScene } = await import('@/engine/phaser/scenes/BossScene')
      const { TransitionScene } = await import('@/engine/phaser/scenes/TransitionScene')

      if (!activeRef.current) return

      const game = await PhaserApp.init({ parent: container as HTMLElement, width, height }, [
        WorldScene,
        BossScene,
        TransitionScene,
      ])

      if (!activeRef.current) {
        PhaserApp.destroy()
        return
      }

      game.scene.start('WorldScene', { world, knowledge, campaignId })
    }

    // Use ResizeObserver so we only launch once the container has real pixel dimensions.
    // This prevents the WebGL "Incomplete Attachment" framebuffer error that occurs
    // when Phaser initialises into a 0×0 element during SSR hydration.
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) {
        ro.disconnect()
        launch(Math.floor(width), Math.floor(height))
      }
    })
    ro.observe(container)

    return () => {
      activeRef.current = false
      ro.disconnect()
      PhaserApp.destroy()
      phaserBridge.clear()
    }
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: '#1a1a2e' }}
    />
  )
}
