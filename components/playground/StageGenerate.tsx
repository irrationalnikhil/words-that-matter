'use client'

import { useState } from 'react'
import hypothesesData from '@/content/hypotheses.json'
import promptsData from '@/content/prompts.json'
import TextRail from './TextRail'

const examples = hypothesesData.examples

/**
 * Stage 1 — Generate.
 * Shows headline pairs from Table 1. Clicking a pair reveals the hypothesis.
 * Shows prompt structure from prompts.json with the three randomization axes as dropdowns.
 * Per briefing §3.3 Stage 1.
 */
export default function StageGenerate() {
  const [selectedPair, setSelectedPair] = useState<number | null>(null)
  const [showHypothesis, setShowHypothesis] = useState(false)
  const [preambleIndex, setPreambleIndex] = useState(0)
  const [structureIndex, setStructureIndex] = useState(0)
  const [variationIndex, setVariationIndex] = useState(0)

  const selected = selectedPair !== null ? examples[selectedPair] : null

  return (
    <div className="lg:grid lg:grid-cols-[1fr_40%] lg:gap-6">
      {/* Left: Interactive workspace */}
      <div>
        <h3 className="font-sans text-h3-mobile md:text-h3-desktop font-semibold text-ink mb-2">
          Stage 1: Generate hypotheses
        </h3>
        <p className="font-sans text-gloss text-ink-muted mb-6">
          Select a headline pair to see how the pipeline generates a hypothesis from it.
        </p>

        {/* Headline pair gallery */}
        <div className="space-y-3 mb-6">
          {examples.map((ex, i) => (
            <button
              key={ex.id}
              onClick={() => {
                setSelectedPair(i)
                setShowHypothesis(false)
              }}
              className={`w-full text-left rounded-lg p-4 border transition-colors ${
                selectedPair === i
                  ? 'border-accent bg-accent/5'
                  : 'border-paper-deep bg-paper-subtle hover:border-accent/50'
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="font-sans text-[10px] text-ink-faint uppercase tracking-wider block mb-1">
                    Headline A
                  </span>
                  <p className="font-serif text-sm text-ink leading-relaxed">
                    {ex.headlineA}
                  </p>
                </div>
                <div>
                  <span className="font-sans text-[10px] text-ink-faint uppercase tracking-wider block mb-1">
                    Headline B
                  </span>
                  <p className="font-serif text-sm text-ink leading-relaxed">
                    {ex.headlineB}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Prompt structure (visible when a pair is selected) */}
        {selected && (
          <div className="bg-paper rounded-lg border border-paper-deep p-5 mb-6 animate-in">
            <h4 className="font-sans text-sm font-semibold text-ink mb-3">
              Prompt configuration
            </h4>
            <p className="font-sans text-xs text-ink-faint mb-4">
              The pipeline uses 288 prompt configurations (9 × 8 × 4). Toggle the dropdowns
              to see how different axes change the prompt.
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
                Given headline A: &ldquo;<span className="text-ink">{selected.headlineA}</span>&rdquo;
              </p>
              <p>
                And headline B: &ldquo;<span className="text-ink">{selected.headlineB}</span>&rdquo;
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
              onClick={() => setShowHypothesis(true)}
              className="mt-4 px-5 py-2 bg-accent text-white font-sans text-sm font-medium rounded-md hover:bg-accent-deep transition-colors"
            >
              Generate hypothesis
            </button>

            {/* Result */}
            {showHypothesis && (
              <div className="mt-4 p-4 bg-finding/5 border border-finding/20 rounded-lg animate-in">
                <p className="font-sans text-[10px] text-ink-faint uppercase tracking-wider mb-2">
                  Hypothesis generated (from {selected.source})
                </p>
                <p className="font-serif text-base text-ink italic leading-relaxed">
                  &ldquo;{selected.hypothesis}&rdquo;
                </p>
                <span
                  className={`inline-block mt-2 text-xs font-sans px-2 py-0.5 rounded-full ${
                    selected.direction === 'positive'
                      ? 'bg-finding/10 text-finding'
                      : 'bg-caveat/10 text-caveat'
                  }`}
                >
                  {selected.direction === 'positive' ? '↑ increases' : '↓ decreases'} engagement
                </span>
                <p className="mt-2 font-sans text-xs text-ink-faint">
                  This is the actual hypothesis the authors published for these inputs — not a
                  live LLM generation.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Text rail */}
      <div className="mt-8 lg:mt-0">
        <div className="lg:hidden font-sans text-xs text-ink-faint uppercase tracking-wider mb-2">
          The paper says…
        </div>
        <TextRail
          sectionRef="§2.3, p.3"
          paragraphs={[
            'We used GPT-4 to generate hypotheses from pairs of headlines. For each pair, we prompted the model with a preamble, the two headlines, and a hypothesis structure, resulting in approximately 2,100 hypotheses.',
            'We randomized across three prompt dimensions: preamble (9 variants), hypothesis structure (8 variants), and variation (4 variants), yielding 288 unique prompt configurations.',
          ]}
          note="The authors note in §3 that prompt choice shapes outputs: &ldquo;we may have shifted the distribution of hypotheses to be more substantive than theoretical.&rdquo;"
        />
      </div>
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
            {opt.length > 80 ? opt.slice(0, 80) + '…' : opt}
          </option>
        ))}
      </select>
      <p className="font-sans text-[10px] text-ink-faint mt-0.5">{note}</p>
    </div>
  )
}
