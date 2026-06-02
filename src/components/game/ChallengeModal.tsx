'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { evaluateChallenge, getVariantQuestions } from '@/engine/learning/ChallengeEngine'
import type { Challenge, ChallengeQuestion } from '@/engine/content/types'
import type { ChallengeAttempt, ChallengeResult } from '@/engine/learning/ChallengeEngine'

interface ChallengeModalProps {
  open: boolean
  challenge: Challenge
  variant: 'easy' | 'medium' | 'hard'
  baseXP: number
  onComplete: (result: ChallengeResult) => void
  onClose: () => void
}

export function ChallengeModal({ open, challenge, variant, baseXP, onComplete, onClose }: ChallengeModalProps) {
  const questions: ChallengeQuestion[] = getVariantQuestions(challenge, variant)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [attempts, setAttempts] = useState<ChallengeAttempt[]>([])
  const [hintsUsed, setHintsUsed] = useState(0)
  const [result, setResult] = useState<ChallengeResult | null>(null)

  const question: ChallengeQuestion | undefined = questions[currentIdx]
  const isLast = currentIdx === questions.length - 1

  const handleConfirm = () => {
    if (selected === null || !question) return
    const next = [...attempts, { questionId: question.id, selectedIndex: selected }]
    setAttempts(next)
    setAnswered(true)
  }

  const handleNext = () => {
    if (isLast) {
      const r = evaluateChallenge(questions, attempts, hintsUsed, baseXP)
      setResult(r)
    } else {
      setCurrentIdx((i) => i + 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  const handleClose = () => {
    setCurrentIdx(0); setSelected(null); setAnswered(false)
    setAttempts([]); setHintsUsed(0); setResult(null)
    onClose()
  }

  const handleFinish = () => {
    if (result) { onComplete(result); handleClose() }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Challenge" size="md">
      {result ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 py-4"
        >
          <div className={cn('text-5xl font-bold font-display', result.passed ? 'text-forge-success' : 'text-forge-danger')}>
            {result.score}%
          </div>
          <p className="text-forge-text">
            {result.correctCount}/{result.totalCount} correct
            {result.hintsUsed > 0 && ` · ${result.hintsUsed} hint${result.hintsUsed > 1 ? 's' : ''} used`}
          </p>
          <p className="text-forge-gold font-semibold">+{result.xpEarned} XP earned</p>
          <p className={cn('text-sm', result.passed ? 'text-forge-success' : 'text-forge-muted')}>
            {result.passed ? 'Challenge complete! Onwards to glory.' : 'Not quite — but you can try again.'}
          </p>
          <Button onClick={handleFinish} className="w-full">
            {result.passed ? 'Continue →' : 'Try Again'}
          </Button>
        </motion.div>
      ) : question ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between text-xs text-forge-muted">
            <span>Question {currentIdx + 1}/{questions.length}</span>
            <span className="capitalize">{variant}</span>
          </div>

          <p className="text-forge-text font-medium leading-relaxed">{question.text}</p>

          <div className="space-y-2">
            {question.options.map((opt: string, i: number) => {
              const isCorrect = answered && i === question.correctIndex
              const isWrong = answered && i === selected && i !== question.correctIndex
              return (
                <button
                  key={i}
                  onClick={() => { if (!answered) setSelected(i) }}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-lg border text-sm transition-all',
                    !answered && selected === i
                      ? 'border-forge-gold bg-forge-gold/10 text-forge-gold'
                      : !answered
                      ? 'border-forge-border bg-forge-surface hover:border-forge-gold/50 text-forge-text'
                      : isCorrect
                      ? 'border-forge-success bg-forge-success/10 text-forge-success'
                      : isWrong
                      ? 'border-forge-danger bg-forge-danger/10 text-forge-danger'
                      : 'border-forge-border bg-forge-surface text-forge-muted'
                  )}
                >
                  {opt}
                </button>
              )
            })}
          </div>

          {answered && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-forge-muted border-t border-forge-border pt-3"
            >
              {question.explanation}
            </motion.p>
          )}

          <div className="flex gap-2">
            {!answered ? (
              <Button size="sm" onClick={handleConfirm} disabled={selected === null} className="ml-auto">
                Confirm
              </Button>
            ) : (
              <Button size="sm" onClick={handleNext} className="ml-auto">
                {isLast ? 'See Results →' : 'Next Question →'}
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
