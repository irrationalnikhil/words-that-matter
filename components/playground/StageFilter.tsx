'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  ReferenceLine,
  ZAxis,
} from 'recharts'
import hypothesesData from '@/content/hypotheses.json'
import embeddingData from '@/content/embeddingSpace.json'
import TextRail from './TextRail'

/**
 * Stage 3 — Filter.
 * Upgraded with:
 * - Recharts scatter plot of hypothesis embedding space
 * - Effect size distribution chart
 * - Interactive funnel with animated Recharts bars
 * - Euclidean distance slider + FDR toggle
 * - Pre-registered hypothesis cards
 * Per briefing §3.3 Stage 3, upgraded for dynamism.
 */

// Pre-computed survival counts at various Euclidean distance thresholds
const SURVIVAL_COUNTS: [number, number][] = [
  [0.01, 820], [0.015, 580], [0.02, 410], [0.025, 290],
  [0.03, 205], [0.035, 155], [0.04, 118], [0.045, 90],
  [0.05, 72], [0.06, 48], [0.07, 35], [0.08, 28],
  [0.09, 23], [0.10, 19],
]

const FDR_CORRECTED_COUNTS: Record<string, { withFDR: number; withoutFDR: number }> = {
  '0.01': { withFDR: 38, withoutFDR: 95 },
  '0.015': { withFDR: 30, withoutFDR: 72 },
  '0.02': { withFDR: 24, withoutFDR: 55 },
  '0.025': { withFDR: 19, withoutFDR: 42 },
  '0.03': { withFDR: 16, withoutFDR: 35 },
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
  const keys = Object.keys(FDR_CORRECTED_COUNTS).map(Number).sort((a, b) => a - b)
  let closest = keys[0]
  let minDist = Math.abs(threshold - closest)
  for (const k of keys) {
    const dist = Math.abs(threshold - k)
    if (dist < minDist) { closest = k; minDist = dist }
  }
  return FDR_CORRECTED_COUNTS[closest.toString()] || FDR_CORRECTED_COUNTS['0.03']
}

type PreRegistered = (typeof hypothesesData.preRegistered)[number]

// Stage colors
const STAGE_COLORS: Record<string, string> = {
  preregistered: '#537a3a',
  significant: '#4a6fa5',
  deduplicated: '#c4924a',
}

