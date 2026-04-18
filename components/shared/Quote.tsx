'use client'

import { type Category } from '@/lib/types'

const borderColorMap: Record<string, string> = {
  method: 'border-l-method',
  finding: 'border-l-finding',
  caveat: 'border-l-caveat',
  novel: 'border-l-novel',
}

interface QuoteProps {
  text: string
  section: string
  page: number
  category?: Category | null
}

/**
 * Verbatim quote block with citation.
 * Uses <blockquote> + <cite> for semantic HTML.
 * Left-border accent from the semantic category color.
 */
export default function Quote({ text, section, page, category }: QuoteProps) {
  const borderClass = category ? borderColorMap[category] : 'border-l-paper-deep'

  return (
    <figure className="my-6">
      <blockquote
        className={`border-l-[3px] ${borderClass} pl-5 py-1`}
      >
        <p className="font-serif text-body-mobile md:text-body-desktop text-ink leading-relaxed">
          {text}
        </p>
      </blockquote>
      <figcaption className="mt-1.5 pl-5">
        <cite className="font-sans text-mono-sm text-ink-faint not-italic">
          &sect;{section}, p.&thinsp;{page}
        </cite>
      </figcaption>
    </figure>
  )
}
