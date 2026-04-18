import React from 'react'
import GlossaryTerm from '@/components/shared/GlossaryTerm'
import type { TermAnchor, GlossaryEntry } from '@/lib/types'

/**
 * Takes paragraph text and termAnchors, returns React nodes with
 * glossary terms wrapped in GlossaryTerm popovers.
 * Terms are identified by character offset in the source text.
 */
export function renderTextWithTerms(
  text: string,
  termAnchors: TermAnchor[] | undefined,
  glossary: Record<string, GlossaryEntry>
): React.ReactNode {
  if (!termAnchors || termAnchors.length === 0) {
    return text
  }

  // Sort anchors by offset to process left-to-right
  const sorted = [...termAnchors].sort((a, b) => a.offset - b.offset)
  const result: React.ReactNode[] = []
  let cursor = 0

  for (const anchor of sorted) {
    // Skip anchors with 0 offset and 0 length (placeholder entries)
    if (anchor.offset === 0 && anchor.length === 0) continue

    const entry = glossary[anchor.definitionKey]
    if (!entry) continue

    // Text before this term
    if (anchor.offset > cursor) {
      result.push(text.slice(cursor, anchor.offset))
    }

    // The glossary term itself
    const termText = text.slice(anchor.offset, anchor.offset + anchor.length)
    result.push(
      <GlossaryTerm key={`${anchor.definitionKey}-${anchor.offset}`} entry={entry}>
        {termText}
      </GlossaryTerm>
    )

    cursor = anchor.offset + anchor.length
  }

  // Remaining text after the last term
  if (cursor < text.length) {
    result.push(text.slice(cursor))
  }

  return <>{result}</>
}
