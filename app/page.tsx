import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="reading-column py-16 md:py-24">
        {/* Title block */}
        <header className="mb-12">
          <h1 className="font-display text-display-mobile md:text-display-desktop text-ink mb-4">
            Words that Work
          </h1>
          <p className="font-sans text-gloss md:text-gloss-desktop text-ink-muted mb-2">
            Batista &amp; Ross &middot; NeurIPS 2024
          </p>
          <p className="font-sans text-gloss md:text-gloss-desktop text-ink-faint">
            <a
              href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4926398"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-dotted underline-offset-2 hover:text-ink-muted transition-colors"
            >
              Read the paper (SSRN)
            </a>
          </p>
        </header>

        {/* Pitch */}
        <p className="font-serif text-body-mobile md:text-body-desktop text-ink mb-12 max-w-reading-narrow">
          This paper presents a way to turn thousands of A/B tests into testable
          hypotheses using LLMs. We&rsquo;ve built two different readers for
          it&thinsp;&mdash;&thinsp;pick one, or compare both.
        </p>

        {/* Two cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Option A card */}
          <Link
            href="/annotated"
            className="block bg-paper-subtle rounded-lg p-8 border border-paper-deep hover:border-accent transition-colors group"
          >
            <h2 className="font-display text-h2-mobile md:text-h2-desktop text-ink mb-3 group-hover:text-accent-deep transition-colors">
              The Annotated Edition
            </h2>
            <p className="font-sans text-gloss md:text-gloss-desktop text-ink-muted mb-4">
              The full paper, with live glossary and appendix material surfaced
              in the margins.
            </p>
            <p className="font-sans text-mono-sm text-ink-faint">
              Est. read time: 25 min
            </p>
          </Link>

          {/* Option B card */}
          <Link
            href="/playground"
            className="block bg-paper-subtle rounded-lg p-8 border border-paper-deep hover:border-accent transition-colors group"
          >
            <h2 className="font-display text-h2-mobile md:text-h2-desktop text-ink mb-3 group-hover:text-accent-deep transition-colors">
              The Pipeline Playground
            </h2>
            <p className="font-sans text-gloss md:text-gloss-desktop text-ink-muted mb-4">
              Run the paper&rsquo;s method yourself on real headlines. The
              paper&rsquo;s text follows along.
            </p>
            <p className="font-sans text-mono-sm text-ink-faint">
              Est. read time: 35 min
            </p>
          </Link>
        </div>

        {/* Below the cards */}
        <p className="font-sans text-gloss text-ink-faint">
          You can switch between views at any time using the tab bar at the top.
        </p>
      </div>
    </main>
  )
}
