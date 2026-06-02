'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { GameLayout } from '@/components/layout/GameLayout'
import { ConceptViewer } from '@/components/game/ConceptViewer'
import { QuestPanel } from '@/components/game/QuestPanel'
import { ChallengeModal } from '@/components/game/ChallengeModal'
import { BossIntro } from '@/components/game/BossIntro'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useGameStore } from '@/store/gameStore'
import { useProgressStore } from '@/store/progressStore'
import { usePlayerStore } from '@/store/playerStore'
import { useUIStore } from '@/store/uiStore'
import { loadCampaignFromStorage, saveRecentCampaign } from '@/lib/localStorage'
import { resolveStageContext, getNextStageId, isCampaignComplete } from '@/engine/learning/LearningEngine'
import { evaluateQuestAnswer } from '@/engine/learning/QuestRunner'
import { resolveAdaptiveVariant } from '@/engine/learning/AdaptiveFlow'
import type { StageContext } from '@/engine/learning/LearningEngine'
import type { ChallengeResult } from '@/engine/learning/ChallengeEngine'
import type { StagePhase } from '@/store/gameStore'
import Link from 'next/link'

export default function StagePage() {
  const { campaignId, stageId } = useParams<{ campaignId: string; stageId: string }>()
  const router = useRouter()

  const { activeCampaign, stagePhase, setActiveCampaign, setPhase } = useGameStore()
  const { getStageStatus, markStageComplete, unlockStage, getCampaignProgress } = useProgressStore()
  const { addXP } = usePlayerStore()
  const { pushNotification } = useUIStore()

  const [ctx, setCtx] = useState<StageContext | null>(null)
  const [questAnswer, setQuestAnswer] = useState('')
  const [questFeedback, setQuestFeedback] = useState<string | null>(null)
  const [questPassed, setQuestPassed] = useState(false)
  const [challengeOpen, setChallengeOpen] = useState(false)
  const [earnedXP, setEarnedXP] = useState(0)
  const [bossAnswer, setBossAnswer] = useState('')
  const [bossFeedback, setBossFeedback] = useState<string | null>(null)
  const [bossPassed, setBossPassed] = useState(false)

  useEffect(() => {
    // Reset all local state so replaying a stage always starts clean
    setCtx(null)
    setQuestAnswer('')
    setQuestFeedback(null)
    setQuestPassed(false)
    setChallengeOpen(false)
    setEarnedXP(0)
    setBossAnswer('')
    setBossFeedback(null)
    setBossPassed(false)

    let campaign = activeCampaign
    if (!campaign || campaign.id !== campaignId) {
      const stored = loadCampaignFromStorage(campaignId)
      if (!stored) { router.replace('/hub'); return }
      setActiveCampaign(stored)
      campaign = stored
    }
    const resolved = resolveStageContext(campaign, stageId)
    if (!resolved) { router.replace(`/world/${campaignId}`); return }
    setCtx(resolved)
    setPhase('STORY_INTRO')
  }, [campaignId, stageId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!ctx || !activeCampaign) {
    return (
      <GameLayout>
        <div className="flex-1 flex items-center justify-center text-forge-muted text-sm">Loading…</div>
      </GameLayout>
    )
  }

  const { knowledgeStage, stageDef } = ctx
  const timesPlayed = getCampaignProgress(campaignId)?.stages[stageId]?.timesPlayed ?? 0
  const adaptiveVariant = resolveAdaptiveVariant(knowledgeStage, timesPlayed)
  const activeQuest = knowledgeStage.quests[0]

  const handleQuestSubmit = () => {
    if (!activeQuest) return
    const result = evaluateQuestAnswer(activeQuest, questAnswer)
    setQuestFeedback(result.feedback)
    setQuestPassed(result.passed)
    if (result.passed) {
      const xp = activeQuest.validation ? 50 : 50
      addXP(xp)
      pushNotification({ type: 'xp', message: 'Quest complete!', amount: xp })
      setTimeout(() => {
        setPhase('CHALLENGE')
        setQuestFeedback(null)
        setQuestAnswer('')
      }, 1200)
    }
  }

  const handleChallengeComplete = (result: ChallengeResult) => {
    setChallengeOpen(false)
    setEarnedXP(result.xpEarned)
    const { levelUp, newLevel } = addXP(result.xpEarned)
    if (levelUp) pushNotification({ type: 'levelup', message: `Level up! You are now level ${newLevel}!` })
    pushNotification({ type: 'xp', message: 'Challenge complete!', amount: result.xpEarned })
    setPhase('XP_REWARD')
  }

  const handleBossSubmit = () => {
    const passed = bossAnswer.trim().length >= 20
    setBossFeedback(passed ? knowledgeStage.bossObjective.victoryText : 'Please elaborate more to defeat the boss.')
    setBossPassed(passed)
    if (passed) {
      setTimeout(() => { finishStage() }, 1000)
    }
  }

  const finishStage = () => {
    addXP(knowledgeStage.xpReward)
    markStageComplete(campaignId, stageId, earnedXP + knowledgeStage.xpReward)
    const nextId = getNextStageId(activeCampaign, stageId)
    if (nextId) unlockStage(campaignId, nextId)
    saveRecentCampaign(activeCampaign)
    setPhase('COMPLETE')
  }

  const handleContinueAfterComplete = () => {
    router.push(`/world/${campaignId}`)
  }

  return (
    <GameLayout>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <Link href={`/world/${campaignId}`}>
              <Button variant="ghost" size="sm">← Map</Button>
            </Link>
            <div>
              <p className="text-xs text-forge-muted">{activeCampaign.name}</p>
              <p className="font-display text-forge-gold font-semibold">{stageDef.name}</p>
            </div>
            <PhaseIndicator phase={stagePhase} />
          </div>

          <AnimatePresence mode="wait">
            {stagePhase === 'STORY_INTRO' && (
              <motion.div key="story" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
                <Card className="border-forge-gold/20">
                  <p className="text-xs text-forge-gold uppercase tracking-wider mb-2">{knowledgeStage.storyIntro.title}</p>
                  <p className="text-sm text-forge-text leading-relaxed">{knowledgeStage.storyIntro.text}</p>
                </Card>
                <Button onClick={() => setPhase('CONCEPT')} className="w-full">Begin Learning →</Button>
              </motion.div>
            )}

            {stagePhase === 'CONCEPT' && (
              <motion.div key="concept" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <ConceptViewer stage={knowledgeStage} onContinue={() => setPhase('QUEST')} />
              </motion.div>
            )}

            {stagePhase === 'QUEST' && activeQuest && (
              <motion.div key="quest" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <QuestPanel
                  quest={activeQuest}
                  answer={questAnswer}
                  onAnswerChange={setQuestAnswer}
                  onSubmit={handleQuestSubmit}
                  feedback={questFeedback}
                  passed={questPassed}
                />
              </motion.div>
            )}

            {stagePhase === 'CHALLENGE' && knowledgeStage.challenge && (
              <motion.div key="challenge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="text-center py-8 space-y-4">
                  <p className="text-3xl">⚔️</p>
                  <p className="font-display text-forge-gold text-xl">Challenge Time!</p>
                  <p className="text-sm text-forge-muted">
                    Test your knowledge with {knowledgeStage.challenge.variants[adaptiveVariant].length} questions.
                  </p>
                  <Button onClick={() => setChallengeOpen(true)}>Start Challenge</Button>
                </Card>
                <ChallengeModal
                  open={challengeOpen}
                  challenge={knowledgeStage.challenge}
                  variant={adaptiveVariant}
                  baseXP={knowledgeStage.xpReward}
                  onComplete={handleChallengeComplete}
                  onClose={() => setChallengeOpen(false)}
                />
              </motion.div>
            )}

            {stagePhase === 'XP_REWARD' && (
              <motion.div key="xp" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center space-y-5 py-8">
                <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.5 }} className="text-5xl">⚡</motion.div>
                <p className="font-display text-forge-gold text-2xl">XP Earned!</p>
                <p className="text-forge-text text-lg font-semibold">+{earnedXP > 0 ? earnedXP : knowledgeStage.xpReward} XP</p>
                <Button onClick={() => setPhase('BOSS_FIGHT')} size="lg">Face the Boss →</Button>
              </motion.div>
            )}

            {stagePhase === 'BOSS_FIGHT' && (
              <motion.div key="boss" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <BossIntro stageDef={stageDef} knowledgeStage={knowledgeStage} onBegin={() => {}} />
                <QuestPanel
                  quest={{
                    id: 'boss-quest',
                    type: 'fill-blank',
                    title: knowledgeStage.bossObjective.title,
                    objective: knowledgeStage.bossObjective.description,
                    hints: [],
                    validation: { strategy: 'none', successMessage: knowledgeStage.bossObjective.victoryText, failureMessage: 'Please elaborate more.', pattern: undefined },
                  }}
                  answer={bossAnswer}
                  onAnswerChange={setBossAnswer}
                  onSubmit={handleBossSubmit}
                  feedback={bossFeedback}
                  passed={bossPassed}
                />
              </motion.div>
            )}

            {stagePhase === 'COMPLETE' && (
              <motion.div key="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5 py-8">
                <div className="text-5xl">🏆</div>
                <p className="font-display text-forge-gold text-2xl">Stage Complete!</p>
                <p className="text-sm text-forge-muted">{stageDef.name} has been conquered.</p>
                <Button onClick={handleContinueAfterComplete} size="lg" className="w-full">Continue →</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </GameLayout>
  )
}

function PhaseIndicator({ phase }: { phase: StagePhase }) {
  const labels: Record<StagePhase, string> = {
    IDLE: '', STORY_INTRO: 'Story', CONCEPT: 'Concept', QUEST: 'Quest',
    CHALLENGE: 'Challenge', XP_REWARD: 'Reward', BOSS_FIGHT: 'Boss', COMPLETE: 'Complete',
  }
  const label = labels[phase]
  if (!label) return null
  return (
    <span className="ml-auto text-xs text-forge-muted bg-forge-surface border border-forge-border rounded-full px-3 py-0.5">
      {label}
    </span>
  )
}
