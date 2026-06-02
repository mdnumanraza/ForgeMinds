'use client'

import { useProgressStore } from '@/store/progressStore'

interface Props {
  campaignId: string
  campaignName: string
  zoneName?: string
}

const XP_PER_LEVEL = 200

export function GameHUD({ campaignId, campaignName, zoneName }: Props) {
  const xp = useProgressStore((s) => s.getCampaignXP(campaignId))
  const level = useProgressStore((s) => s.getCampaignLevel(campaignId))
  const coins = useProgressStore((s) => s.getCampaignCoins(campaignId))

  const xpInLevel = xp % XP_PER_LEVEL
  const xpPct = (xpInLevel / XP_PER_LEVEL) * 100

  return (
    <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
      <div className="flex items-start justify-between px-4 pt-3">
        {/* Left — campaign info */}
        <div className="bg-black/70 backdrop-blur-sm rounded px-3 py-2 border border-[#c8a84b33]">
          <p className="text-[#c8a84b] text-xs font-bold tracking-widest uppercase leading-none">{campaignName}</p>
          {zoneName && (
            <p className="text-gray-400 text-[10px] mt-0.5">{zoneName}</p>
          )}
        </div>

        {/* Right — level + XP + coins */}
        <div className="bg-black/70 backdrop-blur-sm rounded px-3 py-2 border border-[#c8a84b33] flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[#c8a84b] text-xs font-bold">Lv.{level}</span>
            <div className="w-24 h-2 bg-[#ffffff15] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#c8a84b] rounded-full transition-all duration-500"
                style={{ width: `${xpPct}%` }}
              />
            </div>
            <span className="text-gray-400 text-[10px]">{xpInLevel}/{XP_PER_LEVEL}</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-400 text-xs">
            <span>⬡</span>
            <span>{coins}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
