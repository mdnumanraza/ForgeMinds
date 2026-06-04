import * as Phaser from 'phaser'
import { podveilVillage } from '@/game/data/podveilVillage'
import type { StageData } from '@/game/data/StageData'

const PLAYER_SPEED = 200  // px/s
const PLAYER_SIZE = 24

export default class StageRuntimeScene extends Phaser.Scene {
  // Using Phaser arcade physics body on the player for collision
  private player!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody
  private obstacles!: Phaser.Physics.Arcade.StaticGroup
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: {
    up: Phaser.Input.Keyboard.Key
    down: Phaser.Input.Keyboard.Key
    left: Phaser.Input.Keyboard.Key
    right: Phaser.Input.Keyboard.Key
  }
  private debugText!: Phaser.GameObjects.Text
  private debugPhysicsKey!: Phaser.Input.Keyboard.Key
  private stage: StageData = podveilVillage  // future: injected via StageContext

  constructor() {
    super({ key: 'StageRuntimeScene' })
  }

  create() {
    const { width, height, backgroundColour, spawnPoint, obstacles, name } = this.stage

    // ── Background ────────────────────────────────────────────────────────────
    // Fill the world with the stage background colour
    this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      Phaser.Display.Color.HexStringToColor(backgroundColour).color
    )

    // Path — a dirt-coloured strip from south entrance to village centre
    this.add.rectangle(780, 700, 80, 500, 0x7a6040)   // vertical path
    this.add.rectangle(620, 560, 380, 60, 0x7a6040)   // horizontal cross-path

    // ── Obstacles (visual + physics bodies) ───────────────────────────────────
    this.obstacles = this.physics.add.staticGroup()

    for (const obs of obstacles) {
      // Visual rectangle
      const rect = this.add.rectangle(
        obs.x + obs.width / 2,
        obs.y + obs.height / 2,
        obs.width,
        obs.height,
        obs.colour
      )

      // Create a matching static body by wrapping the rectangle in a physics object
      // We use an invisible Image with a resized body for collision accuracy
      const body = this.physics.add
        .staticImage(obs.x + obs.width / 2, obs.y + obs.height / 2, '__DEFAULT')
        .setDisplaySize(obs.width, obs.height)
        .setVisible(false)     // visual is handled by the rectangle above
        .refreshBody()

      this.obstacles.add(body, true)

      // Align the visual rectangle depth
      rect.setDepth(1)
    }

    // Roof indicators on buildings (darker top strip so they read as buildings)
    this.add.rectangle(250, 707, 180, 14, 0x2a3a4a).setDepth(2)  // mira home roof
    this.add.rectangle(780, 187, 200, 14, 0x2a3a4a).setDepth(2)  // sera house roof
    this.add.rectangle(1260, 387, 160, 14, 0x3a2a1a).setDepth(2) // dorn workshop roof
    this.add.rectangle(370, 147, 140, 14, 0x222222).setDepth(2)  // burnt house roof
    this.add.rectangle(1175, 607, 150, 14, 0x2a3a4a).setDepth(2) // east house roof
    this.add.rectangle(1325, 907, 90,  14, 0x3a2a1a).setDepth(2) // shed roof

    // ── Player (physics-enabled) ───────────────────────────────────────────────
    // Use a generated texture for the physics image
    const gfx = this.make.graphics({ x: 0, y: 0 })
    gfx.fillStyle(0xffffff)
    gfx.fillRect(0, 0, PLAYER_SIZE, PLAYER_SIZE)
    gfx.fillStyle(0x00d4aa)
    gfx.fillRect(9, 2, 6, 6)  // direction dot (top-centre)
    gfx.generateTexture('player-texture', PLAYER_SIZE, PLAYER_SIZE)
    gfx.destroy()

    this.player = this.physics.add.image(spawnPoint.x, spawnPoint.y, 'player-texture')
    this.player.setCollideWorldBounds(true)
    this.player.setDepth(10)
    this.player.setMaxVelocity(PLAYER_SPEED)

    // Tighten the collision body slightly for better feel
    this.player.body.setSize(PLAYER_SIZE - 4, PLAYER_SIZE - 4)

    // ── Collision ─────────────────────────────────────────────────────────────
    this.physics.add.collider(this.player, this.obstacles)

    // ── World bounds ──────────────────────────────────────────────────────────
    this.physics.world.setBounds(0, 0, width, height)

    // ── Input ─────────────────────────────────────────────────────────────────
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasd = {
      up:    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }

    // P key toggles physics debug visualisation
    this.debugPhysicsKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P)
    this.debugPhysicsKey.on('down', () => {
      this.physics.world.debugGraphic?.setVisible(
        !this.physics.world.debugGraphic?.visible
      )
    })

    // ── Camera ────────────────────────────────────────────────────────────────
    this.cameras.main.setBackgroundColor(backgroundColour)
    this.cameras.main.setBounds(0, 0, width, height)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)

    // ── Debug overlay ─────────────────────────────────────────────────────────
    this.debugText = this.add
      .text(8, 8, '', {
        fontSize: '12px',
        color: '#a0c4ff',
        backgroundColor: '#00000088',
        padding: { x: 6, y: 4 },
      })
      .setScrollFactor(0)
      .setDepth(100)
  }

  update() {
    // Zero velocity each frame — we'll set it based on input
    this.player.setVelocity(0)

    let vx = 0
    let vy = 0
    if (this.cursors.left.isDown  || this.wasd.left.isDown)  vx = -PLAYER_SPEED
    if (this.cursors.right.isDown || this.wasd.right.isDown) vx =  PLAYER_SPEED
    if (this.cursors.up.isDown    || this.wasd.up.isDown)    vy = -PLAYER_SPEED
    if (this.cursors.down.isDown  || this.wasd.down.isDown)  vy =  PLAYER_SPEED

    // Normalise diagonals
    if (vx !== 0 && vy !== 0) {
      vx *= Math.SQRT2 * 0.5
      vy *= Math.SQRT2 * 0.5
    }

    this.player.setVelocity(vx, vy)

    // Debug overlay
    const cam = this.cameras.main
    this.debugText.setText([
      `Stage: ${this.stage.name}`,
      `World: ${this.stage.width}×${this.stage.height}`,
      `FPS: ${Math.round(this.game.loop.actualFps)}`,
      `Player: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Camera: (${Math.round(cam.scrollX)}, ${Math.round(cam.scrollY)})`,
      `[P] toggle physics debug`,
    ])
  }
}
