'use client'

import { useMemo } from 'react'
import katex from 'katex'

interface KaTeXBlockProps {
  latex: string
  label?: string
  displayMode?: boolean
}

/**
 * Renders a LaTeX equation using KaTeX.
 * Displayed in a paper-subtle background block with optional label right-aligned.
 * Uses dangerouslySetInnerHTML with KaTeX's trusted renderToString output.
 */
export default function KaTeXBlock({ latex, label, displayMode = true }: KaTeXBlockProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        trust: false,
        strict: false,
      })
    } catch (e) {
      // Fallback: show raw LaTeX in mono font if rendering fails
      console.error('KaTeX render error:', e)
      return null
    }
  }, [latex, displayMode])

  return (
    <div
      className="my-4 px-4 py-3 bg-paper-subtle rounded-md overflow-x-auto"
      role="math"
      aria-label={label ? `${label}: ${latex}` : latex}
    >
      <div className="flex items-center justify-center gap-4">
        <div className="flex-1 text-center">
          {html ? (
            <span dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <code className="font-mono text-mono-sm md:text-mono-desktop text-ink">
              {latex}
            </code>
          )}
        </div>
        {label && (
          <span className="flex-shrink-0 font-sans text-mono-sm text-ink-faint">
            ({label})
          </span>
        )}
      </div>
    </div>
  )
}
