'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { GameLayout } from '@/components/layout/GameLayout'
import { CampaignLoaderPanel } from '@/components/loader/CampaignLoaderPanel'
import { Button } from '@/components/ui/Button'

export default function LoadPage() {
  return (
    <GameLayout>
      <div className="flex-1 overflow-y-auto px-6 py-8 max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-forge-gold text-3xl">Load Campaign</h1>
              <p className="text-forge-muted text-sm mt-1">
                Paste world.json and knowledge.json to create a playable campaign.
              </p>
            </div>
            <Link href="/hub">
              <Button variant="ghost" size="sm">← Back to Hub</Button>
            </Link>
          </div>

          <CampaignLoaderPanel />

          <div className="border-t border-forge-border pt-6 text-center space-y-2">
            <p className="text-xs text-forge-muted">
              Don&apos;t have a campaign JSON? Use the &ldquo;Get AI Prompt&rdquo; button above to generate one with any AI assistant.
            </p>
            <p className="text-xs text-forge-muted">
              Or browse our{' '}
              <Link href="/hub" className="text-forge-gold hover:underline">starter templates</Link>.
            </p>
          </div>
        </motion.div>
      </div>
    </GameLayout>
  )
}
