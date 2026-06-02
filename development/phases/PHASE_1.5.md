# Phase 1.5 — 2D RPG Engine Upgrade

> Prerequisites: Phase 1 complete (Campaign Loader, JSON validation, stage flow, XP system, localStorage persistence).  
> Goal: transform the node-map + panel UI into an actual playable 2D RPG experience — tile-based exploration, NPC dialogues, monster encounters, dungeon traversal.  
> This phase ships **before** Phase 2 auth/cloud work because the core gameplay loop must be correct before scaling it.

---

## Why Phase 1.5 Exists

Phase 1 proved the content pipeline: JSON in → campaign rendered → stage loop plays → XP awarded. That goal was achieved.

But the result feels like a **quiz platform with a map wrapper**, not an RPG. The node-map is navigation UI, not a game world. Stage flow is a series of modals, not exploration.

Phase 1.5 makes the game **feel like a game** — inspired by classic Pokémon, Zelda overworld, and GBA JRPGs. The player should move around, discover things, and encounter learning content organically — not click through menus to reach it.

**The critical constraint**: this is still driven entirely by the same JSON system. World + Knowledge JSON now includes tilemap configs, zone definitions, NPC placements, and enemy spawn points — but the engine remains content-agnostic.

---

## Goals

- Replace the PixiJS node-map with a **Phaser.js tilemap world** the player can walk around in
- Implement **tile-based character movement** (4-directional, smooth, keyboard + touch)
- Build **NPC interaction system** — walk up, press interact, see RPG dialogue box
- Build **monster encounter system** — enemies roam zones; touching one triggers an MCQ battle
- Build **knowledge discovery system** — chests, shrines, scrolls scatter XP and lore through the world
- Build **boss arena system** — boss room at end of each zone; 75% threshold; fail = redirect to exploration
- Implement **per-campaign isolated progression** — XP, level, and inventory stored per campaign ID
- Keep React UI for HUD (XP bar, dialogue box, inventory panel) on top of Phaser canvas
- All new world structures expressible in the existing JSON format (schema extensions, not replacement)

---

## Deliverables

| # | Deliverable | Notes |
|---|---|---|
| 1 | Phaser.js integration | Phaser 3 + TypeScript, mounted in React via canvas ref, clean lifecycle |
| 2 | Tilemap renderer | Loads Tiled-format JSON tilemaps; renders ground + collision layers |
| 3 | Player character | Sprite with walk/idle animations, 4-directional movement, smooth tile stepping |
| 4 | Camera system | Camera follows player, clamps to world bounds |
| 5 | Collision system | Tile-layer collision, NPC collision, interactable object zones |
| 6 | NPC system | NPCs placed from world.json; interact to open RPG dialogue box |
| 7 | Monster encounter system | Roaming enemies; collision triggers MCQ battle modal; defeat = XP |
| 8 | Knowledge discovery | Chests/shrines/scrolls trigger concept fragments + XP on interaction |
| 9 | Boss arena | Dedicated boss room; enter = boss fight MCQ sequence; 75% to pass |
| 10 | Boss fail redirect | On fail: blocked entry, dialogue hint, redirected to explore for more knowledge |
| 11 | Per-campaign XP isolation | Progress store keyed by campaignId; independent XP/level/inventory per campaign |
| 12 | RPG dialogue box UI | Retro-style dialogue box (React DOM overlay), character portrait, text scroll |
| 13 | HUD update | XP bar, level indicator, campaign name, mini health/energy indicators |
| 14 | Zone transition system | Enter cave/dungeon zones via doorway tiles; animated transition |
| 15 | World JSON schema v2 | Add `tilemap`, `zones`, `npcs[].position`, `enemies[].spawnZone`, `interactables[]` fields |
| 16 | Knowledge JSON v2 | Add `discoveries[]` — knowledge fragments attached to world interactables |
| 17 | Updated templates | `javascript-basics` and `kubernetes-basics` templates updated with full RPG world data |
| 18 | Updated example JSONs | `docker-basics` world + knowledge updated to include tilemap + RPG fields |

---

## User Flow (Phase 1.5)

