'use client'

interface PipelineNavProps {
  currentStage: number
  onStageChange: (stage: number) => void
}

const stages = [
  { label: 'Generate', number: 1 },
  { label: 'Rank', number: 2 },
  { label: 'Filter', number: 3 },
]

/**
 * Three-stage pipeline progress indicator at the top of the playground workspace.
 * Shows: Generate → Rank → Filter with current stage highlighted.
 */
export default function PipelineNav({ currentStage, onStageChange }: PipelineNavProps) {
  return (
    <nav className="flex items-center gap-2 mb-6" aria-label="Pipeline stages">
      {stages.map((stage, i) => (
        <div key={stage.number} className="flex items-center gap-2">
          <button
            onClick={() => onStageChange(stage.number)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-sans text-sm transition-colors ${
              currentStage === stage.number
                ? 'bg-accent/10 text-accent-deep font-medium'
                : 'text-ink-faint hover:text-ink-muted hover:bg-paper-subtle'
            }`}
            aria-current={currentStage === stage.number ? 'step' : undefined}
          >
            <span
              className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-mono ${
                currentStage === stage.number
                  ? 'bg-accent text-ink'
                  : currentStage > stage.number
                  ? 'bg-finding/20 text-finding'
                  : 'bg-paper-deep text-ink-faint'
              }`}
            >
              {currentStage > stage.number ? '✓' : stage.number}
            </span>
            {stage.label}
          </button>

          {/* Arrow separator */}
          {i < stages.length - 1 && (
            <span className="text-ink-faint text-xs" aria-hidden="true">→</span>
          )}
        </div>
      ))}
    </nav>
  )
}
