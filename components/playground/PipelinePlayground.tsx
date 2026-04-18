'use client'

import { useState } from 'react'
import PipelineNav from './PipelineNav'
import StageGenerate from './StageGenerate'
import StageRank from './StageRank'
import StageFilter from './StageFilter'

/**
 * The Pipeline Playground — Option B.
 * Three-stage pipeline: Generate → Rank → Filter.
 * Per briefing Part 3.
 */
export default function PipelinePlayground() {
  const [currentStage, setCurrentStage] = useState(1)

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
        {currentStage === 1 && <StageGenerate />}
        {currentStage === 2 && <StageRank />}
        {currentStage === 3 && <StageFilter />}
      </div>

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
          className="px-4 py-2 font-sans text-sm bg-accent text-white rounded-md hover:bg-accent-deep disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next stage →
        </button>
      </div>
    </div>
  )
}
