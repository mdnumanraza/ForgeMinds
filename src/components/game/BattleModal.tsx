'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ChallengeQuestion } from '@/engine/content/schemas/knowledge.schema'

interface Props {
  enemyName: string
  question: ChallengeQuestion
  onWin: (xpReward: number, coinReward: number) => void
  onFlee: () => void
}

const XP_REWARD = 50
const COIN_REWARD = 20
const FLEE_COOLDOWN_MS = 2000

export function BattleModal({ enemyName, question, onWin, onFlee }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [fleeing, setFleeing] = useState(false)
  const [hp, setHp] = useState(3)

  function submit() {
    if (selected === null) return
    setRevealed(true)
    if (selected === question.correctIndex) {
      setTimeout(() => onWin(XP_REWARD, COIN_REWARD), 1200)
    } else {
      setHp((h) => h - 1)
      setTimeout(() => {
        setSelected(null)
        setRevealed(false)
      }, 1200)
    }
  }

  function flee() {
    if (fleeing) return
    setFleeing(true)
    setTimeout(() => onFlee(), FLEE_COOLDOWN_MS)
  }

  const correct = revealed && selected === question.correctIndex
  const wrong = revealed && selected !== question.correctIndex

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-[min(560px,92vw)] rounded-md bg-[#0e0e1a] text-white font-mono overflow-hidden"
          initial={{ scale: 0.85, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          style={{ border: '2px solid #ff4444', boxShadow: '0 0 30px #ff000044' }}
        >
          {/* Header */}
          <div className="bg-[#ff4444]/20 px-5 py-3 flex items-center justify-between border-b border-[#ff4444]/30">
            <span className="text-[#ff6666] font-bold text-sm tracking-widest uppercase">
              ⚔ ENCOUNTER — {enemyName}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-lg ${i < hp ? 'text-red-400' : 'text-gray-700'}`}
                >♥</span>
              ))}
            </div>
          </div>

          {/* Question */}
          <div className="px-5 py-4">
            <p className="text-sm leading-relaxed text-gray-200 mb-4">{question.text}</p>

            <div className="flex flex-col gap-2">
              {question.options.map((opt, i) => {
                let cls = 'border border-[#ffffff22] bg-[#ffffff08] hover:bg-[#ffffff15] cursor-pointer'
                if (revealed) {
                  if (i === question.correctIndex) cls = 'border border-green-400 bg-green-400/20'
                  else if (i === selected) cls = 'border border-red-400 bg-red-400/20'
                  else cls = 'border border-[#ffffff11] bg-transparent opacity-50'
                } else if (i === selected) {
                  cls = 'border border-[#c8a84b] bg-[#c8a84b15] cursor-pointer'
                }

                return (
                  <button
                    key={i}
                    onClick={() => !revealed && setSelected(i)}
                    className={`text-left px-4 py-2 rounded text-sm transition-all ${cls}`}
                  >
                    <span className="text-[#c8a84b] mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                )
              })}
            </div>

            {revealed && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-3 text-xs px-3 py-2 rounded ${correct ? 'text-green-300 bg-green-400/10' : 'text-red-300 bg-red-400/10'}`}
              >
                {correct ? '✓ ' : '✗ '}{question.explanation}
              </motion.p>
            )}
          </div>

          {/* Actions */}
          {!revealed && (
            <div className="px-5 pb-4 flex gap-3">
              <button
                onClick={submit}
                disabled={selected === null}
                className="flex-1 py-2 rounded text-sm font-bold bg-[#c8a84b] text-black hover:bg-[#e0c060] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Attack
              </button>
              <button
                onClick={flee}
                disabled={fleeing}
                className="px-4 py-2 rounded text-sm border border-[#ffffff33] text-gray-400 hover:border-[#ffffff66] disabled:opacity-40 transition-colors"
              >
                {fleeing ? 'Running...' : 'Flee'}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