1. Load campaign as before (Hub → template or paste JSON)
2. Campaign loads → **Phaser world renders** instead of the PixiJS node-map
3. Player character appears at world spawn point
4. Player moves around the world using WASD / arrow keys / D-pad touch
5. Player walks near an NPC → press E / tap → RPG dialogue box opens
6. NPC gives lore, hint, or sends player toward a zone
7. Player finds a **knowledge shrine** → interact → concept fragment floats in, XP awarded
8. Player walks into a **monster spawn zone** → monster appears → MCQ battle opens
9. MCQ correct: monster defeated, XP awarded, monster vanishes
10. MCQ wrong: monster attacks (HP loss animation), try again or flee
11. Player finds the **boss arena entrance** → sign warns: "Are you ready?"
12. Player enters → boss battle sequence: multiple MCQs, 75% score required
13. Pass: boss defeated animation, stage complete, next zone/dungeon unlocks
14. Fail: boss pushes player back, dialogue: "You lack knowledge of X. Seek the scrolls."
15. Player goes back to explore, finds missed content, tries boss again

---

## Technology Decisions

### Phaser.js 3 (replaces PixiJS for the world layer)

| Decision | Reasoning |
|---|---|
| Phaser.js 3 + TypeScript | Built-in tilemap, physics, input, scene management. PixiJS is a renderer; Phaser is a game engine. For tile-based RPG the gap is enormous. |
| Keep PixiJS? | No — two WebGL canvases is wasteful. Phaser uses its own WebGL renderer. PixiJS is removed from the game canvas. |
| React DOM overlay | HUD, dialogue box, MCQ battle modal, inventory panel stay as React. No need to build UI in Phaser. |
| Tiled map editor (`.tmj` JSON format) | Industry-standard tilemap editor, exports JSON. Content creators can design worlds visually. Phaser reads Tiled JSON natively. |
| Phaser Input | Built-in keyboard + gamepad + pointer support. No custom input system needed in Phase 1.5. |

### Retained from Phase 1

- Next.js 15, TypeScript, Tailwind, Zustand, Framer Motion
- Campaign JSON pipeline (Zod schemas, SchemaValidator, CampaignLoader)
- localStorage persistence, all existing stores
- React overlay components (Button, Card, Modal, etc.)

---

## Architecture Changes

```
┌──────────────────────────────────────────────────────────────┐
│  UI Layer     (React + Tailwind + Framer Motion)             │
│  HUD overlay: XPBar, DialogueBox, BattleModal, Inventory     │
├──────────────────────────────────────────────────────────────┤
│  Phaser Game Layer   (replaces PixiJS world canvas)          │
│  PhaserApp, SceneManager, WorldScene, BossScene              │
│  TilemapRenderer, PlayerEntity, NPCEntity, EnemyEntity       │
├──────────────────────────────────────────────────────────────┤
│  Learning Engine  (quest flow, challenge scoring, boss eval) │
├──────────────────────────────────────────────────────────────┤
│  Campaign Engine  (JSON validation, normalisation, types)     │
├──────────────────────────────────────────────────────────────┤
│  Data Layer   (Zustand + localStorage, per-campaign keyed)   │
└──────────────────────────────────────────────────────────────┘
```

### React ↔ Phaser Communication

| Direction | Mechanism |
|---|---|
| React → Phaser | Call `phaserApp.scene.getScene('WorldScene').methodName()` |
| Phaser → React | EventBus `emit('npcInteract', npcId)`, `emit('battleStart', enemyId)`, `emit('discoveryFound', discoveryId)` |
| Shared state | Zustand stores — Phaser reads on demand, never subscribes directly |

### New Engine Directory

```
src/engine/
├── phaser/                     ← replaces engine/game/
│   ├── PhaserApp.ts            ← Phaser.Game singleton, React mount/unmount
│   ├── SceneManager.ts         ← thin wrapper around Phaser scene registry
│   ├── scenes/
│   │   ├── WorldScene.ts       ← main exploration scene (tilemap + entities)
│   │   ├── BossScene.ts        ← boss arena scene
│   │   └── TransitionScene.ts  ← zone transition flash scene
│   ├── entities/
│   │   ├── PlayerEntity.ts     ← player sprite, input, animation state machine
│   │   ├── NPCEntity.ts        ← NPC sprite, idle bob, interaction zone
│   │   └── EnemyEntity.ts      ← roaming enemy, patrol FSM, encounter trigger
│   ├── systems/
│   │   ├── TilemapSystem.ts    ← load Tiled JSON, create layers, register colliders
│   │   ├── InteractionSystem.ts← proximity detection, E-key handler, event dispatch
│   │   ├── DiscoverySystem.ts  ← chest/shrine/scroll placement, open/glow animation
│   │   └── EncounterSystem.ts  ← enemy roam FSM, collision → battle event
│   └── types.ts
```

