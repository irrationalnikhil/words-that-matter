'use client'

import { useState, useCallback, type ReactNode } from 'react'

/**
 * DeepDive — a generalisable collapsible wrapper for optional interactives.
 *
 * Use this to wrap any interactive element that's interesting but not essential
 * to the paper's core argument. The reader sees a teaser prompt and can choose
 * to expand it — the "museum box" pattern (info thrown at you, then optionally
 * open a box or turn a knob).
 *
 * Generalisable: works for any paper, any interactive. Not paper-specific.
 */

interface DeepDiveProps {
  /** Short teaser shown when collapsed, e.g. "See how shrinkage works" */
  teaser: string
  /** Optional sublabel for context, e.g. "Technical detail — Eq. 1" */
  sublabel?: string
  /** Category for accent color: method | finding | caveat | novel */
  category?: 'method' | 'finding' | 'caveat' | 'novel'
  /** The interactive content to show when expanded */
  children: ReactNode
  /** Start expanded? Default false */
  defaultOpen?: boolean
}

const categoryColors: Record<string, { border: string; bg: string; text: string }> = {
  method: { border: 'border-method/30', bg: 'bg-method/5', text: 'text-method' },
  finding: { border: 'border-finding/30', bg: 'bg-finding/5', text: 'text-finding' },
  caveat: { border: 'border-caveat/30', bg: 'bg-caveat/5', text: 'text-caveat' },
  novel: { border: 'border-novel/30', bg: 'bg-novel/5', text: 'text-novel' },
}

const defaultColors = { border: 'border-paper-deep', bg: 'bg-paper-subtle', text: 'text-accent-deep' }

export default function DeepDive({
  teaser,
  sublabel,
  category,
  children,
  defaultOpen = false,
}: DeepDiveProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  const colors = category ? categoryColors[category] || defaultColors : defaultColors

  return (
    <div className={`my-5 rounded-lg border ${colors.border} overflow-hidden transition-all duration-300`}>
      <button
        onClick={toggle}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-paper-subtle/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:ring-inset`}
        aria-expanded={isOpen}
      >
        {/* Expand/collapse chevron */}
        <span
          className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full ${colors.bg} transition-transform duration-300 ${
            isOpen ? 'rotate-90' : ''
          }`}
          aria-hidden="true"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={colors.text}>
            <path d="M3.5 2L7 5L3.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        <div className="flex-1 min-w-0">
          <span className={`font-sans text-sm font-medium ${colors.text}`}>
            {teaser}
          </span>
          {sublabel && (
            <span className="font-sans text-xs text-ink-faint block mt-0.5">
              {sublabel}
            </span>
          )}
        </div>

        {/* Interactive badge */}
        <span className="flex-shrink-0 font-sans text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent-deep uppercase tracking-wider">
          interactive
        </span>
      </button>

      {/* Expandable content */}
      {isOpen && (
        <div className="px-4 pb-4 animate-in">
          {children}
        </div>
      )}
    </div>
  )
}
