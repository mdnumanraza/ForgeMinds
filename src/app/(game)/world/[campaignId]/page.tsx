'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { GameLayout } from '@/components/layout/GameLayout'
import { WorldMapCanvas } from '@/components/game/WorldMapCanvas'
import { PhaserWorldCanvas } from '@/components/game/PhaserWorldCanvas'
import { DialogueBox } from '@/components/game/DialogueBox'
import { BattleModal } from '@/components/game/BattleModal'
import { DiscoveryPanel } from '@/components/game/DiscoveryPanel'
import { BossModal } from '@/components/game/BossModal'
import { GameHUD } from '@/components/game/GameHUD'
import { useGameStore } from '@/store/gameStore'
import { useProgressStore } from '@/store/progressStore'
import { loadCampaignFromStorage } from '@/lib/localStorage'
import { Button } from '@/components/ui/Button'
import { phaserBridge } from '@/engine/phaser/EventBridge'
import type { Discovery, ChallengeQuestion } from '@/engine/content/schemas/knowledge.schema'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface DialogueState { name: string; lines: string[] }
interface BattleState { enemyId: string; enemyName: string; question: ChallengeQuestion }
interface BossState {
  stageId: string; bossName: string; introText: string
  questions: ChallengeQuestion[]; scoreThreshold: number
}

