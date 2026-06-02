'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ChallengeQuestion } from '@/engine/content/schemas/knowledge.schema'

interface Props {
  stageId: string
  bossName: string
  introText: string
  questions: ChallengeQuestion[]
  scoreThreshold: number
  onPass: () => void
  onFail: (redirectHints: string[]) => void
}

export function BossModal({ stageId, bossName, introText, questions, scoreThreshold, onPass, onFail }: Props) {
  const [phase, setPhase] = useState<'intro' | 'battle' | 'result'>('intro')
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null))
  const [currentQ, setCurrentQ] = useState(0)
  const [passed, setPassed] = useState(false)
  const [score, setScore] = useState(0)

  function startBattle() {
    setPhase('battle')
  }

  function selectAnswer(idx: number) {
    setAnswers((prev) => {
      const next = [...prev]
      next[currentQ] = idx
      return next
    })
  }

  function nextQuestion() {
    if (answers[currentQ] === null) return
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1)
    } else {
      submitAll()
    }
  }

  function submitAll() {
    const correct = answers.filter((a, i) => a === questions[i].correctIndex).length
    const finalScore = correct / questions.length
    const didPass = finalScore >= scoreThreshold
    setScore(finalScore)
    setPassed(didPass)
    setPhase('result')
  }

  const redirectHints = useMemo(() => {
    return questions
      .filter((q, i) => answers[i] !== q.correctIndex)
      .map((q) => q.explanation)
      .slice(0, 3)
  }, [questions, answers])

  const progressPct = ((currentQ + (answers[currentQ] !== null ? 1 : 0)) / questions.length) * 100

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'radial-gradient(ellipse at center, #1a0010 0%, #000000 100%)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-[min(620px,94vw)] rounded-md bg-[#0a000f] text-white font-mono overflow-hidden"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24 }}
          style={{ border: '2px solid #880000', boxShadow: '0 0 60px #ff000033' }}
        >
          {/* Intro Phase */}
          {phase === 'intro' && (
            <div className="px-6 py-8 text-center">
              <p className="text-[10px] text-red-400 tracking-[0.3em] uppercase mb-2">Boss Encounter</p>
              <h2 className="text-2xl font-bold text-red-300 mb-4">{bossName}</h2>
              <p className="text-sm text-gray-300 leading-relaxed mb-6">{introText}</p>
              <p className="text-xs text-gray-500 mb-6">
                Answer {questions.length} questions. Pass {Math.round(scoreThreshold * 100)}% to advance.
              </p>
              <button
                onClick={startBattle}
                className="px-8 py-3 rounded font-bold text-sm bg-red-700 hover:bg-red-600 text-white transition-colors"
              >
                Begin
              </button>
            </div>
          )}

          {/* Battle Phase */}
          {phase === 'battle' && (
            <>
              <div className="bg-red-900/20 px-5 py-3 flex items-center justify-between border-b border-red-900/30">
                <span className="text-red-400 text-xs tracking-widest uppercase">⚔ {bossName}</span>
                <span className="text-gray-400 text-xs">{currentQ + 1} / {questions.length}</span>
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-[#ffffff11]">
                <div
                  className="h-full bg-red-500 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <div className="px-5 py-5">
                <p className="text-sm leading-relaxed text-gray-200 mb-4">{questions[currentQ].text}</p>

                <div className="flex flex-col gap-2">
                  {questions[currentQ].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => selectAnswer(i)}
                      className={`text-left px-4 py-2 rounded text-sm transition-all border ${
                        answers[currentQ] === i
                          ? 'border-red-400 bg-red-400/15'
                          : 'border-[#ffffff22] bg-[#ffffff08] hover:bg-[#ffffff15]'
                      }`}
                    >
                      <span className="text-red-400 mr-2">{String.fromCharCode(65 + i)}.</span>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-5 pb-5">
                <button
                  onClick={nextQuestion}
                  disabled={answers[currentQ] === null}
                  className="w-full py-2 rounded font-bold text-sm bg-red-700 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
                >
                  {currentQ < questions.length - 1 ? 'Next' : 'Submit'}
                </button>
              </div>
            </>
          )}

          {/* Result Phase */}
          {phase === 'result' && (
            <div className="px-6 py-8 text-center">
              {passed ? (
                <>
                  <p className="text-4xl mb-3">🏆</p>
                  <h3 className="text-xl font-bold text-[#c8a84b] mb-2">Victory!</h3>
                  <p className="text-sm text-gray-300 mb-2">
                    Score: {Math.round(score * 100)}% — Boss defeated!
                  </p>
                  <button
                    onClick={onPass}
                    className="mt-4 px-8 py-3 rounded font-bold text-sm bg-[#c8a84b] hover:bg-[#e0c060] text-black transition-colors"
                  >
                    Continue
                  </button>
                </>
              ) : (
                <>
                  <p className="text-4xl mb-3">💀</p>
                  <h3 className="text-xl font-bold text-red-400 mb-2">Defeated</h3>
                  <p className="text-sm text-gray-300 mb-4">
                    Score: {Math.round(score * 100)}% — Need {Math.round(scoreThreshold * 100)}% to pass.
                  </p>
                  {redirectHints.length > 0 && (
                    <div className="text-left bg-[#ffffff08] border border-[#ffffff11] rounded p-4 mb-4">
                      <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest">Review these:</p>
                      <ul className="flex flex-col gap-1">
                        {redirectHints.map((hint, i) => (
                          <li key={i} className="text-xs text-gray-300">• {hint}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <button
                    onClick={() => onFail(redirectHints)}
                    className="mt-2 px-8 py-3 rounded font-bold text-sm border border-red-700 text-red-400 hover:bg-red-900/30 transition-colors"
                  >
                    Return to Explore
                  </button>
                </>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
