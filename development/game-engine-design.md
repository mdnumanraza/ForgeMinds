# Game Engine Design

> Architecture for the Phaser.js-based 2D RPG game layer.  
> Phase 1.5 replaces PixiJS with Phaser 3 to support tile-based world exploration, NPCs, enemies, and boss arenas.

---

## Philosophy: A Real RPG Engine

The game engine layer is responsible for making ForgeMinds feel like an **actual game** — not a quiz wrapper with a map background.

Players must:
- walk around a real tile-based world
- discover things organically
- encounter enemies and choose to fight
- talk to NPCs for hints and lore
- find treasure and knowledge fragments
- navigate into dungeons and caves

The engine is entirely **content-agnostic**. It renders any valid Campaign JSON into a playable world without knowing the topic is "Docker", "Kubernetes", or anything else.

---

## Technology: Phaser.js 3

| Choice | Rationale |
|---|---|
| Phaser.js 3 | Built-in tilemap, arcade physics, input, cameras, scene management, animation system. PixiJS is only a renderer — Phaser is a complete game engine. |
| Tiled JSON format | Industry-standard tilemap editor; Phaser reads `.tmj` Tiled JSON natively. Content creators can design worlds visually. |
| React DOM overlay | HUD, dialogue box, battle modal, inventory stay as React. No need for Phaser UI widgets. |
| No physics engine beyond Arcade | Phaser's Arcade physics handles tile collision and entity overlap detection. No Box2D needed for 2D RPG movement. |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  React DOM Overlay                                           │
│  XPBar  DialogueBox  BattleModal  InventoryPanel  HUD       │
├──────────────────────────────────────────────────────────────┤
│  Phaser Canvas (full-screen behind React overlay)            │
│  PhaserApp → SceneManager → WorldScene / BossScene           │
│  TilemapSystem  PlayerEntity  NPCEntity  EnemyEntity         │
│  InteractionSystem  DiscoverySystem  EncounterSystem         │
├──────────────────────────────────────────────────────────────┤
│  EventBus  (Phaser ↔ React communication)                    │
├──────────────────────────────────────────────────────────────┤
│  Zustand Stores (read-only from Phaser layer)                │
└──────────────────────────────────────────────────────────────┘
```

---

## PhaserApp Singleton

```typescript
// src/engine/phaser/PhaserApp.ts
class PhaserApp {
  private game: Phaser.Game | null = null

  init(parent: HTMLElement, width: number, height: number): void
  destroy(): void
  getScene<T extends Phaser.Scene>(key: string): T | undefined
  resize(width: number, height: number): void
}

export const phaserApp = new PhaserApp()
```

React mounts it:
```typescript
// WorldMap.tsx
useEffect(() => {
  phaserApp.init(containerRef.current!, width, height)
  return () => phaserApp.destroy()
}, [])
```

Phaser config:
```typescript
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,           // WebGL with Canvas fallback
  parent: containerElement,
  pixelArt: true,              // retro pixel art — no anti-aliasing
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scene: [WorldScene, BossScene, TransitionScene],
}
```

---

## Scene Hierarchy

### WorldScene (main exploration scene)

Entry point for all campaign gameplay. Loaded with:

```typescript
game.scene.start('WorldScene', {
  campaign: Campaign,
  zoneId: string | null,  // null = overworld, string = specific zone
})
```

Responsibilities:
- Load tilemap from `campaign.world.tilemap.tilemapPath`
- Create ground, decoration, collision layers
- Spawn `PlayerEntity` at spawn point
- Spawn all `NPCEntity` instances from `campaign.world.npcs[]`
- Spawn all `EnemyEntity` instances filtered to this zone
- Spawn all interactable objects from `campaign.world.interactables[]`
- Run `InteractionSystem` and `EncounterSystem` every frame
- Handle zone transition tiles → start `TransitionScene`

### BossScene

Loaded when player enters a boss arena zone.

```typescript
game.scene.start('BossScene', {
  campaign: Campaign,
  stageId: string,
})
```

- Loads boss arena tilemap
- Plays boss intro animation
- Emits `bossIntroComplete` → React opens `BossModal`
- On boss modal close: emits `bossResult` with score

### TransitionScene

Brief flash scene between zone loads. Handles camera fade + new scene start.

---

## PlayerEntity

```typescript
// src/engine/phaser/entities/PlayerEntity.ts
class PlayerEntity {
  private sprite: Phaser.GameObjects.Sprite
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd: Record<string, Phaser.Input.Keyboard.Key>
  private state: 'idle' | 'walking' | 'interacting' | 'battling'
  private facing: 'up' | 'down' | 'left' | 'right'

