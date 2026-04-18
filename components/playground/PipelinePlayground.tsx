'use client'

import { useState, useCallback } from 'react'
import PipelineNav from './PipelineNav'
import StageGenerate from './StageGenerate'
import StageRank from './StageRank'
import StageFilter from './StageFilter'
import ExitPanel from './ExitPanel'

/**
 * The Pipeline Playground — Option B.
 * Three-stage pipeline: Generate → Rank → Filter.
 * Manages shared state (selected hypothesis) across stages.
 * Per briefing Part 3.
 */
export default function PipelinePlayground() {
  const [currentStage, setCurrentStage] = useState(1)
  const [selectedHypothesis, setSelectedHypothesis] = useState<string | undefined>(undefined)

  const handleHypothesisSelect = useCallback((hypothesis: string) => {
    setSelectedHypothesis(hypothesis)
  }, [])

  return (
    <div className="py-8 md:py-12">
      {/* Welcome panel */}
      <div className="bg-paper-subtle rounded-lg p-6 mb-8 border border-paper-deep">
        <p className="font-sans text-gloss md:text-gloss-desktop text-ink-muted leading-relaxed">
          This is the paper&rsquo;s method, made playable. Move through the three stages to
          see how the authors turned thousands of A/B tests into testable hypotheses.
          The paper&rsquo;s verbatim text is always visible{' '}
          <span className="hidden lg:inline">on the right</span>
          <span className="lg:hidden">below each stage</span>.
        </p>
      </div>

      {/* Pipeline navigation */}
      <PipelineNav currentStage={currentStage} onStageChange={setCurrentStage} />

      {/* Current stage */}
      <div className="min-h-[60vh]">
        {currentStage === 1 && (
          <StageGenerate onHypothesisSelect={handleHypothesisSelect} />
        )}
        {currentStage === 2 && (
          <StageRank selectedHypothesis={selectedHypothesis} />
        )}
        {currentStage === 3 && <StageFilter />}
      </div>

      {/* Exit panel — shown after interacting with Stage 3 */}
      {currentStage === 3 && <ExitPanel />}

      {/* Stage navigation buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-paper-deep">
        <button
          onClick={() => setCurrentStage(Math.max(1, currentStage - 1))}
          disabled={currentStage === 1}
          className="px-4 py-2 font-sans text-sm text-ink-muted hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous stage
        </button>
        <button
          onClick={() => setCurrentStage(Math.min(3, currentStage + 1))}
          disabled={currentStage === 3}
          className="px-4 py-2 font-sans text-sm bg-accent text-ink rounded-md hover:bg-accent-deep disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          Next stage →
        </button>
      </div>
    </div>
  )
}
