# Session 2 Prompt — Words that Work Interactive Reader

## Context
We're building an interactive Next.js site that renders the NeurIPS 2024 paper "Words that Work: Using Language to Generate Hypotheses" (Batista & Ross) as two parallel reading experiences on separate tabs — so reviewers can compare them and tell us which pattern works better.

**Live URL:** https://words-that-work.vercel.app
**Paper:** https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4926398
**OSF (data, prompts, surveys):** https://osf.io/d5xvb/?view_only=301ca63ed1004401adb697a625ff8d61

## Before you write any code
1. Read `COWORK-CONTEXT.md` — it has the full project state, what's working, what's broken, and what's not built yet.
2. Read `words-that-work-briefing.md` — it's the authoritative spec. If anything in this prompt conflicts with the briefing, the briefing wins.
3. Read `DEVLOG.md` — it has all decisions made so far and their rationale.
4. Skim `content/paper.json` to understand the data structure (don't modify it without showing me a diff first).

## The hard constraint, restated
The authors' words are the substrate of both tabs. Every claim, method, and finding the reader sees is a verbatim quote from the paper — with page and section reference. We are not paraphrasing or summarizing. Plain-English gloss is permitted beside the authors' quotes (clearly demarcated — different typeface, indented, muted color), never in place of them.

## What exists now
- Next.js 14.2.35 + React 18 + Tailwind 3.4 project, deployed to Vercel
- Landing page with two cards (Annotated Edition + Pipeline Playground)
- `/annotated` route rendering ALL paper sections from `paper.json` with semantic left-border accents (method=blue, finding=green, caveat=rust, novel=purple)
- Margin notes rendering inline (not in a rail yet)
- Tab switcher, sticky top bar
- 4 self-hosted Google fonts (DM Serif Display, Lora, DM Sans, JetBrains Mono)
- `glossary.json` (18 terms), `hypotheses.json` (Table 1 + 6 pre-registered), `morphs.json` (Table 2), `prompts.json` (examples from Appendix A.2)
- `/playground` is just a placeholder

## What needs to happen this session

### Priority 1: Fix broken rendering (30 min)
These are bugs visible right now on the live site:

**(a) KaTeX for equations.** The `katex` package is in package.json but not used. Equations in `paper.json` have `latex` strings. Build a client component that renders them. The equations should display in a `paper-subtle` background block with the equation label (e.g. "Eq. 1") right-aligned. CSS for KaTeX needs importing (`katex/dist/katex.min.css`).

**(b) Markdown in margin notes.** Margin note `content` strings contain markdown bold (`**Table 1**`). Currently renders as literal asterisks. Either use a tiny markdown renderer or do a simple regex replacement for `**text**` → `<strong>text</strong>`. Keep it minimal — margin notes only use bold and links, not full markdown.

**(c) Delete stale `site/` directory.** Run `rm -rf site/` — it's leftover from a failed `create-next-app` with wrong versions.

### Priority 2: Shared infrastructure (Phase 2) (2-3 hours)
Per Parts 1.6 and 1.7 of the briefing:

**(d) Glossary component.** Build `components/shared/Glossary.tsx` — a popover that shows the plain-English definition + authoritative source when a reader hovers (desktop) or taps (mobile) a glossary term. In the AnnotatedReader, use `termAnchors` from `paper.json` to identify which words to underline with a dotted line. The popover should be dismissable and non-modal.

**(e) Source Materials appendix.** Build `components/shared/AppendixSection.tsx` — rendered at the bottom of BOTH `/annotated` and `/playground`. Nine sections per Part 1.7 of the briefing:
1. The paper (SSRN link + BibTeX)
2. Data (Upworthy Research Archive link)
3. Code & prompts (OSF link)
4. Pre-registration (AsPredicted #172038)
5. Survey materials (OSF .qsf files)
6. Full set of hypotheses (link + counts: 2,100 → 205 → 16 → 6)
7. Tables 1 & 2 (rendered from hypotheses.json and morphs.json)
8. References (all 45 references from the paper, with DOI/URL)
9. About this reader (one paragraph explaining the A/B build)

**(f) Source materials dropdown in top bar.** Replace the current single link with a dropdown containing: Paper (SSRN), Data (Upworthy archive), Code (OSF), Pre-registration. Keep it accessible (keyboard navigable, escape to close).

### Priority 3: Option A polish (Phase 3) (2-3 hours)
Per Part 2 of the briefing:

**(g) Desktop margin rail.** On screens ≥1024px, margin notes move from inline to a 280px right rail alongside their parent paragraph. Mobile stays inline. This is the biggest layout change and the core visual identity of Option A.

**(h) Section progress indicator.** A sticky breadcrumb below the top bar showing the current section name, and a thin progress bar. Use IntersectionObserver to track which section is in view.

**(i) At least 2 of the 4 interactives.** Start with:
- The filtering funnel (2,100 → 205 → 16 → 6) — it's the most visually impactful and data is already in hypotheses.json
- The Study 1 & 2 results card — six hypothesis cards as small multiples, data already in hypotheses.json

The shrinkage slider and R² chart can come in session 3.

### Priority 4: Option B scaffold (Phase 4 start) (1-2 hours)
Per Part 3 of the briefing:

**(j) Pipeline stage layout.** Replace the placeholder with the three-stage structure: Generate → Rank → Filter. On desktop, two-panel split (60% workspace / 40% text rail). Mobile: single column with "The paper says…" blocks between stages.

**(k) Stage 1 (Generate) — basic version.** Show 6 headline pairs from hypotheses.json. Clicking a pair reveals the hypothesis generated. Show the prompt structure from prompts.json with the three randomization axes as dropdowns. Text rail shows §2.3 paragraphs.

Stages 2 and 3 can come in session 3.

## Design constraints (from the briefing)
- **Typography:** Body text in Lora 18-19px, line-height 1.65, left-aligned (never full-justify). Display in DM Serif Display. Gloss/editorial in DM Sans.
- **Colors:** Warm off-white `#faf8f3` background. Semantic colors as LEFT-BORDER ACCENTS only — never as text highlights.
- **Reading column:** 680px max-width for long-form passages.
- **Performance:** <250kb gzip per tab. Each tab lazy-loads its interactives.
- **Mobile-first:** Design mobile layout first, then desktop enhancement.
- **No scroll-jacking, parallax, or animation-on-scroll** beyond simple fade-in.
- **No dark mode for v1.**
- **All interactive elements keyboard-accessible, WCAG 2.2 AA.**

## Architecture principle: reusable for other papers
The content lives in JSON files (`paper.json`, `glossary.json`, etc.). The components read from these files. Swapping in a different paper = replacing the content files + any paper-specific interactive components. The framework (AnnotatedReader, TextRail, Glossary, AppendixSection, etc.) must work for any paper.

## How we work
- **Ask before deviating** from the briefing. If something doesn't work in practice, raise it — don't silently change the spec.
- **Any change to `paper.json` gets a diff shown to me** before committing.
- **Counterfactual-check non-trivial choices.** Before implementing, briefly state what you're about to do, the alternative, and why you're choosing one over the other.
- **Don't add features not in the briefing.** Log ideas as "v2 candidate" in DEVLOG.md.
- **Show screenshots** after completing each priority block.
- **Deploy to Vercel** after each major block so we can see it live.
- **Update DEVLOG.md** with decisions made during this session.
- **Update COWORK-CONTEXT.md** at the end of the session with current state.

## Session 2 deliverables
By end of session, I want:
1. Equations rendering properly (KaTeX)
2. Margin notes rendering bold text
3. Glossary hover/tap working for at least a few terms
4. Source Materials appendix section at the bottom of both tabs
5. Desktop margin rail on Option A
6. At least the funnel interactive working
7. Option B with the basic Generate stage
8. Updated Vercel deployment
9. Screenshots of desktop + mobile for both tabs
10. Updated DEVLOG.md and COWORK-CONTEXT.md
