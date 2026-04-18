'use client'

import { useState } from 'react'
import hypothesesData from '@/content/hypotheses.json'
import morphsData from '@/content/morphs.json'
import referencesData from '@/content/references.json'

/**
 * Source Materials — shared appendix rendered at the bottom of BOTH tabs.
 * Per briefing Part 1.7: 9 sections with paper link, data, code, pre-reg,
 * survey materials, hypothesis funnel, Tables 1 & 2, references, about.
 * Title is "Source materials" — not "Appendix" (implies ignorable).
 */
export default function AppendixSection() {
  return (
    <footer className="bg-paper-subtle border-t border-paper-deep mt-16">
      <div className="reading-column py-12 md:py-16">
        <h2 className="font-display text-h2-mobile md:text-h2-desktop text-ink mb-8">
          Source materials
        </h2>

        {/* 1. The paper */}
        <AppendixBlock id="sm-paper" title="The paper">
          <p className="mb-3">
            Batista, R. M. & Ross, J. (2024). Words that Work: Using Language to Generate
            Hypotheses. <em>38th Conference on Neural Information Processing Systems (NeurIPS 2024).</em>
          </p>
          <div className="flex flex-wrap gap-3 mb-3">
            <AppendixLink href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4926398" label="SSRN" />
            <AppendixLink href="https://openreview.net/pdf?id=pvnXlajGBZ" label="OpenReview PDF" />
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer text-ink-muted hover:text-ink text-sm font-sans transition-colors">
              BibTeX
            </summary>
            <pre className="mt-2 bg-paper rounded-md p-3 text-xs font-mono text-ink-muted overflow-x-auto">
{`@inproceedings{batista2024words,
  title={Words that Work: Using Language to Generate Hypotheses},
  author={Batista, Rafael M. and Ross, James},
  booktitle={Advances in Neural Information Processing Systems},
  volume={37},
  year={2024}
}`}
            </pre>
          </details>
        </AppendixBlock>

        {/* 2. Data */}
        <AppendixBlock id="sm-data" title="Data">
          <p className="mb-3">
            The primary dataset is the <strong>Upworthy Research Archive</strong> — 32,487 headline
            A/B tests run by Upworthy between 2013 and 2015.
          </p>
          <AppendixLink
            href="https://www.nature.com/articles/s41597-021-00934-7"
            label="Matias et al. (2021) — Upworthy Research Archive"
          />
          <p className="mt-3 text-sm text-ink-faint">
            Study 2 uses a proprietary dataset of social media posts from an online entertainment
            company. The authors note this dataset is not publicly available.
          </p>
        </AppendixBlock>

        {/* 3. Code & prompts */}
        <AppendixBlock id="sm-code" title="Code & prompts">
          <p className="mb-3">
            The OSF repository contains the full <code className="font-mono text-sm bg-paper rounded px-1.5 py-0.5">prompts.yaml</code> file
            with all prompt configurations. The hypothesis-generation step uses three randomization
            axes: <strong>preamble</strong> (9 variants) × <strong>structure</strong> (8 variants)
            × <strong>variation</strong> (4 variants) = 288 prompt configurations.
          </p>
          <AppendixLink
            href="https://osf.io/d5xvb/?view_only=301ca63ed1004401adb697a625ff8d61"
            label="OSF repository"
          />
        </AppendixBlock>

        {/* 4. Pre-registration */}
        <AppendixBlock id="sm-prereg" title="Pre-registration">
          <p className="mb-3">
            The six hypotheses tested in Studies 1 and 2 were pre-registered before data
            analysis. This prevents HARKing (Hypothesizing After Results are Known) and
            p-hacking.
          </p>
          <AppendixLink
            href="https://aspredicted.org/S6H_ZPF"
            label="AsPredicted #172038"
          />
        </AppendixBlock>

        {/* 5. Survey materials */}
        <AppendixBlock id="sm-survey" title="Survey materials">
          <p className="mb-3">
            The Qualtrics survey files (<code className="font-mono text-sm bg-paper rounded px-1.5 py-0.5">.qsf</code>)
            used for Studies 1 and 2 are available on OSF.
          </p>
          <AppendixLink
            href="https://osf.io/d5xvb/?view_only=301ca63ed1004401adb697a625ff8d61"
            label="Survey files on OSF"
          />
        </AppendixBlock>

        {/* 6. The full set of hypotheses */}
        <AppendixBlock id="sm-hypotheses" title="The full set of hypotheses">
          <HypothesisFunnelSummary />
        </AppendixBlock>

        {/* 7. Tables 1 & 2 */}
        <AppendixBlock id="sm-tables" title="Tables 1 & 2">
          <Table1 />
          <Table2 />
        </AppendixBlock>

        {/* 8. References */}
        <AppendixBlock id="sm-references" title="References">
          <ReferencesList />
        </AppendixBlock>

        {/* 9. About this reader */}
        <AppendixBlock id="sm-about" title="About this reader">
          <p>
            This site presents two interactive reading experiences for the same NeurIPS 2024
            paper. <strong>The Annotated Edition</strong> renders the full paper with a live
            glossary and appendix material surfaced in the margins. <strong>The Pipeline
            Playground</strong> lets you walk through the paper&rsquo;s three-stage method on
            real data. Both tabs display the authors&rsquo; verbatim text — every claim and
            finding you see is a direct quote with page and section reference. We built both
            to compare which pattern works better for communicating academic research to a
            broad audience. If you have feedback, we&rsquo;d love to hear it.
          </p>
        </AppendixBlock>
      </div>
    </footer>
  )
}