---

## World JSON Schema v2 Extensions

The existing `world.json` schema is extended — all new fields are **optional** so Phase 1 JSON still loads correctly (graceful degradation to node-map view for JSON without tilemap data).

### New top-level fields

```json
{
  "tilemap": {
    "tilemapKey": "world-docker-basics",
    "tilemapPath": "/content/tilemaps/docker-basics/world.tmj",
    "tilesetKey": "tileset-forge",
    "tilesetPath": "/content/tilesets/forge.png",
    "spawnPoint": { "x": 320, "y": 480 },
    "tileSize": 16,
    "scale": 2
  },
  "zones": [
    {
      "id": "zone-foundry",
      "name": "The Image Foundry",
      "type": "dungeon",
      "linkedStageId": "stage-images",
      "entranceTile": { "x": 10, "y": 15 },
      "tilemapPath": "/content/tilemaps/docker-basics/zone-foundry.tmj",
      "bgmKey": "bgm-dungeon"
    }
  ],
  "interactables": [
    {
      "id": "interactable-scroll-1",
      "type": "scroll",
      "position": { "x": 256, "y": 128 },
      "linkedDiscoveryId": "discovery-image-layers",
      "spriteKey": "sprite-scroll",
      "glowColor": "#f7d060"
    },
    {
      "id": "interactable-shrine-1",
      "type": "shrine",
      "position": { "x": 480, "y": 320 },
      "linkedDiscoveryId": "discovery-multistage",
      "spriteKey": "sprite-shrine"
    }
  ]
}
```

### NPC position extension

```json
{
  "npcs": [
    {
      "id": "npc-mentor-ironhands",
      "position": { "x": 320, "y": 240 },
      "zone": "overworld",
      "patrolPath": [
        { "x": 300, "y": 240 },
        { "x": 380, "y": 240 }
      ]
    }
  ]
}
```

### Enemy spawn extension

```json
{
  "enemies": [
    {
      "id": "enemy-dangling-image",
      "spawnZone": "zone-foundry",
      "spawnCount": 3,
      "roamRadius": 64,
      "encounterType": "mcq",
      "linkedChallengeId": "challenge-images-mcq"
    }
  ]
}
```

---

## Knowledge JSON Schema v2 Extensions

### New `discoveries` array

Discoveries are learning fragments attached to interactables in the world. Finding them grants XP and concept knowledge outside the formal stage flow.

```json
{
  "discoveries": [
    {
      "id": "discovery-image-layers",
      "title": "Image Layers",
      "type": "scroll",
      "xpReward": 25,
      "coinReward": 10,
      "content": {
        "type": "text",
        "text": "Each RUN, COPY, and ADD instruction in a Dockerfile creates a new read-only layer. Docker caches layers to speed rebuilds — but only if instructions above them haven't changed. Order matters."
      }
    },
    {
      "id": "discovery-multistage",
      "title": "Multi-Stage Build Secret",
      "type": "shrine",
      "xpReward": 50,
      "coinReward": 25,
      "content": {
        "type": "code",
        "code": "FROM node:18 AS builder\nRUN npm run build\n\nFROM node:18-alpine\nCOPY --from=builder /app/dist ./dist",
        "language": "dockerfile",
        "caption": "Copy artifacts between stages — build tools never reach production."
      }
    }
  ]
}
```

---

## Monster Encounter System

When a player sprite overlaps an enemy sprite:
1. Player movement freezes
2. `EncounterSystem` emits `battleStart` event with `{ enemyId, challengeId }`
3. React `BattleModal` opens — full-screen MCQ challenge
4. If correct: emit `battleWon` → enemy disappears, XP/coins float up
5. If wrong: emit `battleDamage` → player HP visual drops, retry or flee option
6. On flee: player pushed back 3 tiles, enemy resets with brief cooldown
7. On enemy defeat: enemy sprite dies animation, drops loot sprite, vanishes permanently (tracked in progressStore)

### MCQ Battle Rules

- Each enemy has a `linkedChallengeId` pointing to a challenge in knowledge.json
- Easy enemies: 1 MCQ question, any difficulty variant
- Hard enemies and mini-bosses: 2-3 questions, medium/hard variant
- No paragraph answers, no fill-in-the-blank — objective only
- Time pressure visual (optional in Phase 1.5, flag in JSON)

