# Session 3 Prompt — Words that Matter Interactive Reader

## Context
We're building an interactive Next.js site that renders the NeurIPS 2024 paper "Words that Work: Using Language to Generate Hypotheses" (Batista & Ross) as two parallel reading experiences on separate tabs.

**Live URL:** https://words-that-matter.vercel.app
**GitHub:** https://github.com/irrationalnikhil/words-that-matter
**Paper:** https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4926398
**OSF:** https://osf.io/d5xvb/?view_only=301ca63ed1004401adb697a625ff8d61

## Before you write any code

1. Read `COWORK-CONTEXT.md` — full project state from Session 2.
2. Read `words-that-work-briefing.md` — the authoritative spec. If anything in this prompt conflicts with the briefing, the briefing wins.
3. Read `DEVLOG.md` — all decisions made in Sessions 1–2 and their rationale.
4. Skim `content/paper.json` to understand the data structure (don't modify without showing a diff first).
5. Run `npm run build` to verify the project builds clean before making changes.

## The hard constraint, restated
The authors' words are the substrate. Every claim the reader sees is a verbatim quote with page and section reference. Plain-English gloss beside, never in place of.

## What exists now (end of Session 2)

### Working
- Full paper rendering with semantic left-border accents
- KaTeX equation rendering (4 equations)
- Glossary hover/tap popovers (18 terms)
- Desktop margin rail (280px right rail on ≥1024px)
- Section progress bar + breadcrumb
- Filtering funnel interactive (2,100 → 205 → 16 → 6)
- Hypothesis results cards (6 pre-registered)
- Source Materials appendix (9 sections, both tabs)
- Source materials dropdown in top bar
- Option B: Stage 1 (Generate) fully functional with prompt assembly
- Auto-deploy from GitHub → Vercel

### Not built yet
- Shrinkage formula slider (Eq. 1 interactive)
- R² jump chart (0.04 vs 0.13)
- Figure 1 SVG redraw in warm palette
- Option B Stage 2 (Rank / Morph & Score)
- Option B Stage 3 (Filter with sliders)
- Option B exit panel ("What you just did")
- Full 45-reference list with DOI verification
- Accessibility audit
- Feedback form

## What needs to happen this session

### Priority 1: Remaining Option A interactives (2 hours)

**(a) Shrinkage formula slider (Eq. 1)**
Per briefing §2.4(a). Two sliders: Clicks (0–500, log scale), Impressions (10–10,000, log scale). Live-updating panel shows raw CTR, smoothed CTR (Eq. 1 formula), grand-mean CTR as reference line, and a visual bar showing how much the smoothed value is pulled toward the mean. Place after/alongside Eq. 1 in §2.1.

**(b) R² jump chart**
Per briefing §2.4(b). A two-bar chart: 0.04 (BU model) vs 0.13 (ML model). Hover/tap each bar for R² explanation, verbatim quote, F-statistic (169.4). Small caveat pill: "R² of 0.13 is still not high." Place after the R² discussion in §2.2.

### Priority 2: Option B Stages 2 & 3 (3 hours)

**(c) Stage 2 — Rank (Morph & Score)**
Per briefing §3.3 Stage 2. Show a hypothesis from Stage 1 carried forward. Display 3–4 headlines with "Morph" buttons that reveal the actual morph from Table 2 / morphs.json. Each morph shows a predicted ∆CTR bar. Summary score aggregates at bottom. Reader can try different hypotheses.

**(d) Stage 3 — Filter**
Per briefing §3.3 Stage 3. Vertical funnel: 2,100 → 205 → 16 → 6. Euclidean distance slider (default 0.03, range 0.01–0.10) with pre-computed survival counts at various thresholds. FDR toggle. At bottom: 6 pre-registered hypothesis cards with Study 1/2 results. Reuse/adapt the FilteringFunnel and HypothesisResults components from Option A.

**(e) Exit panel**
Per briefing §3.4. After Stage 3: "What you just did" editorial reflection (3 sentences), link to §3 Limitations rendered verbatim, link to Source Materials.

### Priority 3: Figure 1 & polish (1-2 hours)

**(f) Figure 1 SVG**
Redraw the paper's pipeline overview (Figure 1) as a clean SVG in the warm palette. Use the semantic colors: method blue for process stages, finding green for outputs, accent amber for interactive affordances. Place it in §2.3 or as a hero element in Option B.

**(g) Full references**
Extract all 45 references from the paper PDF (`61_Words_that_work_Using_langu.pdf` in project root). Update `content/references.json` with complete entries. Verify DOIs where possible. Show me a diff before committing.

**(h) Accessibility pass**
- Check color contrast for ink-muted (#5a5a5a) against paper (#faf8f3) — needs ≥4.5:1
- Verify all interactive elements are keyboard accessible
- Add proper aria-labels to sliders
- Ensure focus rings are visible
- Check prefers-reduced-motion is respected

### Priority 4: Feedback form (30 min)

**(i) Feedback form**
Per briefing §6. Add a "Give feedback" link to the top bar and to the Source Materials section. Link to a Tally or Typeform with the 5 reviewer questions from the briefing (comprehension, engagement, trust, appendix discovery, preference).

## Design constraints (unchanged)

* Typography: Body Lora 18-19px/1.65, display DM Serif Display, gloss DM Sans.
* Colors: Warm off-white #faf8f3. Semantic colors as LEFT-BORDER ACCENTS only.
* Reading column: 680px max-width. Margin rail: 280px.
* Performance: <250kb gzip per tab. Lazy-load interactives.
* Mobile-first. No scroll-jacking, parallax, or animation-on-scroll.
* All interactives keyboard-accessible, WCAG 2.2 AA.

## Architecture reminder
Content in JSON, components generic. Swapping in a different paper = replacing content files + paper-specific interactives.

## How we work
* Ask before deviating from the briefing.
* Any change to paper.json gets a diff shown first.
* Counterfactual-check non-trivial choices.
* Don't add features not in the briefing (log as v2 in DEVLOG).
* Commit after each priority block with descriptive messages.
* Push to GitHub after each block (Vercel auto-deploys).
* Update DEVLOG.md with decisions.
* Update COWORK-CONTEXT.md at end of session.

## Session 3 deliverables
1. Shrinkage slider working alongside Eq. 1
2. R² chart working in §2.2
3. Option B Stage 2 (Rank) with morphed headlines
4. Option B Stage 3 (Filter) with sliders + hypothesis cards
5. Option B exit panel
6. Figure 1 SVG in warm palette
7. Full 45-reference list
8. Accessibility fixes for any contrast/keyboard issues
9. Feedback form linked
10. Updated DEVLOG.md and COWORK-CONTEXT.md
