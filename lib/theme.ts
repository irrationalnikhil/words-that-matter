// Design tokens — canonical source. Tailwind config mirrors these values.
// If you change a value here, update tailwind.config.ts to match.

export const colors = {
  // Backgrounds
  paper:        '#faf8f3',  // warm off-white, main reading surface
  paperSubtle:  '#f3efe5',  // gloss/margin container
  paperDeep:    '#ede6d3',  // pull-quotes, accent panels
  ink:          '#1a1a1a',  // primary text
  inkMuted:     '#5a5a5a',  // secondary text, citations
  inkFaint:     '#767676',  // metadata, page numbers (darkened from #8a8a8a for WCAG AA 4.5:1)

  // Semantic (left-border accents, small pills — never text highlights)
  method:       '#4a6fa5',  // process, pipeline, how-it-works (cool blue)
  finding:      '#6b8e4e',  // empirical claims, results (warm green)
  caveat:       '#b85c38',  // limitations, null results, caveats (warm rust)
  novel:        '#8b6bb1',  // the paper's novel contribution (muted purple)

  // Interactive
  accent:       '#c4924a',  // sliders, buttons, interactive affordances (amber)
  accentDeep:   '#a67938',
} as const

export const fonts = {
  display: 'DM Serif Display',  // headers, pull quotes
  serif:   'Lora',              // body reading
  sans:    'DM Sans',           // UI chrome, gloss, captions
  mono:    'JetBrains Mono',    // code, prompts, formulas
} as const

export const spacing = {
  readingColumn: '680px',
  readingColumnNarrow: '560px',
  marginRail: '280px',
} as const

// Semantic category → color mapping
export const categoryColor: Record<string, string> = {
  method:  colors.method,
  finding: colors.finding,
  caveat:  colors.caveat,
  novel:   colors.novel,
}
