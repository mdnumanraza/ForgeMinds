import type { KnowledgeStage } from '../content/types'

export function resolveAdaptiveVariant(
  _stage: KnowledgeStage,
  timesPlayed: number
): 'easy' | 'medium' | 'hard' {
  if (timesPlayed >= 2) return 'easy'
  if (timesPlayed === 1) return 'medium'
  return 'medium'
}

export function shouldShowExtraHint(timesPlayed: number): boolean {
  return timesPlayed >= 1
}
