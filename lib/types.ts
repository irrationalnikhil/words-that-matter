// Content types — derived from Part 1.4 of the briefing

export type Category = 'method' | 'finding' | 'caveat' | 'novel'

export type TermAnchor = {
  term: string
  offset: number      // char offset in text
  length: number
  definitionKey: string // key into glossary.json
}

export type MarginNote = {
  kind: 'cross-ref' | 'appendix-promo' | 'caveat' | 'interactive'
  content: string     // markdown
  payload?: unknown   // e.g. appendix table rows to promote inline
}

export type Equation = {
  id: string
  latex: string
  label?: string          // "Eq. 1"
  interactive?: 'shrinkage' | 'ctr-delta' | null
}

export type Paragraph = {
  id: string              // stable anchor, e.g. "p-2.1-intro"
  text: string            // VERBATIM from the paper
  category?: Category | null
  glossKey?: string       // key into glossary.json for paragraph-level gloss
  termAnchors?: TermAnchor[]
  marginNotes?: MarginNote[]
  equations?: Equation[]
}

export type Section = {
  id: string              // e.g. "2.1", "3", "abstract"
  title: string
  pageStart: number
  pageEnd: number
  paragraphs: Paragraph[]
}

export type PaperContent = {
  title: string
  authors: string[]
  venue: string
  year: number
  sections: Section[]
}

// Glossary types
export type GlossaryEntry = {
  term: string
  plainEnglish: string
  firstUseIn: string    // section id
  authoritativeSource: {
    citation: string
    url: string
  }
}

export type Glossary = Record<string, GlossaryEntry>
