import * as Phaser from 'phaser'
import type { World } from '../../content/schemas/world.schema'
import type { Knowledge } from '../../content/schemas/knowledge.schema'
import { PlayerEntity } from '../entities/PlayerEntity'
import { NPCEntity } from '../entities/NPCEntity'
import { EnemyEntity } from '../entities/EnemyEntity'
import { InteractableObject } from '../entities/InteractableObject'
import { InteractionSystem } from '../systems/InteractionSystem'
import { EncounterSystem } from '../systems/EncounterSystem'
import { phaserBridge } from '../EventBridge'

interface WorldSceneData {
  world: World
  knowledge: Knowledge
  campaignId: string
  zoneId?: string
}

const TILE = 16
const COLS = 50
const ROWS = 38

// Tile indices for procedural world
const T_GRASS = 0
const T_WALL = 1
const T_PATH = 2
const T_WATER = 3
const T_ZONE_ENTRANCE = 4

export class WorldScene extends Phaser.Scene {
  private world!: World
  private knowledge!: Knowledge
  private campaignId!: string
  private player!: PlayerEntity
  private npcs: NPCEntity[] = []
  private enemies: EnemyEntity[] = []
  private interactables: InteractableObject[] = []
  private interactionSystem!: InteractionSystem
  private encounterSystem!: EncounterSystem
  private groundLayer!: Phaser.GameObjects.Graphics

  constructor() {
    super({ key: 'WorldScene' })
  }

  init(data: WorldSceneData) {
    this.world = data.world
    this.knowledge = data.knowledge
    this.campaignId = data.campaignId
  }

  preload() {
    // Assets are procedurally generated — no external loads needed for Phase 1.5
  }

  create() {
    const tilemap = this.world.tilemap

    if (tilemap?.tilemapPath) {
      this.createTiledWorld(tilemap.tilemapPath, tilemap.tilesetPath, tilemap.tilesetKey)
    } else {
      this.createProceduralWorld()
    }

    const spawn = tilemap?.spawnPoint ?? { x: COLS * TILE * 0.4, y: ROWS * TILE * 0.4 }
    this.player = new PlayerEntity(this, spawn.x, spawn.y)

    this.spawnNPCs()
    this.spawnEnemies()
    this.spawnInteractables()

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
    this.cameras.main.setZoom(tilemap?.scale ?? 2)

    this.interactionSystem = new InteractionSystem(
      this, this.player, this.npcs, this.interactables, this.knowledge
    )
    this.encounterSystem = new EncounterSystem(
      this, this.player, this.enemies, this.world
    )

    phaserBridge.emit('mapReady', undefined as void)
  }

  update(_time: number, delta: number) {
    this.player.update()
    this.interactionSystem.update()
    this.encounterSystem.update(delta)
  }

  resolveEncounter(enemyId: string, won: boolean, xpReward: number, coinReward: number) {
    this.encounterSystem.resolveEncounter(enemyId, won, xpReward, coinReward)
  }

