'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/store/uiStore'
import type { Notification } from '@/store/uiStore'
import { cn } from '@/lib/utils'

const typeStyles: Record<string, string> = {
  xp: 'border-forge-gold text-forge-gold bg-forge-gold/10',
  levelup: 'border-forge-ember text-forge-ember bg-forge-ember/10',
  achievement: 'border-forge-frost text-forge-frost bg-forge-frost/10',
  info: 'border-forge-border text-forge-text bg-forge-surface',
  error: 'border-forge-danger text-forge-danger bg-forge-danger/10',
}

const typeIcons: Record<string, string> = {
  xp: '⚡',
  levelup: '🔥',
  achievement: '🏆',
  info: 'ℹ',
  error: '✕',
}

function NotificationItem({ n }: { n: Notification }) {
  const remove = useUIStore((s) => s.removeNotification)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium shadow-lg cursor-pointer',
        typeStyles[n.type] ?? typeStyles.info
      )}
      onClick={() => remove(n.id)}
    >
      <span>{typeIcons[n.type] ?? '•'}</span>
      <span>{n.message}</span>
      {n.amount !== undefined && n.amount > 0 && (
        <span className="ml-auto font-bold">+{n.amount}</span>
      )}
    </motion.div>
  )
}

export function NotificationStack() {
  const notifications = useUIStore((s) => s.notifications)
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-72 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => (
          <div key={n.id} className="pointer-events-auto">
            <NotificationItem n={n} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
