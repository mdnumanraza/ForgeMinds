import type { Node, Edge } from '@xyflow/react'
import type { Campaign, Stage, Beat, ValidationWarning } from './types'
import { validateStage } from '../validation/rules'

// Beat type → visual colour (tailwind bg class)
export const BEAT_COLOURS: Record<string, string> = {
  ARRIVAL: 'bg-slate-500',
  EXPLORATION: 'bg-emerald-600',
  KNOWLEDGE: 'bg-blue-600',
  QUEST: 'bg-violet-600',
  ENCOUNTER: 'bg-red-600',
  NPC_INTERACTION: 'bg-teal-600',
  MINI_CHALLENGE: 'bg-orange-500',
  DUNGEON: 'bg-red-900',
  BOSS: 'bg-rose-700',
  CUTSCENE: 'bg-gray-500',
  CHECKPOINT: 'bg-yellow-500',
  PORTAL: 'bg-indigo-600',
}

export const BEAT_LABELS: Record<string, string> = {
  ARRIVAL: 'Arrival',
  EXPLORATION: 'Exploration',
  KNOWLEDGE: 'Knowledge',
  QUEST: 'Quest',
  ENCOUNTER: 'Encounter',
  NPC_INTERACTION: 'NPC',
  MINI_CHALLENGE: 'Mini Challenge',
  DUNGEON: 'Dungeon',
  BOSS: 'Boss',
  CUTSCENE: 'Cutscene',
  CHECKPOINT: 'Checkpoint',
  PORTAL: 'Portal',
}

// ─── Stage View: Stage → ordered Beat nodes ─────────────────────────────────

export function stageToFlow(
  stage: Stage,
  warnings: ValidationWarning[]
): { nodes: Node[]; edges: Edge[] } {
  const warningsByBeat = new Map<string, ValidationWarning[]>()
  const stageWarnings: ValidationWarning[] = []
  for (const w of warnings) {
    if (w.beatId) {
      const existing = warningsByBeat.get(w.beatId) ?? []
      warningsByBeat.set(w.beatId, [...existing, w])
    } else {
      stageWarnings.push(w)
    }
  }

  const sorted = [...stage.beats].sort((a, b) => a.position - b.position)

  const nodes: Node[] = sorted.map((beat, i) => ({
    id: beat.id,
    type: 'beat',
    position: { x: 0, y: i * 110 },
    data: {
      beat,
      warnings: warningsByBeat.get(beat.id) ?? [],
      colourClass: BEAT_COLOURS[beat.type] ?? 'bg-gray-500',
      label: BEAT_LABELS[beat.type] ?? beat.type,
    },
  }))

  // Stage-level warning node (not tied to a beat)
  if (stageWarnings.length > 0) {
    nodes.unshift({
      id: `${stage.id}-warnings`,
      type: 'stageWarnings',
      position: { x: 260, y: 0 },
      data: { warnings: stageWarnings },
    })
  }

  const edges: Edge[] = sorted.slice(0, -1).map((beat, i) => ({
    id: `${beat.id}→${sorted[i + 1].id}`,
    source: beat.id,
    target: sorted[i + 1].id,
    type: 'smoothstep',
  }))

  return { nodes, edges }
}

// ─── Campaign View: Campaign → Act → Stage nodes ─────────────────────────────

const COL_W = 220
const ROW_H = 90

export function campaignToFlow(
  campaign: Campaign,
  allWarnings: ValidationWarning[]
): { nodes: Node[]; edges: Edge[] } {
  const warningsByStage = new Map<string, ValidationWarning[]>()
  for (const w of allWarnings) {
    const existing = warningsByStage.get(w.stageId) ?? []
    warningsByStage.set(w.stageId, [...existing, w])
  }

  const nodes: Node[] = []
  const edges: Edge[] = []

  // Campaign root
  nodes.push({
    id: campaign.id,
    type: 'campaign',
    position: { x: 0, y: 0 },
    data: { campaign },
  })

  campaign.acts.forEach((act, actIdx) => {
    const actX = (actIdx + 1) * COL_W
    nodes.push({
      id: act.id,
      type: 'act',
      position: { x: actX, y: 0 },
      data: { act },
    })
    edges.push({ id: `${campaign.id}→${act.id}`, source: campaign.id, target: act.id })

    act.stages.forEach((stage, stageIdx) => {
      const stageX = actX + COL_W
      const stageY = stageIdx * ROW_H
      const stageWarnings = warningsByStage.get(stage.id) ?? []
      nodes.push({
        id: stage.id,
        type: 'stage',
        position: { x: stageX, y: stageY },
        data: { stage, warnings: stageWarnings },
      })
      edges.push({ id: `${act.id}→${stage.id}`, source: act.id, target: stage.id })
    })
  })

  return { nodes, edges }
}

// ─── Re-export for convenience ────────────────────────────────────────────────
export { validateStage }
