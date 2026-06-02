import * as Phaser from 'phaser'
import type { Npc } from '../../content/schemas/world.schema'
import { phaserBridge } from '../EventBridge'

const NPC_COLOR = 0x00ffff

export class NPCEntity extends Phaser.Physics.Arcade.Sprite {
  readonly npcId: string
  readonly npcName: string
  readonly dialogLines: string[]
  private interactZone!: Phaser.GameObjects.Zone
  private bobTween!: Phaser.Tweens.Tween
  interactionAvailable = false

  constructor(scene: Phaser.Scene, npc: Npc) {
    super(scene, npc.position.x, npc.position.y, 'npc')
    this.npcId = npc.id
    this.npcName = npc.name
    this.dialogLines = npc.dialogLines

    scene.add.existing(this)
    scene.physics.add.existing(this, true) // static body

    if (!scene.textures.exists('npc')) {
      const g = scene.make.graphics()
      g.fillStyle(NPC_COLOR)
      g.fillRect(0, 0, 16, 16)
      g.generateTexture('npc', 16, 16)
      g.destroy()
    }
    this.setTexture('npc').setDepth(9)

    // idle bob tween
    this.bobTween = scene.tweens.add({
      targets: this,
      y: npc.position.y - 3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    // interaction zone (32px radius)
    this.interactZone = scene.add.zone(npc.position.x, npc.position.y, 64, 64)
    scene.physics.world.enable(this.interactZone)
  }

  get zone() {
    return this.interactZone
  }

  interact() {
    phaserBridge.emit('npcInteract', {
      npcId: this.npcId,
      name: this.npcName,
      lines: this.dialogLines,
    })
  }

  destroy(fromScene?: boolean) {
    this.bobTween?.stop()
    this.interactZone?.destroy()
    super.destroy(fromScene)
  }
}
