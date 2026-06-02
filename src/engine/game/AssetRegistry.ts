/** Maps sprite/asset keys to public paths. Missing keys fall back to defaults. */
const ASSET_MAP: Record<string, string> = {
  // Fallback defaults — always present
  'node-default': '/assets/sprites/node-default.png',
  'node-completed': '/assets/sprites/node-completed.png',
  'node-locked': '/assets/sprites/node-locked.png',
  'boss-default': '/assets/sprites/boss-default.png',
  'npc-default': '/assets/sprites/npc-default.png',
  'player-default': '/assets/sprites/player-default.png',
  'bg-default': '/assets/backgrounds/bg-default.png',
  'bg-cyber': '/assets/backgrounds/bg-cyber.png',
  'bg-fantasy': '/assets/backgrounds/bg-fantasy.png',
  'bg-space': '/assets/backgrounds/bg-space.png',
}

const FALLBACKS: Record<string, string> = {
  node: 'node-default',
  boss: 'boss-default',
  npc: 'npc-default',
  player: 'player-default',
  bg: 'bg-default',
}

export function resolveAssetKey(key: string, category: keyof typeof FALLBACKS = 'node'): string {
  if (ASSET_MAP[key]) return ASSET_MAP[key]
  const fallbackKey = FALLBACKS[category] ?? 'node-default'
  return ASSET_MAP[fallbackKey] ?? '/assets/sprites/node-default.png'
}

export function resolveBackground(key: string): string {
  return ASSET_MAP[key] ?? ASSET_MAP['bg-default']
}
