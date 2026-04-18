# COWORK-CONTEXT — Running State for Future Sessions

## Current State (as of 2026-04-18, end of Session 4)

**Live URL:** https://words-that-matter.vercel.app
**Stack:** Next.js 14.2.35 + React 18 + Tailwind 3.4 + TypeScript
**Phase:** Phase 0-1 complete. Phase 2 (Shared Infrastructure) complete. Phase 3 (Option A) ~95% done. Phase 4 (Option B) ~95% done. Phase 5 (Polish) ~85%.

## What's Working

### Shared infrastructure (Phase 2 — complete)
- Landing page (/) with two cards, SSRN link, pitch text
- Tab switcher with active state highlighting
- Sticky top bar with backdrop blur
- **Source materials dropdown** in top bar (keyboard-navigable, 4 links: SSRN, Upworthy, OSF, AsPredicted)
- **Feedback link** in top bar (desktop) and Source Materials "About this reader" section
- **Glossary hover/tap** — dotted-underline glossary terms in reading column with popovers showing definition + authoritative source (18 terms in glossary.json, wired via `termAnchors` in paper.json)
- **Source Materials appendix** — 9 sections at bottom of BOTH tabs (paper link + BibTeX, data, code/prompts, pre-registration, survey materials, hypothesis funnel summary, Tables 1 & 2, references, about)
- **KaTeX equation rendering** — 4 equations rendered from LaTeX strings in paper.json
- **Markdown in margin notes** — bold and links render correctly (mini-markdown renderer)
- 4 self-hosted fonts preloading correctly (DM Serif Display, Lora, DM Sans, JetBrains Mono)
- **Full 45-reference list** with DOIs where available

### Option A — Annotated Edition (Phase 3 — ~90%)
- /annotated renders ALL paper sections from paper.json with semantic left-border accents
- **Desktop margin rail** (≥1024px) — margin notes appear in a 280px right rail alongside their parent paragraph. Mobile: inline below paragraphs.
- **Section progress indicator** — sticky breadcrumb below top bar showing current section name + reading progress bar (IntersectionObserver)
- **Shrinkage formula slider** (Eq. 1) — two log-scale sliders (Clicks, Impressions) with live-updating raw CTR, smoothed CTR, grand-mean reference, and pull-toward-mean visualization. Placed after Eq. 1 in §2.1.
- **R² jump chart** — two-bar chart (BU model 0.04 vs ML model 0.13) with hover/tap detail panel showing verbatim quote, F-statistic, and caveat pill. Placed after R² discussion in §2.2.
- **Figure 1 SVG** — pipeline overview redrawn in warm palette with semantic colors (method blue, finding green, accent amber for interactives). Placed before §2.3 Hypothesis Generation.
- **Filtering funnel interactive** — 2,100 → 205 → 16 → 6, expandable stages with quotes and descriptions
- **Hypothesis results cards** — 6 pre-registered hypotheses as small multiples with Study 1/2 p-values, caveat tags
- Source Materials appendix (9 sections, both tabs)
- Lazy-loaded interactives (React.lazy) for all 4 interactives

### Option B — Pipeline Playground (Phase 4 — ~90%)
- /playground with three-stage pipeline navigation (Generate → Rank → Filter)
- **Stage 1 (Generate)** — fully functional: headline pair gallery, prompt assembly with 3 randomization axes, hypothesis reveal, text rail. Hypothesis selection persists across stages.
- **Stage 2 (Rank)** — fully functional: carries forward selected hypothesis from Stage 1, shows 4 headline morphs from Table 2 with "Morph" reveal buttons, predicted ∆CTR bars (illustrative), summary score aggregation. Set selector for cycling through morph examples.
- **Stage 3 (Filter)** — fully functional: Euclidean distance slider (0.01–0.10, default 0.03) with pre-computed survival counts, FDR toggle, vertical funnel visualization, 6 pre-registered hypothesis cards with Study 1/2 results and expand-for-details.
- **Exit panel** — "What you just did" editorial reflection (3 sentences), link to §3 Limitations, link to Source Materials. Clearly labeled as editorial gloss.
- 60/40 desktop split layout (workspace / text rail)
- Welcome panel with description
- Previous/Next stage navigation buttons

### Accessibility (Phase 5 — ~85%)
- ink-faint color darkened to #767676 (4.54:1 contrast, WCAG AA compliant)
- Button text switched from white to dark for AA-compliant accent buttons (6.25:1)
- Global `:focus-visible` ring in accent color
- `prefers-reduced-motion` respected (all transitions/animations disabled)
- All sliders have `aria-label`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- FDR toggle has `role="switch"` with `aria-checked`
- **Session 4**: Semantic colors (finding/caveat/novel) darkened for WCAG AA 4.5:1 text contrast
- **Session 4**: Touch target sizing for range inputs and toggles (≥44px)
- **Session 4**: aria-label on main, footer, workspace landmarks
- **Session 4**: All TextRail quotes verified verbatim; fabricated quote removed
- **Session 4**: OG image and Twitter card meta tags added

