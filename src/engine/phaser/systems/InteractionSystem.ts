import * as Phaser from 'phaser'
import type { PlayerEntity } from '../entities/PlayerEntity'
import type { NPCEntity } from '../entities/NPCEntity'
import type { InteractableObject } from '../entities/InteractableObject'
import type { Knowledge } from '../../content/schemas/knowledge.schema'

const INTERACTION_RANGE = 40

export class InteractionSystem {
  private scene: Phaser.Scene
  private player: PlayerEntity
  private npcs: NPCEntity[]
  private interactables: InteractableObject[]
  private knowledge: Knowledge
  private eKey!: Phaser.Input.Keyboard.Key
  private indicatorText!: Phaser.GameObjects.Text
  private activeNPC: NPCEntity | null = null
  private activeInteractable: InteractableObject | null = null

  constructor(
    scene: Phaser.Scene,
    player: PlayerEntity,
    npcs: NPCEntity[],
    interactables: InteractableObject[],
    knowledge: Knowledge
  ) {
    this.scene = scene
    this.player = player
    this.npcs = npcs
    this.interactables = interactables
    this.knowledge = knowledge

    this.eKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E)
    this.indicatorText = scene.add
      .text(0, 0, '[E]', {
        fontSize: '10px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 3, y: 2 },
      })
      .setDepth(20)
      .setVisible(false)
  }

  update() {
    this.activeNPC = null
    this.activeInteractable = null

    // Check NPCs
    for (const npc of this.npcs) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y)
      if (dist <= INTERACTION_RANGE) {
        this.activeNPC = npc
        break
      }
    }

    // Check interactables
    if (!this.activeNPC) {
      for (const obj of this.interactables) {
        if (obj.isCollected) continue
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, obj.x, obj.y)
        if (dist <= INTERACTION_RANGE) {
          this.activeInteractable = obj
          break
        }
      }
    }

    const hasTarget = this.activeNPC || this.activeInteractable
    if (hasTarget) {
      const target = (this.activeNPC ?? this.activeInteractable)!
      this.indicatorText.setPosition(target.x - 10, target.y - 28).setVisible(true)
    } else {
      this.indicatorText.setVisible(false)
    }

    // Handle E keypress
    if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
      if (this.activeNPC) {
        this.activeNPC.interact()
      } else if (this.activeInteractable) {
        this.triggerInteractable(this.activeInteractable)
      }
    }
  }

  private triggerInteractable(obj: InteractableObject) {
    const discovery = this.knowledge.discoveries?.find(
      (d) => d.id === obj.linkedDiscoveryId
    )
    if (!discovery) return
    obj.collect(discovery.xpReward, discovery.coinReward, discovery.title)
  }

  destroy() {
    this.indicatorText.destroy()
  }
}
