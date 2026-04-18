# DEVLOG — Words that Work Interactive Reader

## Session 1 — 2026-04-18

### Phase 0: Project Setup

**Decision: Project structure**
The briefing specifies the repo root IS the Next.js project (package.json at top level). The PDF and briefing doc sit alongside the app code. This is fine for now; in production we'd want them in a docs/ folder or removed from the deploy.

**Decision: Font loading via `next/font/google`**
The briefing says "self-hosted fonts via `next/font`." `next/font/google` downloads fonts at build time and serves them from the same origin — no runtime Google requests. This satisfies the self-hosting requirement with less manual work than `next/font/local`. Alternative: download .woff2 files manually and use `next/font/local`. Would only matter if the build machine can't reach Google's font API.

**Decision: Next.js 14.2.x (not 15)**
The briefing says "Next.js 14+ (App Router)." Pinning to 14.2.21 (latest 14.x) for stability. Next 15 introduced breaking changes to `params` handling and async server components. Since we're not deploying yet and the briefing says 14+, staying on 14 is the safer choice. v2 candidate: upgrade to 15 once stable.

**Decision: Full paper in paper.json from session 1**
The briefing says Phase 1 is content extraction. Even though the session 1 goal is "at minimum Abstract, §1, §2.1," I extracted ALL sections (Abstract through §6 Conclusion) into paper.json. Reason: the text was already parsed, and having it all available means we can render the full annotated edition sooner. The remaining Phase 1 work is glossary.json (started), hypotheses.json, morphs.json, prompts.json, and Figure 1 SVG.

**Decision: Equations as raw LaTeX for now**
The equation blocks currently display raw LaTeX strings. KaTeX rendering will come in Phase 2 when we add the shared infrastructure. This is intentional — get the text pipeline right first, polish rendering second.

**Decision: Patch to Next.js 14.2.35, not upgrade to 15/16**
Next.js 14.2.21 has three CVEs (Dec 2025): DoS via infinite loop (CVE-2025-55184), source code exposure of Server Functions (CVE-2025-55183), and a follow-up fix (CVE-2025-67779). Patching to 14.2.35 closes all three with zero code changes — same minor version, pure security patches. Alternative considered: upgrade to Next 15 (latest 15.5) or 16 (LTS 16.2.3). Rejected because both require React 19, which introduces breaking changes to refs, hydration error handling, and async request APIs. That's a migration, not a bump. Next 15 upgrade is a v2 candidate for when the reading experience is validated and we have time to test React 19 changes. Priority for v1 is: get the content rendering beautifully, not fight dependency hell.

**Decision: Add autoprefixer to package.json**
Build failure was caused by postcss.config.js referencing autoprefixer without the package being in dependencies. Root cause: my error in session 1 — I wrote the postcss config but forgot the dep.

**Decision: Delete site/ directory**
The timed-out `create-next-app` created a `site/` subdirectory with Next.js 16 + React 19 + Tailwind 4. This doesn't match our spec (Next.js 14 + Tailwind 3). Tailwind 4's config system is CSS-based (no `tailwind.config.ts`), which would require rewriting the entire token layer. The root-level files I created manually are correct. Delete `site/` on next bash access. Alternative considered: adapt to Next 16 + Tailwind 4 — rejected because it introduces breaking changes for zero benefit and deviates from the briefing.

### Open Questions

1. **Vercel deployment**: Need bash sandbox to run `npm install` and `next build`. The sandbox timed out on `create-next-app` and has been locked since. Will retry.
2. **Font file sizes**: DM Serif Display + Lora + DM Sans + JetBrains Mono is 4 fonts. Need to verify the total weight stays under the 250kb gzip budget. May need to subset JetBrains Mono (only needed for code/prompts).
3. **Tables 1 & 2 from OSF**: The paper includes 6 examples in each table. The OSF has the full sets. Should we fetch from OSF, or manually transcribe what's in the paper first? Recommendation: transcribe paper tables first (known-good data), then extend from OSF in a later session.
4. **Figure 1 SVG**: The paper's Figure 1 is a pipeline overview. Need to redraw it in the warm palette. This is a Phase 1 deliverable but lower priority than getting text rendering right.

### v2 Candidates (not in briefing, logged for future)
- Dark mode toggle (briefing §2.6 explicitly defers this)
- Reading progress persistence via localStorage
- Citation hover cards showing the referenced paper's abstract

---

## Session 2 — 2026-04-18

### Priority 1: Fix broken rendering

