import * as Phaser from 'phaser'
import type { PlayerEntity } from '../entities/PlayerEntity'
import type { EnemyEntity } from '../entities/EnemyEntity'
import { phaserBridge } from '../EventBridge'
import type { World } from '../../content/schemas/world.schema'

const OVERLAP_RANGE = 20

export class EncounterSystem {
  private scene: Phaser.Scene
  private player: PlayerEntity
  private enemies: EnemyEntity[]
  private world: World
  private activeEncounter: string | null = null

  constructor(scene: Phaser.Scene, player: PlayerEntity, enemies: EnemyEntity[], world: World) {
    this.scene = scene
    this.player = player
    this.enemies = enemies
    this.world = world
  }

  update(delta: number) {
    for (const enemy of this.enemies) {
      if (enemy.isDefeated) continue

      enemy.update(delta, this.player.x, this.player.y)

      if (this.activeEncounter) continue

      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y)
      if (dist <= OVERLAP_RANGE) {
        this.triggerEncounter(enemy)
      }
    }
  }

  private triggerEncounter(enemy: EnemyEntity) {
    this.activeEncounter = enemy.enemyId
    this.player.freeze()
    enemy.startCooldown()

    // Find challenge for this enemy
    const worldEnemy = this.world.enemies.find((e) => e.id === enemy.enemyId)
    const challengeId = enemy.linkedChallengeId ?? worldEnemy?.encounterStages?.[0] ?? ''

    phaserBridge.emit('battleStart', {
      enemyId: enemy.enemyId,
      challengeId,
      enemyName: enemy.enemyName,
    })
  }

  resolveEncounter(enemyId: string, won: boolean, xpReward: number, coinReward: number) {
    this.activeEncounter = null
    this.player.unfreeze()

    if (won) {
      const enemy = this.enemies.find((e) => e.enemyId === enemyId)
      enemy?.defeat()
      phaserBridge.emit('battleWon', { enemyId, xpReward, coinReward })
    } else {
      phaserBridge.emit('battleFled', { enemyId })
    }
  }

  get hasActiveEncounter() {
    return this.activeEncounter !== null
  }
}
