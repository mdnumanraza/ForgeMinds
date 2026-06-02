'use client'

import Link from 'next/link'
import { XPBar } from '@/components/game/XPBar'
import { NotificationStack } from '@/components/game/NotificationStack'
import { usePlayerStore } from '@/store/playerStore'
import { useGameStore } from '@/store/gameStore'

interface GameLayoutProps {
  children: React.ReactNode
}

export function GameLayout({ children }: GameLayoutProps) {
  const { username } = usePlayerStore()
  const { activeCampaign } = useGameStore()

  return (
    <div className="h-screen bg-forge-void flex flex-col overflow-hidden">
      <header className="h-14 bg-forge-dark border-b border-forge-border/70 flex items-center px-5 gap-4 shrink-0">
        <Link
          href="/hub"
          className="font-display text-forge-gold text-base font-semibold hover:text-[#f7d060] transition-colors shrink-0"
        >
          ⚡ ForgeMinds
        </Link>

        {activeCampaign && (
          <>
            <span className="text-forge-border/80 text-sm select-none">/</span>
            <span className="text-xs text-forge-muted border border-forge-border rounded-full px-3 py-1 bg-forge-surface/50 truncate max-w-[180px]">
              {activeCampaign.name}
            </span>
          </>
        )}

        <div className="ml-auto flex items-center gap-4">
          <XPBar />
          {username && (
            <span className="text-xs text-forge-muted hidden sm:block border-l border-forge-border/50 pl-4">
              {username}
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>

      <NotificationStack />
    </div>
  )
}