  private createProceduralWorld() {
    const worldW = COLS * TILE
    const worldH = ROWS * TILE

    const g = this.add.graphics()
    this.groundLayer = g
    g.setDepth(0)

    // Base grass
    g.fillStyle(0x2d5a27)
    g.fillRect(0, 0, worldW, worldH)

    // Random grass variation patches
    for (let i = 0; i < 200; i++) {
      const x = Math.floor(Math.random() * COLS) * TILE
      const y = Math.floor(Math.random() * ROWS) * TILE
      g.fillStyle(0x3a6e32, 0.6)
      g.fillRect(x, y, TILE, TILE)
    }

    // Stone path (horizontal + vertical cross)
    g.fillStyle(0x7a6a55)
    const midY = Math.floor(ROWS / 2) * TILE
    const midX = Math.floor(COLS / 2) * TILE
    g.fillRect(0, midY - TILE, worldW, TILE * 2)
    g.fillRect(midX - TILE, 0, TILE * 2, worldH)

    // Border walls
    g.fillStyle(0x2a2a3a)
    g.fillRect(0, 0, worldW, TILE * 2)
    g.fillRect(0, worldH - TILE * 2, worldW, TILE * 2)
    g.fillRect(0, 0, TILE * 2, worldH)
    g.fillRect(worldW - TILE * 2, 0, TILE * 2, worldH)

    // Zone entrance markers
    const zones = this.world.zones
    const zonePositions = this.getZonePositions(zones.length)
    for (let i = 0; i < zones.length; i++) {
      const pos = zonePositions[i]
      const zoneColors: number[] = [0x4444ff, 0xff4444, 0xffaa00, 0x00ffaa, 0xff00ff]
      g.fillStyle(zoneColors[i % zoneColors.length])
      g.fillRect(pos.x * TILE, pos.y * TILE, TILE * 3, TILE * 3)
      // Label
      this.add.text(pos.x * TILE + 4, pos.y * TILE - 14, zones[i].name, {
        fontSize: '6px',
        color: '#ffffff',
      }).setDepth(5)
    }

    this.physics.world.setBounds(0, 0, worldW, worldH)
    this.cameras.main.setBounds(0, 0, worldW, worldH)
  }

  private getZonePositions(count: number): { x: number; y: number }[] {
    const positions = [
      { x: 5, y: 5 },
      { x: COLS - 8, y: 5 },
      { x: 5, y: ROWS - 8 },
      { x: COLS - 8, y: ROWS - 8 },
      { x: Math.floor(COLS / 2) - 2, y: 4 },
    ]
    return positions.slice(0, count)
  }

  private createTiledWorld(tilemapPath: string, tilesetPath: string, tilesetKey: string) {
    // When real Tiled JSON assets are provided, load and render them
    const map = this.make.tilemap({ key: tilesetKey })
    const tileset = map.addTilesetImage(tilesetKey, tilesetPath)
    if (tileset) {
      map.createLayer('Ground', tileset, 0, 0)
      const wallLayer = map.createLayer('Walls', tileset, 0, 0)
      if (wallLayer) {
        wallLayer.setCollisionByProperty({ collides: true })
      }
      this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
      this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
    }
  }

  private spawnNPCs() {
    for (const npc of this.world.npcs) {
      const entity = new NPCEntity(this, npc)
      this.npcs.push(entity)
    }
  }

  private spawnEnemies() {
    const zonePositions = this.getZonePositions(this.world.zones.length)

    for (const enemy of this.world.enemies) {
      const count = enemy.spawnCount ?? 1
      for (let i = 0; i < count; i++) {
        const entity = new EnemyEntity(this, enemy)

        // Determine spawn position from zone or fallback to random
        let sx = COLS * TILE * 0.5
        let sy = ROWS * TILE * 0.5
        if (enemy.spawnZone) {
          const zoneIdx = this.world.zones.findIndex((z) => z.id === enemy.spawnZone)
          if (zoneIdx >= 0 && zonePositions[zoneIdx]) {
            const zp = zonePositions[zoneIdx]
            sx = (zp.x + 1 + Math.random() * 4) * TILE
            sy = (zp.y + 1 + Math.random() * 4) * TILE
          }
        } else {
          sx = (5 + Math.random() * (COLS - 10)) * TILE
          sy = (5 + Math.random() * (ROWS - 10)) * TILE
        }

        entity.setSpawnPosition(sx, sy)
        this.enemies.push(entity)
      }
    }
  }

  private spawnInteractables() {
    for (const interactable of this.world.interactables) {
      const obj = new InteractableObject(this, interactable)
      this.interactables.push(obj)
    }
  }

  shutdown() {
    this.interactionSystem?.destroy()
    this.npcs = []
    this.enemies = []
    this.interactables = []
    // Do NOT clear phaserBridge here — React layer owns its lifecycle
  }
}
