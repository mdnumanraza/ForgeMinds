'use client'

import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean
  variant?: 'default' | 'inset'
}

export function Card({ glow, variant = 'default', className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border',
        variant === 'default'
          ? 'bg-forge-surface border-forge-border p-5'
          : 'bg-forge-void border-forge-border/60 p-4',
        glow && 'border-forge-gold/40 shadow-glow-gold',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
