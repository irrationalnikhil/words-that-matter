# Cowork prompt — Words That Work interactive paper

Paste this into a new cowork session after creating a fresh project folder. The folder should contain:
- `words-that-work-briefing.md` (the comprehensive spec — read this first, thoroughly)
- `61_Words_that_work_Using_langu.pdf` (the source paper PDF)

---

## Prompt

We're building an interactive Next.js site that renders the NeurIPS 2024 paper "Words that Work: Using Language to Generate Hypotheses" by Batista & Ross as two parallel reading experiences on separate tabs — so reviewers can compare them and tell us which pattern works better.

**Before you write any code**, read `words-that-work-briefing.md` in full. Then read the source PDF at `61_Words_that_work_Using_langu.pdf`. The briefing is the authoritative spec. If anything in this prompt conflicts with the briefing, the briefing wins.

### The hard constraint, restated

The authors' words are the substrate of both tabs. Every claim, method, and finding the reader sees is a verbatim quote from the paper — with page and section reference. We are *not* paraphrasing or summarizing. Plain-English gloss is permitted *beside* the authors' quotes (clearly demarcated — different typeface, indented, muted color), never in place of them. If you ever find yourself writing prose that describes what the paper says, stop — quote the paper instead.

### What we're building

- **Landing page (`/`)** — minimal, two cards pointing to the two tabs, persistent top bar with tab switcher
- **Tab A — "The Annotated Edition" (`/annotated`)** — the paper rendered as a warm editorial reading experience (think LURU newsletter typography), with a live glossary, margin rail that promotes appendix material inline, and four small interactive moments (shrinkage formula, R² comparison, hypothesis filtering funnel, Study 1&2 results card)
- **Tab B — "The Pipeline Playground" (`/playground`)** — the paper's three-stage pipeline made playable. Reader runs Generate → Rank → Filter on real headlines from the paper's own data, while the paper's verbatim text follows along in a sticky rail on the right
- **Shared appendix section ("Source materials")** at the bottom of both tabs — OSF links, full Tables 1 & 2, pre-registration, prompts, references

### Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- Self-hosted fonts via `next/font`: DM Serif Display (display), Lora (body reading), DM Sans (UI), JetBrains Mono (code)
- Warm off-white reading surface (`#faf8f3`), serif body text, semantic color (method / finding / caveat / novel) applied as left-border accents only — never as text highlights
- KaTeX for equations
- No runtime LLM calls. Everything cached from the paper + OSF.
- Mobile-first, desktop-enhanced. WCAG 2.2 AA. Bundle <250kb gzip per tab.

### Repo layout

Follow the structure in Part 1.2 of the briefing exactly. The content files — `paper.json`, `glossary.json`, `hypotheses.json`, `morphs.json`, `prompts.json` — are the single source of truth; both tabs render from them.

### Build order (follow this, don't skip ahead)

1. **Setup (Phase 0)** — `create-next-app`, fonts, tokens, deploy a skeleton to Vercel first so we have the deployment path validated before we build anything real
2. **Content extraction (Phase 1)** — the biggest risk to the whole project is getting the paper's text into `paper.json` accurately. Parse the PDF, structure it per the `Section → Paragraph → Equation` schema in Part 1.4 of the briefing. Preserve the text verbatim — no silent fixes, no formatting normalization. Build `glossary.json` with the 18 seed terms. Populate `hypotheses.json` and `morphs.json` from Tables 1 & 2 of the paper plus whatever's accessible from OSF. Redraw Figure 1 as a warm-palette SVG.
3. **Shared infrastructure (Phase 2)** — landing page, tab switcher, top bar with OSF dropdown, `Quote` / `Gloss` / `Glossary` components, Source Materials section
4. **Option A (Phase 3)** — AnnotatedReader + margin rail + four interactives. Mobile responsive pass as you go, not at the end.
5. **Option B (Phase 4)** — Pipeline workspace + sticky text rail + three stages. Mobile responsive pass as you go.
6. **Polish (Phase 5)** — a11y audit (axe + keyboard + screen reader), Lighthouse, cross-browser, copy-edit

Estimate ~8-10 working days. Maintain a `DEVLOG.md` in the project root — log decisions, open questions, and anything that deviated from the briefing so we have a breadcrumb trail for reviewer feedback sessions. Maintain a `COWORK-CONTEXT.md` with running state for future sessions.

### How we'll work together

- **Ask before deviating.** If something in the briefing doesn't quite work in practice (a layout issue, a performance trade-off, a content-parsing edge case), raise it. Don't silently change the spec.
- **Commit often.** Every stage in the build order is a commit. Use descriptive messages. Push to a branch, not main, until we've reviewed.
- **Test on real devices.** Chrome DevTools mobile emulation is not enough. Test on an actual phone (my iPhone, any Android) before declaring a phase done.
- **Show me screenshots.** After each phase, show me screenshots of desktop + mobile before moving on. I want to course-correct early.
- **Protect the content layer.** Any change to `paper.json` gets a diff shown to me before commit. This is the single source of truth for the authors' words and must not drift.
- **Counterfactual-check your choices.** Before implementing anything non-trivial, briefly state what you're about to do and what the alternative would have been and why you're choosing one over the other. Especially for the interactives — there's usually a simpler version that would work.
- **Don't add features not in the briefing.** v1 scope is tight (see Part 8 of the briefing). If an idea occurs to you that isn't in the briefing, log it in `DEVLOG.md` as "v2 candidate" and move on.

### First session deliverables

In this first cowork session, I want you to:
1. Read the briefing and the PDF fully
2. Set up the Next.js project (Phase 0)
3. Begin content extraction — at minimum, get the Abstract, §1, and §2.1 into `paper.json` and render them on a placeholder `/annotated` route so we can see the typography working end-to-end
4. Deploy to Vercel
5. Report back with: Vercel URL, screenshots of the rendered early content on mobile and desktop, and a list of any decisions or open questions for me

Don't try to do the whole build in one session. The goal of session 1 is to de-risk the hardest thing (getting the paper's text rendered beautifully and accurately) before we invest in the interactives.

Ready when you are.
