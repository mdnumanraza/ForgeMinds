import * as Phaser from 'phaser'

export default class PreloaderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloaderScene' })
  }

  preload() {
    // Stage 2 assets loaded here in T-02+
    // For T-01: nothing to load
  }

  create() {
    this.scene.start('StageRuntimeScene')
  }
}