---

## Boss Fight System

### Entry

1. Boss arena is a dedicated zone (separate tilemap)
2. Entrance tile triggers a door check: `learningEngine.canEnterBossArena(stageId)`
3. Check: has player collected minimum required discoveries for this stage?
4. If yes: enter — boss intro dialogue plays
5. If no: locked door message + hint about what to find first

### Fight

- Boss battle = multi-question MCQ sequence (3–7 questions)
- Questions sourced from stage's `challenge` field, hard variant prioritised
- Score threshold: **75% correct to pass**
- Timer pressure cosmetic (no fail-on-time in Phase 1.5)

### Pass

1. Final score shown: "You defeated [Boss Name]!"
2. Boss defeated animation (screen flash, enemy sprite collapses)
3. Stage marked complete in progressStore
4. Reward XP + coins awarded
5. Next zone/dungeon gate opens on overworld map
6. Victory dialogue from the boss and from the NPC mentor

### Fail (score < 75%)

1. Boss pushes back: screen shake, player ejected from arena
2. Boss dialogue: "You are not yet worthy. Seek the [scroll/shrine] of [concept]."
3. Hint system: three specific hints about which discoveries to find
4. Door becomes locked with a visual "come back when you're stronger" sign
5. Player resumes free exploration — can enter other zones, find more discoveries
6. Re-entry allowed after 60-second cooldown (anti-spam, not punishment)
7. Player can attempt boss as many times as needed

---

## Per-Campaign Progression Isolation

**Problem**: the Phase 1 progressStore stores XP and level globally. If a player has:
- Linux Campaign: Level 7
- Docker Campaign: Level 2
- Kubernetes Campaign: Level 11

These must remain completely independent. A player's Docker level must never affect their Kubernetes level.

### Implementation

Every progress slice is keyed by `campaignId`:

```typescript
// progressStore shape (Phase 1.5)
interface CampaignProgress {
  campaignId: string
  level: number
  xp: number
  xpToNextLevel: number
  coins: number
  inventory: InventoryItem[]
  completedStages: string[]
  defeatedEnemies: string[]
  collectedDiscoveries: string[]
  unlockedZones: string[]
  bossAttempts: Record<string, number>
  lastPlayedAt: number
}

interface ProgressStore {
  campaigns: Record<string, CampaignProgress>
  activeCampaignId: string | null
  
  getProgress(campaignId: string): CampaignProgress
  setActiveCampaign(campaignId: string): void
  awardXP(campaignId: string, amount: number): void
  awardCoins(campaignId: string, amount: number): void
  markDiscoveryCollected(campaignId: string, discoveryId: string): void
  markEnemyDefeated(campaignId: string, enemyId: string): void
  markStageComplete(campaignId: string, stageId: string): void
}
```

localStorage key: `fm:progress:${campaignId}` — one key per campaign, never merged.

---

## RPG Dialogue Box

Rendered as React DOM overlay on top of Phaser canvas. Design is retro RPG-inspired.

```
┌─────────────────────────────────────────────────────┐
│  [Portrait]  IRONHANDS                              │
│  ──────────────────────────────────────────────     │
│  Every RUN command adds a layer. Chain your         │
│  commands and you'll keep images lean. The          │
│  Bloated Image feeds on your laziness.▮             │
│                                                     │
│                                [A] Continue         │
└─────────────────────────────────────────────────────┘
```

- Text typewriter effect (character-by-character reveal)
- Press E or tap to advance / skip
- Speaker name shown if NPC has a name
- Portrait if NPC has a `portraitKey`
- Can show multi-page dialogue (paginated, same box)
- Framer Motion entry/exit animation (slide up from bottom)
- Retro pixel-art border style

---

## HUD Updates

```
┌───────────────────────────────────────────────────────────────┐
│  [Campaign Name]                Level 4      XP ████░░ 240/300 │
│  ♥ ♥ ♥ ♥ ♡         🪙 150 coins              [Zone: Overworld] │
└───────────────────────────────────────────────────────────────┘
```

HUD is always rendered as React DOM, never in Phaser. Phaser emits events when XP/HP changes, React HUD updates reactively via Zustand.

---

## Zone Transitions

