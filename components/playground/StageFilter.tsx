'use client'

import TextRail from './TextRail'

/**
 * Stage 3 — Filter.
 * Placeholder for Session 3. Will have Euclidean distance slider,
 * FDR toggle, and the 6 pre-registered hypothesis cards.
 */
export default function StageFilter() {
  return (
    <div className="lg:grid lg:grid-cols-[1fr_40%] lg:gap-6">
      <div>
        <h3 className="font-sans text-h3-mobile md:text-h3-desktop font-semibold text-ink mb-2">
          Stage 3: Filter &amp; test
        </h3>
        <p className="font-sans text-gloss text-ink-muted mb-6">
          The funnel narrows from 2,100 hypotheses to 6 pre-registered ones. This interactive
          will let you adjust the filtering parameters. Coming in the next build.
        </p>

        <div className="bg-paper-subtle rounded-lg p-8 border border-paper-deep text-center">
          <p className="font-sans text-sm text-ink-faint">
            Filtering &amp; results interactive — coming in Session 3
          </p>
          <p className="font-sans text-xs text-ink-faint mt-2">
            Will include Euclidean distance slider, FDR toggle, and Study 1 &amp; 2 results
          </p>
        </div>
      </div>

      <div className="mt-8 lg:mt-0">
        <div className="lg:hidden font-sans text-xs text-ink-faint uppercase tracking-wider mb-2">
          The paper says…
        </div>
        <TextRail
          sectionRef="§2.3–2.4, p.3–4"
          paragraphs={[
            'We filtered out hypotheses that were semantically similar using MPNet sentence embeddings and Euclidean distance. After de-duplication and FDR correction, 16 hypotheses had significant predicted positive effects.',
            'We pre-registered six hypotheses — four with predicted positive effects and two with predicted negative effects — before testing them on the lockbox data and the social media dataset.',
          ]}
          note="This paper shows 2 of 6 hypotheses survived the novelty check (controlling for BU features). Most did not. The authors treat this honestly in §5."
        />
      </div>
    </div>
  )
}
