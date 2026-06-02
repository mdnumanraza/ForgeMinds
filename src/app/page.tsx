import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-forge-void flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-forge-gold/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full bg-forge-ember/5 blur-[80px] pointer-events-none" />

      <div className="relative max-w-2xl mx-auto space-y-10">
        <div className="space-y-5">
          <p className="text-forge-muted text-xs uppercase tracking-[0.3em] font-medium">
            ⚡ ForgeMinds
          </p>
          <h1 className="font-display text-forge-gold text-5xl sm:text-6xl leading-tight">
            Learn Through
            <br />
            <span className="text-forge-ember">Epic Quests</span>
          </h1>
          <p className="text-forge-text/70 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Transform any technical topic into an RPG adventure. Load a campaign JSON, earn XP, defeat bosses, and master real skills.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/hub">
            <Button size="lg" className="w-full sm:w-auto">
              Enter the Forge →
            </Button>
          </Link>
          <Link href="/load">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Load a Campaign
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-8 pt-8 border-t border-forge-border/50 max-w-xs mx-auto">
          <div className="text-center space-y-1.5">
            <div className="text-2xl">⚔️</div>
            <p className="text-xs text-forge-muted font-medium uppercase tracking-wider">Boss Fights</p>
          </div>
          <div className="text-center space-y-1.5">
            <div className="text-2xl">📜</div>
            <p className="text-xs text-forge-muted font-medium uppercase tracking-wider">Quests</p>
          </div>
          <div className="text-center space-y-1.5">
            <div className="text-2xl">⬆️</div>
            <p className="text-xs text-forge-muted font-medium uppercase tracking-wider">XP & Levels</p>
          </div>
        </div>
      </div>
    </main>
  )
}
