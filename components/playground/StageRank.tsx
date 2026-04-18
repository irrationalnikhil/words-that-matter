'use client'

import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import morphsData from '@/content/morphs.json'
import TextRail from './TextRail'

const morphExamples = morphsData.examples

/**
 * Stage 2 — Rank (Morph & Score).
 * Upgraded with Recharts bar chart that builds as morphs are revealed.
 * Shows hypothesis carried forward from Stage 1.
 * Each morph has "Morph →" reveal + Recharts delta bar chart.
 * Per briefing §3.3 Stage 2, upgraded for dynamism.
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

// Short labels for chart
const SHORT_LABELS: Record<string, string> = {
  'm-1': 'Emotional trigger',
  'm-2': 'Personal story',
  'm-3': 'Sensationalism',
  'm-4': 'Narrative arc',
  'm-5': 'Mystery',
  'm-6': 'Surprise',
}

interface StageRankProps {
  selectedHypothesis?: string
}

export default function StageRank({ selectedHypothesis }: StageRankProps) {
  const [revealedMorphs, setRevealedMorphs] = useState<Set<string>>(new Set())
  const [activeMorphSet, setActiveMorphSet] = useState(0)
  const [hoveredMorph, setHoveredMorph] = useState<string | null>(null)

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

  // Chart data from revealed morphs
  const chartData = useMemo(() => {
    return currentMorphs
      .filter((m) => revealedMorphs.has(m.id))
      .map((m) => ({
        id: m.id,
        name: SHORT_LABELS[m.id] || m.id,
        delta: (ILLUSTRATIVE_DELTA_CTR[m.id] || 0) * 100,
        rawDelta: ILLUSTRATIVE_DELTA_CTR[m.id] || 0,
      }))
  }, [currentMorphs, revealedMorphs])

  const avgDelta = useMemo(() => {
    if (chartData.length === 0) return null
    return chartData.reduce((sum, d) => sum + d.rawDelta, 0) / chartData.length
  }, [chartData])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null
    const data = payload[0].payload
    return (
      <div className="bg-paper border border-paper-deep rounded-md px-3 py-2 shadow-md">
        <p className="font-sans text-xs font-medium text-ink">{data.name}</p>
        <p className={`font-mono text-sm font-bold ${data.delta >= 0 ? 'text-finding' : 'text-caveat'}`}>
          {data.delta >= 0 ? '+' : ''}{data.delta.toFixed(2)}% CTR
        </p>
      </div>
    )
  }

  return (
    <div className="lg:grid lg:grid-cols-[1fr_40%] lg:gap-6">
      <div>
        <h3 className="font-sans text-h3-mobile md:text-h3-desktop font-semibold text-ink mb-2">
          Stage 2: Rank hypotheses
        </h3>
        <p className="font-sans text-gloss text-ink-muted mb-6">
          Each hypothesis is tested by &ldquo;morphing&rdquo; headlines — rewriting them to
          incorporate the hypothesized feature — then predicting the CTR change.
          Reveal morphs below to build the effect chart.
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
              Headlines {i * 2 + 1}&ndash;{Math.min((i + 1) * 2 + 2, morphExamples.length)}
            </button>
          ))}
        </div>

        {/* Morph cards */}
        <div className="space-y-4 mb-6">
          {currentMorphs.map((morph) => {
            const isRevealed = revealedMorphs.has(morph.id)
            const delta = ILLUSTRATIVE_DELTA_CTR[morph.id] || 0
            const isHovered = hoveredMorph === morph.id

            return (
              <div
                key={morph.id}
                className={`rounded-lg border bg-paper p-4 transition-all duration-200 ${
                  isHovered ? 'border-accent/50 shadow-sm' : 'border-paper-deep'
                }`}
                onMouseEnter={() => setHoveredMorph(morph.id)}
                onMouseLeave={() => setHoveredMorph(null)}
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
                    Morph &rarr;
                  </button>
                ) : (
                  <div className="animate-in">
                    {/* Morphed headline with diff-style highlight */}
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

                    {/* Inline delta indicator */}
                    <div className="flex items-center gap-3">
                      <span className="font-sans text-xs text-ink-faint whitespace-nowrap">
                        Predicted ∆CTR
                      </span>
                      <span
                        className={`font-mono text-sm tabular-nums font-bold ${
                          delta >= 0 ? 'text-finding' : 'text-caveat'
                        }`}
                      >
                        {delta >= 0 ? '+' : ''}
                        {(delta * 100).toFixed(2)}%
                      </span>
                      <span className="font-sans text-[10px] text-ink-faint">
                        ({SHORT_LABELS[morph.id]})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Recharts effect comparison — builds as morphs are revealed */}
        {chartData.length > 0 && (
          <div className="bg-paper-subtle rounded-lg border border-paper-deep p-4 mb-6 animate-in">
            <h4 className="font-sans text-sm font-semibold text-ink mb-1">
              Effect comparison
            </h4>
            <p className="font-sans text-xs text-ink-faint mb-4">
              Predicted ∆CTR for each revealed morph. Reveal more morphs to build the chart.
            </p>

            <ResponsiveContainer width="100%" height={Math.max(120, chartData.length * 50 + 40)}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ede6d3" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[-0.5, 1]}
                  tickFormatter={(v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`}
                  tick={{ fontSize: 11, fill: '#5a5a5a', fontFamily: 'JetBrains Mono, monospace' }}
                  axisLine={{ stroke: '#ede6d3' }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 11, fill: '#5a5a5a', fontFamily: 'DM Sans, sans-serif' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <ReferenceLine x={0} stroke="#767676" strokeWidth={1} />
                <Bar dataKey="delta" radius={[0, 4, 4, 0]} barSize={20} animationDuration={600}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.id}
                      fill={entry.delta >= 0 ? '#537a3a' : '#ad5633'}
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Aggregate score */}
            {avgDelta !== null && (
              <div className="mt-3 pt-3 border-t border-paper-deep flex items-center gap-3">
                <span className="font-sans text-xs text-ink-faint">Hypothesis-level score:</span>
                <span
                  className={`font-mono text-base font-bold tabular-nums ${
                    avgDelta >= 0 ? 'text-finding' : 'text-caveat'
                  }`}
                >
                  avg ∆CTR: {avgDelta >= 0 ? '+' : ''}{(avgDelta * 100).toFixed(3)}%
                </span>
                <span className="font-sans text-[10px] text-ink-faint">
                  ({chartData.length} morph{chartData.length !== 1 ? 's' : ''})
                </span>
              </div>
            )}

            <p className="font-sans text-[10px] text-ink-faint mt-2">
              ∆CTR values are illustrative — within the paper&apos;s reported range.
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
          The paper says&hellip;
        </div>
        <TextRail
          sectionRef="§2.3, ¶3, p.3"
          paragraphs={[
            'We produced 252,000 counterfactual headlines ("morphs") by having GPT rewrite a set of Upworthy headlines to incorporate each feature. Each morph was based on one actual headline and one of the hypotheses. We then used the ML algorithm to predict the difference in CTR between each morph and the original headline it was based on.',
            'By applying the hypotheses to many different headlines and predicting their effect, we get a sense of how generalizable it is.',
          ]}
          note="The ML model's predictions are not ground truth — they're signals. The actual test is Studies 1 and 2."
        />
      </div>
    </div>
  )
}
