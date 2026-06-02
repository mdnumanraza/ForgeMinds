'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { JSONTextarea } from './JSONTextarea'
import { ValidationFeedback } from './ValidationFeedback'
import { ExamplePromptModal } from './ExamplePromptModal'
import { validateCampaignJSON, parseRawJSON } from '@/engine/content/SchemaValidator'
import { loadCampaignFromRaw } from '@/engine/content/CampaignLoader'
import { useGameStore } from '@/store/gameStore'
import { useProgressStore } from '@/store/progressStore'
import { useUIStore } from '@/store/uiStore'
import { saveRecentCampaign } from '@/lib/localStorage'
import type { ValidationResult } from '@/engine/content/types'
import { useRouter } from 'next/navigation'

export function CampaignLoaderPanel() {
  const [worldRaw, setWorldRaw] = useState('')
  const [knowledgeRaw, setKnowledgeRaw] = useState('')
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [validating, setValidating] = useState(false)
  const [promptOpen, setPromptOpen] = useState(false)

  const router = useRouter()
  const { setActiveCampaign } = useGameStore()
  const { initCampaign } = useProgressStore()
  const { pushNotification, setLoadingCampaign } = useUIStore()

  const handleValidate = () => {
    setValidating(true)
    setValidation(null)
    setTimeout(() => {
      const parsed = parseRawJSON({ worldRaw, knowledgeRaw })
      if (!parsed.ok) {
        setValidation({ valid: false, errors: parsed.errors })
        setValidating(false)
        return
      }
      const result = validateCampaignJSON(parsed.parsed)
      setValidation(result)
      setValidating(false)
    }, 300)
  }

  const handleLoad = () => {
    const loadResult = loadCampaignFromRaw(worldRaw, knowledgeRaw)
    if (!loadResult.ok) {
      setValidation(loadResult.validation)
      return
    }
    const { campaign } = loadResult
    setLoadingCampaign(true)
    setActiveCampaign(campaign)
    initCampaign(campaign.id, campaign.world.stages[0].id)
    saveRecentCampaign(campaign)
    pushNotification({ type: 'info', message: `"${campaign.name}" loaded!` })
    setLoadingCampaign(false)
    router.push(`/world/${campaign.id}`)
  }

  const hasContent = worldRaw.trim().length > 0 && knowledgeRaw.trim().length > 0

  return (
    <Card className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-forge-gold text-sm font-semibold">Paste Campaign JSON</h2>
          <p className="text-xs text-forge-muted mt-0.5">world.json on the left, knowledge.json on the right</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setPromptOpen(true)}>
          ✦ Generate with AI
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <JSONTextarea
          label="world.json"
          value={worldRaw}
          onChange={(v) => { setWorldRaw(v); setValidation(null) }}
          placeholder={'{\n  "id": "my-world",\n  "name": "My Campaign",\n  ...\n}'}
          hasError={validation !== null && !validation.valid && validation.errors.some(e => e.source === 'world')}
        />
        <JSONTextarea
          label="knowledge.json"
          value={knowledgeRaw}
          onChange={(v) => { setKnowledgeRaw(v); setValidation(null) }}
          placeholder={'{\n  "worldId": "my-world",\n  "topic": "...",\n  ...\n}'}
          hasError={validation !== null && !validation.valid && validation.errors.some(e => e.source === 'knowledge')}
        />
      </div>

      <ValidationFeedback result={validation} loading={validating} />

      <div className="flex items-center gap-3 pt-1">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleValidate}
          disabled={!hasContent}
        >
          Validate JSON
        </Button>
        <Button
          size="md"
          onClick={handleLoad}
          disabled={!hasContent || validating}
          className="ml-auto"
        >
          Load Campaign →
        </Button>
      </div>

      <ExamplePromptModal open={promptOpen} onClose={() => setPromptOpen(false)} />
    </Card>
  )
}
