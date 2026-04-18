'use client'

import TextRail from './TextRail'

/**
 * Stage 2 — Rank (Morph & Score).
 * Placeholder for Session 3. Will show morphed headlines and predicted ∆CTR values.
 */
export default function StageRank() {
  return (
    <div className="lg:grid lg:grid-cols-[1fr_40%] lg:gap-6">
      <div>
        <h3 className="font-sans text-h3-mobile md:text-h3-desktop font-semibold text-ink mb-2">
          Stage 2: Rank hypotheses
        </h3>
        <p className="font-sans text-gloss text-ink-muted mb-6">
          Each hypothesis is tested by &ldquo;morphing&rdquo; headlines — rewriting them to
          incorporate the hypothesized feature — and predicting the CTR change. This stage
          is coming in the next build.
        </p>

        <div className="bg-paper-subtle rounded-lg p-8 border border-paper-deep text-center">
          <p className="font-sans text-sm text-ink-faint">
            Morphing &amp; scoring interactive — coming in Session 3
          </p>
          <p className="font-sans text-xs text-ink-faint mt-2">
            Will use data from morphs.json (252,000 morphs generated)
          </p>
        </div>
      </div>

      <div className="mt-8 lg:mt-0">
        <div className="lg:hidden font-sans text-xs text-ink-faint uppercase tracking-wider mb-2">
          The paper says…
        </div>
        <TextRail
          sectionRef="§2.3, ¶4–5, p.3"
          paragraphs={[
            'For each hypothesis, we rewrote headlines to incorporate the hypothesized feature while keeping the story content the same. We generated 252,000 headline morphs across all hypothesis–headline combinations.',
            'By applying the hypotheses to many different headlines and predicting their effect, we get a sense of how generalizable each hypothesis is.',
          ]}
          note="The ML model's predictions are not ground truth — they're signals. The actual test is Studies 1 and 2."
        />
      </div>
    </div>
  )
}
