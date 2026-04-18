'use client'

import { useState } from 'react'

/**
 * R² jump chart — BU model (0.04) vs ML model (0.13).
 * Hover/tap for explanation, verbatim quote, F-statistic.
 * Per briefing §2.4(b).
 */

type BarId = 'bu' | 'ml' | null

const bars = [
  {
    id: 'bu' as const,
    label: 'BU model',
    sublabel: '51 psychological features',
    rSquared: 0.04,
    explanation:
      'R² = 0.04 means the BU model (51 psychological constructs from Bannerjee & Urminsky) explains 4% of the variation in ∆CTR.',
    color: 'bg-method',
    colorLight: 'bg-method/10',
    borderColor: 'border-method/30',
  },
  {
    id: 'ml' as const,
    label: 'ML model',
    sublabel: 'Siamese network + sentence embeddings',
    rSquared: 0.13,
    explanation:
      'R² = 0.13 means the ML model (Siamese network with MPNet embeddings) explains 13% of the variation in ∆CTR — a 3.25× improvement over the BU model.',
    color: 'bg-finding',
    colorLight: 'bg-finding/10',
    borderColor: 'border-finding/30',
  },
]

const VERBATIM_QUOTE =
  '"We compared the out-of-sample predictions of the BU model (R² = 0.04) to one that included the prediction from an ML algorithm we trained using each headline\'s sentence embedding (R² = 0.13). Indeed, the ML predictions improved the performance, F(1, 1690) = 169.4, p < .001. This suggests there is signal in the text to be discovered."'

export default function RSquaredChart() {
  const [activeBar, setActiveBar] = useState<BarId>(null)

  const activeData = bars.find((b) => b.id === activeBar)

  return (
    <div className="my-6 rounded-lg border border-paper-deep bg-paper-subtle p-5">
      <h4 className="font-sans text-sm font-semibold text-ink mb-1">
        Model comparison: R² jump
      </h4>
      <p className="font-sans text-xs text-ink-faint mb-5">
        How much of the variation in ∆CTR does each model explain? Click a bar for details.
      </p>

      {/* Chart */}
      <div className="flex items-end gap-6 justify-center h-48 mb-4 px-4">
        {bars.map((bar) => {
          const isActive = activeBar === bar.id
          const heightPct = (bar.rSquared / 0.2) * 100 // scale to 0.2 max for visual clarity

          return (
            <button
              key={bar.id}
              onClick={() => setActiveBar(isActive ? null : bar.id)}
              onMouseEnter={() => setActiveBar(bar.id)}
              onMouseLeave={() => setActiveBar(null)}
              className={`relative flex flex-col items-center group focus:outline-none focus:ring-2 focus:ring-accent/30 rounded-md px-2 py-1`}
              aria-label={`${bar.label}: R² = ${bar.rSquared}. ${bar.explanation}`}
              aria-expanded={isActive}
            >
              {/* R² value label on top */}
              <span
                className={`font-mono text-base font-bold mb-2 tabular-nums transition-colors ${
                  isActive ? 'text-ink' : 'text-ink-muted'
                }`}
              >
                {bar.rSquared.toFixed(2)}
              </span>

              {/* Bar */}
              <div
                className={`w-16 sm:w-20 rounded-t-md transition-all duration-300 ${bar.color} ${
                  isActive ? 'opacity-100 shadow-md' : 'opacity-70 group-hover:opacity-90'
                }`}
                style={{ height: `${heightPct}%`, minHeight: '20px' }}
              />

              {/* Label below */}
              <span className="font-sans text-xs text-ink-muted mt-2 text-center whitespace-nowrap">
                {bar.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* F-statistic */}
      <div className="text-center mb-4">
        <span className="font-mono text-xs text-ink-faint">
          F(1, 1690) = 169.4, p &lt; .001
        </span>
      </div>

      {/* Expanded detail panel */}
      {activeData && (
        <div
          className={`rounded-md p-4 border ${activeData.colorLight} ${activeData.borderColor} mb-4 animate-in`}
        >
          <p className="font-sans text-sm text-ink leading-relaxed mb-3">
            {activeData.explanation}
          </p>
          <blockquote className="border-l-2 border-paper-deep pl-3 py-1">
            <p className="font-serif text-sm text-ink-muted italic leading-relaxed">
              {VERBATIM_QUOTE}
            </p>
            <cite className="font-sans text-xs text-ink-faint not-italic block mt-1">
              §2.2, p.2
            </cite>
          </blockquote>
        </div>
      )}

      {/* Caveat pill */}
      <div className="flex items-start gap-2 rounded-md bg-caveat/5 border border-caveat/15 px-3 py-2.5">
        <span className="inline-block font-sans text-[10px] font-medium px-2 py-0.5 rounded-full bg-caveat/10 text-caveat whitespace-nowrap flex-shrink-0 mt-0.5">
          caveat
        </span>
        <p className="font-sans text-xs text-ink-muted leading-relaxed">
          R² of 0.13 is still not high — most variation in ∆CTR is unexplained. The point is
          relative improvement, not absolute predictive power. The authors note this is evidence
          that &ldquo;there is signal in the text to be discovered,&rdquo; not that the model
          is a reliable predictor of CTR.
        </p>
      </div>
    </div>
  )
}