export default function WorldMapPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const router = useRouter()
  const { activeCampaign, setActiveCampaign, setActiveStage } = useGameStore()
  const {
    initCampaign, getCompletionPercent,
    awardXP, awardCoins,
    markDiscoveryCollected, markEnemyDefeated, recordBossAttempt,
  } = useProgressStore()

  const [dialogue, setDialogue] = useState<DialogueState | null>(null)
  const [battle, setBattle] = useState<BattleState | null>(null)
  const [discoveryItem, setDiscoveryItem] = useState<Discovery | null>(null)
  const [boss, setBoss] = useState<BossState | null>(null)

  // Keep a stable ref to activeCampaign so bridge handlers always see latest data
  // without needing to re-register listeners on every render
  const campaignRef = useRef(activeCampaign)
  useEffect(() => { campaignRef.current = activeCampaign }, [activeCampaign])

  // Load campaign into store on mount / campaignId change
  useEffect(() => {
    if (!activeCampaign || activeCampaign.id !== campaignId) {
      const stored = loadCampaignFromStorage(campaignId)
      if (stored) {
        setActiveCampaign(stored)
        initCampaign(stored.id, stored.world.stages[0].id)
      } else {
        router.replace('/hub')
      }
    }
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Wire Phaser bridge — register once per campaignId, clear on unmount/change
  useEffect(() => {
    // Flush any stale overlay state from a previous session
    setDialogue(null)
    setBattle(null)
    setDiscoveryItem(null)
    setBoss(null)

    const offs = [
      phaserBridge.on('npcInteract', ({ name, lines }) => {
        setDialogue({ name, lines })
      }),

      phaserBridge.on('battleStart', ({ enemyId, challengeId, enemyName }) => {
        const campaign = campaignRef.current
        if (!campaign) return
        const stage = campaign.knowledge.stages.find(
          (s) => s.stageId === challengeId || s.challenge.id === challengeId
        )
        if (!stage) return
        const pool = [...stage.challenge.variants.easy, ...stage.challenge.variants.medium]
        const q = pool[Math.floor(Math.random() * pool.length)]
        setBattle({ enemyId, enemyName, question: q })
      }),

      phaserBridge.on('discoveryFound', ({ discoveryId }) => {
        const campaign = campaignRef.current
        if (!campaign) return
        const d = campaign.knowledge.discoveries?.find((d) => d.id === discoveryId)
        if (d) setDiscoveryItem(d)
      }),

      phaserBridge.on('bossIntroReady', ({ stageId, bossName, introText }) => {
        const campaign = campaignRef.current
        if (!campaign) return
        const stage = campaign.knowledge.stages.find((s) => s.stageId === stageId)
        if (!stage) return
        const pool = [
          ...stage.challenge.variants.hard,
          ...stage.challenge.variants.medium,
          ...stage.challenge.variants.easy,
        ]
        const questions = pool.slice(0, 3)
        const threshold = stage.bossObjective.scoreThreshold ?? 0.75
        recordBossAttempt(campaignId, stageId)
        setBoss({ stageId, bossName, introText, questions, scoreThreshold: threshold })
      }),
    ]

    return () => {
      offs.forEach((off) => off())
      // Flush overlay state on exit so it doesn't bleed into the next session
      setDialogue(null)
      setBattle(null)
      setDiscoveryItem(null)
      setBoss(null)
    }
  }, [campaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStageSelect = useCallback((stageId: string) => {
    setActiveStage(stageId)
    router.push(`/world/${campaignId}/stage/${stageId}`)
  }, [campaignId, setActiveStage, router])

  const handleBattleWin = useCallback((enemyId: string, xp: number, coins: number) => {
    awardXP(campaignId, xp)
    awardCoins(campaignId, coins)
    markEnemyDefeated(campaignId, enemyId)
    setBattle(null)
  }, [campaignId, awardXP, awardCoins, markEnemyDefeated])

  const handleDiscoveryCollect = useCallback(() => {
    const item = discoveryItem
    if (!item) return
    awardXP(campaignId, item.xpReward)
    awardCoins(campaignId, item.coinReward)
    markDiscoveryCollected(campaignId, item.id)
    setDiscoveryItem(null)
  }, [discoveryItem, campaignId, awardXP, awardCoins, markDiscoveryCollected])

  const handleBossPass = useCallback(() => {
    const b = boss
    if (!b) return
    const stage = campaignRef.current?.knowledge.stages.find((s) => s.stageId === b.stageId)
    if (stage) {
      awardXP(campaignId, stage.xpReward)
      setActiveStage(b.stageId)
      router.push(`/world/${campaignId}/stage/${b.stageId}`)
    }
    setBoss(null)
  }, [boss, campaignId, awardXP, setActiveStage, router])

  const handleBossFail = useCallback(() => setBoss(null), [])

  if (!activeCampaign || activeCampaign.id !== campaignId) {
    return (
      <GameLayout>
        <div className="flex-1 flex items-center justify-center text-forge-muted text-sm">
          Loading campaign…
        </div>
      </GameLayout>
    )
  }

  const hasTilemap = !!activeCampaign.world.tilemap
  const percent = getCompletionPercent(campaignId, activeCampaign.world.stages.length)

  return (
    <GameLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {!hasTilemap && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 py-3 bg-forge-dark border-b border-forge-border flex items-center gap-4 shrink-0"
          >
            <Link href="/hub">
              <Button variant="ghost" size="sm">← Hub</Button>
            </Link>
            <div className="flex-1">
              <p className="font-display text-forge-gold text-sm font-semibold">{activeCampaign.name}</p>
              <p className="text-xs text-forge-muted">{activeCampaign.knowledge.topic}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-forge-muted">
              <div className="w-24 h-1.5 bg-forge-void rounded-full border border-forge-border overflow-hidden">
                <div className="h-full bg-forge-gold rounded-full" style={{ width: `${percent}%` }} />
              </div>
              <span>{percent}%</span>
            </div>
          </motion.div>
        )}

        <div className="flex-1 relative overflow-hidden">
          {hasTilemap ? (
            <>
              <PhaserWorldCanvas
                world={activeCampaign.world}
                knowledge={activeCampaign.knowledge}
                campaignId={campaignId}
              />
              <GameHUD campaignId={campaignId} campaignName={activeCampaign.name} />
              <div className="absolute top-12 left-4 z-30 pointer-events-auto">
                <Link href="/hub">
                  <Button variant="ghost" size="sm" className="bg-black/60 backdrop-blur-sm">← Hub</Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <WorldMapCanvas campaign={activeCampaign} onStageSelect={handleStageSelect} />
              <div className="absolute bottom-4 left-4 max-w-xs bg-forge-dark/90 border border-forge-border rounded-xl px-4 py-3 backdrop-blur-sm">
                <p className="text-xs text-forge-muted leading-relaxed line-clamp-3">
                  {activeCampaign.world.lore.worldOrigin ?? activeCampaign.world.lore.playerRole ?? ''}
                </p>
              </div>
            </>
          )}
        </div>

        {dialogue && (
          <DialogueBox name={dialogue.name} lines={dialogue.lines} onClose={() => setDialogue(null)} />
        )}

        {battle && (
          <BattleModal
            enemyName={battle.enemyName}
            question={battle.question}
            onWin={(xp, coins) => handleBattleWin(battle.enemyId, xp, coins)}
            onFlee={() => setBattle(null)}
          />
        )}

        {discoveryItem && (
          <DiscoveryPanel discovery={discoveryItem} onCollect={handleDiscoveryCollect} />
        )}

        {boss && (
          <BossModal
            stageId={boss.stageId}
            bossName={boss.bossName}
            introText={boss.introText}
            questions={boss.questions}
            scoreThreshold={boss.scoreThreshold}
            onPass={handleBossPass}
            onFail={handleBossFail}
          />
        )}
      </div>
    </GameLayout>
  )
}
