'use client'

import { lazy, Suspense } from 'react'
import { type Section, type Paragraph, type Category, type Glossary } from '@/lib/types'
import KaTeXBlock from '@/components/shared/KaTeXBlock'
import DeepDive from '@/components/shared/DeepDive'
import { renderMiniMarkdown } from '@/lib/renderMiniMarkdown'
import { renderTextWithTerms } from '@/lib/renderTextWithTerms'

// Lazy-load interactives per P4 performance budget
const FilteringFunnel = lazy(() => import('./FilteringFunnel'))
const HypothesisResults = lazy(() => import('./HypothesisResults'))
const ShrinkageSlider = lazy(() => import('./ShrinkageSlider'))
const RSquaredChart = lazy(() => import('./RSquaredChart'))

// Map of section IDs to the interactive that follows them
const interactiveAfterSection: Record<string, React.ReactNode> = {
  '2.3': (
    <Suspense fallback={<InteractiveLoading />}>
      <FilteringFunnel />
    </Suspense>
  ),
  '2.4': (
    <Suspense fallback={<InteractiveLoading />}>
      <HypothesisResults />
    </Suspense>
  ),
}

// Map of paragraph IDs to interactives placed after that paragraph (more precise than section-level)
// Preprocessing details (shrinkage, R² comparison) are wrapped in DeepDive — collapsed by default.
// These are "open a box" moments, not core insights. The reader chooses to explore them.
const interactiveAfterParagraph: Record<string, React.ReactNode> = {
  'p-2.1-2': (
    <DeepDive
      teaser="Play with the shrinkage formula"
      sublabel="See how sample size affects CTR estimates — Eq. 1"
      category="method"
    >
      <Suspense fallback={<InteractiveLoading />}>
        <ShrinkageSlider />
      </Suspense>
    </DeepDive>
  ),
  'p-2.2-4': (
    <DeepDive
      teaser="Compare model performance"
      sublabel="BU model vs ML model — R² comparison"
      category="finding"
    >
      <Suspense fallback={<InteractiveLoading />}>
        <RSquaredChart />
      </Suspense>
    </DeepDive>
  ),
}

// Figure placed before a section's paragraphs
const figureBeforeSection: Record<string, React.ReactNode> = {
  '2.3': (
    <figure className="my-6">
      <img
        src="/figure-1.svg"
        alt="Pipeline overview: Data (Upworthy Archive, 32k A/B tests) → Prepare (Shrinkage + ∆CTR, Eq. 1) → Model (Siamese network, R² 0.04→0.13) → Generate (GPT-4 + 288 prompt configs → 2,100 hypotheses) → Rank (252k headline morphs, predict ∆CTR) → Filter (de-duplication + FDR → 6 pre-registered) → Test (Studies 1 & 2)"
        className="w-full rounded-lg border border-paper-deep"
        loading="lazy"
        width={900}
        height={320}
      />
      <figcaption className="mt-2 font-sans text-xs text-ink-faint text-center">
        Figure 1: The full pipeline — from Upworthy A/B tests to pre-registered hypotheses.
        Redrawn from the paper (p.3) in the project&apos;s warm palette.
      </figcaption>
    </figure>
  ),
}

function InteractiveLoading() {
  return (
    <div className="my-8 py-6 flex items-center justify-center">
      <p className="font-sans text-sm text-ink-faint">Loading interactive…</p>
    </div>
  )
}

const borderColorMap: Record<string, string> = {
  method: 'border-l-method',
  finding: 'border-l-finding',
  caveat: 'border-l-caveat',
  novel: 'border-l-novel',
}

interface AnnotatedReaderProps {
  sections: Section[]
  glossary: Glossary
}

/**
 * Renders paper.json sections as a warm editorial reading experience.
 *
 * Layout:
 * - Mobile (<1024px): Single column, margin notes inline below paragraphs.
 * - Desktop (≥1024px): Two-column grid — 680px reading column + 280px margin rail.
 *   Margin notes appear in the right rail alongside their parent paragraph.
 *
 * Each paragraph that has margin notes uses a CSS subgrid row so the note
 * aligns vertically with its source paragraph.
 */
export default function AnnotatedReader({ sections, glossary }: AnnotatedReaderProps) {
  return (
    <article className="py-8 md:py-12">
      {sections.map((section) => (
        <div key={section.id}>
          <SectionBlock section={section} glossary={glossary} />
          {interactiveAfterSection[section.id] && (
            <div className="border-t border-paper-deep pt-4 mb-8">
              {interactiveAfterSection[section.id]}
            </div>
          )}
        </div>
      ))}
    </article>
  )
}