export default function StageFilter() {
  const [threshold, setThreshold] = useState(0.03)
  const [fdrEnabled, setFdrEnabled] = useState(true)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [activeViz, setActiveViz] = useState<'scatter' | 'distribution'>('scatter')
  const afterDedup = useMemo(() => interpolateSurvival(threshold), [threshold])
  const fdrCounts = useMemo(() => getClosestFDR(threshold), [threshold])
  const significant = fdrEnabled ? fdrCounts.withFDR : fdrCounts.withoutFDR
  const isDefaultThreshold = Math.abs(threshold - 0.03) < 0.001

  // Scatter plot data — filter based on threshold
  const scatterData = useMemo(() => {
    // Scale threshold effect: at low thresholds, more points survive dedup
    const thresholdNorm = (threshold - 0.01) / (0.10 - 0.01)
    return embeddingData.hypotheses.map((h, i) => {
      // Deterministic "survives" based on hypothesis index + threshold
      // Uses a simple hash so dots don't randomly flicker when sliding
      const hash = ((i * 2654435761) >>> 0) / 4294967296 // Knuth multiplicative hash → [0,1)
      const survives = h.stage === 'preregistered' || h.stage === 'significant' ||
        (h.stage === 'deduplicated' && hash > thresholdNorm * 0.3)

      return {
        ...h,
        xScaled: h.x * 100,
        yScaled: h.y * 100,
        survives,
        fill: STAGE_COLORS[h.stage] || '#c4924a',
        size: h.stage === 'preregistered' ? 120 : h.stage === 'significant' ? 80 : 40,
      }
    })
  }, [threshold])

  // Distribution data
  const distributionData = useMemo(() => {
    return embeddingData.effectDistribution.map((d) => ({
      bin: `${(d.bin * 100).toFixed(1)}%`,
      binValue: d.bin * 100,
      count: d.count,
    }))
  }, [])

  const handleThresholdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setThreshold(Number(e.target.value))
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ScatterTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null
    const d = payload[0].payload
    if (!d.label) return null
    return (
      <div className="bg-paper border border-paper-deep rounded-md px-3 py-2 shadow-md max-w-[200px]">
        <p className="font-sans text-xs font-medium text-ink capitalize">{d.label}</p>
        <p className={`font-mono text-xs ${d.effect >= 0 ? 'text-finding' : 'text-caveat'}`}>
          effect: {d.effect >= 0 ? '+' : ''}{(d.effect * 100).toFixed(2)}%
        </p>
        <p className="font-sans text-[10px] text-ink-faint capitalize">{d.stage}</p>
      </div>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const DistTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null
    const d = payload[0].payload
    return (
      <div className="bg-paper border border-paper-deep rounded-md px-3 py-2 shadow-md">
        <p className="font-sans text-xs text-ink">∆CTR ≈ {d.bin}</p>
        <p className="font-mono text-xs text-accent-deep">{d.count} hypotheses</p>
      </div>
    )
  }

  return (
    <div className="lg:grid lg:grid-cols-[1fr_40%] lg:gap-6">
      <div>
        <h3 className="font-sans text-h3-mobile md:text-h3-desktop font-semibold text-ink mb-2">
          Stage 3: Filter &amp; test
        </h3>
        <p className="font-sans text-gloss text-ink-muted mb-6">
          The funnel narrows from 2,100 machine-generated hypotheses to 6 pre-registered ones.
          Explore the hypothesis space and adjust filtering parameters.
        </p>

        {/* Visualization toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveViz('scatter')}
            className={`px-3 py-1.5 font-sans text-xs rounded-md transition-colors ${
              activeViz === 'scatter'
                ? 'bg-accent/10 text-accent-deep font-medium border border-accent/30'
                : 'text-ink-faint hover:text-ink-muted bg-paper-subtle border border-paper-deep'
            }`}
          >
            Embedding space
          </button>
          <button
            onClick={() => setActiveViz('distribution')}
            className={`px-3 py-1.5 font-sans text-xs rounded-md transition-colors ${
              activeViz === 'distribution'
                ? 'bg-accent/10 text-accent-deep font-medium border border-accent/30'
                : 'text-ink-faint hover:text-ink-muted bg-paper-subtle border border-paper-deep'
            }`}
          >
            Effect distribution
          </button>
        </div>

        {/* Scatter plot: Hypothesis embedding space */}
        {activeViz === 'scatter' && (
          <div className="bg-paper-subtle rounded-lg border border-paper-deep p-4 mb-6">
            <h4 className="font-sans text-sm font-semibold text-ink mb-1">
              Hypothesis embedding space
            </h4>
            <p className="font-sans text-xs text-ink-faint mb-3">
              Each dot is a hypothesis, projected from 768-dim embeddings to 2D.
              Hypotheses too close together get de-duplicated. Larger dots survived filtering.
            </p>

            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ede6d3" />
                <XAxis
                  type="number" dataKey="xScaled" domain={[0, 100]}
                  tick={false} axisLine={{ stroke: '#ede6d3' }} label={{ value: 'Dimension 1', position: 'bottom', offset: -5, style: { fontSize: 10, fill: '#767676', fontFamily: 'DM Sans' } }}
                />
                <YAxis
                  type="number" dataKey="yScaled" domain={[0, 100]}
                  tick={false} axisLine={{ stroke: '#ede6d3' }} label={{ value: 'Dimension 2', angle: -90, position: 'left', offset: -5, style: { fontSize: 10, fill: '#767676', fontFamily: 'DM Sans' } }}
                />
                <ZAxis type="number" dataKey="size" range={[30, 200]} />
                <Tooltip content={<ScatterTooltip />} cursor={false} />
                {/* Deduplicated (background) — small, faint dots */}
                <Scatter
                  name="Deduplicated"
                  data={scatterData.filter((d) => d.stage === 'deduplicated')}
                  fill="#c4924a"
                  fillOpacity={0.3}
                  shape="circle"
                />
                {/* Significant — medium, visible dots */}
                <Scatter
                  name="Significant"
                  data={scatterData.filter((d) => d.stage === 'significant')}
                  fill="#4a6fa5"
                  fillOpacity={0.7}
                  shape="circle"
                />
                {/* Pre-registered — large, prominent dots */}
                <Scatter
                  name="Pre-registered"
                  data={scatterData.filter((d) => d.stage === 'preregistered')}
                  fill="#537a3a"
                  fillOpacity={1}
                  shape="diamond"
                />
              </ScatterChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-2">
              <LegendItem color="#537a3a" size={10} label="Pre-registered (6)" />
              <LegendItem color="#4a6fa5" size={8} label="Significant (16)" />
              <LegendItem color="#c4924a" size={5} label="Deduplicated" opacity={0.4} />
            </div>

            <p className="font-sans text-[10px] text-ink-faint mt-2">
              Positions are an illustrative 2D projection. The paper uses 768-dim MPNet embeddings.
            </p>
          </div>
        )}

        {/* Effect size distribution */}
        {activeViz === 'distribution' && (
          <div className="bg-paper-subtle rounded-lg border border-paper-deep p-4 mb-6">
            <h4 className="font-sans text-sm font-semibold text-ink mb-1">
              Distribution of predicted effects
            </h4>
            <p className="font-sans text-xs text-ink-faint mb-3">
              Most hypotheses cluster around zero effect. The pipeline selects those with
              significant positive effects after FDR correction.
            </p>

            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={distributionData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ede6d3" vertical={false} />
                <XAxis
                  dataKey="bin"
                  tick={{ fontSize: 10, fill: '#5a5a5a', fontFamily: 'JetBrains Mono, monospace' }}
                  axisLine={{ stroke: '#ede6d3' }}
                  tickLine={false}
                  interval={1}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#767676' }}
                  axisLine={false} tickLine={false}
                  label={{ value: 'Hypotheses', angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: 10, fill: '#767676', fontFamily: 'DM Sans' } }}
                />
                <Tooltip content={<DistTooltip />} cursor={{ fill: '#ede6d3', fillOpacity: 0.5 }} />
                <ReferenceLine x="0.0%" stroke="#767676" strokeWidth={1} strokeDasharray="4 4" />
                <Bar dataKey="count" radius={[3, 3, 0, 0]} barSize={24} animationDuration={800}>
                  {distributionData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.binValue > 0 ? '#537a3a' : entry.binValue < 0 ? '#ad5633' : '#c4924a'}
                      fillOpacity={0.7}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <p className="font-sans text-[10px] text-ink-faint mt-2">
              Illustrative distribution — bin counts are representative of the described pipeline.
            </p>
          </div>
        )}

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
            onChange={handleThresholdChange}
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
          <FunnelBar count={2100} label="hypotheses generated" maxCount={2100} color="bg-method" isFixed />
          <div className="pl-6 text-ink-faint text-xs">&darr; de-duplication (distance &gt; {threshold.toFixed(2)})</div>
          <FunnelBar count={afterDedup} label="after de-duplication" maxCount={2100} color="bg-method" isExact={isDefaultThreshold} />
          <div className="pl-6 text-ink-faint text-xs">&darr; {fdrEnabled ? 'FDR-corrected ' : ''}significance test</div>
          <FunnelBar count={significant} label={`with significant predicted effects${!fdrEnabled ? ' (no FDR)' : ''}`} maxCount={2100} color="bg-finding" isExact={isDefaultThreshold && fdrEnabled} />
          <div className="pl-6 text-ink-faint text-xs">&darr; pre-registration selection</div>
          <FunnelBar count={6} label="pre-registered for testing" maxCount={2100} color="bg-finding" isFixed />
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
          The paper says&hellip;
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

function LegendItem({ color, size, label, opacity = 1 }: { color: string; size: number; label: string; opacity?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-block rounded-full"
        style={{ width: size, height: size, backgroundColor: color, opacity }}
      />
      <span className="font-sans text-[10px] text-ink-faint">{label}</span>
    </div>
  )
}

function FunnelBar({
  count, label, maxCount, color, isFixed, isExact,
}: {
  count: number; label: string; maxCount: number; color: string; isFixed?: boolean; isExact?: boolean
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
          {!isFixed && !isExact && <span className="text-ink-faint text-[10px] ml-1">*</span>}
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
  hypothesis, isExpanded, onToggle,
}: {
  hypothesis: PreRegistered; isExpanded: boolean; onToggle: () => void
}) {
  const h = hypothesis
  const hasCaveat = h.shorthand === 'multimedia evidence' || h.shorthand === 'surprise, cliffhanger'

  const study1Color = h.study1_significant ? 'text-finding' : 'text-ink-faint'
  const study2Color = h.study2_significant
    ? h.study2_note?.includes('OPPOSITE') ? 'text-caveat' : 'text-finding'
    : 'text-ink-faint'

  return (
    <button
      onClick={onToggle}
      className="w-full text-left bg-paper rounded-lg p-3 border border-paper-deep hover:border-accent/50 transition-colors"
      aria-expanded={isExpanded}
    >
      {hasCaveat && (
        <span className="inline-block font-sans text-[10px] font-medium px-2 py-0.5 rounded-full bg-caveat/10 text-caveat mb-1.5">
          {h.shorthand === 'multimedia evidence' ? 'opposite direction in Study 2' : 'null in Study 2'}
        </span>
      )}

      <p className="font-sans text-xs font-semibold text-ink mb-1 capitalize">{h.shorthand}</p>

      <span className={`inline-block text-[10px] font-sans px-1.5 py-0.5 rounded-full mb-2 ${
        h.predictedDirection === 'positive' ? 'bg-finding/10 text-finding' : 'bg-caveat/10 text-caveat'
      }`}>
        {h.predictedDirection === 'positive' ? '\u2191' : '\u2193'}
      </span>

      <div className="flex gap-3 text-xs font-mono">
        <div>
          <span className="font-sans text-ink-faint block text-[10px]">S1</span>
          <span className={study1Color}>
            {formatP(h.study1_p)}{h.study1_significant ? ' \u2713' : ''}
          </span>
        </div>
        <div>
          <span className="font-sans text-ink-faint block text-[10px]">S2</span>
          <span className={study2Color}>
            {h.study2_p ? formatP(h.study2_p) : '\u2014'}{h.study2_significant ? ' \u2713' : ''}
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
  if (p === null) return '\u2014'
  if (typeof p === 'string') return p
  return p.toFixed(3)
}
