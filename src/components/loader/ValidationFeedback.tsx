'use client'

import { cn } from '@/lib/utils'
import type { ValidationResult } from '@/engine/content/types'

interface ValidationFeedbackProps {
  result: ValidationResult | null
  loading?: boolean
}

export function ValidationFeedback({ result, loading }: ValidationFeedbackProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-forge-muted text-sm mt-2">
        <span className="h-3.5 w-3.5 border-2 border-forge-muted border-t-transparent rounded-full animate-spin" />
        Validating…
      </div>
    )
  }

  if (!result) return null

  if (result.valid) {
    return (
      <div className="flex items-center gap-2 text-forge-success text-sm mt-2 font-medium">
        <span>✓</span> Valid JSON — campaign ready to load
      </div>
    )
  }

  return (
    <div className="mt-2 space-y-1">
      {result.errors.map((err, i) => (
        <div
          key={i}
          className={cn(
            'text-xs px-3 py-1.5 rounded-md border font-mono',
            err.source === 'world'
              ? 'border-forge-ember/40 bg-forge-ember/10 text-forge-ember'
              : 'border-forge-danger/40 bg-forge-danger/10 text-forge-danger'
          )}
        >
          <span className="opacity-60 uppercase text-[10px] mr-2">[{err.source}]</span>
          {err.field}: {err.message}
        </div>
      ))}
    </div>
  )
}