function SectionBlock({ section, glossary }: { section: Section; glossary: Glossary }) {
  if (section.paragraphs.length === 0) return null

  const isAbstract = section.id === 'abstract'
  const sectionNumber = section.id === 'abstract' ? '' : section.id

  return (
    <section
      id={`section-${section.id}`}
      className="mb-12 scroll-mt-20"
      aria-labelledby={`heading-${section.id}`}
      data-section-id={section.id}
      data-section-title={section.title}
    >
      {/* Section header — spans full width on desktop */}
      <header className="mb-6">
        {isAbstract ? (
          <h2
            id={`heading-${section.id}`}
            className="font-display text-h2-mobile md:text-h2-desktop text-ink"
          >
            {section.title}
          </h2>
        ) : (
          <h2
            id={`heading-${section.id}`}
            className="font-display text-h2-mobile md:text-h2-desktop text-ink"
          >
            <span className="text-ink-faint mr-2">{sectionNumber}</span>
            {section.title}
          </h2>
        )}
        <p className="font-sans text-mono-sm text-ink-faint mt-1">
          p.&thinsp;{section.pageStart}
          {section.pageEnd !== section.pageStart && <>&ndash;{section.pageEnd}</>}
        </p>
      </header>

      {/* Figure before section if applicable (e.g. Figure 1 before §2.3) */}
      {figureBeforeSection[section.id]}

      {/* Paragraphs with margin rail layout */}
      {section.paragraphs.map((para) => (
        <ParagraphBlock key={para.id} paragraph={para} sectionId={section.id} glossary={glossary} />
      ))}
    </section>
  )
}

function ParagraphBlock({
  paragraph,
  sectionId,
  glossary,
}: {
  paragraph: Paragraph
  sectionId: string
  glossary: Glossary
}) {
  const category = paragraph.category as Category | null | undefined
  const hasBorder = category && borderColorMap[category]
  const hasMarginNotes = paragraph.marginNotes && paragraph.marginNotes.length > 0

  return (
    <div
      id={paragraph.id}
      className={`mb-5 scroll-mt-20 ${
        hasMarginNotes
          ? 'lg:grid lg:grid-cols-[1fr_280px] lg:gap-6'
          : ''
      }`}
    >
      {/* Main content column */}
      <div
        className={`${
          hasBorder ? `border-l-[3px] ${borderColorMap[category!]} pl-5` : 'pl-0 md:pl-5'
        }`}
      >
        {/* The verbatim text — with glossary terms wrapped */}
        <p className="font-serif text-body-mobile md:text-body-desktop text-ink leading-[1.65]">
          {renderTextWithTerms(paragraph.text, paragraph.termAnchors, glossary)}
        </p>

        {/* Equations rendered with KaTeX */}
        {paragraph.equations?.map((eq) => (
          <KaTeXBlock key={eq.id} latex={eq.latex} label={eq.label} />
        ))}

        {/* Paragraph-level interactive (e.g. shrinkage slider after Eq. 1) */}
        {interactiveAfterParagraph[paragraph.id] && (
          <div className="mt-2">
            {interactiveAfterParagraph[paragraph.id]}
          </div>
        )}

        {/* Mobile-only: margin notes inline */}
        {hasMarginNotes && (
          <div className="lg:hidden">
            {paragraph.marginNotes!.map((note, i) => (
              <MarginNoteCard key={i} note={note} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop-only: margin rail */}
      {hasMarginNotes && (
        <aside className="hidden lg:block" aria-label="Margin notes">
          <div className="sticky top-20 space-y-3">
            {paragraph.marginNotes!.map((note, i) => (
              <MarginNoteCard key={i} note={note} />
            ))}
          </div>
        </aside>
      )}
    </div>
  )
}

function MarginNoteCard({ note }: { note: { kind: string; content: string } }) {
  return (
    <div
      className={`mt-3 lg:mt-0 bg-paper-subtle rounded-md px-3 py-2.5 border-l-[3px] ${
        note.kind === 'caveat'
          ? 'border-l-caveat'
          : note.kind === 'appendix-promo'
          ? 'border-l-novel'
          : 'border-l-paper-deep'
      }`}
    >
      <p className="font-sans text-[13px] lg:text-[14px] text-ink-muted leading-relaxed">
        {renderMiniMarkdown(note.content)}
      </p>
    </div>
  )
}
