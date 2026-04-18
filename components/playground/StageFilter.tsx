'use client'

import { useState, useMemo } from 'react'
import hypothesesData from '@/content/hypotheses.json'
import TextRail from './TextRail'

/**
 * Stage 3 — Filter.
 * Vertical funnel: 2,100 → 205 → 16 → 6.
 * Euclidean distance slider, FDR toggle, hypothesis cards.
 * Per briefing §3.3 Stage 3.
 *
 * Survival counts at various thresholds are pre-computed estimates.
 * Only the 0.03 threshold (205) is the paper's exact value.
 */

// Pre-computed survival counts at various Euclidean distance thresholds
// Only threshold=0.03 → 205 is from the paper; others are illustrative interpolations.
const SURVIVAL_COUNTS: [number, number][] = [
  [0.01, 820],
  [0.015, 580],
  [0.02, 410],
  [0.025, 290],
  [0.03, 205],   // ← paper's actual value
  [0.035, 155],
  [0.04, 118],
  [0.045, 90],
  [0.05, 72],
  [0.06, 48],
  [0.07, 35],
  [0.08, 28],
  [0.09, 23],
  [0.10, 19],
]

// FDR-corrected significant counts (illustrative; 16 is paper's value at threshold=0.03)
const FDR_CORRECTED_COUNTS: Record<string, { withFDR: number; withoutFDR: number }> = {
  '0.01': { withFDR: 38, withoutFDR: 95 },
  '0.015': { withFDR: 30, withoutFDR: 72 },
  '0.02': { withFDR: 24, withoutFDR: 55 },
  '0.025': { withFDR: 19, withoutFDR: 42 },
  '0.03': { withFDR: 16, withoutFDR: 35 },  // ← paper's actual value
  '0.035': { withFDR: 13, withoutFDR: 28 },
  '0.04': { withFDR: 10, withoutFDR: 22 },
  '0.045': { withFDR: 8, withoutFDR: 18 },
  '0.05': { withFDR: 7, withoutFDR: 15 },
  '0.06': { withFDR: 5, withoutFDR: 10 },
  '0.07': { withFDR: 4, withoutFDR: 8 },
  '0.08': { withFDR: 3, withoutFDR: 6 },
  '0.09': { withFDR: 3, withoutFDR: 5 },
  '0.10': { withFDR: 2, withoutFDR: 4 },
}

function interpolateSurvival(threshold: number): number {
  for (let i = 0; i < SURVIVAL_COUNTS.length - 1; i++) {
    const [t1, c1] = SURVIVAL_COUNTS[i]
    const [t2, c2] = SURVIVAL_COUNTS[i + 1]
    if (threshold >= t1 && threshold <= t2) {
      const fraction = (threshold - t1) / (t2 - t1)
      return Math.round(c1 + fraction * (c2 - c1))
    }
  }
  if (threshold < SURVIVAL_COUNTS[0][0]) return SURVIVAL_COUNTS[0][1]
  return SURVIVAL_COUNTS[SURVIVAL_COUNTS.length - 1][1]
}

function getClosestFDR(threshold: number): { withFDR: number; withoutFDR: number } {
  // Find the closest key in FDR_CORRECTED_COUNTS
  const keys = Object.keys(FDR_CORRECTED_COUNTS).map(Number).sort((a, b) => a - b)
  let closest = keys[0]
  let minDist = Math.abs(threshold - closest)
  for (const k of keys) {
    const dist = Math.abs(threshold - k)
    if (dist < minDist) {
      closest = k
      minDist = dist
    }
  }
  return FDR_CORRECTED_COUNTS[closest.toString()] || FDR_CORRECTED_COUNTS['0.03']
}

type PreRegistered = (typeof hypothesesData.preRegistered)[number]