1. Player walks onto a transition tile (entrance to cave, dungeon, boss room)
2. Screen fades to black (Phaser camera fade)
3. New scene loads (`PhaserApp.scene.start('WorldScene', { tilemapKey: 'zone-foundry' })`)
4. Screen fades back in — player placed at zone entry point
5. Zone name toasts briefly in the HUD

For boss arenas:
1. Same fade but slower (more dramatic)
2. Boss intro music starts
3. Boss intro dialogue fires before player can move

---

## Implementation Plan

### Step 1: Engine Swap (Phaser replaces PixiJS)
- Install `phaser@3` — remove `pixi.js` dependency
- Scaffold `src/engine/phaser/PhaserApp.ts` singleton
- Wire to React via `useEffect` ref pattern (same as PixiJS was)
- Verify Phaser canvas renders in place of PixiJS canvas

### Step 2: Tilemap Foundation
- Add `TilemapSystem` — loads Tiled JSON format
- Create a stub tilemap for testing (simple 20×15 tile overworld)
- Render ground layer, register collision layer
- Verify tiles render and are collidable

### Step 3: Player Movement
- `PlayerEntity` with walk/idle sprite animation state machine
- 4-directional movement (WASD + arrow keys)
- Smooth tile-to-tile stepping (tweened movement, not instant snap)
- Camera following player, clamped to world bounds

### Step 4: NPC System
- `NPCEntity` spawned from `world.json npcs[]`
- Idle bob animation
- Proximity detection — glow indicator when player in range
- E-key → emit `npcInteract` → React `DialogueBox` opens

### Step 5: Discovery System
- `DiscoverySystem` spawns chests/scrolls/shrines from `world.json interactables[]`
- Glow pulse animation
- Interact → emit `discoveryFound` → React shows discovery card → XP awarded
- Collected discoveries tracked per campaign in progressStore

### Step 6: Enemy + Encounter System
- `EnemyEntity` with patrol FSM (idle → roam → return)
- Overlap trigger → `EncounterSystem.startBattle(enemyId)`
- React `BattleModal` (MCQ) opens
- Win/lose handling, XP award, enemy defeat persistence

### Step 7: Boss System
- Boss zone tilemap
- Entry gate tile check against campaign progress
- Boss fight modal (multi-question MCQ with score tracking)
- Pass/fail handling with dialogue

### Step 8: Per-Campaign Progression
- Rewrite progressStore to be campaign-keyed
- Migrate localStorage format (single key → per-campaign keys)
- Update all engine consumers to pass `campaignId`

### Step 9: JSON Schema v2
- Extend Zod schemas with new optional fields
- Update `SchemaValidator` — new fields pass, old JSON still valid
- Update templates + example JSONs with full RPG data

### Step 10: Polish
- Retro HUD design
- RPG dialogue box styling
- Zone transition animations
- Sound system stub (play bgm key, sfx key from JSON config)

---

## Out of Scope for Phase 1.5

- Actual tilemap art (pixel art sprites/tilesets) — placeholder procedural color tiles acceptable
- Multiplayer or social features (Phase 7)
- Cloud save (Phase 2)
- AI-generated hints in battle (Phase 3)
- World editor tooling (Phase 4)
- Mobile-native app (future)

---

## Success Criteria

Phase 1.5 is complete when:

1. Loading a campaign opens a **walkable 2D world**, not a node-map
2. Player can move to every NPC and trigger dialogue
3. Player can collect at least 3 different discovery types (scroll, shrine, chest)
4. Encountering an enemy opens an MCQ — win grants XP, lose has retry
5. Entering a boss room triggers multi-question MCQ — pass at 75%+ completes stage
6. Failing boss redirects player with a hint (no hard block)
7. Loading two different campaigns shows completely independent XP/level/inventory
8. `npm run build` passes with 0 errors
9. Game feels like an actual RPG, not a learning dashboard

---

## Estimated Effort

| Step | Complexity | Estimated Days |
|---|---|---|
| Phaser engine swap | Medium | 1 |
| Tilemap foundation | Medium | 1.5 |
| Player movement + camera | Low | 1 |
| NPC system | Low | 1 |
| Discovery system | Low | 0.5 |
| Enemy + encounter | Medium | 2 |
| Boss system | Medium | 2 |
| Per-campaign progression | Medium | 1 |
| JSON schema v2 + templates | Low | 1 |
| Polish + HUD | Low | 1 |
| **Total** | | **~12 days** |
