import type { Challenge, ChallengeQuestion } from '../content/types'

export interface ChallengeAttempt {
  questionId: string
  selectedIndex: number
}

export interface ChallengeResult {
  score: number           // 0–100
  xpEarned: number
  correctCount: number
  totalCount: number
  hintsUsed: number
  passed: boolean
}

export function getVariantQuestions(
  challenge: Challenge,
  variant: 'easy' | 'medium' | 'hard'
): ChallengeQuestion[] {
  return challenge.variants[variant]
}

export function evaluateChallenge(
  questions: ChallengeQuestion[],
  attempts: ChallengeAttempt[],
  hintsUsed: number,
  baseXP: number
): ChallengeResult {
  const total = questions.length
  if (total === 0) return { score: 100, xpEarned: baseXP, correctCount: 0, totalCount: 0, hintsUsed, passed: true }

  let correct = 0
  for (const attempt of attempts) {
    const q = questions.find((q) => q.id === attempt.questionId)
    if (q && attempt.selectedIndex === q.correctIndex) correct++
  }

  const accuracy = correct / total
  const score = Math.round(accuracy * 100)
  const passed = score >= 60

  const hintPenalty = hintsUsed * 5
  const xpEarned = Math.max(0, Math.round(baseXP * accuracy) - hintPenalty)

  return { score, xpEarned, correctCount: correct, totalCount: total, hintsUsed, passed }
}