/* --- Sub-components --- */

function AppendixBlock({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="mb-10 scroll-mt-20">
      <h3 className="font-sans text-h3-mobile md:text-h3-desktop font-semibold text-ink mb-3">
        {title}
      </h3>
      <div className="font-sans text-gloss md:text-gloss-desktop text-ink-muted leading-relaxed">
        {children}
      </div>
    </section>
  )
}

function AppendixLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 font-sans text-sm text-accent-deep hover:text-accent underline decoration-dotted underline-offset-2 transition-colors"
    >
      {label}
      <span aria-hidden="true" className="text-xs">↗</span>
    </a>
  )
}

function HypothesisFunnelSummary() {
  const fc = hypothesesData.funnelCounts

  const stages = [
    { count: fc.generated, label: 'hypotheses generated', detail: 'GPT-4 with 288 prompt configurations across headline pairs' },
    { count: fc.afterDedup, label: 'after de-duplication', detail: `Euclidean distance > ${fc.dedupThreshold} in embedding space` },
    { count: fc.significant, label: 'with significant predicted effects', detail: 'After Benjamini-Hochberg FDR correction' },
    { count: fc.preRegistered, label: 'pre-registered for testing', detail: '4 predicted positive + 2 predicted negative' },
  ]

  return (
    <div>
      <div className="space-y-3 mb-4">
        {stages.map((stage, i) => (
          <div key={i} className="flex items-baseline gap-3">
            <span className="font-mono text-lg md:text-xl font-semibold text-ink tabular-nums min-w-[4rem] text-right">
              {stage.count.toLocaleString()}
            </span>
            <div>
              <span className="text-ink">{stage.label}</span>
              <span className="block text-xs text-ink-faint mt-0.5">{stage.detail}</span>
            </div>
          </div>
        ))}
      </div>
      <AppendixLink
        href="https://osf.io/d5xvb/?view_only=301ca63ed1004401adb697a625ff8d61"
        label="Full hypothesis set on OSF"
      />
    </div>
  )
}

