import type * as PhaserType from 'phaser'

let gameInstance: PhaserType.Game | null = null

export interface PhaserAppOptions {
  parent: HTMLElement
  width: number
  height: number
}

export const PhaserApp = {
  async init(options: PhaserAppOptions, scenes: PhaserType.Types.Core.GameConfig['scene']) {
    PhaserApp.destroy()

    const Phaser = await import('phaser')

    const config: PhaserType.Types.Core.GameConfig = {
      // CANVAS avoids WebGL framebuffer errors on resize/zero-dimension mount
      type: Phaser.CANVAS,
      parent: options.parent,
      width: options.width,
      height: options.height,
      backgroundColor: '#1a1a2e',
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'arcade',
        arcade: { debug: false },
      },
      scene: scenes as PhaserType.Types.Core.GameConfig['scene'],
    }

    gameInstance = new Phaser.Game(config)
    return gameInstance
  },

  destroy() {
    if (gameInstance) {
      gameInstance.destroy(true)
      gameInstance = null
    }
  },

  get instance() {
    return gameInstance
  },
}
