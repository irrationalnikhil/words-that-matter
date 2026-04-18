'use client'

import { useState, useMemo, useCallback } from 'react'
import headlinesData from '@/content/headlines.json'
import promptsData from '@/content/prompts.json'
import TextRail from './TextRail'

/**
 * Stage 1 — Generate.
 * Expanded headline explorer with real Upworthy-style data.
 * - Browsable headline pairs with topic filtering
 * - User can type their own headline pair
 * - Prompt configuration dropdowns (288 combos)
 * - Hypothesis generation (pre-baked results for real pairs, simulated for user input)
 * Per briefing §3.3 Stage 1, upgraded for dynamism.
 */

const pairs = headlinesData.pairs
const topics = headlinesData.topics

// Simulated hypothesis templates for user-input headlines
const SIMULATED_TEMPLATES = [
  'Using {feature} in the headline results in more engagement with a message.',
  'Incorporating {feature} affects engagement with a message.',
  'Framing a message to {feature} increases engagement.',
  '{Feature} in headlines leads to more engagement with a message.',
]

const FEATURES = [
  'emotional specificity', 'narrative tension', 'concrete detail',
  'curiosity gaps', 'personal stakes', 'surprising contrasts',
  'temporal urgency', 'social identity cues', 'sensory language',
]

function simulateHypothesis(): { hypothesis: string; direction: 'positive' | 'negative' } {
  const feature = FEATURES[Math.floor(Math.random() * FEATURES.length)]
  const template = SIMULATED_TEMPLATES[Math.floor(Math.random() * SIMULATED_TEMPLATES.length)]
  const hypothesis = template
    .replace('{feature}', feature)
    .replace('{Feature}', feature.charAt(0).toUpperCase() + feature.slice(1))
  return {
    hypothesis,
    direction: Math.random() > 0.3 ? 'positive' : 'negative',
  }
}

interface StageGenerateProps {
  onHypothesisSelect?: (hypothesis: string) => void
}

