import type { Quest } from '../content/types'

export type QuestEvalResult = {
  passed: boolean
  feedback: string
}

export function evaluateQuestAnswer(quest: Quest, answer: string): QuestEvalResult {
  const trimmed = answer.trim()

  if (!trimmed) {
    return { passed: false, feedback: quest.validation.failureMessage }
  }

  const { strategy, pattern } = quest.validation
  if (!pattern || strategy === 'none') {
    return {
      passed: trimmed.length >= 5,
      feedback: trimmed.length >= 5 ? quest.validation.successMessage : 'Please provide a more detailed answer.',
    }
  }

  return applyStrategy(trimmed, strategy, pattern, quest.validation.successMessage, quest.validation.failureMessage)
}

function applyStrategy(
  answer: string,
  strategy: string,
  pattern: string,
  successMessage: string,
  failureMessage: string
): QuestEvalResult {
  switch (strategy) {
    case 'includes': {
      const passed = answer.toLowerCase().includes(pattern.toLowerCase())
      return { passed, feedback: passed ? successMessage : failureMessage }
    }

    case 'regex': {
      try {
        const re = new RegExp(pattern, 'i')
        const passed = re.test(answer)
        return { passed, feedback: passed ? successMessage : failureMessage }
      } catch {
        return { passed: false, feedback: 'Validation error — invalid pattern.' }
      }
    }

    case 'exact': {
      const passed = answer.trim() === pattern.trim()
      return { passed, feedback: passed ? successMessage : failureMessage }
    }

    default:
      return { passed: true, feedback: successMessage }
  }
}
