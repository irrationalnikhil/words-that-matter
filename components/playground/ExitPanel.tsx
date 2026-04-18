'use client'

/**
 * Exit panel — "What you just did" editorial reflection.
 * Shown after Stage 3. Per briefing §3.4.
 * Clearly labelled as editorial gloss, not paper text.
 */
export default function ExitPanel() {
  return (
    <div className="mt-8 pt-6 border-t border-paper-deep">
      <div className="bg-paper-subtle rounded-lg p-6 border border-paper-deep">
        {/* Header — clearly editorial */}
        <p className="font-sans text-[10px] text-ink-faint uppercase tracking-wider mb-3">
          Editorial gloss — not paper text
        </p>

        <h3 className="font-sans text-h3-mobile md:text-h3-desktop font-semibold text-ink mb-4">
          What you just did
        </h3>

        {/* 3-sentence editorial reflection */}
        <div className="space-y-3 mb-6">
          <p className="font-sans text-gloss md:text-gloss-desktop text-ink-muted leading-relaxed">
            You just ran the paper&apos;s full pipeline on real data — from generating hypotheses
            about what makes language effective, through ranking them by morphing headlines and
            predicting engagement, to filtering down to a testable few.
          </p>
          <p className="font-sans text-gloss md:text-gloss-desktop text-ink-muted leading-relaxed">
            The 6 hypotheses you saw at the bottom are the ones the authors pre-registered and
            tested in two independent studies. Four produced significant effects in the first
            study; two of those also survived a novelty check showing they capture something
            beyond existing psychological constructs.
          </p>
          <p className="font-sans text-gloss md:text-gloss-desktop text-ink-muted leading-relaxed">
            That&apos;s a mixed result, and the authors are upfront about it. The pipeline
            generates testable hypotheses — but most of what it finds may overlap with what
            researchers already know. Read the limitations below.
          </p>
        </div>

        {/* Link to Limitations */}
        <div className="mb-4">
          <a
            href="#section-3"
            className="inline-flex items-center gap-2 px-4 py-2 bg-caveat/5 border border-caveat/15 rounded-md font-sans text-sm text-caveat hover:bg-caveat/10 transition-colors focus:outline-none focus:ring-2 focus:ring-caveat/30"
          >
            Read §3 Limitations (the most important section)
            <span aria-hidden="true">↓</span>
          </a>
          <p className="font-sans text-[10px] text-ink-faint mt-1.5">
            Section 3 is where the authors confront what the pipeline can and cannot do.
            Most readers skip it — don&apos;t.
          </p>
        </div>

        {/* Link to Source Materials */}
        <div>
          <a
            href="#sm-paper"
            className="inline-flex items-center gap-2 px-4 py-2 bg-paper border border-paper-deep rounded-md font-sans text-sm text-ink-muted hover:text-ink hover:bg-paper-deep transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            View source materials
            <span aria-hidden="true">↓</span>
          </a>
          <p className="font-sans text-[10px] text-ink-faint mt-1.5">
            Paper PDF, data, code, prompts, pre-registration, and full reference list.
          </p>
        </div>
      </div>
    </div>
  )
}