export default function StageGenerate({ onHypothesisSelect }: StageGenerateProps) {
  const [selectedPair, setSelectedPair] = useState<string | null>(null)
  const [showHypothesis, setShowHypothesis] = useState(false)
  const [preambleIndex, setPreambleIndex] = useState(0)
  const [structureIndex, setStructureIndex] = useState(0)
  const [variationIndex, setVariationIndex] = useState(0)
  const [topicFilter, setTopicFilter] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [mode, setMode] = useState<'browse' | 'custom'>('browse')
  const [customA, setCustomA] = useState('')
  const [customB, setCustomB] = useState('')
  const [simulatedResult, setSimulatedResult] = useState<{ hypothesis: string; direction: 'positive' | 'negative' } | null>(null)

  const PAIRS_PER_PAGE = 4

  const filteredPairs = useMemo(() => {
    if (!topicFilter) return pairs
    return pairs.filter((p) => p.topic === topicFilter)
  }, [topicFilter])

  const pagedPairs = useMemo(() => {
    const start = page * PAIRS_PER_PAGE
    return filteredPairs.slice(start, start + PAIRS_PER_PAGE)
  }, [filteredPairs, page])

  const totalPages = Math.ceil(filteredPairs.length / PAIRS_PER_PAGE)

  const selected = pairs.find((p) => p.id === selectedPair) || null

  const handleGenerate = useCallback(() => {
    setShowHypothesis(true)
    if (mode === 'browse' && selected && onHypothesisSelect) {
      onHypothesisSelect(selected.hypothesis)
    } else if (mode === 'custom') {
      const result = simulateHypothesis()
      setSimulatedResult(result)
      if (onHypothesisSelect) onHypothesisSelect(result.hypothesis)
    }
  }, [mode, selected, onHypothesisSelect])

  return (
    <div className="lg:grid lg:grid-cols-[1fr_40%] lg:gap-6">
      {/* Left: Interactive workspace */}
      <div>
        <h3 className="font-sans text-h3-mobile md:text-h3-desktop font-semibold text-ink mb-2">
          Stage 1: Generate hypotheses
        </h3>
        <p className="font-sans text-gloss text-ink-muted mb-6">
          The pipeline takes a pair of headlines from an A/B test and asks GPT-4 to identify
          what feature might explain the difference in engagement. Try it yourself.
        </p>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => { setMode('browse'); setShowHypothesis(false) }}
            className={`px-4 py-2 font-sans text-sm rounded-md transition-colors ${
              mode === 'browse'
                ? 'bg-accent/15 text-accent-deep font-medium border border-accent/30'
                : 'text-ink-faint hover:text-ink-muted bg-paper-subtle border border-paper-deep'
            }`}
          >
            Browse A/B tests
          </button>
          <button
            onClick={() => { setMode('custom'); setShowHypothesis(false); setSelectedPair(null) }}
            className={`px-4 py-2 font-sans text-sm rounded-md transition-colors ${
              mode === 'custom'
                ? 'bg-accent/15 text-accent-deep font-medium border border-accent/30'
                : 'text-ink-faint hover:text-ink-muted bg-paper-subtle border border-paper-deep'
            }`}
          >
            Write your own headlines
          </button>
        </div>

        {mode === 'browse' ? (
          <>
            {/* Topic filter */}
            <div className="mb-4">
              <p className="font-sans text-xs text-ink-faint mb-2">Filter by topic</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => { setTopicFilter(null); setPage(0) }}
                  className={`px-2.5 py-1 font-sans text-xs rounded-full transition-colors ${
                    !topicFilter
                      ? 'bg-accent/15 text-accent-deep font-medium'
                      : 'text-ink-faint hover:text-ink-muted bg-paper-subtle'
                  }`}
                >
                  All ({pairs.length})
                </button>
                {topics.map((topic) => {
                  const count = pairs.filter((p) => p.topic === topic).length
                  if (count === 0) return null
                  return (
                    <button
                      key={topic}
                      onClick={() => { setTopicFilter(topic); setPage(0) }}
                      className={`px-2.5 py-1 font-sans text-xs rounded-full transition-colors ${
                        topicFilter === topic
                          ? 'bg-accent/15 text-accent-deep font-medium'
                          : 'text-ink-faint hover:text-ink-muted bg-paper-subtle'
                      }`}
                    >
                      {topic} ({count})
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Headline pair gallery */}
            <div className="space-y-3 mb-4">
              {pagedPairs.map((pair) => (
                <button
                  key={pair.id}
                  onClick={() => {
                    setSelectedPair(pair.id)
                    setShowHypothesis(false)
                  }}
                  className={`w-full text-left rounded-lg p-4 border transition-colors ${
                    selectedPair === pair.id
                      ? 'border-accent bg-accent/5'
                      : 'border-paper-deep bg-paper-subtle hover:border-accent/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-sans text-[10px] text-ink-faint uppercase tracking-wider bg-paper-deep px-2 py-0.5 rounded-full">
                      {pair.topic}
                    </span>
                    <span className={`font-mono text-xs tabular-nums font-medium ${
                      pair.deltaCTR > 0 ? 'text-finding' : pair.deltaCTR < 0 ? 'text-caveat' : 'text-ink-faint'
                    }`}>
                      {pair.deltaCTR > 0 ? '+' : ''}{(pair.deltaCTR * 100).toFixed(1)}% CTR
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="font-sans text-[10px] text-ink-faint uppercase tracking-wider block mb-1">
                        Headline A
                      </span>
                      <p className="font-serif text-sm text-ink leading-relaxed">
                        {pair.headlineA}
                      </p>
                    </div>
                    <div>
                      <span className="font-sans text-[10px] text-ink-faint uppercase tracking-wider block mb-1">
                        Headline B
                      </span>
                      <p className="font-serif text-sm text-ink leading-relaxed">
                        {pair.headlineB}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mb-6">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 font-sans text-xs rounded-md border border-paper-deep bg-paper disabled:opacity-30 disabled:cursor-not-allowed hover:border-accent/50 transition-colors"
                >
                  Previous
                </button>
                <span className="font-sans text-xs text-ink-faint tabular-nums">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 font-sans text-xs rounded-md border border-paper-deep bg-paper disabled:opacity-30 disabled:cursor-not-allowed hover:border-accent/50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          /* Custom headline input mode */
          <div className="bg-paper rounded-lg border border-paper-deep p-5 mb-6">
            <h4 className="font-sans text-sm font-semibold text-ink mb-1">
              Write your own A/B test
            </h4>
            <p className="font-sans text-xs text-ink-faint mb-4">
              Imagine you&apos;re writing two versions of a headline for the same story.
              What would you change?
            </p>
            <div className="space-y-3">
              <div>
                <label className="font-sans text-xs text-ink-faint block mb-1">Headline A</label>
                <input
                  type="text"
                  value={customA}
                  onChange={(e) => { setCustomA(e.target.value); setShowHypothesis(false) }}
                  placeholder="e.g. Scientists Make A Breakthrough In Cancer Research"
                  className="w-full bg-paper-subtle border border-paper-deep rounded-md px-3 py-2.5 font-serif text-sm text-ink placeholder:text-ink-faint/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/30"
                />
              </div>
              <div>
                <label className="font-sans text-xs text-ink-faint block mb-1">Headline B</label>
                <input
                  type="text"
                  value={customB}
                  onChange={(e) => { setCustomB(e.target.value); setShowHypothesis(false) }}
                  placeholder="e.g. This Cancer Discovery Has Doctors Speechless"
                  className="w-full bg-paper-subtle border border-paper-deep rounded-md px-3 py-2.5 font-serif text-sm text-ink placeholder:text-ink-faint/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/30"
                />
              </div>
            </div>
          </div>
        )}

        {/* Prompt structure (visible when input is ready) */}
        {(selected || (mode === 'custom' && customA.trim() && customB.trim())) && (
          <div className="bg-paper rounded-lg border border-paper-deep p-5 mb-6 animate-in">
            <h4 className="font-sans text-sm font-semibold text-ink mb-3">
              Prompt configuration
            </h4>
            <p className="font-sans text-xs text-ink-faint mb-4">
              The pipeline uses 288 prompt configurations (9 preambles &times; 8 structures &times; 4 variations).
              Toggle the dropdowns to see how different axes change the prompt.
            </p>

            {/* Three randomization axes */}
            <div className="space-y-3 mb-4">
              <PromptDropdown
                label="Preamble"
                options={promptsData.preambles}
                selected={preambleIndex}
                onChange={setPreambleIndex}
                note={promptsData.preambleNote}
              />
              <PromptDropdown
                label="Hypothesis structure"
                options={promptsData.hypothesisStructures}
                selected={structureIndex}
                onChange={setStructureIndex}
                note={promptsData.structureNote}
              />
              <PromptDropdown
                label="Variation"
                options={promptsData.variations.map((v) => `${v.name}: ${v.description}`)}
                selected={variationIndex}
                onChange={setVariationIndex}
                note={promptsData.variationNote}
              />
            </div>

            {/* Assembled prompt preview */}
            <div className="bg-paper-subtle rounded-md p-4 font-mono text-xs text-ink-muted leading-relaxed">
              <p className="text-ink-faint mb-2"># Assembled prompt</p>
              <p>
                You are <span className="text-method">{promptsData.preambles[preambleIndex]}</span>.
              </p>
              <p className="mt-2">
                Given headline A: &ldquo;<span className="text-ink">{mode === 'browse' && selected ? selected.headlineA : customA}</span>&rdquo;
              </p>
              <p>
                And headline B: &ldquo;<span className="text-ink">{mode === 'browse' && selected ? selected.headlineB : customB}</span>&rdquo;
              </p>
              <p className="mt-2">
                Generate a hypothesis in this format:
              </p>
              <p className="text-accent-deep mt-1">
                {promptsData.hypothesisStructures[structureIndex]}
              </p>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              className="mt-4 px-5 py-2.5 bg-accent text-ink font-sans text-sm font-medium rounded-md hover:bg-accent-deep transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              Generate hypothesis
            </button>

            {/* Result */}
            {showHypothesis && (
              <div className="mt-4 p-4 bg-finding/5 border border-finding/20 rounded-lg animate-in">
                <p className="font-sans text-[10px] text-ink-faint uppercase tracking-wider mb-2">
                  {mode === 'browse'
                    ? `Hypothesis generated (from ${selected?.topic || 'data'})`
                    : 'Simulated hypothesis'}
                </p>
                <p className="font-serif text-base text-ink italic leading-relaxed">
                  &ldquo;{mode === 'browse' && selected
                    ? selected.hypothesis
                    : simulatedResult?.hypothesis || ''}&rdquo;
                </p>
                <span
                  className={`inline-block mt-2 text-xs font-sans px-2 py-0.5 rounded-full ${
                    (mode === 'browse'
                      ? selected?.hypothesisDirection
                      : simulatedResult?.direction) === 'positive'
                      ? 'bg-finding/10 text-finding'
                      : 'bg-caveat/10 text-caveat'
                  }`}
                >
                  {(mode === 'browse'
                    ? selected?.hypothesisDirection
                    : simulatedResult?.direction) === 'positive'
                    ? '\u2191 increases'
                    : '\u2193 decreases'}{' '}
                  engagement
                </span>
                <p className="mt-2 font-sans text-xs text-ink-faint">
                  {mode === 'browse'
                    ? 'This is the actual hypothesis the pipeline produced — not a live LLM generation.'
                    : 'This is a simulated result for illustration. The real pipeline uses GPT-4 with the configured prompt.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Dataset stats teaser */}
        <div className="bg-paper-subtle rounded-lg border border-paper-deep px-4 py-3 mb-4">
          <div className="flex flex-wrap gap-4">
            <Stat label="A/B tests" value={headlinesData.stats.totalExperiments.toLocaleString()} />
            <Stat label="headlines" value={headlinesData.stats.totalHeadlines.toLocaleString()} />
            <Stat label="mean CTR" value={(headlinesData.stats.meanCTR * 100).toFixed(1) + '%'} />
            <Stat label="hypotheses generated" value="2,100" />
          </div>
          <p className="font-sans text-[10px] text-ink-faint mt-2">
            Source: <a href="https://osf.io/jd64p/" className="underline hover:text-accent-deep" target="_blank" rel="noopener noreferrer">Upworthy Research Archive</a> (Matias et al., 2021)
          </p>
        </div>
      </div>

      {/* Right: Text rail */}
      <div className="mt-8 lg:mt-0">
        <div className="lg:hidden font-sans text-xs text-ink-faint uppercase tracking-wider mb-2">
          The paper says&hellip;
        </div>
        <TextRail
          sectionRef="§2.3, ¶2, p.3"
          paragraphs={[
            'We provided GPT-4 with pairs of headlines written for the same story and indicated which had the higher CTR. The prompt then elicited a feature that fits the format: "Hypothesis: ______ [increases/decreases] engagement with a message." This step produced 2,100 interpretable hypotheses (which human raters, n = 79, also believed to be good quality).',
          ]}
          note="The authors note in §3 that prompt choice shapes outputs: &ldquo;we may have shifted the distribution of hypotheses to be more substantive than theoretical.&rdquo;"
        />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-mono text-sm font-semibold text-ink tabular-nums">{value}</span>
      <span className="font-sans text-xs text-ink-faint ml-1.5">{label}</span>
    </div>
  )
}

function PromptDropdown({
  label,
  options,
  selected,
  onChange,
  note,
}: {
  label: string
  options: string[]
  selected: number
  onChange: (i: number) => void
  note: string
}) {
  return (
    <div>
      <label className="font-sans text-xs text-ink-faint block mb-1">{label}</label>
      <select
        value={selected}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-paper border border-paper-deep rounded-md px-3 py-2 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
      >
        {options.map((opt, i) => (
          <option key={i} value={i}>
            {opt.length > 80 ? opt.slice(0, 80) + '\u2026' : opt}
          </option>
        ))}
      </select>
      <p className="font-sans text-[10px] text-ink-faint mt-0.5">{note}</p>
    </div>
  )
}
