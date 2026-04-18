'use client'

import { useState } from 'react'
import morphsData from '@/content/morphs.json'
import TextRail from './TextRail'

const morphExamples = morphsData.examples

/**
 * Stage 2 — Rank (Morph & Score).
 * Shows hypothesis carried forward from Stage 1.
 * Displays headlines with "Morph" buttons that reveal actual morphs from Table 2.
 * Each morph shows predicted ∆CTR bar. Summary score at bottom.
 * Per briefing §3.3 Stage 2.
 *
 * Predicted ∆CTR values are illustrative — the paper does not publish
 * individual morph-level predictions. Values are within the paper's reported ranges.
 */

// Illustrative predicted ∆CTR values per morph (paper reports ∆CTR in range of ~0.001–0.01)
const ILLUSTRATIVE_DELTA_CTR: Record<string, number> = {
  'm-1': 0.0045,
  'm-2': 0.0068,
  'm-3': -0.0032,
  'm-4': 0.0051,
  'm-5': 0.0029,
  'm-6': 0.0073,
}

interface StageRankProps {
  selectedHypothesis?: string
}

export default function StageRank({ selectedHypothesis }: StageRankProps) {
  const [revealedMorphs, setRevealedMorphs] = useState<Set<string>>(new Set())
  const [activeMorphSet, setActiveMorphSet] = useState(0)

  // Show 4 morphs at a time, cycling through sets
  const morphSets = [
    morphExamples.slice(0, 4),
    morphExamples.slice(2, 6),
  ]
  const currentMorphs = morphSets[activeMorphSet] || morphSets[0]

  const toggleMorph = (id: string) => {
    setRevealedMorphs((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Calculate summary score from revealed morphs
  const revealedDeltas = currentMorphs
    .filter((m) => revealedMorphs.has(m.id))
    .map((m) => ILLUSTRATIVE_DELTA_CTR[m.id] || 0)
  const avgDelta =
    revealedDeltas.length > 0
      ? revealedDeltas.reduce((a, b) => a + b, 0) / revealedDeltas.length
      : null

  return (
    <div className="lg:grid lg:grid-cols-[1fr_40%] lg:gap-6">
      <div>
        <h3 className="font-sans text-h3-mobile md:text-h3-desktop font-semibold text-ink mb-2">
          Stage 2: Rank hypotheses
        </h3>
        <p className="font-sans text-gloss text-ink-muted mb-6">
          Each hypothesis is tested by &ldquo;morphing&rdquo; headlines — rewriting them to
          incorporate the hypothesized feature — then predicting the CTR change.
        </p>

        {/* Carried-forward hypothesis */}
        {selectedHypothesis && (
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mb-6">
            <p className="font-sans text-[10px] text-ink-faint uppercase tracking-wider mb-1">
              Your hypothesis from Stage 1
            </p>
            <p className="font-serif text-sm text-ink italic leading-relaxed">
              &ldquo;{selectedHypothesis}&rdquo;
            </p>
          </div>
        )}

        {/* Morph set selector */}
        <div className="flex gap-2 mb-4">
          {morphSets.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveMorphSet(i)
                setRevealedMorphs(new Set())
              }}
              className={`px-3 py-1 font-sans text-xs rounded-md transition-colors ${
                activeMorphSet === i
                  ? 'bg-accent/10 text-accent-deep font-medium'
                  : 'text-ink-faint hover:text-ink-muted bg-paper-subtle'
              }`}
            >
              Headlines {i * 2 + 1}–{Math.min((i + 1) * 2 + 2, morphExamples.length)}
            </button>
          ))}
        </div>

        {/* Morph cards */}
        <div className="space-y-4 mb-6">
          {currentMorphs.map((morph) => {
            const isRevealed = revealedMorphs.has(morph.id)
            const delta = ILLUSTRATIVE_DELTA_CTR[morph.id] || 0

            return (
              <div
                key={morph.id}
                className="rounded-lg border border-paper-deep bg-paper p-4"
              >
                {/* Original headline */}
                <div className="mb-3">
                  <span className="font-sans text-[10px] text-ink-faint uppercase tracking-wider block mb-1">
                    Original headline
                  </span>
                  <p className="font-serif text-sm text-ink leading-relaxed">
                    {morph.original}
                  </p>
                </div>

                {/* Morph button or revealed morph */}
                {!isRevealed ? (
                  <button
                    onClick={() => toggleMorph(morph.id)}
                    className="px-4 py-2 bg-accent text-ink font-sans text-sm font-medium rounded-md hover:bg-accent-deep transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30"
                  >
                    Morph →
                  </button>
                ) : (
                  <div className="animate-in">
                    {/* Morphed headline */}
                    <div className="bg-finding/5 border border-finding/15 rounded-md p-3 mb-3">
                      <span className="font-sans text-[10px] text-ink-faint uppercase tracking-wider block mb-1">
                        Morphed headline
                      </span>
                      <p className="font-serif text-sm text-ink leading-relaxed">
                        {morph.morph}
                      </p>
                      <p className="font-sans text-[10px] text-ink-faint mt-1.5">
                        Hypothesis applied: &ldquo;{morph.hypothesis}&rdquo;
                      </p>
                    </div>

                    {/* Predicted ∆CTR bar */}
                    <div className="flex items-center gap-3">
                      <span className="font-sans text-xs text-ink-faint whitespace-nowrap">
                        Predicted ∆CTR
                      </span>
                      <div className="flex-1 h-5 bg-paper-deep rounded-full overflow-hidden relative">
                        {/* Center line at 0 */}
                        <div className="absolute inset-y-0 left-1/2 w-px bg-ink-faint/30" />
                        {/* Delta bar */}
                        <div
                          className={`absolute top-0.5 bottom-0.5 rounded-full transition-all duration-500 ${
                            delta >= 0 ? 'bg-finding' : 'bg-caveat'
                          }`}
                          style={{
                            left: delta >= 0 ? '50%' : `${50 + delta * 5000}%`,
                            width: `${Math.abs(delta) * 5000}%`,
                            maxWidth: '48%',
                          }}
                        />
                      </div>
                      <span
                        className={`font-mono text-xs tabular-nums font-semibold ${
                          delta >= 0 ? 'text-finding' : 'text-caveat'
                        }`}
                      >
                        {delta >= 0 ? '+' : ''}
                        {(delta * 100).toFixed(2)}%
                      </span>
                    </div>

                    <p className="font-sans text-[10px] text-ink-faint mt-1">
                      From {morph.source}. ∆CTR is illustrative — within the paper&apos;s reported range.
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Summary score */}
        {avgDelta !== null && (
          <div className="bg-paper-subtle rounded-lg border border-paper-deep p-4 mb-4 animate-in">
            <p className="font-sans text-[10px] text-ink-faint uppercase tracking-wider mb-1">
              Hypothesis-level score ({revealedDeltas.length} morphs)
            </p>
            <div className="flex items-center gap-4">
              <span
                className={`font-mono text-xl font-bold tabular-nums ${
                  avgDelta >= 0 ? 'text-finding' : 'text-caveat'
                }`}
              >
                avg ∆CTR: {avgDelta >= 0 ? '+' : ''}{(avgDelta * 100).toFixed(3)}%
              </span>
            </div>
            <p className="font-sans text-xs text-ink-faint mt-2">
              By applying the hypothesis to many different headlines and predicting its effect,
              we get a sense of how generalizable it is. This aggregate is illustrative.
            </p>
          </div>
        )}

        {/* Caveat note */}
        <div className="flex items-start gap-2 rounded-md bg-caveat/5 border border-caveat/15 px-3 py-2.5">
          <span className="inline-block font-sans text-[10px] font-medium px-2 py-0.5 rounded-full bg-caveat/10 text-caveat whitespace-nowrap flex-shrink-0 mt-0.5">
            caveat
          </span>
          <p className="font-sans text-xs text-ink-muted leading-relaxed">
            The ML model&apos;s predictions are not ground truth — they&apos;re signals.
            The actual test is Studies 1 and 2, coming up in Stage 3.
          </p>
        </div>
      </div>

      {/* Right: Text rail */}
      <div className="mt-8 lg:mt-0">
        <div className="lg:hidden font-sans text-xs text-ink-faint uppercase tracking-wider mb-2">
          The paper says…
        </div>
        <TextRail
          sectionRef="§2.3, ¶4–5, p.3"
          paragraphs={[
            'For each hypothesis, we rewrote headlines to incorporate the hypothesized feature while keeping the story content the same. We generated 252,000 headline morphs across all hypothesis–headline combinations.',
            'By applying the hypotheses to many different headlines and predicting their effect, we get a sense of how generalizable each hypothesis is.',
          ]}
          note="The ML model's predictions are not ground truth — they're signals. The actual test is Studies 1 and 2."
        />
      </div>
    </div>
  )
}
