'use client'

import { cn } from '@/lib/utils'

interface JSONTextareaProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  hasError?: boolean
}

export function JSONTextarea({ label, value, onChange, placeholder, hasError }: JSONTextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-forge-muted uppercase tracking-wider">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? '{}'}
        rows={12}
        spellCheck={false}
        className={cn(
          'w-full bg-forge-void border rounded-lg px-4 py-3 text-xs font-mono text-forge-text resize-none',
          'focus:outline-none focus:ring-1 placeholder:text-forge-muted/40',
          hasError
            ? 'border-forge-danger focus:ring-forge-danger'
            : 'border-forge-border focus:ring-forge-gold/50'
        )}
      />
    </div>
  )
}