  update(delta: number): void      // called every frame by WorldScene
  freeze(): void                    // during dialogue / battle / transition
  unfreeze(): void
  moveTo(x: number, y: number): Promise<void>  // tween-animated movement
  setFacing(dir: Direction): void
}
```

### Movement

- 4-directional, tile-snapped movement
- Smooth tweened stepping (not instant grid teleport)
- 8px/frame walking speed (configurable via campaign JSON)
- Diagonal movement disabled (RPG standard)
- Sprite faces direction of movement

### Animation State Machine

```
IDLE_DOWN  ←→  WALK_DOWN
IDLE_UP    ←→  WALK_UP
IDLE_LEFT  ←→  WALK_LEFT
IDLE_RIGHT ←→  WALK_RIGHT
```

Fallback: if sprite key not found in asset registry, use `player-default` placeholder.

---

## NPCEntity

```typescript
class NPCEntity {
  private sprite: Phaser.GameObjects.Sprite
  private npcData: NpcDefinition
  private interactionZone: Phaser.GameObjects.Zone

  update(delta: number): void      // idle bob animation
  showInteractionIndicator(): void // "E" key bubble above head
  hideInteractionIndicator(): void
}
```

- Spawned from `world.json npcs[]` entries
- Position sourced from `npc.position` (Phase 1.5 schema extension)
- Optional patrol path: NPC walks between waypoints on idle
- Interaction zone: 32px radius around NPC
- When player enters zone: indicator appears; E key → emit `npcInteract`

---

## EnemyEntity

```typescript
class EnemyEntity {
  private sprite: Phaser.GameObjects.Sprite
  private enemyData: EnemyDefinition
  private state: 'patrol' | 'chase' | 'defeated'
  private homePosition: Phaser.Math.Vector2

  update(delta: number): void
  defeat(): void   // play defeat animation, then destroy
}
```

### Patrol FSM

```
PATROL: random walk within roamRadius
  ↓ player enters aggro range (64px)
CHASE: move toward player
  ↓ overlap with player
ENCOUNTER: freeze, emit battleStart
  ↓ battle won
DEFEATED: defeat animation, remove from scene
  ↓ battle lost / fled
PATROL: return to home position after 2s cooldown
```

---

## TilemapSystem

```typescript
// src/engine/phaser/systems/TilemapSystem.ts
class TilemapSystem {
  loadTilemap(scene: Phaser.Scene, tilemapData: TilemapConfig): TilemapResult
  registerColliders(
    scene: Phaser.Scene,
    player: PlayerEntity,
    enemyGroup: Phaser.GameObjects.Group,
    collisionLayer: Phaser.Tilemaps.TilemapLayer
  ): void
}

interface TilemapResult {
  map: Phaser.Tilemaps.Tilemap
  groundLayer: Phaser.Tilemaps.TilemapLayer
  collisionLayer: Phaser.Tilemaps.TilemapLayer
  decorationLayer: Phaser.Tilemaps.TilemapLayer | null
  transitionObjects: Phaser.Types.Tilemaps.TiledObject[]
  spawnPoint: { x: number; y: number }
}
```

Tiled map layer naming convention (must match):

| Layer Name | Purpose |
|---|---|
| `Ground` | Base ground tiles |
| `Decoration` | Trees, rocks, above-ground decorations |
| `Collision` | Invisible collision tiles (collidable=true property) |
| `Objects` | Object layer: spawn points, transition tiles, NPC positions |

---

## InteractionSystem

```typescript
class InteractionSystem {
  private scene: Phaser.Scene
  private player: PlayerEntity
  private interactables: Map<string, InteractableObject>

