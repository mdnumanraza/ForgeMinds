import * as Phaser from 'phaser'
import { phaserBridge } from '../EventBridge'

interface BossSceneData {
  stageId: string
  bossName: string
  introText: string
}

export class BossScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BossScene' })
  }

  init(data: BossSceneData) {
    const { stageId, bossName, introText } = data
    // Brief dark intro screen then emit to React layer
    this.time.delayedCall(800, () => {
      phaserBridge.emit('bossIntroReady', { stageId, bossName, introText })
    })
  }

  create() {
    const { width, height } = this.scale
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0010)
    this.add.text(width / 2, height / 2 - 20, '⚔ BOSS ENCOUNTER ⚔', {
      fontSize: '16px',
      color: '#ff4444',
    }).setOrigin(0.5)
  }
}
