import * as Phaser from 'phaser'
import type { Enemy } from '../../content/schemas/world.schema'

const ENEMY_COLOR = 0xff4444
const ROAM_SPEED = 60
const CHASE_SPEED = 100
const DETECTION_RANGE = 120
const ENCOUNTER_RANGE = 24
const COOLDOWN_MS = 3000

type EnemyState = 'roam' | 'chase' | 'cooldown'

export class EnemyEntity extends Phaser.Physics.Arcade.Sprite {
  readonly enemyId: string
  readonly enemyName: string
  readonly linkedChallengeId: string | undefined
  private aiState: EnemyState = 'roam'
  private roamTarget: Phaser.Math.Vector2
  private readonly spawnPoint: Phaser.Math.Vector2
  private readonly roamRadius: number
  private cooldownTimer = 0
  private defeated = false

  constructor(scene: Phaser.Scene, enemy: Enemy) {
    const x = enemy.spawnZone ? 200 : 300 // fallback positions; WorldScene overrides
    super(scene, x, x, 'enemy')
    this.enemyId = enemy.id
    this.enemyName = enemy.name
    this.linkedChallengeId = enemy.linkedChallengeId
    this.roamRadius = enemy.roamRadius ?? 80

    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.setCollideWorldBounds(true).setDepth(9)

    if (!scene.textures.exists('enemy')) {
      const g = scene.make.graphics()
      g.fillStyle(ENEMY_COLOR)
      g.fillRect(0, 0, 16, 16)
      g.generateTexture('enemy', 16, 16)
      g.destroy()
    }
    this.setTexture('enemy')

    this.spawnPoint = new Phaser.Math.Vector2(x, x)
    this.roamTarget = this.pickRoamTarget()
  }

  setSpawnPosition(x: number, y: number) {
    this.setPosition(x, y)
    this.spawnPoint.set(x, y)
    this.roamTarget = this.pickRoamTarget()
  }

  private pickRoamTarget(): Phaser.Math.Vector2 {
    const angle = Math.random() * Math.PI * 2
    const dist = Math.random() * this.roamRadius
    return new Phaser.Math.Vector2(
      this.spawnPoint.x + Math.cos(angle) * dist,
      this.spawnPoint.y + Math.sin(angle) * dist
    )
  }

  get isDefeated() {
    return this.defeated
  }

  defeat() {
    this.defeated = true
    this.setVelocity(0, 0)
    this.setAlpha(0)
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 300,
      onComplete: () => this.destroy(),
    })
  }

  startCooldown() {
    this.aiState = 'cooldown'
    this.cooldownTimer = COOLDOWN_MS
    this.setVelocity(0, 0)
  }

  update(delta: number, playerX: number, playerY: number) {
    if (this.defeated) return

    if (this.aiState === 'cooldown') {
      this.cooldownTimer -= delta
      if (this.cooldownTimer <= 0) this.aiState = 'roam'
      this.setVelocity(0, 0)
      return
    }

    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY)

    if (this.aiState === 'roam') {
      if (distToPlayer < DETECTION_RANGE) {
        this.aiState = 'chase'
      } else {
        const distToTarget = Phaser.Math.Distance.Between(this.x, this.y, this.roamTarget.x, this.roamTarget.y)
        if (distToTarget < 8) {
          this.roamTarget = this.pickRoamTarget()
        }
        this.scene.physics.moveToObject(this, { x: this.roamTarget.x, y: this.roamTarget.y }, ROAM_SPEED)
      }
    } else if (this.aiState === 'chase') {
      if (distToPlayer > DETECTION_RANGE * 1.5) {
        this.aiState = 'roam'
      } else {
        this.scene.physics.moveTo(this, playerX, playerY, CHASE_SPEED)
      }
    }
  }

  get isInEncounterRange() {
    return !this.defeated && this.aiState === 'chase'
  }

  get encounterRadius() {
    return ENCOUNTER_RANGE
  }
}
