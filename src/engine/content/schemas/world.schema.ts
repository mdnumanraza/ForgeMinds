import { z } from 'zod'

// ─── Unlock Conditions ────────────────────────────────────────────────────────

export const UnlockConditionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('world_start') }),
  z.object({ type: z.literal('stage_complete'), stageId: z.string() }),
  z.object({
    type: z.literal('multi_require'),
    stageIds: z.array(z.string()).min(2),
  }),
  z.object({
    type: z.literal('xp_threshold'),
    minXP: z.number().int().positive(),
  }),
])

// ─── Boss ─────────────────────────────────────────────────────────────────────

export const BossSchema = z.object({
  id: z.string(),
  name: z.string().max(80),
  spriteKey: z.string().default('boss-default'),
  introText: z.string().max(300),
  defeatText: z.string().max(300),
  health: z.number().int().min(50).max(1000).default(100),
  attackPattern: z.string().default('basic'),
})

// ─── NPC ──────────────────────────────────────────────────────────────────────

export const NpcSchema = z.object({
  id: z.string(),
  name: z.string(),
  spriteKey: z.string().default('npc-default'),
  position: z.object({ x: z.number(), y: z.number() }),
  role: z.enum(['mentor', 'guide', 'merchant', 'enemy']).default('guide'),
  dialogTrigger: z.string().default('interact'),
  dialogLines: z.array(z.string()).min(1),
})

// ─── Tilemap Config (Phase 1.5) ───────────────────────────────────────────────

export const TilemapConfigSchema = z.object({
  tilemapKey: z.string(),
  tilemapPath: z.string().default(''),
  tilesetKey: z.string().default(''),
  tilesetPath: z.string().default(''),
  spawnPoint: z.object({ x: z.number(), y: z.number() }).default({ x: 400, y: 300 }),
  tileSize: z.number().int().min(8).max(64).default(16),
  scale: z.number().min(0.5).max(4).default(2),
})

// ─── Zone Definition (Phase 1.5) ─────────────────────────────────────────────

export const ZoneDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['dungeon', 'cave', 'overworld', 'boss-area']).default('overworld'),
  linkedStageId: z.string().optional(),
  entranceTile: z.object({ x: z.number(), y: z.number() }),
  tilemapPath: z.string().default(''),
  bgmKey: z.string().default(''),
  unlockCondition: UnlockConditionSchema.optional(),
})

// ─── Interactable (Phase 1.5) ─────────────────────────────────────────────────

export const InteractableSchema = z.object({
  id: z.string(),
  type: z.enum(['scroll', 'shrine', 'chest']),
  position: z.object({ x: z.number(), y: z.number() }),
  linkedDiscoveryId: z.string(),
  spriteKey: z.string().default(''),
  glowColor: z.string().default('#ffdd00'),
})

// ─── Enemy ────────────────────────────────────────────────────────────────────

export const EnemySchema = z.object({
  id: z.string(),
  name: z.string(),
  spriteKey: z.string().default('npc-default'),
  encounterStages: z.array(z.string()),
  behavior: z.enum(['patrol', 'static', 'chase']).default('static'),
  // Phase 1.5 fields
  spawnZone: z.string().optional(),
  spawnCount: z.number().int().min(1).max(10).default(1),
  roamRadius: z.number().min(0).default(80),
  encounterType: z.enum(['battle', 'flee', 'boss']).default('battle'),
  linkedChallengeId: z.string().optional(),
})

// ─── Stage Definition ─────────────────────────────────────────────────────────

export const StageDefinitionSchema = z.object({
  id: z.string(),
  name: z.string().max(80),
  position: z.object({ x: z.number(), y: z.number() }),
  nodeIconKey: z.string().default('node-default'),
  backgroundKey: z.string().default('bg-default'),
  unlockCondition: UnlockConditionSchema,
  hidden: z.boolean().default(false),
  optional: z.boolean().default(false),
  boss: BossSchema,
})

// ─── Map Config ───────────────────────────────────────────────────────────────

export const MapConfigSchema = z.object({
  layout: z.enum(['linear', 'branching', 'open']).default('linear'),
  width: z.number().int().min(400).default(1200),
  height: z.number().int().min(300).default(800),
  connectionStyle: z.enum(['path', 'line', 'dashed']).default('path'),
  startPosition: z.object({ x: z.number(), y: z.number() }).default({ x: 100, y: 400 }),
})

// ─── World Theme ──────────────────────────────────────────────────────────────

export const WorldThemeSchema = z.object({
  biome: z.string(),
  atmosphere: z.string(),
  backgroundKey: z.string().default('bg-default'),
  ambientKey: z.string().optional(),
  musicKey: z.string().optional(),
  colorPalette: z.array(z.string()).max(5).default([]),
  environmentEffects: z.array(z.string()).default([]),
  difficultyProfile: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
})

// ─── World Lore ───────────────────────────────────────────────────────────────

export const WorldLoreSchema = z.object({
  worldOrigin: z.string().optional(),
  playerRole: z.string().optional(),
  antagonist: z.string().optional(),
})

// ─── World Schema (root) ──────────────────────────────────────────────────────

export const WorldSchema = z.object({
  $schema: z.string().optional(),
  id: z.string().min(1),
  name: z.string().max(80),
  description: z.string().max(300).default(''),
  version: z.string().default('1.0.0'),
  theme: WorldThemeSchema,
  map: MapConfigSchema.default({}),
  stages: z.array(StageDefinitionSchema).min(1).max(50),
  npcs: z.array(NpcSchema).default([]),
  enemies: z.array(EnemySchema).default([]),
  lore: WorldLoreSchema.default({}),
  // Phase 1.5 fields
  tilemap: TilemapConfigSchema.optional(),
  zones: z.array(ZoneDefinitionSchema).default([]),
  interactables: z.array(InteractableSchema).default([]),
})

export type World = z.infer<typeof WorldSchema>
export type StageDefinition = z.infer<typeof StageDefinitionSchema>
export type Boss = z.infer<typeof BossSchema>
export type Npc = z.infer<typeof NpcSchema>
export type UnlockCondition = z.infer<typeof UnlockConditionSchema>
export type TilemapConfig = z.infer<typeof TilemapConfigSchema>
export type ZoneDefinition = z.infer<typeof ZoneDefinitionSchema>
export type Interactable = z.infer<typeof InteractableSchema>
export type Enemy = z.infer<typeof EnemySchema>
