# Session 4 — Polish, Copy-Edit, and Ship-Readiness

**Date:** (next session)
**Starting state:** Sessions 1–3 complete. 18 files changed in Session 3 (1,600 insertions). Build passes locally. Commit done. Not yet pushed to GitHub / Vercel.
**Live URL (once pushed):** https://words-that-matter.vercel.app
**Authoritative spec:** `words-that-work-briefing.md` in project root (if anything conflicts, briefing wins)
**Context docs:** `COWORK-CONTEXT.md` (current state), `DEVLOG.md` (decisions + rationale)

---

## Goal

Bring the site to ship-readiness for reviewer sessions. No new features. No generalization/portability work (that's Session 5). This session is about: visual correctness, copy precision, accessibility completeness, feedback infrastructure, and deployment confidence.

---

## Priority 0 — Build & Deploy Gate

**Do this first. Everything else depends on a green build and a live deploy.**

1. `git push origin main` — trigger Vercel auto-deploy (repo is connected; see `reference_vercel_deploy.md` in memory)
2. Verify https://words-that-matter.vercel.app loads the latest commit
3. Run `npm run build` in the sandbox to confirm zero warnings/errors
4. Run `npx next lint` — fix any lint issues (zero-warning policy for v1)

If the build or deploy fails, that is the session priority. Fix it before moving on.

---

## Priority 1 — Visual Review & Interactive QA (both tabs)

Open the live site (or `npm run dev`) and walk through every screen. Fix what you find. Here's the checklist:

### Landing page (`/`)
- [ ] Two cards render side-by-side on desktop, stacked on mobile
- [ ] "Read the paper (SSRN)" link works
- [ ] "Words that Work" title uses DM Serif Display
- [ ] Hover states on both cards (border turns accent)
- [ ] Below-cards text ("You can switch between views...") is visible and ink-faint

### Top bar (both tabs)
- [ ] Sticky with backdrop blur on scroll
- [ ] "Words that Work" links back to `/`
- [ ] Tab switcher highlights the active tab (bg-paper-deep)
- [ ] "Give feedback" link visible on desktop, hidden on mobile
- [ ] Source Materials dropdown: opens, keyboard-navigable (↑↓, Escape, Enter), click-outside-to-close
- [ ] "View all source materials ↓" scrolls to `#sm-paper`

### Option A — Annotated Edition (`/annotated`)
- [ ] All sections render from Abstract through §6 Conclusion
- [ ] Semantic left-border accents: method (blue), finding (green), caveat (rust), novel (purple) — verify at least one of each appears
- [ ] Glossary terms have dotted underline; hover/tap shows popover with definition + authoritative source link; Escape dismisses
- [ ] Margin notes appear in 280px right rail on desktop (≥1024px), inline below paragraphs on mobile
- [ ] Section progress breadcrumb is sticky below top bar, shows current section + progress bar
- [ ] KaTeX equations render (check all 4 — Eq. 1 in §2.1, others in §2.2/2.3)
- [ ] **Shrinkage slider** (after Eq. 1 in §2.1): both sliders move smoothly, raw CTR / smoothed CTR / pull-toward-mean update in real time, "illustrative" label visible
- [ ] **R² chart** (after model comparison in §2.2): two bars render, click either bar to expand detail panel with verbatim quote + F-statistic (169.4) + caveat pill
- [ ] **Figure 1 SVG** (before §2.3): renders, alt text is descriptive, semantic colors match legend
- [ ] **Filtering funnel** (after §2.3): 2,100 → 205 → 16 → 6, stages expandable, quotes load
- [ ] **Hypothesis results cards** (after §2.4): 6 cards render, Study 1/2 p-values color-coded, multimedia + surprise/cliffhanger have caveat tags, expand-for-details works

### Option B — Pipeline Playground (`/playground`)
- [ ] Welcome panel renders with desktop/mobile text variant ("on the right" / "below each stage")
- [ ] Pipeline nav shows 3 stages, current highlighted, clicking any stage navigates
- [ ] Previous/Next buttons work and disable at boundaries
- [ ] **Stage 1 (Generate):** headline pair gallery, selecting a pair shows prompt assembly, 3 dropdown axes cycle through variants, "Generate hypothesis" reveals the hypothesis, text rail shows §2.3
- [ ] **Stage 2 (Rank):** hypothesis carried forward from Stage 1 (or shows "No hypothesis selected" if skipped), 4 morph cards with "Morph →" reveal buttons, ∆CTR bars animate in, summary score aggregates, set selector cycles morph examples
- [ ] **Stage 3 (Filter):** Euclidean distance slider (0.01–0.10) responds in real time, survival count updates, FDR toggle works (role="switch"), vertical funnel renders, 6 hypothesis cards with expand-for-details
- [ ] **Exit panel** on Stage 3: "Editorial gloss" label visible, 3 editorial sentences, §3 Limitations link works, Source Materials link works
- [ ] 60/40 split on desktop, single column on mobile
- [ ] Text rail sticky on desktop, inline on mobile

### Source Materials (bottom of both tabs)
- [ ] All 9 sections present and identical on both tabs
- [ ] BibTeX collapsible works
- [ ] Hypothesis funnel counts match (2,100 / 205 / 16 / 6)
- [ ] Tables 1 & 2 "Show all" expands correctly
- [ ] References list "Show all 45 references" expands; DOI links work for those that have them
- [ ] "Give feedback on this reader" link present in About section
- [ ] "View all source materials ↓" anchor from top bar dropdown scrolls here

**If any of the above is broken, fix it before moving on to Priority 2.**

---

## Priority 2 — Copy-Edit All Editorial Text

Every piece of text that is NOT a verbatim paper quote is editorial gloss. It must be:
- Accurate (no claims the paper doesn't make)
- Clear to a masters-educated generalist who is not from ML/marketing/behavioral science
- Grammatically clean
- Clearly demarcated from paper text (DM Sans, muted color, labeled container)

### Files to copy-edit:

1. **`app/page.tsx`** — Landing page pitch text ("This paper presents a way to turn thousands of A/B tests..."). Check accuracy: the paper uses LLMs + A/B test data, not just LLMs.

2. **`components/playground/PipelinePlayground.tsx`** — Welcome panel text ("This is the paper's method, made playable...").

3. **`components/playground/ExitPanel.tsx`** — "What you just did" editorial reflection. Verify the 3 sentences against the paper:
   - "Four produced significant effects in the first study" — check §2.4 results
   - "two of those also survived a novelty check" — check §2.4 final paragraph
   - "the pipeline generates testable hypotheses — but most of what it finds may overlap with what researchers already know" — check §5 Discussion

4. **`components/playground/StageGenerate.tsx`** — "Select a headline pair to see how the pipeline generates a hypothesis from it."

5. **`components/playground/StageRank.tsx`** — Any gloss text around morphing explanation. Check that "illustrative" labels appear on all ∆CTR values.

6. **`components/playground/StageFilter.tsx`** — Euclidean distance gloss, FDR toggle explanation, asterisk notes on interpolated values. Verify the one exact data point (0.03 → 205) is clearly distinguished from the illustrative interpolations.

7. **`components/annotated/ShrinkageSlider.tsx`** — Gloss text about shrinkage. Verify "grand mean CTR = 0.02" is labeled as illustrative.

8. **`components/annotated/RSquaredChart.tsx`** — Verbatim quote and F-statistic. Cross-check against paper §2.2.

9. **`components/annotated/FilteringFunnel.tsx`** — Stage descriptions and verbatim quotes at each funnel step.

10. **`components/annotated/HypothesisResults.tsx`** — Hypothesis text, p-values, caveat tags. Cross-check against Table 3 / §2.4 in paper.json.

11. **`components/shared/AppendixSection.tsx`** — All 9 section descriptions. Check:
    - BibTeX entry matches the actual NeurIPS 2024 proceedings format
    - "32,487 headline A/B tests" matches Matias et al. (2021)
    - Pre-registration description is accurate
    - About section's "Four replicated" / "two did not" phrasing (should this be more precise?)

### Copy-edit rules:
- **Never modify** anything inside `content/paper.json`. That file is verbatim paper text.
- If you find a factual error in editorial text, fix it and note the fix in the commit message.
- If you're unsure whether a claim is accurate, check `content/paper.json` sections and the PDF (`61_Words_that_work_Using_langu.pdf`).
- After all edits, grep for common copy errors: double spaces, smart quote inconsistency, orphaned HTML entities, "the the".

---

## Priority 3 — Create Tally Feedback Form

The briefing (§6) specifies 5 reviewer questions. Create a Tally form at tally.so with these questions:

1. **Comprehension** — "After using this tab, could you accurately describe the paper's main contribution to a colleague? What would you say?" (open text)
2. **Engagement** — "Which tab did you spend more time in? What made you stay?" (multiple choice: Annotated / Playground / About equal + open text)
3. **Trust** — "Did either tab ever feel like it was replacing the authors' words with its own interpretation? If so, where?" (open text)
4. **Appendix discovery** — "Did you engage with any of the following? Check all that apply." (checkboxes: Tables 1 & 2 / Prompt variations / OSF links / Pre-registration / Full reference list / None)
5. **Preference** — "Which format would you want for the next paper you read? Why?" (open text)

Add metadata field: "Which tab did you start with?" (Annotated / Playground)

Once created, update the placeholder URL in TWO files:
- `components/shared/TabSwitcher.tsx` — line 61 (`href="https://tally.so/r/words-that-work-feedback"`)
- `components/shared/AppendixSection.tsx` — line 132 (same placeholder URL)

If Tally requires account access you don't have, leave the placeholder but document the exact form spec in DEVLOG so I can create it manually.

---

## Priority 4 — Accessibility Completion

Session 3 got us to ~40% on Phase 5 accessibility. Finish the remaining items:

### Already done (do not redo):
- ✅ ink-faint darkened to #767676 (4.54:1 AA)
- ✅ Button text switched to dark for AA contrast (6.25:1)
- ✅ Global `:focus-visible` ring in accent color
- ✅ `prefers-reduced-motion` disables all transitions
- ✅ Slider aria attributes (aria-label, aria-valuenow, aria-valuemin, aria-valuemax)
- ✅ FDR toggle role="switch" with aria-checked

### Still needed:

1. **Semantic HTML audit** — briefing §4 says "Semantic HTML throughout — no div soup":
   - Verify `<blockquote>` + `<cite>` used for all verbatim quotes (check Quote.tsx — ✅ already done; check if it's used consistently wherever quotes appear)
   - Verify `<nav>` used for navigation (TabSwitcher, PipelineNav)
   - Verify `<main>`, `<article>`, `<section>`, `<aside>` used appropriately
   - Verify `<figure>` + `<figcaption>` on Figure 1 SVG (✅ already done)

2. **Alt text audit** — every `<img>` and `<svg>` needs descriptive alt text:
   - Figure 1 SVG (✅ already has long alt text — verify it's accurate)
   - Any icons/decorative SVGs should have `aria-hidden="true"`

3. **Keyboard navigation completeness**:
   - Tab through the entire Annotated Edition — every interactive should be reachable
   - Tab through the entire Playground — stage navigation, sliders, toggles, morph buttons, hypothesis cards
   - Verify Escape dismisses glossary popovers
   - Verify the Source Materials dropdown is fully keyboard-navigable

4. **Touch target audit** — briefing §P5 says ≥44px touch targets:
   - Check all buttons in the Playground (morph reveal, generate hypothesis, stage nav)
   - Check the Pipeline nav stage buttons
   - Check slider thumb sizes (should be at least 44px hit area even if visually smaller)
   - Check the glossary term tap targets on mobile

5. **Color contrast spot-check** — verify these specific combinations:
   - Caveat pill text (`text-caveat` on `bg-caveat/10`) — is rust-on-light-rust ≥ 4.5:1?
   - Finding pill text (`text-finding` on `bg-finding/10`) — is green-on-light-green ≥ 4.5:1?
   - Novel pill text (`text-novel` on `bg-novel/10`)
   - Accent-deep text on paper background (used in links)
   - The "illustrative" labels in ShrinkageSlider and StageFilter

6. **Screen reader landmarks** — add `aria-label` to key regions:
   - Main reading area
   - Source Materials footer
   - Pipeline workspace vs text rail

---

## Priority 5 — Unused Components Integration Check

Three shared components were built but noted as "not yet integrated" in COWORK-CONTEXT:

1. **`components/shared/Gloss.tsx`** — a plain-English gloss container. Check if any editorial text in the Annotated Edition or Playground would benefit from using this component instead of inline styling. If so, refactor. If not (because the current styling is equivalent), note it in DEVLOG as available for future use.

2. **`components/shared/Pill.tsx`** — category pills (method/finding/caveat/novel). These could enhance the Annotated Edition by adding small pills next to section headers or paragraphs that have a `category` in paper.json. Check if this improves the reading experience without adding clutter. If it does, integrate. If not, defer to v2 and note in DEVLOG.

3. **`components/shared/Quote.tsx`** — already used in AppendixSection. Check if FilteringFunnel or HypothesisResults have inline quote styling that should use this component instead.

---

## Priority 6 — Glossary Accuracy Audit

Cross-check the 18 terms in `content/glossary.json` against the updated `content/references.json`:

- Every `authoritativeSource.url` in glossary.json should be a working link
- Every `authoritativeSource.citation` should match the reference format in references.json (where applicable)
- Verify `firstUseIn` section IDs are correct (the term's first appearance in paper.json)
- Spot-check 3-4 `plainEnglish` definitions against the actual papers/sources they cite — are they accurate?

---

## Priority 7 — OG Image & Meta Tags

The briefing mentions `public/og-image.png` in the repo structure. Check if it exists. If not:

1. Create a simple OG image (1200×630px) with:
   - "Words that Work" in DM Serif Display
   - "Interactive Paper Reader" subtitle
   - "Batista & Ross · NeurIPS 2024"
   - Warm paper background (#faf8f3)
2. Add proper `<meta>` OG tags in `app/layout.tsx` (some already exist — verify `og:image` points to the file)
3. Add Twitter card meta tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)

---

## Priority 8 — Documentation Update

After all changes:

1. **Update `DEVLOG.md`** — add Session 4 section with all decisions and fixes
2. **Update `COWORK-CONTEXT.md`** — reflect new completion percentages (Phase 5 should be close to 100% after this session)
3. **Commit with descriptive message**: `git add -A && git commit -m "Session 4: polish, copy-edit, accessibility, feedback form, OG image"`
4. **Push to deploy**: `git push origin main`
5. **Verify live site** at https://words-that-matter.vercel.app after Vercel builds

---

## Architecture Reminders (same as Session 3)

- **Content files are read-only** this session. Do NOT modify paper.json, hypotheses.json, morphs.json, prompts.json, or references.json unless you find a factual error — and if you do, show the diff first.
- **Theme tokens** live in `lib/theme.ts` and are mirrored in `tailwind.config.ts`. Change both if you change either.
- **Lazy loading** — all 4 annotated-edition interactives use `React.lazy()`. Don't break that.
- **Mobile-first** — any CSS changes should start with the mobile case, then add desktop overrides at `md:` or `lg:`.
- **The briefing is authoritative** — `words-that-work-briefing.md`. If you're unsure about a design decision, check there first.

---

## Working Agreements (same as always)

- Ask before deviating from the briefing
- Commit often with descriptive messages
- Any paper.json change gets a diff review
- Counterfactual-check non-trivial decisions
- Don't add features not in the briefing (log as v2 in DEVLOG)
- Build mobile-first, desktop-enhanced

---

## Out of Scope This Session

- Portability / plug-and-play generalization (Session 5)
- Dark mode (v2)
- Performance / Lighthouse audit (not yet — get the UI right first)
- New interactives or features
- Any changes to paper.json content
