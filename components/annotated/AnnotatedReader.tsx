'use client'

import { lazy, Suspense } from 'react'
import { type Section, type Paragraph, type Category, type Glossary } from '@/lib/types'
import KaTeXBlock from '@/components/shared/KaTeXBlock'
import { renderMiniMarkdown } from '@/lib/renderMiniMarkdown'
import { renderTextWithTerms } from '@/lib/renderTextWithTerms'

// Lazy-load interactives per P4 performance budget
const FilteringFunnel = lazy(() => import('./FilteringFunnel'))
const HypothesisResults = lazy(() => import('./HypothesisResults'))

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
