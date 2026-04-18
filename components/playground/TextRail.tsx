'use client'

import { renderMiniMarkdown } from '@/lib/renderMiniMarkdown'

interface TextRailProps {
  sectionRef: string    // e.g. "§2.3, ¶2, p.3"
  paragraphs: string[]  // verbatim text from the paper
  note?: string         // optional margin note
}

/**
 * Sticky right-hand rail with verbatim paper text.
 * Desktop (≥1024px): sticky sidebar, always visible.
 * Mobile: inline "The paper says…" block.
 */
export default function TextRail({ sectionRef, paragraphs, note }: TextRailProps) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="bg-paper-subtle rounded-lg p-5 border border-paper-deep">
        {/* Rail header */}
        <p className="font-sans text-[13px] text-ink-faint mb-1">From the paper (verbatim)</p>
        <p className="font-sans text-xs text-ink-faint mb-3">{sectionRef}</p>

        {/* Verbatim paragraphs */}
        <div className="space-y-3">
          {paragraphs.map((text, i) => (
            <p
              key={i}
              className="font-serif text-[15px] lg:text-[17px] text-ink leading-relaxed"
            >
              {text}
            </p>
          ))}
        </div>

        {/* Optional note */}
        {note && (
          <div className="mt-3 pt-3 border-t border-paper-deep">
            <p className="font-sans text-xs text-ink-muted leading-relaxed">
              {renderMiniMarkdown(note)}
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
