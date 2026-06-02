'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  name: string
  lines: string[]
  onClose: () => void
}

const CHAR_DELAY = 30

export function DialogueBox({ name, lines, onClose }: Props) {
  const [lineIndex, setLineIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [finished, setFinished] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setDisplayed('')
    setFinished(false)
    const text = lines[lineIndex]
    let idx = 0
    intervalRef.current = setInterval(() => {
      idx++
      setDisplayed(text.slice(0, idx))
      if (idx >= text.length) {
        clearInterval(intervalRef.current!)
        setFinished(true)
      }
    }, CHAR_DELAY)
    return () => clearInterval(intervalRef.current!)
  }, [lineIndex, lines])

  function advance() {
    if (!finished) {
      // Skip typewriter — show full text immediately
      clearInterval(intervalRef.current!)
      setDisplayed(lines[lineIndex])
      setFinished(true)
      return
    }
    if (lineIndex < lines.length - 1) {
      setLineIndex((i) => i + 1)
    } else {
      onClose()
    }
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'e' || e.key === 'E' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        advance()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[min(640px,90vw)] z-50"
        onClick={advance}
      >
        <div className="relative rounded-sm bg-[#0e0e1a] text-white font-mono"
          style={{
            border: '2px solid #c8a84b',
            boxShadow: '0 0 0 1px #0e0e1a, 0 0 0 3px #c8a84b33, inset 0 0 20px #00000088',
          }}
        >
          {/* Gold corner accents */}
          <span className="absolute top-[-2px] left-[-2px] w-3 h-3 border-t-2 border-l-2 border-[#c8a84b]" />
          <span className="absolute top-[-2px] right-[-2px] w-3 h-3 border-t-2 border-r-2 border-[#c8a84b]" />
          <span className="absolute bottom-[-2px] left-[-2px] w-3 h-3 border-b-2 border-l-2 border-[#c8a84b]" />
          <span className="absolute bottom-[-2px] right-[-2px] w-3 h-3 border-b-2 border-r-2 border-[#c8a84b]" />

          {/* Speaker name */}
          <div className="px-4 pt-2 pb-1 border-b border-[#c8a84b33]">
            <span className="text-[#c8a84b] text-xs font-bold tracking-widest uppercase">{name}</span>
          </div>

          {/* Text */}
          <div className="px-4 py-3 min-h-[64px] text-sm leading-relaxed">
            {displayed}
            {!finished && <span className="animate-pulse">▌</span>}
          </div>

          {/* Advance indicator */}
          <div className="px-4 pb-2 text-right">
            <span className="text-[#c8a84b66] text-xs">
              {finished ? (lineIndex < lines.length - 1 ? 'E — Next' : 'E — Close') : '...'}
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
