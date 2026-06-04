'use client'

import { useEffect, useRef } from 'react'
import type * as PhaserTypes from 'phaser'

export default function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<PhaserTypes.Game | null>(null)

  useEffect(() => {
    if (gameRef.current || !containerRef.current) return

    // All Phaser imports are dynamic — keeps Phaser out of the SSR bundle entirely.
    // Phaser's ESM build has no default export — everything is a named export.
    Promise.all([
      import('phaser'),
      import('@/game/scenes/BootScene'),
      import('@/game/scenes/PreloaderScene'),
      import('@/game/scenes/StageRuntimeScene'),
    ]).then(([Phaser, { default: BootScene }, { default: PreloaderScene }, { default: StageRuntimeScene }]) => {
      if (gameRef.current || !containerRef.current) return

      const config: PhaserTypes.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: containerRef.current,
        backgroundColor: '#1a1a2e',
        scene: [BootScene, PreloaderScene, StageRuntimeScene],
        physics: {
          default: 'arcade',
          arcade: { gravity: { x: 0, y: 0 }, debug: false },
        },
      }

      gameRef.current = new Phaser.Game(config)
    })

    return () => {
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [])

  return (
    <div
      ref={containerRef}
      id="phaser-canvas-container"
      style={{ width: '800px', height: '600px' }}
    />
  )
}
