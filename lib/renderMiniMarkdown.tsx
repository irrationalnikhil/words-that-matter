import React from 'react'

/**
 * Minimal markdown renderer for margin notes.
 * Supports only: **bold** and [text](url).
 * No full markdown parser needed — margin notes use only these two patterns.
 * Returns an array of React elements suitable for rendering inline.
 */
export function renderMiniMarkdown(text: string): React.ReactNode[] {
  // Combined pattern: **bold** or [text](url)
  const pattern = /(\*\*(.+?)\*\*)|(\[([^\]]+)\]\(([^)]+)\))/g
  const result: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    // Push any text before this match
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index))
    }

    if (match[1]) {
      // **bold** match
      result.push(
        <strong key={match.index} className="font-semibold text-ink">
          {match[2]}
        </strong>
      )
    } else if (match[3]) {
      // [text](url) match
      result.push(
        <a
          key={match.index}
          href={match[5]}
          className="underline decoration-dotted underline-offset-2 hover:text-ink transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          {match[4]}
        </a>
      )
    }

    lastIndex = match.index + match[0].length
  }

  // Push any remaining text after the last match
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex))
  }

  return result
}
