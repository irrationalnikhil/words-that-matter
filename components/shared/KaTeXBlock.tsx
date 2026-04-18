'use client'

import { useState, useEffect } from 'react'

interface KaTeXBlockProps {
  latex: string
  label?: string
  displayMode?: boolean
}

/**
 * Renders a LaTeX equation using KaTeX.
 * Displayed in a paper-subtle background block with optional label right-aligned.
 * Uses useEffect to ensure KaTeX only renders in the browser (not during SSR).
 */
export default function KaTeXBlock({ latex, label, displayMode = true }: KaTeXBlockProps) {
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    // Dynamic import ensures KaTeX is only loaded client-side
    import('katex').then((katex) => {
      try {
        const rendered = katex.default.renderToString(latex, {
          displayMode,
          throwOnError: false,
          trust: false,
          strict: false,
        })
        setHtml(rendered)
      } catch (e) {
        console.error('KaTeX render error:', e)
        setHtml(null)
      }
    })
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