export default function StageFilter() {
  const [threshold, setThreshold] = useState(0.03)
  const [fdrEnabled, setFdrEnabled] = useState(true)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const afterDedup = useMemo(() => interpolateSurvival(threshold), [threshold])
  const fdrCounts = useMemo(() => getClosestFDR(threshold), [threshold])
  const significant = fdrEnabled ? fdrCounts.withFDR : fdrCounts.withoutFDR
  const isDefaultThreshold = Math.abs(threshold - 0.03) < 0.001

  return (
    <div className="lg:grid lg:grid-cols-[1fr_40%] lg:gap-6">
      <div>
        <h3 className="font-sans text-h3-mobile md:text-h3-desktop font-semibold text-ink mb-2">
          Stage 3: Filter &amp; test
        </h3>
        <p className="font-sans text-gloss text-ink-muted mb-6">
          The funnel narrows from 2,100 machine-generated hypotheses to 6 pre-registered ones.
          Adjust the filtering parameters to see how the counts change.
        </p>

        {/* Euclidean distance slider */}
        <div className="bg-paper-subtle rounded-lg border border-paper-deep p-4 mb-6">
          <div className="flex items-baseline justify-between mb-2">
            <label className="font-sans text-sm font-medium text-ink" htmlFor="euclidean-slider">
              Euclidean distance threshold
            </label>
            <span className="font-mono text-sm text-accent-deep tabular-nums">
              {threshold.toFixed(2)}
            </span>
          </div>
          <input
            id="euclidean-slider"
            type="range"
            min={0.01}
            max={0.10}
            step={0.005}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full h-2 bg-paper-deep rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-sm
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-accent/30 focus:ring-offset-2 focus:ring-offset-paper-subtle"
            aria-label="Euclidean distance threshold for de-duplication"
            aria-valuenow={threshold}
            aria-valuemin={0.01}
            aria-valuemax={0.10}
          />
          <div className="flex justify-between mt-1 mb-3">
            <span className="font-sans text-[10px] text-ink-faint">0.01 (permissive)</span>
            <span className="font-sans text-[10px] text-ink-faint">0.10 (strict)</span>
          </div>
          <p className="font-sans text-xs text-ink-muted leading-relaxed">
            {threshold < 0.03
              ? 'Lower threshold = more hypotheses survive but more redundancy. Many near-duplicate hypotheses are kept.'
              : threshold > 0.05
              ? 'Higher threshold = fewer hypotheses survive. We\'re demanding more distinctiveness between each hypothesis.'
              : 'At the paper\'s default (0.03), hypotheses must be meaningfully distinct from each other to survive.'}
          </p>

          {/* FDR toggle */}
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-paper-deep">
            <button
              onClick={() => setFdrEnabled(!fdrEnabled)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30 ${
                fdrEnabled ? 'bg-accent' : 'bg-paper-deep'
              }`}
              role="switch"
              aria-checked={fdrEnabled}
              aria-label="Benjamini-Hochberg FDR correction"
            >
              <span
                className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                  fdrEnabled ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
            <div>
              <span className="font-sans text-sm text-ink">FDR correction</span>
              <span className="font-sans text-xs text-ink-faint block">
                Benjamini-Hochberg — controls for multiple testing
              </span>
            </div>
          </div>
        </div>

        {/* Funnel visualization */}
        <div className="space-y-2 mb-6">
          <FunnelBar
            count={2100}
            label="hypotheses generated"
            maxCount={2100}
            color="bg-method"
            isFixed
          />
          <div className="pl-6 text-ink-faint text-xs">↓ de-duplication (distance &gt; {threshold.toFixed(2)})</div>
          <FunnelBar
            count={afterDedup}
            label="after de-duplication"
            maxCount={2100}
            color="bg-method"
            isExact={isDefaultThreshold}
          />
          <div className="pl-6 text-ink-faint text-xs">
            ↓ {fdrEnabled ? 'FDR-corrected ' : ''}significance test
          </div>
          <FunnelBar
            count={significant}
            label={`with significant predicted effects${!fdrEnabled ? ' (no FDR)' : ''}`}
            maxCount={2100}
            color="bg-finding"
            isExact={isDefaultThreshold && fdrEnabled}
          />
          <div className="pl-6 text-ink-faint text-xs">↓ pre-registration selection</div>
          <FunnelBar
            count={6}
            label="pre-registered for testing"
            maxCount={2100}
            color="bg-finding"
            isFixed
          />
        </div>

        {/* Pre-registered hypothesis cards */}
        <div className="mb-6">
          <h4 className="font-sans text-sm font-semibold text-ink mb-3">
            The 6 pre-registered hypotheses
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hypothesesData.preRegistered.map((hyp) => (
              <HypothesisResultCard
                key={hyp.id}
                hypothesis={hyp}
                isExpanded={expandedCard === hyp.id}
                onToggle={() =>
                  setExpandedCard(expandedCard === hyp.id ? null : hyp.id)
                }
              />
            ))}
          </div>
        </div>

        {/* Caveat */}
        <div className="flex items-start gap-2 rounded-md bg-caveat/5 border border-caveat/15 px-3 py-2.5 mb-4">
          <span className="inline-block font-sans text-[10px] font-medium px-2 py-0.5 rounded-full bg-caveat/10 text-caveat whitespace-nowrap flex-shrink-0 mt-0.5">
            caveat
          </span>
          <p className="font-sans text-xs text-ink-muted leading-relaxed">
            When controlling for 51 existing psychological constructs, only 2 of 6 features
            showed significant incremental effects (§2.4). The authors note in §5
            that &ldquo;one could argue that these features appear similar to insights
            already known.&rdquo;
          </p>
        </div>

        {!isDefaultThreshold && (
          <p className="font-sans text-[10px] text-ink-faint">
            * Survival counts at thresholds other than 0.03 are illustrative interpolations.
            Only the 0.03 value (205 hypotheses) is from the paper.
          </p>
        )}
      </div>

      {/* Right: Text rail */}
      <div className="mt-8 lg:mt-0">
        <div className="lg:hidden font-sans text-xs text-ink-faint uppercase tracking-wider mb-2">
          The paper says…
        </div>
        <TextRail
          sectionRef="§2.3, ¶4 – §2.4, ¶1, p.3–4"
          paragraphs={[
            'Working from highest to lowest scores, we selected hypotheses that had a Euclidean distance greater than 0.03 from previously selected hypotheses. Finally, we tested whether the predicted treatment effects of the remaining 205 hypotheses were significantly different from 0 (after applying a correction to control for false discovery rates). Sixteen hypotheses had significant, positive predicted effects (p<.05).',
            'To test our hypotheses — and assuage any concerns of overfitting or p-hacking — we pre-registered the six hypotheses and conducted all of our tests out of sample, on data that was intentionally left untouched in all the preceding steps.',
          ]}
          note="2 of 6 hypotheses survived the novelty check (controlling for BU features). Most did not. The authors treat this honestly in §5."
        />
      </div>
    </div>
  )
}

function FunnelBar({
  count,
  label,
  maxCount,
  color,
  isFixed,
  isExact,
}: {
  count: number
  label: string
  maxCount: number
  color: string
  isFixed?: boolean
  isExact?: boolean
}) {
  const barWidth = Math.max((count / maxCount) * 100, 4)

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-1">
        <span className="font-mono text-lg md:text-xl font-semibold text-ink tabular-nums min-w-[4rem] text-right">
          {count.toLocaleString()}
        </span>
        <span className="font-sans text-sm text-ink-muted">
          {label}
          {!isFixed && !isExact && (
            <span className="text-ink-faint text-[10px] ml-1">*</span>
          )}
        </span>
      </div>
      <div className="ml-[4rem] pl-3">
        <div className="h-3 bg-paper-deep rounded-full overflow-hidden">
          <div
            className={`h-full ${color} rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function HypothesisResultCard({
  hypothesis,
  isExpanded,
  onToggle,
}: {
  hypothesis: PreRegistered
  isExpanded: boolean
  onToggle: () => void
}) {
  const h = hypothesis
  const hasCaveat =
    h.shorthand === 'multimedia evidence' || h.shorthand === 'surprise, cliffhanger'

  const study1Color = h.study1_significant ? 'text-finding' : 'text-ink-faint'
  const study2Color = h.study2_significant
    ? h.study2_note?.includes('OPPOSITE')
      ? 'text-caveat'
      : 'text-finding'
    : 'text-ink-faint'

  return (
    <button
      onClick={onToggle}
      className="w-full text-left bg-paper rounded-lg p-3 border border-paper-deep hover:border-accent/50 transition-colors"
      aria-expanded={isExpanded}
    >
      {hasCaveat && (
        <span className="inline-block font-sans text-[10px] font-medium px-2 py-0.5 rounded-full bg-caveat/10 text-caveat mb-1.5">
          {h.shorthand === 'multimedia evidence'
            ? 'opposite direction in Study 2'
            : 'null in Study 2'}
        </span>
      )}

      <p className="font-sans text-xs font-semibold text-ink mb-1 capitalize">
        {h.shorthand}
      </p>

      <span
        className={`inline-block text-[10px] font-sans px-1.5 py-0.5 rounded-full mb-2 ${
          h.predictedDirection === 'positive'
            ? 'bg-finding/10 text-finding'
            : 'bg-caveat/10 text-caveat'
        }`}
      >
        {h.predictedDirection === 'positive' ? '↑' : '↓'}
      </span>

      <div className="flex gap-3 text-xs font-mono">
        <div>
          <span className="font-sans text-ink-faint block text-[10px]">S1</span>
          <span className={study1Color}>
            {formatP(h.study1_p)}
            {h.study1_significant ? ' ✓' : ''}
          </span>
        </div>
        <div>
          <span className="font-sans text-ink-faint block text-[10px]">S2</span>
          <span className={study2Color}>
            {h.study2_p ? formatP(h.study2_p) : '—'}
            {h.study2_significant ? ' ✓' : ''}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-paper-deep animate-in">
          <p className="font-serif text-xs text-ink-muted italic leading-relaxed">
            &ldquo;{h.hypothesis}&rdquo;
          </p>
          {h.study2_note && (
            <p className="font-sans text-[10px] text-ink-faint mt-1">
              Study 2: {h.study2_note}
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