  update(): void  // checks proximity each frame
  // emits: npcInteract, discoveryFound, zoneTransition
}
```

- Uses distance check (not physics overlap) for soft interaction zones
- Only the closest interactable within range is highlighted
- E key (keyboard) or tap (mobile) triggers interaction
- Mobile: shows tap-to-interact button when near an object

---

## DiscoverySystem

```typescript
class DiscoverySystem {
  spawnInteractables(
    scene: Phaser.Scene,
    interactables: InteractableDefinition[],
    collectedIds: string[]  // from progressStore — skip already-collected
  ): void
  playCollectAnimation(x: number, y: number, type: DiscoveryType): void
}
```

- Scrolls: idle float animation + glow
- Shrines: particle aura
- Chests: closed sprite, animate to open on collect
- Already-collected objects: not spawned (filtered from progressStore)

---

## EncounterSystem

```typescript
class EncounterSystem {
  registerEnemy(enemy: EnemyEntity): void
  checkEncounters(player: PlayerEntity): void
  startEncounter(enemy: EnemyEntity): void  // freeze player, emit battleStart
  resolveEncounter(result: EncounterResult): void
}
```

Encounter event payload:
```typescript
eventBus.emit('battleStart', {
  enemyId: string,
  challengeId: string,
  enemyName: string,
  enemySpriteKey: string,
})
```

---

## EventBus: Phaser ↔ React

All communication between the Phaser layer and React goes through a typed EventBus.

```typescript
type PhaseEventMap = {
  npcInteract: { npcId: string }
  battleStart: { enemyId: string; challengeId: string; enemyName: string; enemySpriteKey: string }
  battleWon: { enemyId: string; xpReward: number; coinReward: number }
  battleLost: { enemyId: string }
  discoveryFound: { discoveryId: string; xpReward: number; coinReward: number }
  zoneTransition: { toZoneId: string }
  bossIntroComplete: { stageId: string }
  bossResult: { stageId: string; score: number; passed: boolean }
  xpAwarded: { amount: number; newTotal: number; newLevel: number | null }
  playerHurt: { newHp: number }
  mapReady: void
  resize: { width: number; height: number }
}
```

React components subscribe in `useEffect`:
```typescript
useEffect(() => {
  const handler = (data: PhaseEventMap['battleStart']) => openBattleModal(data)
  eventBus.on('battleStart', handler)
  return () => eventBus.off('battleStart', handler)
}, [])
```

---

## Asset Fallback System

Same principle as before — engine never crashes on missing asset.

| Category | Fallback Key | File |
|---|---|---|
| Player sprite | `player-default` | `/assets/sprites/player-default.png` |
| NPC sprite | `npc-default` | `/assets/sprites/npc-default.png` |
| Enemy sprite | `enemy-default` | `/assets/sprites/enemy-default.png` |
| Boss sprite | `boss-default` | `/assets/sprites/boss-default.png` |
| Tileset | `tileset-default` | `/assets/tilesets/default.png` |
| Interactable scroll | `scroll-default` | `/assets/sprites/scroll-default.png` |
| Interactable shrine | `shrine-default` | `/assets/sprites/shrine-default.png` |
| Interactable chest | `chest-default` | `/assets/sprites/chest-default.png` |

---

## Performance Notes

- Phase 1.5: placeholder color-block tiles acceptable (no art asset dependency)
- Tilemap chunk loading for large worlds (Phaser built-in)
- Enemy cap per zone: 8 max to maintain 60fps on mid-range mobile
- Sprite atlas for all player/NPC/enemy frames (Phase 6 optimization)
- Target: 60fps on mid-range mobile hardware (iPhone 12 / Android 2021 class)

---

## Phase 1 Legacy Mode

If a campaign JSON does not include a `tilemap` field, the engine falls back to the Phase 1 node-map view (PixiJS WorldMapScene is kept in a compatibility shim).

This ensures:
- Existing Phase 1 templates still load without errors
- Migration is opt-in — add `tilemap` field to a JSON to upgrade it
- No breaking change to the schema contract

> Note: PixiJS is retained only for this fallback path. New worlds should always include tilemap data.
