'use client'

import { useState } from 'react'
import hypothesesData from '@/content/hypotheses.json'

const funnelStages = [
  {
    count: hypothesesData.funnelCounts.generated,
    label: 'hypotheses generated',
    description:
      'GPT-4 generated hypotheses from headline pairs using 288 prompt configurations (9 preambles × 8 structures × 4 variations).',
    quote:
      '"We generated approximately 2,100 hypotheses by prompting GPT-4 with pairs of headlines from Upworthy A/B tests."',
    quoteRef: '§2.3, p.3',
    color: 'bg-method',
  },
  {
    count: hypothesesData.funnelCounts.afterDedup,
    label: 'after de-duplication',
    description: `Hypotheses with embedding distance < ${hypothesesData.funnelCounts.dedupThreshold} were merged as near-duplicates using sentence embeddings (MPNet).`,
    quote:
      '"We filtered out hypotheses that were semantically similar using MPNet sentence embeddings and Euclidean distance."',
    quoteRef: '§2.3, p.3',
    color: 'bg-method',
  },
  {
    count: hypothesesData.funnelCounts.significant,
    label: 'with significant predicted effects',
    description:
      'After applying Benjamini-Hochberg FDR correction to control for multiple testing, only 16 hypotheses had predicted effects significantly different from zero.',
    quote:
      '"We identified hypotheses with statistically significant predicted effects after correcting for multiple comparisons."',
    quoteRef: '§2.3, p.3',
    color: 'bg-finding',
  },
  {
    count: hypothesesData.funnelCounts.preRegistered,
    label: 'pre-registered for testing',
    description:
      '4 hypotheses predicted to increase engagement + 2 predicted to decrease it. These were pre-registered at AsPredicted before looking at the test data.',
    quote:
      '"We pre-registered six hypotheses... four with predicted positive effects and two with predicted negative effects."',
    quoteRef: '§2.4, p.4',
    color: 'bg-finding',
  },
]

/**
 * Vertical funnel visualization: 2,100 → 205 → 16 → 6.
 * Each stage is expandable with description, verbatim quote, and link.
 * Per briefing §2.4(c) — one of the 4 interactives.
 */
export default function FilteringFunnel() {
  const [expandedStage, setExpandedStage] = useState<number | null>(null)

  const maxCount = funnelStages[0].count

  return (
    <div className="my-8 py-6">
      <h3 className="font-sans text-h3-mobile md:text-h3-desktop font-semibold text-ink mb-6">
        The filtering funnel
      </h3>
      <p className="font-sans text-gloss text-ink-muted mb-6">
        How 2,100 machine-generated hypotheses were narrowed to 6 pre-registered ones.
        Click each stage to learn more.
      </p>

      <div className="space-y-3">
        {funnelStages.map((stage, i) => {
          const isExpanded = expandedStage === i
          const barWidth = Math.max((stage.count / maxCount) * 100, 8) // minimum 8% width for visibility

          return (
            <div key={i}>
              <button
                onClick={() => setExpandedStage(isExpanded ? null : i)}
                className="w-full text-left group"
                aria-expanded={isExpanded}
              >
                {/* Count and label */}
                <div className="flex items-baseline gap-3 mb-1.5">
                  <span className="font-mono text-xl md:text-2xl font-semibold text-ink tabular-nums min-w-[4.5rem] text-right">
                    {stage.count.toLocaleString()}
                  </span>
                  <span className="font-sans text-sm text-ink-muted group-hover:text-ink transition-colors">
                    {stage.label}
                    <span className="ml-1.5 text-ink-faint text-xs">
                      {isExpanded ? '▾' : '▸'}
                    </span>
                  </span>
                </div>

                {/* Visual bar */}
                <div className="ml-[4.5rem] pl-3">
                  <div className="h-3 bg-paper-deep rounded-full overflow-hidden">
                    <div
                      className={`h-full ${stage.color} rounded-full transition-all duration-500 ease-out`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="ml-[4.5rem] pl-3 mt-3 mb-2 animate-in">
                  <p className="font-sans text-sm text-ink-muted leading-relaxed mb-2">
                    {stage.description}
                  </p>
                  <blockquote className="border-l-2 border-paper-deep pl-3 py-1">
                    <p className="font-serif text-sm text-ink-muted italic leading-relaxed">
                      {stage.quote}
                    </p>
                    <cite className="font-sans text-xs text-ink-faint not-italic block mt-1">
                      {stage.quoteRef}
                    </cite>
                  </blockquote>
                </div>
              )}

              {/* Arrow between stages */}
              {i < funnelStages.length - 1 && (
                <div className="ml-[4.5rem] pl-3 flex items-center gap-2 py-1 text-ink-faint">
                  <span className="text-xs">↓</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
