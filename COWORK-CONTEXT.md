# COWORK-CONTEXT — Running State for Future Sessions

## Current State (as of 2026-04-18, end of Session 2)

**Live URL:** https://words-that-work.vercel.app
**Stack:** Next.js 14.2.35 + React 18 + Tailwind 3.4 + TypeScript
**Phase:** Phase 0-1 complete. Phase 2 (Shared Infrastructure) complete. Phase 3 (Option A) ~60% done. Phase 4 (Option B) ~30% done.

## What's Working

### Shared infrastructure (Phase 2 — complete)
- Landing page (/) with two cards, SSRN link, pitch text
- Tab switcher with active state highlighting
- Sticky top bar with backdrop blur
- **Source materials dropdown** in top bar (keyboard-navigable, 4 links: SSRN, Upworthy, OSF, AsPredicted)
- **Glossary hover/tap** — dotted-underline glossary terms in reading column with popovers showing definition + authoritative source (18 terms in glossary.json, wired via `termAnchors` in paper.json)
- **Source Materials appendix** — 9 sections at bottom of BOTH tabs (paper link + BibTeX, data, code/prompts, pre-registration, survey materials, hypothesis funnel summary, Tables 1 & 2, references, about)
- **KaTeX equation rendering** — 4 equations rendered from LaTeX strings in paper.json
- **Markdown in margin notes** — bold and links render correctly (mini-markdown renderer)
- 4 self-hosted fonts preloading correctly (DM Serif Display, Lora, DM Sans, JetBrains Mono)

### Option A — Annotated Edition (Phase 3 — ~60%)
- /annotated renders ALL paper sections from paper.json with semantic left-border accents
- **Desktop margin rail** (≥1024px) — margin notes appear in a 280px right rail alongside their parent paragraph. Mobile: inline below paragraphs.
- **Section progress indicator** — sticky breadcrumb below top bar showing current section name + reading progress bar (IntersectionObserver)
- **Filtering funnel interactive** — 2,100 → 205 → 16 → 6, expandable stages with quotes and descriptions
- **Hypothesis results cards** — 6 pre-registered hypotheses as small multiples with Study 1/2 p-values, caveat tags
- Lazy-loaded interactives (React.lazy) after §2.3 and §2.4

### Option B — Pipeline Playground (Phase 4 — ~30%)
- /playground with three-stage pipeline navigation (Generate → Rank → Filter)
- **Stage 1 (Generate)** — fully functional: headline pair gallery, prompt assembly with 3 randomization axes, hypothesis reveal, text rail
- Stage 2 (Rank) — placeholder with text rail
- Stage 3 (Filter) — placeholder with text rail
- 60/40 desktop split layout (workspace / text rail)
- Welcome panel with description
- Previous/Next stage navigation buttons

## What's Not Built Yet

### Phase 3: Option A (remaining ~40%)
1. **Left spine navigation dots** — 30px left spine with dots per §2.1. v2 candidate.
2. **Shrinkage formula slider** (Eq. 1) — interactive with two sliders per §2.4(a). Session 3.
3. **R² jump chart** — two-bar chart (0.04 vs 0.13) per §2.4(b). Session 3.
4. **Figure 1 SVG** — redraw pipeline overview in warm palette. Session 3.

### Phase 4: Option B (remaining ~70%)
5. **Stage 2 (Rank)** — morph headlines, predicted ∆CTR bars per §3.3. Session 3.
6. **Stage 3 (Filter)** — Euclidean distance slider, FDR toggle, funnel per §3.3. Session 3.
7. **Exit panel** — "What you just did" editorial reflection per §3.4. Session 3.
8. **Scroll-driven stage advancement** — deferred to v2 (see DEVLOG for rationale).

### Phase 5: Polish
9. Accessibility audit (axe DevTools, keyboard nav, screen reader)
10. Lighthouse performance audit
11. Cross-browser testing
12. Copy-edit all editorial/gloss text
13. Feedback form (Typeform/Tally) per §6
14. Full 45-reference list with DOI verification

## Content Files Status
| File | Status | Notes |
|------|--------|-------|
| `content/paper.json` | ✅ Complete | All sections, verbatim. DO NOT MODIFY without diff review. |
| `content/glossary.json` | ✅ Complete | 18 terms with definitions + authoritative sources |
| `content/hypotheses.json` | ⚠️ Partial | Table 1 examples + 6 pre-registered hypotheses + funnel counts. Needs OSF data for full set. |
| `content/morphs.json` | ⚠️ Partial | Table 2 examples only. Needs OSF data for Stage 2. |
| `content/prompts.json` | ⚠️ Partial | 3 examples per axis from Appendix A.2. Needs OSF prompts.yaml. |
| `content/references.json` | ⚠️ Partial | ~35 references with some DOIs. Need full 45 from PDF. |

## Key Files
- `content/paper.json` — single source of truth for paper text. ALL changes need diff review.
- `content/glossary.json` — 18 seed terms with definitions and authoritative sources
- `content/references.json` — partial reference list
- `lib/theme.ts` — design tokens (colors, fonts, spacing)
- `lib/types.ts` — TypeScript types for content schema
- `lib/renderMiniMarkdown.tsx` — tiny bold/link markdown renderer for margin notes
- `lib/renderTextWithTerms.tsx` — splits paragraph text at glossary term offsets
- `tailwind.config.ts` — mirrors theme.ts tokens
- `components/annotated/AnnotatedReader.tsx` — main reading view with margin rail + interactives
- `components/annotated/SectionProgress.tsx` — sticky breadcrumb + progress bar
- `components/annotated/FilteringFunnel.tsx` — 2100→6 funnel interactive
- `components/annotated/HypothesisResults.tsx` — 6 hypothesis result cards
- `components/playground/PipelinePlayground.tsx` — Option B main component
- `components/playground/StageGenerate.tsx` — Stage 1 with headline pairs + prompts
- `components/playground/TextRail.tsx` — sticky text rail with verbatim paper text
- `components/shared/TabSwitcher.tsx` — top bar with tabs + source dropdown
- `components/shared/AppendixSection.tsx` — 9-section source materials footer
- `components/shared/KaTeXBlock.tsx` — LaTeX equation renderer
- `components/shared/GlossaryTerm.tsx` — hover/tap popover for glossary terms
- `components/shared/Quote.tsx` — verbatim quote block (built, used in AppendixSection)
- `components/shared/Gloss.tsx` — plain-English gloss container (built, not yet integrated)
- `components/shared/Pill.tsx` — category pills (built, not yet integrated)
- `DEVLOG.md` — decisions and open questions log
- `words-that-work-briefing.md` — AUTHORITATIVE spec

## Spec Reference
- **Briefing:** `words-that-work-briefing.md` in project root (AUTHORITATIVE — if anything conflicts, briefing wins)
- **Source PDF:** `61_Words_that_work_Using_langu.pdf` in project root
- **Live URL:** https://words-that-work.vercel.app
- **Paper URL:** https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4926398
- **OSF:** https://osf.io/d5xvb/?view_only=301ca63ed1004401adb697a625ff8d61
- **Pre-registration:** https://aspredicted.org/S6H_ZPF

## Working Agreements
- Ask before deviating from briefing
- Commit often with descriptive messages
- Show screenshots after each phase
- Any paper.json change gets a diff review
- Counterfactual-check non-trivial decisions
- Don't add features not in the briefing (log as v2 in DEVLOG)
- Build mobile-first, desktop-enhanced
- The framework should be reusable for other papers (content in JSON, components generic)
