import * as Phaser from 'phaser'

const SPEED = 160

export class PlayerEntity extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: {
    up: Phaser.Input.Keyboard.Key
    down: Phaser.Input.Keyboard.Key
    left: Phaser.Input.Keyboard.Key
    right: Phaser.Input.Keyboard.Key
  }
  private frozen = false
  private facing: 'up' | 'down' | 'left' | 'right' = 'down'

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player')
    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setCollideWorldBounds(true)
    this.setDepth(10)

    // Draw placeholder colored rectangle as texture if no real sprite loaded
    if (!scene.textures.exists('player')) {
      const g = scene.make.graphics()
      g.fillStyle(0x44ff44)
      g.fillRect(0, 0, 16, 16)
      g.fillStyle(0x22cc22)
      g.fillRect(4, 0, 8, 6) // head indicator
      g.generateTexture('player', 16, 16)
      g.destroy()
      this.setTexture('player')
    }

    this.cursors = scene.input.keyboard!.createCursorKeys()
    this.wasd = {
      up: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }
  }

  freeze() {
    this.frozen = true
    this.setVelocity(0, 0)
  }

  unfreeze() {
    this.frozen = false
  }

  get facingDirection() {
    return this.facing
  }

  update() {
    if (this.frozen) {
      this.setVelocity(0, 0)
      return
    }

    const left = this.cursors.left.isDown || this.wasd.left.isDown
    const right = this.cursors.right.isDown || this.wasd.right.isDown
    const up = this.cursors.up.isDown || this.wasd.up.isDown
    const down = this.cursors.down.isDown || this.wasd.down.isDown

    let vx = 0
    let vy = 0

    if (left) { vx = -SPEED; this.facing = 'left' }
    else if (right) { vx = SPEED; this.facing = 'right' }

    if (up) { vy = -SPEED; this.facing = 'up' }
    else if (down) { vy = SPEED; this.facing = 'down' }

    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707
      vy *= 0.707
    }

    this.setVelocity(vx, vy)
  }
}
