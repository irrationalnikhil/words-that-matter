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
- Figure 1 SVG redraw in warm palette
- Full 45-reference list with DOI verification
- Feedback form (Typeform/Tally) linked from top bar (§6)
- Per-section progress bar (instead of whole-page)