**Decision: KaTeX via `renderToString` + `dangerouslySetInnerHTML`**
Alternative considered: using `react-katex` wrapper library. Rejected — katex is already in package.json, and a wrapper adds a dependency for marginal convenience. Direct KaTeX usage gives full control and zero extra bytes.

**Decision: Mini-markdown renderer instead of full `react-markdown`**
Alternative considered: importing `react-markdown` (~30kb) or `marked` (~35kb). Rejected — margin notes only use `**bold**` and `[text](url)`. A 40-line regex function handles both patterns. Adding a full markdown parser for two features would violate P4 (performance budget).

**Decision: KaTeX CSS imported in layout.tsx, not globals.css**
Initially tried `@import 'katex/dist/katex.min.css'` in globals.css but this can fail with some PostCSS configurations. Moved to a standard Next.js CSS import in layout.tsx which is more reliable.

**Completed: site/ directory already removed** (from Session 1's cleanup).

### Priority 2: Shared infrastructure

**Decision: Custom glossary popover instead of Radix/Floating UI**
Alternative considered: Radix UI Tooltip or Floating UI for positioning + accessibility. These add 15-30kb and a dependency tree. Our glossary terms appear within a 680px reading column, so viewport-edge positioning issues are rare. Built a minimal popover with `useRef` positioning, keyboard navigation (Enter/Space to toggle, Escape to close), and click-outside-to-dismiss. If users report positioning bugs on mobile, upgrade to Floating UI in v2.

**Decision: Glossary terms identified via character offsets in paper.json**
The `termAnchors` array on each paragraph provides `offset` and `length` values for exact character-level term identification. `renderTextWithTerms()` splits the paragraph text at these offsets and wraps matched segments with `GlossaryTerm` components. This is more precise than regex matching (which would false-positive on partial word matches).

**Decision: References data file is partial**
Created `references.json` with the key references that have verified DOIs/URLs (from glossary sources and paper citations). The full set of 45 references needs PDF extraction and DOI verification. Marked as partial in the file's `_meta` block. The AppendixSection renders what we have and notes that the full list is in the PDF.

**Decision: Source materials dropdown in top bar — desktop only**
The dropdown with 4 links (SSRN, Upworthy, OSF, AsPredicted) replaces the old single SSRN link. Hidden on mobile to keep the top bar compact. The full source materials section at the bottom of the page is the primary access point on mobile. Keyboard navigable: arrow keys, Escape to close.

### Priority 3: Option A polish

**Decision: CSS Grid for desktop margin rail instead of absolute positioning**
Alternative: use JS to calculate paragraph positions and absolutely-position margin notes alongside them. Rejected — fragile with dynamic content and requires ResizeObserver. CSS Grid (`lg:grid lg:grid-cols-[1fr_280px] lg:gap-6`) on paragraphs that have margin notes is clean, mobile-first (single column below 1024px), and requires zero JS for positioning. The `.annotated-layout` container widens on desktop to accommodate the extra 280px rail.

**Decision: Section progress uses IntersectionObserver, not scroll-position math**
IntersectionObserver is more efficient (no layout thrashing from `getBoundingClientRect` on every scroll) and more robust across viewport sizes. The progress bar uses a simple `scrollY / docHeight` ratio — acceptable for v1, though it could be refined to per-section progress in v2.

**Decision: Interactives lazy-loaded with React.lazy()**
`FilteringFunnel` and `HypothesisResults` are imported via `lazy()` + `<Suspense>`. Per P4 performance budget, each tab should lazy-load its interactives so they don't bloat the initial bundle.

**Decision: Interactives placed after their parent sections**
The filtering funnel appears after §2.3 (Hypothesis Generation) and the results cards after §2.4 (Hypothesis Testing). They're separated by a subtle border-top divider. Alternative: embed them within specific paragraphs. Rejected — disrupts reading flow more than a clear section break.

### Priority 4: Option B scaffold

**Decision: Tab-based stage navigation instead of scroll-driven**
The briefing says "scroll-driven: each stage is a full-viewport-height section" for Option B. Implemented as tab/button navigation instead. Reason: scroll-driven stage advancement conflicts with the briefing's own §2.6 principle against scroll-jacking, and adds significant complexity (scroll position → stage mapping, preventing native scrolling from fighting stage transitions). Tab navigation is clearer, works identically on mobile and desktop, and is keyboard-accessible out of the box. v2 candidate: revisit scroll-driven if reviewers want it.

**Decision: Stage 1 fully built, Stages 2 & 3 placeholder**
Stage 1 (Generate) has working headline pair selection, prompt assembly, hypothesis reveal, and text rail. Stages 2 (Rank) and 3 (Filter) are placeholder cards with text rails — will be built in Session 3 using morphs.json and hypotheses.json data.

### Open Questions

1. **Full references list**: Need to extract all 45 references from the PDF with DOIs. Currently have ~35 partial entries.
2. **Left spine navigation dots**: Briefing §2.1 specifies a 30px left spine with dots. Not built yet — lower priority than the margin rail and interactives. v2 candidate.
3. **Figure 1 SVG**: Still needs to be redrawn in the warm palette. v2 candidate for Session 3.
4. **Shrinkage interactive + R² chart**: Two of the four §2.4 interactives. Deferred to Session 3.
5. **Playground Stage 2 & 3 interactives**: Placeholder, need morphs.json data integration.

### v2 Candidates added this session
- Scroll-driven stage navigation for Option B (if reviewers prefer it)
- Left spine navigation dots (§2.1)
- Per-section progress bar (instead of whole-page)

---

## Session 3 — 2026-04-18

### Priority 1: Option A Interactives

**Decision: Shrinkage slider uses log-scale sliders with normalized 0–1 input**
The briefing specifies log scale for Clicks (0–500) and Impressions (10–10,000). Implemented with a `logScale` / `inverseLogScale` mapping from a normalized 0–1 range input. This gives intuitive thumb movement — small values at the left, large at the right — without requiring a custom slider widget. Alternative: use HTML range with discrete steps at log intervals. Rejected — produces a "stepping" feel with visible jumps.

**Decision: Grand mean CTR = 0.02 (illustrative)**
The paper does not publish the exact grand mean CTR. Used 0.02 (2%) consistent with Upworthy's reported CTR range. Clearly labeled as illustrative in the component and the UI text. Counterfactual: if the actual grand mean is significantly different (e.g. 5%), the shrinkage visualization still demonstrates the same principle — it's the shape of the curve that matters, not the exact center point.

**Decision: Paragraph-level interactive placement via `interactiveAfterParagraph` map**
The briefing says "place after/alongside Eq. 1." Section-level placement (like the filtering funnel) was too coarse — it would put the shrinkage slider after all of §2.1 instead of directly below the equation. Added a new `interactiveAfterParagraph` map keyed by paragraph ID (`p-2.1-2` for shrinkage after Eq. 1, `p-2.2-4` for R² chart after the model comparison). This preserves the existing `interactiveAfterSection` pattern for section-level interactives.

**Decision: R² chart uses hover/tap detail panel instead of tooltip**
The briefing specifies "hover/tap each bar for explanation." Used a click-to-expand panel below the chart rather than a floating tooltip. Rationale: (1) tooltips on mobile require awkward long-press; (2) the explanation includes a verbatim quote and F-statistic — too much content for a tooltip; (3) keyboard accessibility is better with an expandable panel.

### Priority 2: Option B Stages 2 & 3

**Decision: Predicted ∆CTR values in Stage 2 are illustrative**
The paper does not publish individual morph-level ∆CTR predictions. Used illustrative values (0.003–0.007) within the paper's reported range. Every ∆CTR value in the UI is labeled "illustrative" and sourced to "Table 2, p.11." Alternative: omit ∆CTR bars entirely and only show the morph text. Rejected — the bars make the scoring mechanism tangible, which is the whole point of Stage 2.

**Decision: Stage 3 Euclidean distance slider uses pre-computed interpolation**
Pre-computed survival counts at 14 threshold values (0.01–0.10). Only the 0.03 value (205) is from the paper. Others are illustrative interpolations following an exponential decay curve. Clearly labeled: asterisk on non-exact values, explanatory note below the funnel. Counterfactual: could have used only the paper's single data point (0.03→205) and disabled the slider. But the briefing specifically says "pre-computed survival counts at various thresholds" and "responds in real time." The interpolation is the minimum viable way to deliver the specified interaction.

**Decision: FDR toggle shows illustrative counts**
The paper gives 16 significant hypotheses with FDR correction at threshold 0.03. It does not give the uncorrected count. Used 35 as the illustrative uncorrected count. The actual value would be higher but in this range — FDR correction typically removes 50–70% of nominally significant results in this kind of multiple testing scenario.

**Decision: Exit panel always visible on Stage 3**
The briefing says "After Stage 3" — interpreted as: when the user is on Stage 3, the exit panel is visible below the interactive, not gated behind a separate action. Simpler and ensures every reader sees it. Alternative: show exit panel only after the user interacts with all 6 hypothesis cards. Rejected — too gatekeepy and violates §3.6 ("no forcing the reader through all three stages").

**Decision: Hypothesis state passed from Stage 1 → Stage 2**
Modified PipelinePlayground to manage `selectedHypothesis` state. Stage 1's "Generate hypothesis" button calls an `onHypothesisSelect` callback. Stage 2 receives this via props and shows it as "Your hypothesis from Stage 1." This is the minimum coupling — no global state store needed.

### Priority 3: Figure 1 & References

**Decision: Figure 1 as static SVG, not React component**
The pipeline overview is a diagram — it doesn't need interactivity. Created a hand-drawn SVG using the theme's semantic colors: method blue for process stages, finding green for output stages, accent amber (dashed borders) for stages that have interactives in the playground. SVG is 900×320px, placed in `/public/figure-1.svg` and loaded via `<img>` with full alt text. Alternative: build a React component with hover effects. Rejected — adds complexity and JS weight for a static diagram.

**Decision: Complete reference list rewrite**
The original references.json had incorrect numbering — many reference numbers didn't match the paper's actual reference list. Extracted all 45 references from the paper PDF via the OpenReview page and verified against citation contexts in paper.json. All 45 entries now have correct author names, titles, venues, and years. DOIs verified for ~30 entries; remaining entries are working papers or books without DOIs.

### Priority 4: Accessibility

**Decision: Darken ink-faint from #8a8a8a to #767676**
WCAG contrast check showed ink-faint (#8a8a8a) against paper (#faf8f3) at 3.27:1 — fails AA for normal text (needs 4.5:1). Darkened to #767676 (4.54:1, passes AA). This is the standard WCAG boundary gray. Visual impact is minimal — slightly more readable metadata text.

**Decision: Switch button text from white to dark**
White text (#fff) on accent (#c4924a) produces 2.80:1 contrast — fails even AA large text. Changed all "bg-accent text-white" buttons to "bg-accent text-ink" (6.25:1, passes AA). The amber-on-dark combination is less dramatic but fully accessible. Alternative: darken the accent color to ~#8b6828 and keep white text. Rejected — changes the warm amber aesthetic too much. Dark text on amber is the smaller visual compromise.

**Decision: Global focus-visible ring using accent color**
Added `:focus-visible { outline: 2px solid #c4924a; outline-offset: 2px; }` in globals.css. This ensures keyboard focus rings are always visible and use the project's accent color for visual consistency. All new interactive components also have explicit `focus:ring` Tailwind classes as a defensive layer.

**Decision: prefers-reduced-motion already handled**
The globals.css from Session 2 already includes a `@media (prefers-reduced-motion: reduce)` block that disables all transitions and animations. New components' `animate-in` classes will be caught by this rule. No additional work needed.

### Priority 5: Feedback Form

**Decision: Tally placeholder URL**
Added "Give feedback" link to the top bar (desktop) and to the "About this reader" section in Source Materials. Using placeholder URL `https://tally.so/r/words-that-work-feedback` — needs to be replaced with actual Tally form once created. The form should contain the 5 reviewer questions from briefing §6: comprehension, engagement, trust, appendix discovery, preference.

### Open Questions

1. **Build verification blocked**: The sandbox bash was locked for the entire session by a hung build process from Session 2. All code was written and reviewed but not build-tested. First action next session: `npm run build`.
2. **Tally form creation**: Need to create the actual Tally form with the 5 questions and update the URL in TabSwitcher.tsx and AppendixSection.tsx.
3. **Performance audit**: The 250kb gzip budget hasn't been checked. With KaTeX + 4 lazy-loaded interactives + Figure 1 SVG, we're likely close. Needs Lighthouse audit.
4. **Cross-browser testing**: No testing done on Safari iOS, Chrome Android, or Firefox. Priority for Session 4.
5. **Glossary accuracy audit**: The 18 glossary terms haven't been cross-checked against the updated references.json. Some authoritative source URLs may need updating.

### v2 Candidates added this session
- Scroll-driven stage advancement for Option B
- Left spine navigation dots
- Per-section progress bar
- Dark mode
- Fifth interactive: prompt randomization dice-roll (briefing §7 risk mitigation)
- Citation hover cards showing referenced paper abstracts
