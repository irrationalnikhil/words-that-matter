'use client'

import { useState } from 'react'
import hypothesesData from '@/content/hypotheses.json'

type PreRegistered = typeof hypothesesData.preRegistered[number]

/**
 * Six hypothesis cards as small multiples. Each shows:
 * - Verbatim hypothesis text (serif, quoted)
 * - Study 1 and Study 2 p-values (color-coded: finding/null/caveat)
 * - Plain-English gloss (sans, muted)
 * - Expand for details
 * Caveat tags on multimedia + surprise/cliffhanger per briefing §2.4(d).
 */
export default function HypothesisResults() {
  return (
    <div className="my-8 py-6">
      <h3 className="font-sans text-h3-mobile md:text-h3-desktop font-semibold text-ink mb-2">
        Study 1 &amp; Study 2 results
      </h3>
      <p className="font-sans text-gloss text-ink-muted mb-6">
        Six pre-registered hypotheses tested across two datasets. Click a card to see details.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {hypothesesData.preRegistered.map((hyp) => (
          <HypothesisCard key={hyp.id} hypothesis={hyp} />
        ))}
      </div>
    </div>
  )
}

function HypothesisCard({ hypothesis }: { hypothesis: PreRegistered }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const h = hypothesis

  // Determine result status
  const hasCaveat =
    h.shorthand === 'multimedia evidence' || h.shorthand === 'surprise, cliffhanger'

  const study1Color = h.study1_significant ? 'text-finding' : 'text-ink-faint'
  const study2Color = h.study2_significant
    ? h.study2_note?.includes('OPPOSITE')
      ? 'text-caveat'
      : 'text-finding'
    : 'text-ink-faint'

  // Plain-English gloss
  const gloss = getGloss(h)

  return (
    <button
      onClick={() => setIsExpanded(!isExpanded)}
      className="w-full text-left bg-paper-subtle rounded-lg p-4 border border-paper-deep hover:border-accent/50 transition-colors"
      aria-expanded={isExpanded}
    >
      {/* Caveat tag */}
      {hasCaveat && (
        <span className="inline-block font-sans text-[10px] font-medium px-2 py-0.5 rounded-full bg-caveat/10 text-caveat mb-2">
          {h.shorthand === 'multimedia evidence'
            ? 'opposite direction in Study 2'
            : 'null in Study 2'}
        </span>
      )}

      {/* Hypothesis shorthand */}
      <p className="font-sans text-sm font-semibold text-ink mb-2 capitalize">
        {h.shorthand}
      </p>

      {/* Hypothesis text */}
      <p className="font-serif text-sm text-ink-muted italic leading-relaxed mb-3">
        &ldquo;{h.hypothesis}&rdquo;
      </p>

      {/* Direction */}
      <span
        className={`inline-block text-xs font-sans px-2 py-0.5 rounded-full mb-3 ${
          h.predictedDirection === 'positive'
            ? 'bg-finding/10 text-finding'
            : 'bg-caveat/10 text-caveat'
        }`}
      >
        predicted: {h.predictedDirection === 'positive' ? '↑ increases' : '↓ decreases'}
      </span>

      {/* P-values row */}
      <div className="flex gap-4 text-xs font-mono">
        <div>
          <span className="font-sans text-ink-faint block mb-0.5">Study 1</span>
          <span className={`font-semibold ${study1Color}`}>
            p = {formatP(h.study1_p)}
            {h.study1_significant ? ' ✓' : ''}
          </span>
        </div>
        <div>
          <span className="font-sans text-ink-faint block mb-0.5">Study 2</span>
          <span className={`font-semibold ${study2Color}`}>
            {h.study2_p ? `p ${formatP(h.study2_p)}` : '—'}
            {h.study2_significant ? ' ✓' : ''}
          </span>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-paper-deep animate-in">
          <p className="font-sans text-xs text-ink-muted leading-relaxed mb-2">
            {gloss}
          </p>
          {h.study2_note && (
            <p className="font-sans text-xs text-ink-faint">
              Study 2 note: {h.study2_note}
            </p>
          )}
          {h.noveltyCheck_significant && (
            <p className="font-sans text-xs text-ink-faint mt-1">
              Novelty check: significant (p {formatP(h.noveltyCheck_p)}) — this feature
              captures information beyond the 51 BU constructs.
            </p>
          )}
        </div>
      )}
    </button>
  )
}

function formatP(p: number | string | null): string {
  if (p === null) return '—'
  if (typeof p === 'string') return p
  return p.toFixed(3)
}

function getGloss(h: PreRegistered): string {
  const glossMap: Record<string, string> = {
    'surprise, cliffhanger':
      'Headlines that tease an unexpected outcome or leave something unresolved. Predicted to increase clicks, but the effect was not significant in either study.',
    'parody':
      'Headlines that use humor or imitation for satirical effect. Predicted to increase clicks, but the effect was marginal in Study 1 and not significant in Study 2.',
    'multimedia evidence':
      'Headlines that reference video, photo, or audio evidence. Significant in both studies, but the direction flipped — positive in Study 1, negative in Study 2.',
    'physical reaction':
      'Headlines that describe bodily responses (gasps, tears, goosebumps). Significant and consistent across both studies — the strongest positive finding.',
    'short, simple phrases':
      'Headlines using shorter, plainer language. Predicted to decrease engagement, and this was confirmed in both studies.',
    'positive human behavior':
      'Headlines focusing on people doing good things. Predicted to decrease engagement — confirmed in both studies. One of the novel findings.',
  }
  return glossMap[h.shorthand] || h.hypothesis
}