function Table1() {
  const [showAll, setShowAll] = useState(false)
  const examples = hypothesesData.examples
  const visible = showAll ? examples : examples.slice(0, 3)

  return (
    <div className="mb-8">
      <h4 className="font-sans text-sm font-semibold text-ink mb-3">
        Table 1 — Example hypotheses generated from headline pairs
      </h4>
      <div className="space-y-4">
        {visible.map((ex) => (
          <div key={ex.id} className="bg-paper rounded-lg p-4 border border-paper-deep">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <div>
                <span className="text-xs text-ink-faint font-sans block mb-1">Headline A</span>
                <p className="font-serif text-sm text-ink leading-relaxed">{ex.headlineA}</p>
              </div>
              <div>
                <span className="text-xs text-ink-faint font-sans block mb-1">Headline B</span>
                <p className="font-serif text-sm text-ink leading-relaxed">{ex.headlineB}</p>
              </div>
            </div>
            <div className="border-t border-paper-deep pt-2 mt-2">
              <span className="text-xs text-ink-faint font-sans block mb-1">Hypothesis generated</span>
              <p className="font-serif text-sm text-ink-muted italic leading-relaxed">
                &ldquo;{ex.hypothesis}&rdquo;
              </p>
              <span className={`inline-block mt-1 text-xs font-sans px-2 py-0.5 rounded-full ${
                ex.direction === 'positive' ? 'bg-finding/10 text-finding' : 'bg-caveat/10 text-caveat'
              }`}>
                {ex.direction === 'positive' ? '↑ increases' : '↓ decreases'} engagement
              </span>
            </div>
          </div>
        ))}
      </div>
      {examples.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 font-sans text-sm text-accent-deep hover:text-accent underline decoration-dotted underline-offset-2 transition-colors"
        >
          {showAll ? 'Show fewer' : `Show all ${examples.length} examples`}
        </button>
      )}
    </div>
  )
}

function Table2() {
  const [showAll, setShowAll] = useState(false)
  const examples = morphsData.examples
  const visible = showAll ? examples : examples.slice(0, 3)

  return (
    <div>
      <h4 className="font-sans text-sm font-semibold text-ink mb-3">
        Table 2 — Example headline morphs
      </h4>
      <div className="space-y-4">
        {visible.map((ex) => (
          <div key={ex.id} className="bg-paper rounded-lg p-4 border border-paper-deep">
            <div className="mb-2">
              <span className="text-xs text-ink-faint font-sans block mb-1">Hypothesis</span>
              <p className="font-serif text-sm text-ink-muted italic leading-relaxed">
                &ldquo;{ex.hypothesis}&rdquo;
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border-t border-paper-deep pt-2">
              <div>
                <span className="text-xs text-ink-faint font-sans block mb-1">Original</span>
                <p className="font-serif text-sm text-ink leading-relaxed">{ex.original}</p>
              </div>
              <div>
                <span className="text-xs text-ink-faint font-sans block mb-1">Morphed</span>
                <p className="font-serif text-sm text-ink leading-relaxed">{ex.morph}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {examples.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 font-sans text-sm text-accent-deep hover:text-accent underline decoration-dotted underline-offset-2 transition-colors"
        >
          {showAll ? 'Show fewer' : `Show all ${examples.length} examples`}
        </button>
      )}
    </div>
  )
}

function ReferencesList() {
  const [expanded, setExpanded] = useState(false)
  const refs = referencesData.references
  const visible = expanded ? refs : refs.slice(0, 10)

  return (
    <div>
      <ol className="list-decimal list-inside space-y-1.5">
        {visible.map((ref) => (
          <li key={ref.id} value={ref.id} className="text-sm text-ink-muted leading-relaxed">
            {ref.url ? (
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink transition-colors"
              >
                {ref.text}
              </a>
            ) : (
              ref.text
            )}
          </li>
        ))}
      </ol>
      {refs.length > 10 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 font-sans text-sm text-accent-deep hover:text-accent underline decoration-dotted underline-offset-2 transition-colors"
        >
          {expanded ? 'Show fewer' : `Show all ${refs.length} references`}
        </button>
      )}
      <p className="mt-3 text-xs text-ink-faint">
        Some references are working papers or books without stable URLs. Full reference list
        available in the{' '}
        <a
          href="https://openreview.net/pdf?id=pvnXlajGBZ"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-dotted underline-offset-2"
        >
          paper PDF
        </a>.
      </p>
    </div>
  )
}
