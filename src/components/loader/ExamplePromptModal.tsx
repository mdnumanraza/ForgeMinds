'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface ExamplePromptModalProps {
  open: boolean
  onClose: () => void
}

const PROMPT = `You are a JSON content generator for ForgeMinds, an RPG learning engine.

Generate a valid ForgeMinds campaign as two separate JSON objects: world.json and knowledge.json.

RULES:
1. Choose ANY technical topic (programming language, devops tool, framework, concept)
2. Create exactly 3 stages with an engaging RPG theme and names
3. Each stage must have a boss with a thematic name
4. Knowledge stages need: storyIntro, concept (with 3-4 chunks), quest, challenge (3 MCQs), xpReward
5. All stage IDs must match between world.json and knowledge.json
6. unlockCondition for stage-1: {"type":"world_start"}, stage-2+: {"type":"stage_complete","stageId":"previous-id"}

Output ONLY the two JSON objects, no explanation. Format:

=== world.json ===
{ ... }

=== knowledge.json ===
{ ... }

Use this schema reference:
- world.json: id, name, description, theme{atmosphere,primaryColor,accentColor,backgroundKey,musicKey:null}, mapConfig{width:800,height:600,scrollable:false}, stages[], npcs:[], enemies:[], lore
- knowledge.json: worldId (must match world id), topic, difficultyLevel, estimatedHours, prerequisites:[], stages[]
- Each stage: stageId, storyIntro, concept{title,chunks[{type:"text"|"code",content}]}, quest{id,title,objective,type:"code-task"|"short-answer"|"reflection",validation?{strategy:"contains"|"regex"|"exact",value},xpReward}, challenge{difficulty:"easy"|"medium"|"hard",questions[{id,text,options[4],correctIndex,explanation,hints:[]}]}, xpReward, bossObjective`

export function ExamplePromptModal({ open, onClose }: ExamplePromptModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(PROMPT)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal open={open} onClose={onClose} title="Generate a Campaign with AI" size="lg">
      <div className="space-y-4">
        <p className="text-sm text-forge-muted">
          Copy this prompt and paste it into Claude, ChatGPT, or any LLM. Paste the generated JSON
          back into the campaign loader.
        </p>

        <div className="relative">
          <pre className="bg-forge-void border border-forge-border rounded-lg p-4 text-xs font-mono text-forge-text whitespace-pre-wrap overflow-auto max-h-80">
            {PROMPT}
          </pre>
        </div>

        <Button onClick={handleCopy} variant={copied ? 'secondary' : 'primary'} className="w-full">
          {copied ? '✓ Copied to clipboard' : 'Copy Prompt'}
        </Button>

        <p className="text-xs text-forge-muted text-center">
          No API key needed — use any AI assistant in your browser.
        </p>
      </div>
    </Modal>
  )
}
