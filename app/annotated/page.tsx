import TabSwitcher from '@/components/shared/TabSwitcher'
import SectionProgress from '@/components/annotated/SectionProgress'
import AnnotatedReader from '@/components/annotated/AnnotatedReader'
import AppendixSection from '@/components/shared/AppendixSection'
import paperData from '@/content/paper.json'
import glossaryData from '@/content/glossary.json'
import type { PaperContent, Glossary } from '@/lib/types'

const paper = paperData as PaperContent
const glossary = glossaryData as Glossary

export const metadata = {
  title: 'The Annotated Edition — Words that Work',
  description: 'The full paper with live glossary and appendix material surfaced in the margins.',
}

export default function AnnotatedPage() {
  return (
    <>
      <TabSwitcher />
      <SectionProgress sections={paper.sections} />
      <main className="min-h-screen bg-paper" aria-label="Annotated Edition reading area">
        {/* Paper header — constrained to reading column */}
        <header className="reading-column pt-8 md:pt-12 pb-4">
          <h1 className="font-display text-display-mobile md:text-display-desktop text-ink mb-3">
            {paper.title}
          </h1>
          <p className="font-sans text-gloss md:text-gloss-desktop text-ink-muted mb-1">
            {paper.authors.join(' & ')}
          </p>
          <p className="font-sans text-mono-sm text-ink-faint">
            {paper.venue}
          </p>
        </header>

        {/* The paper — wider container on desktop to accommodate margin rail */}
        <div className="annotated-layout">
          <AnnotatedReader sections={paper.sections} glossary={glossary} />
        </div>
      </main>

      {/* Source materials — shared across both tabs */}
      <AppendixSection />
    </>
  )
}
