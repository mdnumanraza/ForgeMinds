'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { Discovery } from '@/engine/content/schemas/knowledge.schema'

interface Props {
  discovery: Discovery
  onCollect: () => void
}

const TYPE_ICONS: Record<Discovery['type'], string> = {
  scroll: '📜',
  shrine: '⛩',
  chest: '📦',
}

export function DiscoveryPanel({ discovery, onCollect }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="pointer-events-auto w-[min(600px,92vw)] mb-8 rounded-md bg-[#0e0e1a] text-white font-mono overflow-hidden"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          style={{ border: '2px solid #c8a84b', boxShadow: '0 0 30px #c8a84b22' }}
        >
          {/* Header */}
          <div className="bg-[#c8a84b]/10 px-5 py-3 flex items-center gap-3 border-b border-[#c8a84b33]">
            <span className="text-2xl">{TYPE_ICONS[discovery.type]}</span>
            <div>
              <p className="text-[10px] text-[#c8a84b] tracking-widest uppercase">{discovery.type} discovered</p>
              <h3 className="text-sm font-bold text-white">{discovery.title}</h3>
            </div>
            <div className="ml-auto flex gap-4 text-xs text-gray-400">
              <span className="text-[#c8a84b]">+{discovery.xpReward} XP</span>
              <span className="text-yellow-400">+{discovery.coinReward} ⬡</span>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 py-4">
            {discovery.content.type === 'text' ? (
              <p className="text-sm leading-relaxed text-gray-300">{discovery.content.text}</p>
            ) : (
              <div>
                {discovery.content.caption && (
                  <p className="text-xs text-gray-400 mb-2">{discovery.content.caption}</p>
                )}
                <pre className="bg-[#0a0a14] border border-[#ffffff11] rounded p-3 text-xs text-green-300 overflow-x-auto leading-relaxed">
                  <code>{discovery.content.code}</code>
                </pre>
              </div>
            )}
          </div>

          {/* Collect */}
          <div className="px-5 pb-4 flex justify-end">
            <button
              onClick={onCollect}
              className="px-6 py-2 rounded text-sm font-bold bg-[#c8a84b] text-black hover:bg-[#e0c060] transition-colors"
            >
              Collect
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
