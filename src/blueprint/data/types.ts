// Content architecture types — mirrors development/content-architecture/ai-beat-model.md
// Beat is the L2 entity; payloads are L3.

export type BeatType =
  | 'ARRIVAL'
  | 'EXPLORATION'
  | 'KNOWLEDGE'
  | 'QUEST'
  | 'ENCOUNTER'
  | 'NPC_INTERACTION'
  | 'MINI_CHALLENGE'
  | 'DUNGEON'
  | 'BOSS'
  | 'CUTSCENE'
  | 'CHECKPOINT'
  | 'PORTAL'

export interface BeatPayload {
  title: string
  description?: string
  conceptRef?: string       // platform-level Concept ID
  learningGoal?: string
  relatedNPCs?: string[]
  relatedQuests?: string[]
  relatedEnemies?: string[]
  conceptsRequired?: string[] // for BOSS beats — must all appear in prior KNOWLEDGE beats
}

export interface Beat {
  id: string
  position: number          // ordering within stage; lower = earlier
  type: BeatType
  payload: BeatPayload
}

export interface Stage {
  id: string
  title: string
  conceptRef: string        // primary concept this stage teaches
  levelRange: [number, number]
  beats: Beat[]
  optional?: boolean
}

export interface Act {
  id: string
  title: string
  narrativeTheme: string
  stages: Stage[]
}

export interface Campaign {
  id: string
  title: string
  domain: string
  acts: Act[]
}

// ─── Validation ───────────────────────────────────────────────────────────────

export type ValidationSeverity = 'error' | 'warning'

export interface ValidationWarning {
  stageId: string
  beatId?: string           // if warning is on a specific beat
  rule: string
  message: string
  severity: ValidationSeverity
}
