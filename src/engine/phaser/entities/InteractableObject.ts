import * as Phaser from 'phaser'
import type { Interactable } from '../../content/schemas/world.schema'
import { phaserBridge } from '../EventBridge'

const TYPE_COLORS: Record<Interactable['type'], number> = {
  scroll: 0xffdd00,
  shrine: 0xcc44ff,
  chest: 0xff8800,
}

export class InteractableObject extends Phaser.Physics.Arcade.Sprite {
  readonly interactableId: string
  readonly linkedDiscoveryId: string
  readonly interactableType: Interactable['type']
  private glowTween!: Phaser.Tweens.Tween
  private collected = false

  constructor(scene: Phaser.Scene, interactable: Interactable) {
    super(scene, interactable.position.x, interactable.position.y, `interactable-${interactable.type}`)
    this.interactableId = interactable.id
    this.linkedDiscoveryId = interactable.linkedDiscoveryId
    this.interactableType = interactable.type

    scene.add.existing(this)
    scene.physics.add.existing(this, true) // static
    this.setDepth(8)

    const texKey = `interactable-${interactable.type}`
    if (!scene.textures.exists(texKey)) {
      const color = TYPE_COLORS[interactable.type]
      const g = scene.make.graphics()
      g.fillStyle(color)
      g.fillRect(0, 0, 16, 16)
      // Draw icon shape per type
      if (interactable.type === 'chest') {
        g.fillStyle(0xcc6600)
        g.fillRect(0, 7, 16, 9)
        g.fillStyle(0xffaa00)
        g.fillRect(6, 5, 4, 4)
      } else if (interactable.type === 'shrine') {
        g.fillStyle(0x8800cc)
        g.fillTriangle(8, 0, 0, 16, 16, 16)
      }
      g.generateTexture(texKey, 16, 16)
      g.destroy()
    }
    this.setTexture(texKey)

    // glow pulse tween
    this.glowTween = scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  }

  collect(xpReward: number, coinReward: number, title: string) {
    if (this.collected) return
    this.collected = true
    this.glowTween?.stop()
    phaserBridge.emit('discoveryFound', {
      discoveryId: this.linkedDiscoveryId,
      xpReward,
      coinReward,
      title,
    })
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      y: this.y - 20,
      duration: 400,
      onComplete: () => this.setVisible(false),
    })
  }

  get isCollected() {
    return this.collected
  }

  destroy(fromScene?: boolean) {
    this.glowTween?.stop()
    super.destroy(fromScene)
  }
}
