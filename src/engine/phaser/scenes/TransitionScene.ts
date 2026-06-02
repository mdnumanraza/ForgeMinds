import * as Phaser from 'phaser'

export class TransitionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TransitionScene' })
  }

  create(data: { onComplete?: () => void }) {
    const { width, height } = this.scale
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0)

    this.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 300,
      yoyo: true,
      hold: 200,
      onComplete: () => data.onComplete?.(),
    })
  }
}
