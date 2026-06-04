// Temporary StageData structure.
// Migration path: when the YAML pipeline is ready, a loader will parse
// stage YAML files and produce objects that satisfy this interface.
// Nothing downstream should hardcode stage IDs or field values.

export interface ObstacleRect {
  x: number      // top-left x in world coordinates
  y: number      // top-left y
  width: number
  height: number
  colour: number // hex fill colour for primitive rendering
  label?: string // debug label only
}

export interface StageData {
  id: string
  name: string
  width: number
  height: number
  backgroundColour: string // CSS hex string
  spawnPoint: { x: number; y: number }
  obstacles: ObstacleRect[]
}