## What's Not Built Yet

### Phase 3: Option A (remaining ~10%)
1. **Left spine navigation dots** — 30px left spine with dots per §2.1. v2 candidate.

### Phase 4: Option B (remaining ~10%)
2. **Scroll-driven stage advancement** — deferred to v2 (see DEVLOG for rationale).

### Phase 5: Polish (remaining ~15%)
3. Lighthouse performance audit (250kb budget)
4. Cross-browser testing (Safari iOS, Chrome Android, Firefox desktop)
5. ~~Copy-edit all editorial/gloss text~~ ✅ Session 4
6. ~~Reviewer questions~~ ✅ Session 4 (inline, not Tally)
7. ~~Glossary accuracy audit~~ ✅ Session 4
8. Build verification — need to run `npm run build` + `npx next lint` locally

## Content Files Status
| File | Status | Notes |
|------|--------|-------|
| `content/paper.json` | ✅ Complete | All sections, verbatim. DO NOT MODIFY without diff review. |
| `content/glossary.json` | ✅ Complete | 18 terms with definitions + authoritative sources |
| `content/hypotheses.json` | ⚠️ Partial | Table 1 examples + 6 pre-registered hypotheses + funnel counts. Needs OSF data for full set. |
| `content/morphs.json` | ⚠️ Partial | Table 2 examples only. Needs OSF data for Stage 2 expansion. |
| `content/prompts.json` | ⚠️ Partial | 3 examples per axis from Appendix A.2. Needs OSF prompts.yaml. |
| `content/references.json` | ✅ Complete | All 45 references with DOIs where verified. |

## Key Files
- `content/paper.json` — single source of truth for paper text. ALL changes need diff review.
- `content/glossary.json` — 18 seed terms with definitions and authoritative sources
- `content/references.json` — complete 45-reference list
- `lib/theme.ts` — design tokens (colors, fonts, spacing)
- `lib/types.ts` — TypeScript types for content schema
- `lib/renderMiniMarkdown.tsx` — tiny bold/link markdown renderer for margin notes
- `lib/renderTextWithTerms.tsx` — splits paragraph text at glossary term offsets
- `tailwind.config.ts` — mirrors theme.ts tokens
- `components/annotated/AnnotatedReader.tsx` — main reading view with margin rail + interactives
- `components/annotated/SectionProgress.tsx` — sticky breadcrumb + progress bar
- `components/annotated/ShrinkageSlider.tsx` — Eq. 1 interactive with two log-scale sliders
- `components/annotated/RSquaredChart.tsx` — BU vs ML model R² comparison chart
- `components/annotated/FilteringFunnel.tsx` — 2100→6 funnel interactive
- `components/annotated/HypothesisResults.tsx` — 6 hypothesis result cards
- `components/playground/PipelinePlayground.tsx` — Option B main component with stage state management
- `components/playground/StageGenerate.tsx` — Stage 1 with headline pairs + prompts
- `components/playground/StageRank.tsx` — Stage 2 with morph reveal + ∆CTR bars
- `components/playground/StageFilter.tsx` — Stage 3 with Euclidean slider, FDR toggle, funnel, hypothesis cards
- `components/playground/ExitPanel.tsx` — "What you just did" editorial reflection
- `components/playground/TextRail.tsx` — sticky text rail with verbatim paper text
- `components/shared/TabSwitcher.tsx` — top bar with tabs + source dropdown + feedback link
- `components/shared/AppendixSection.tsx` — 9-section source materials footer
- `components/shared/KaTeXBlock.tsx` — LaTeX equation renderer
- `components/shared/GlossaryTerm.tsx` — hover/tap popover for glossary terms
- `components/shared/Quote.tsx` — verbatim quote block (built, used in AppendixSection)
- `components/shared/Gloss.tsx` — plain-English gloss container (built, not yet integrated)
- `components/shared/Pill.tsx` — category pills (built, not yet integrated)
- `public/figure-1.svg` — pipeline overview SVG in warm palette
- `DEVLOG.md` — decisions and open questions log
- `words-that-work-briefing.md` — AUTHORITATIVE spec

## Spec Reference
- **Briefing:** `words-that-work-briefing.md` in project root (AUTHORITATIVE — if anything conflicts, briefing wins)
- **Source PDF:** `61_Words_that_work_Using_langu.pdf` in project root
- **Live URL:** https://words-that-matter.vercel.app
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

## Session 5 Priority: Portability & Generalization
1. Build verification: `npm run build` + `npx next lint`
2. Lighthouse performance audit (250kb budget)
3. Cross-browser testing
4. Portability refactoring (per briefing Session 5 scope)
