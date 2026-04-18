# Words That Work — Interactive Paper Build Briefing

**Source paper:** Batista & Ross, *"Words that Work: Using Language to Generate Hypotheses,"* NeurIPS 2024. ([OpenReview PDF](https://openreview.net/pdf?id=pvnXlajGBZ))
**Project goal:** Build an A/B comparison of two interactive reading experiences for this paper, deployed as a single Next.js site with two tabs. Solicit reviewer feedback to determine the winning pattern for future papers.
**Audience:** Masters-educated generalists. Not necessarily from ML, marketing, or behavioral science. Should leave with a working mental model of the paper's contribution, be able to quote the authors accurately and think about how the paper's contribution could apply to their work.

---

## Part 0 — Non-negotiable principles

These apply to both tabs and should not be violated anywhere in the build.

### P1. The authors' words are the substrate

Every claim, finding, method, and caveat the reader encounters must be the authors' verbatim text, quoted exactly, with page and section reference. Plain-English gloss is permitted *beside* the quote — never *in place of* it. This is the inversion of the standard "AI paper explainer" pattern. Visually, author text uses the serif (DM Serif Display for display, Lora or Source Serif for body); any editorial/gloss text uses sans (DM Sans or Inter) and sits in a clearly demarcated container (indented, different background tint, muted color).

### P2. Appendix material is promoted, not hidden

Tables 1 and 2, the prompt variations, the OSF links, the Prolific survey materials, the pre-registration — these are the richest parts of the paper and they're buried. Both tabs must surface them prominently. Tab A does this through inline margin promotion at the moment of first reference. Tab B does this by making appendix material the substrate of the interactive playground. Both tabs share the same appendix section at the end ("Source Materials").

### P3. Warm, editorial, readable

Not a black-on-white academic PDF. Warm off-white background (`#faf8f3`, not `#ffffff`). Serif for reading (680px max column width for long-form passages — reuse the LURU newsletter lineage). Semantic color applied sparingly: one tint for method/process, one for empirical findings, one for caveats/limitations. Color never highlights the text itself (fights reading); it appears as left-border accents, margin marks, or small category pills.

### P4. Performance budget

- First contentful paint < 1.2s on 4G
- Total JS payload < 250kb gzipped for the initial tab
- Each tab lazy-loads its own interactive components
- No LLM calls at runtime — all example outputs are cached from the paper's own published data
- Images (Figure 1, any diagrams) are SVG-first, WebP fallback only if needed

### P5. Mobile-first, desktop-enhanced

Design the mobile layout first (narrow column, inline gloss, collapsible margin notes become inline drawers). Desktop adds the margin rail (Option A) and the side-by-side pipeline-plus-text layout (Option B). No horizontal scrolling on mobile. Touch targets ≥ 44px. Interactive elements (sliders, toggles) must work with thumb on mobile.

### P6. Lift-and-shift portable

The whole thing is a Next.js 14+ app (App Router), deployable to Vercel in one click. Paper content lives in a single structured JSON/MDX file. Swapping in a different paper = replacing the content file + the pipeline-specific Option B visualization. The framework must be and is reusable.

### P7. Counterfactual checks built in

Both options include deliberate surfacing of the paper's own caveats (Section 3 of the paper is rich here) and explicitly flag where the authors' claims did *not* replicate (e.g., multimedia evidence had opposite-direction effects across studies; surprise/cliffhanger was null in Study 2). Don't smooth over the messiness.

### P8. References and cited papers matter greatly

Research contributions are measured in the context of the papers they cite and extend. Academics read papers but pay close attention to the references too. Traditional papers do this poorly with various citation formats, and a reference chunk at the end. Make sure the papers cited by the researchers get their due place in both reading experiences, and give the reader this valuable context.

---

## Part 1 — Shared infrastructure (both tabs)

### 1.1 Tech stack

- **Framework:** Next.js 14+ (App Router), TypeScript
- **Styling:** Tailwind CSS with a custom token layer (see 1.3)
- **Typography:** `next/font` with self-hosted Google Fonts (DM Serif Display, DM Sans, Lora)
- **Interactivity:** React 18 client components for interactive bits; everything else is Server Components
- **State:** URL-driven where possible (`?tab=annotated` vs `?tab=playground`), `useState` for local interaction state, no global store needed
- **Deployment:** Vercel
- **Analytics:** Plausible or Vercel Analytics (privacy-friendly, no cookies)
- **No CMS.** Content is a local JSON + MDX file.

### 1.2 Repository structure

```
words-that-work/
├── app/
│   ├── layout.tsx              # Root layout, fonts, theme
│   ├── page.tsx                # Landing + tab switcher
│   ├── annotated/
│   │   └── page.tsx            # Option A
│   ├── playground/
│   │   └── page.tsx            # Option B
│   └── api/                    # (empty — no runtime LLM calls)
├── components/
│   ├── shared/
│   │   ├── TabSwitcher.tsx
│   │   ├── SourceMasthead.tsx  # Persistent top strip with paper metadata + OSF links
│   │   ├── AppendixSection.tsx # Shared appendix renderer
│   │   ├── Quote.tsx           # Verbatim quote block with citation
│   │   ├── Gloss.tsx           # Plain-English gloss container
│   │   ├── Glossary.tsx        # Hover/tap definitions
│   │   └── Pill.tsx            # Category pills (method/finding/caveat)
│   ├── annotated/
│   │   ├── AnnotatedReader.tsx
│   │   ├── MarginNote.tsx
│   │   ├── ShrinkageInteractive.tsx
│   │   └── ShowMePanel.tsx
│   └── playground/
│       ├── PipelineStage.tsx
│       ├── StageGenerate.tsx
│       ├── StageRank.tsx
│       ├── StageFilter.tsx
│       ├── HypothesisCard.tsx
│       └── TextRail.tsx        # Sticky right-hand rail with verbatim paper text
├── content/
│   ├── paper.json              # Structured paper content (see 1.4)
│   ├── glossary.json           # Term → definition mapping
│   ├── hypotheses.json         # All 2,100 → 205 → 16 → 6 hypotheses with metadata
│   ├── morphs.json             # Headline → morph pairs from Table 2 + OSF
│   └── prompts.json            # Prompt variations from Appendix A.2
├── lib/
│   ├── types.ts
│   └── theme.ts                # Design tokens
├── public/
│   ├── fonts/
│   ├── figure-1.svg            # Redrawn Figure 1, warm palette
│   └── og-image.png
├── tailwind.config.ts
├── next.config.js
├── package.json
└── README.md
```

### 1.3 Design tokens

Colors (these are starting values — tune in-browser):

```ts
// lib/theme.ts
export const colors = {
  // Backgrounds
  paper:        '#faf8f3',  // warm off-white, main reading surface
  paperSubtle:  '#f3efe5',  // gloss/margin container
  paperDeep:    '#ede6d3',  // pull-quotes, accent panels
  ink:          '#1a1a1a',  // primary text
  inkMuted:     '#5a5a5a',  // secondary text, citations
  inkFaint:     '#8a8a8a',  // metadata, page numbers

  // Semantic (left-border accents, small pills — never text highlights)
  method:       '#4a6fa5',  // process, pipeline, how-it-works (cool blue)
  finding:      '#6b8e4e',  // empirical claims, results (warm green)
  caveat:       '#b85c38',  // limitations, null results, caveats (warm rust)
  novel:        '#8b6bb1',  // the paper's novel contribution (muted purple)

  // Interactive
  accent:       '#c4924a',  // sliders, buttons, interactive affordances (amber)
  accentDeep:   '#a67938',
}

export const fonts = {
  display: 'DM Serif Display',  // headers, pull quotes
  serif:   'Lora',              // body reading
  sans:    'DM Sans',           // UI chrome, gloss, captions
  mono:    'JetBrains Mono',    // code, prompts, formulas
}

export const spacing = {
  readingColumn: '680px',
  readingColumnNarrow: '560px',
  marginRail: '280px',
}
```

Typography scale (mobile → desktop):
- Display: 32px → 56px, DM Serif Display, line-height 1.1
- H2: 24px → 32px, DM Serif Display, line-height 1.2
- H3: 18px → 22px, DM Sans semibold
- Body: 18px → 19px, Lora, line-height 1.65 (generous; research-backed for reading)
- Gloss/caption: 15px → 16px, DM Sans, line-height 1.5, muted color
- Mono/code: 14px → 15px, JetBrains Mono

### 1.4 Paper content schema

All of the paper's text lives in `content/paper.json` so both tabs render from the same source.

```ts
type Section = {
  id: string              // e.g. "2.1", "3", "abstract"
  title: string
  pageStart: number
  pageEnd: number
  paragraphs: Paragraph[]
}

type Paragraph = {
  id: string              // stable anchor, e.g. "p-2.1-intro"
  text: string            // VERBATIM from the paper
  category?: 'method' | 'finding' | 'caveat' | 'novel' | null
  glossKey?: string       // optional key into glossary.json for a paragraph-level plain-English gloss
  termAnchors?: {         // inline terms that get hover-definitions (Option A)
    term: string
    offset: number        // char offset in text
    length: number
    definitionKey: string // key into glossary.json
  }[]
  marginNotes?: {         // margin promotions (Option A)
    kind: 'cross-ref' | 'appendix-promo' | 'caveat' | 'interactive'
    content: string       // markdown
    payload?: any         // e.g. appendix table rows to promote inline
  }[]
  equations?: Equation[]  // flagged so they can be rendered with KaTeX + interactive if applicable
}

type Equation = {
  id: string
  latex: string
  label?: string          // "Eq. 1"
  interactive?: 'shrinkage' | 'ctr-delta' | null
}

type Quote = {
  text: string            // verbatim
  section: string
  page: number
}
```

**Content extraction:** One of the first build tasks is to parse the uploaded PDF into `paper.json`. This is a one-time operation. Quote exactly — no silent edits, no "tidying up" the LaTeX formatting artifacts, no em-dash normalization. If the paper has a typo, preserve it (flag with a `[sic]` margin note if needed).

### 1.5 Glossary terms (seed list)

These 18 terms should have hover/tap definitions. Each definition is 2-3 sentences in plain English, plus a link to the authoritative source (original paper, Wikipedia, or textbook chapter — not a Claude summary).

1. **A/B test** — randomized comparison of two variants
2. **Click-through rate (CTR)** — clicks ÷ impressions
3. **Siamese network** — twin neural networks with shared weights, compared at the output ([Bromley et al., 1993](https://proceedings.neurips.cc/paper/1993/hash/288cc0ff022877bd3df94bc9360b9c5d-Abstract.html))
4. **MPNet** — masked + permuted pre-training, a transformer variant ([Song et al., 2020](https://arxiv.org/abs/2004.09297))
5. **Sentence embedding** — a fixed-length vector representing a sentence's meaning
6. **Shrinkage / smoothed CTR** — pulling noisy estimates toward the grand mean when sample sizes are small
7. **OLS regression** — ordinary least squares, the standard linear regression
8. **R²** — proportion of variance explained (0 to 1)
9. **F-statistic** — ratio of explained to unexplained variance for comparing models
10. **Benjamini-Hochberg / FDR** — method to correct for multiple hypothesis testing ([Benjamini & Hochberg, 1995](https://www.jstor.org/stable/2346101))
11. **Euclidean distance** — straight-line distance between two vectors
12. **Pre-registration** — committing to analyses before seeing the data
13. **HARKing** — Hypothesizing After Results are Known ([Kerr, 1998](https://journals.sagepub.com/doi/10.1207/s15327957pspr0203_4))
14. **p-hacking** — trying many analyses until one is significant
15. **LIWC** — Linguistic Inquiry and Word Count, a text-analysis dictionary
16. **Hypothesis morphing (this paper's term)** — rewriting a headline to incorporate a hypothesized feature
17. **Upworthy Research Archive** — the public dataset of 32k A/B tests ([Matias et al., 2021](https://www.nature.com/articles/s41597-021-00934-7))
18. **GPT-4** — large language model used by the authors (OpenAI, 2023)

Each term appears in `glossary.json` as:
```json
{
  "siamese-network": {
    "term": "Siamese network",
    "plainEnglish": "Two copies of the same neural network that share weights. You feed one input to each copy, then compare the two outputs. Useful when you care about the *relationship* between two things rather than classifying one thing.",
    "firstUseIn": "2.2",
    "authoritativeSource": {
      "citation": "Bromley et al., 1993",
      "url": "https://proceedings.neurips.cc/paper/1993/..."
    }
  }
}
```

### 1.6 Shared landing + tab switcher

Entry to the site is `/` — a minimal landing page:

- Paper title (DM Serif Display, 56px desktop / 32px mobile), author names, NeurIPS 2024, direct link to OpenReview PDF
- Two-sentence pitch (editorial, not a summary of findings): "This paper presents a way to turn thousands of A/B tests into testable hypotheses using LLMs. We've built two different readers for it — pick one, or compare both."
- Two large cards, side-by-side on desktop / stacked on mobile:
  - **"The Annotated Edition"** — one-sentence description: "The full paper, with live glossary and appendix material surfaced in the margins." Est. read time: 25 min.
  - **"The Pipeline Playground"** — "Run the paper's method yourself on real headlines. The paper's text follows along." Est. read time: 35 min.
- Below the cards: "You can switch between views at any time using the tab bar at the top."
- Persistent top bar (on both `/annotated` and `/playground`) has: paper title (compact), tab switcher, "Source materials" dropdown (OSF, OpenReview, pre-registration, datasets).

### 1.7 Shared appendix section (bottom of both tabs)

Title: **"Source materials"** (not "Appendix" — that word implies "ignorable").

Sections:
1. **The paper** — link to OpenReview PDF, BibTeX, DOI
2. **Data** — Upworthy Research Archive ([Matias et al., 2021](https://www.nature.com/articles/s41597-021-00934-7)), description of the Study 2 dataset (the authors note it's not public)
3. **Code & prompts** — OSF repository link, description of the `prompts.yaml` file, the three prompt-generation randomization axes (preamble × structure × variation)
4. **Pre-registration** — [AsPredicted #172038](https://aspredicted.org/S6H_ZPF)
5. **Survey materials** — link to OSF `.qsf` files
6. **The full set of hypotheses** — link to the OSF with a note that 2,100 were generated, 205 survived filtering, 16 had significant predicted effects, 6 were tested
7. **Tables 1 & 2 (full)** — renderable tables with all the examples the authors published, plus the "view more" OSF links
8. **References** — all 45 references from the paper as a scrollable list, each with DOI/URL where available
9. **About this reader** — one paragraph explaining the A/B build, linking to feedback form

This section is rendered from shared components so both tabs are guaranteed identical here.

---

## Part 2 — Option A: The Annotated Edition

**Route:** `/annotated`
**Philosophy:** The paper, rendered as a warm editorial reading experience, with a live gloss layer that never displaces the authors' words.
**Closest references:** ScholarPhi ([Head et al., CHI 2021](https://arxiv.org/abs/2009.14237)); Genius.com annotations; the Distill.pub reading experience; your own LURU newsletter reading layout.

### 2.1 Layout

**Desktop (≥1024px):**
- Three-zone layout: left spine (30px, navigation dots for sections), center reading column (680px), right margin rail (280px)
- Sticky top: section breadcrumb ("2.3 Hypothesis Generation") + progress bar
- Margin rail holds: cross-references, appendix promotions, caveat call-outs, "Show me" buttons
- Reading column is pure verbatim paper text in Lora 19px/1.65, with semantic left-border accents

**Tablet (768-1023px):**
- Reading column widens slightly (620px)
- Margin rail collapses into inline drawers that expand in place (no horizontal scroll)

**Mobile (<768px):**
- Single column, 100% width with 20px padding
- All margin notes become inline collapsible "Notes" pills below the paragraph
- Top bar simplifies to paper title + tab menu icon

### 2.2 The reading column

Paragraphs render from `paper.json`. For each paragraph:

1. Text is Lora 19px, line-height 1.65, justified-left (never full-justify — it hurts readability).
2. If the paragraph has a `category`, a 3px left border in the semantic color extends the full height of the paragraph. No text highlighting.
3. If the paragraph has `termAnchors`, those terms get a subtle dotted underline in the same color as the semantic border (or `inkMuted` if no category). On hover (desktop) or tap (mobile), a popover appears with the plain-English definition and the link to the authoritative source. The popover is dismissable and non-modal.
4. Equations render with KaTeX. If `equation.interactive === 'shrinkage'`, the equation is followed by a small interactive panel (see 2.4).
5. Section headers use DM Serif Display, with the section number in `inkFaint` to the left.

### 2.3 The margin rail (desktop) / inline drawers (mobile)

Each margin note is a small card (`paperSubtle` background, 4px left-border in the appropriate semantic color, 14px DM Sans). Four types:

- **Cross-references:** "This is the ∆CTR from Eq. 2, applied here." Links scroll-to the original mention.
- **Appendix promotions:** At the moment the main text says "A sample of hypotheses is shown in Table 1," the margin note shows 3 *actual* hypotheses from Table 1 as a mini-scrollable gallery, with a "See all 20+" link to the appendix section. Same for Table 2 (morphs), and for the prompt variations (A.2.1).
- **Caveats:** Surfacing relevant points from Section 3 at the exact paragraph they apply to. E.g., when the main text first describes the multimedia hypothesis, a margin caveat flags: *"The authors found the multimedia effect in the opposite direction in Study 2 — see §3."*
- **Interactive triggers:** "Show me the Siamese architecture" / "Play with the shrinkage formula" — expand in-place.

### 2.4 Interactive moments (minimum viable set)

Keep this tight. Four interactives total:

**(a) The shrinkage formula (Eq. 1)**
Two sliders: *Clicks* (0–500, log scale), *Impressions* (10–10,000, log scale). A live-updating panel shows:
- The raw CTR (clicks/impressions)
- The smoothed CTR (the formula)
- The grand-mean CTR (fixed value from the paper, shown as a horizontal reference line)
- A visual bar showing how much the smoothed value is "pulled" toward the mean
Text beside it (DM Sans, `inkMuted`): "At low impressions, the smoothed CTR stays close to the grand mean. As impressions grow, it converges to the raw CTR. This is what the authors call shrinkage."

**(b) The R² jump (BU model vs. ML model)**
A two-bar chart: 0.04 vs 0.13. Hover/tap each bar to see:
- What R² means ("0.04 = the BU model explains 4% of the variation in ∆CTR")
- Verbatim quote from the paper justifying the jump
- The F-statistic (169.4) and its p-value
Small caveat pill: "R² of 0.13 is still not high — most variation in ∆CTR is unexplained. The point is relative improvement, not absolute predictive power."

**(c) The filtering funnel (2,100 → 205 → 16 → 6)**
A vertical funnel visualization showing the drops at each stage:
- 2,100 hypotheses generated
- 205 after de-duplication (Euclidean distance > 0.03)
- 16 with significant predicted positive effects (after FDR correction)
- 6 pre-registered for testing (4 positive + 2 negative)
Each stage expandable to show: what happened, verbatim quote, link to the relevant paragraph.

**(d) The Study 1 & 2 results card**
Six hypothesis cards laid out as small multiples. Each card shows:
- The verbatim hypothesis text (serif, quoted)
- Study 1 p-value (color-coded: finding / null / caveat)
- Study 2 p-value
- A one-line plain-English gloss (sans, `inkMuted`)
- Expand for: the actual morphed headlines from Table 2 that illustrate the hypothesis
The multimedia and surprise/cliffhanger cards get a prominent caveat tag ("opposite direction in Study 2" / "null in Study 2").

### 2.5 Reading order

Exactly the paper's order:
1. Abstract (with a small "What is this paper?" gloss panel directly below, clearly demarcated)
2. §1 Introduction
3. §2.1 Data preparation (+ shrinkage interactive)
4. §2.2 Modeling (+ R² jump interactive)
5. §2.3 Hypothesis Generation (Figure 1 redrawn, warm palette, annotated with same semantic colors)
6. §2.4 Hypothesis Testing (+ Study 1 & 2 results card)
7. §3 Limitations (entire section left-bordered in caveat color; this is the most-promoted section)
8. §4 Impacts
9. §5 Discussion
10. §6 Conclusion
11. Source materials (shared)

### 2.6 What NOT to do in Option A

- No scroll-jacking, parallax, or animation-on-scroll beyond a simple fade-in.
- No AI summary at the top. The paper's abstract is the summary.
- No sidebar with "key points" bullet list that paraphrases the paper.
- No dark mode for v1 (keep scope tight; add later if reviewers ask).
- No comment/annotation features for v1.

---

## Part 3 — Option B: The Pipeline Playground

**Route:** `/playground`
**Philosophy:** The paper's central artifact is its three-stage pipeline (Figure 1). Make the pipeline the interactive substrate of the entire experience. The reader *runs* the pipeline, stage by stage, while the paper's verbatim text follows along in a sticky rail.
**Closest references:** Bret Victor's *Explorable Explanations* and *Ladder of Abstraction*; Distill.pub's *Feature Visualization* (Olah et al.); Amelia Wattenberger's *Why React Query*.

### 3.1 Layout

**Desktop (≥1024px):**
- Two-panel split: left = pipeline workspace (60% width, interactive), right = sticky text rail (40% width, ~480px, always shows the paper's verbatim text corresponding to the current stage)
- Top bar same as Option A
- Progress indicator at the top of the workspace: three pipeline stages (Generate → Rank → Filter), current stage highlighted
- Scroll-driven: each stage is a full-viewport-height section; scrolling advances stages

**Tablet (768-1023px):**
- Single column. The text rail becomes a collapsible bottom sheet that can be pulled up to full-screen or peeked at the bottom (30% of viewport)
- Pipeline workspace takes the rest

**Mobile (<768px):**
- Single column. Text rail becomes an inline "The paper says…" block between each interactive stage (not a sticky rail — too cramped)
- Pipeline stages become vertical, one per screen, with clear visual separators
- All interactive controls (pickers, sliders) are thumb-sized (≥44px)

### 3.2 The sticky text rail

On desktop, the rail is always visible and always contains the paper's verbatim text relevant to the currently-visible pipeline stage. Structure:

- Rail header: "From the paper" (DM Sans, `inkMuted`, 13px)
- Section reference: "§2.3, ¶2, p.3" (DM Sans, `inkFaint`, 12px)
- Body: the verbatim paragraph(s), Lora 17px (slightly smaller than Option A to fit the rail)
- If the paragraph has relevant margin notes, they appear below the quote in `paperSubtle` containers.
- When the user interacts with a specific sub-element (e.g. clicking on one of the prompt variations), the rail scrolls to the exact sentence that describes that mechanism.

### 3.3 The three stages

#### Stage 1 — Generate

**What the reader sees:** A curated gallery of 8-10 Upworthy headline pairs, pulled from Table 1 and OSF. Each pair is shown as a two-card comparison with the CTR difference (color-coded for direction).

**What the reader does:**
1. Picks a pair (click/tap)
2. Sees the actual GPT-4 prompt assemble itself in a formatted code-like view. The three randomization axes (preamble, hypothesis structure, variation) are shown as dropdowns that the reader can toggle to see different prompt variants — these are the *actual* variations from Appendix A.2.1.
3. Clicks "Generate hypothesis"
4. A hypothesis appears below the prompt — this is the *actual* hypothesis the authors published for that pair in Table 1. Labelled clearly: "This is the hypothesis generated by the authors' pipeline for these inputs."

**Text rail shows:** §2.3 paragraphs describing the hypothesis-generation step. The equation `"Hypothesis: ______ [increases/decreases] engagement with a message"` is pulled out as a formatted quote.

**Why it works:** The reader sees the actual prompt — not a caricature. They understand why the randomization matters (different prompts produce different-sounding hypotheses). They see 2,100 is not just a number: it's what you get when you run this loop thousands of times.

**Caveat surfaced here:** The authors' note on prompt choice shaping outputs — "we may have shifted the distribution of hypotheses to be more substantive than theoretical" (§3). Pinned as a caveat card.

#### Stage 2 — Rank (Morph & Score)

**What the reader sees:** Their chosen hypothesis from Stage 1 (carried forward). Plus 3-4 new headlines from the corpus (different from the pair in Stage 1).

**What the reader does:**
1. Clicks "Morph" on each headline. The morph appears beside the original (actual morph from Table 2 / OSF).
2. For each morph, a predicted ∆CTR bar animates in (value from the authors' published data where available; otherwise clearly labelled as "illustrative — the authors' model produced predictions in this range").
3. The individual predictions aggregate into a "hypothesis-level score" shown as a summary bar at the bottom.
4. Reader can click "Try a different hypothesis" to swap in another of the 205 surviving hypotheses and see its morphs + score.

**Text rail shows:** §2.3 paragraphs on morphing and ranking. The key sentence — "by applying the hypotheses to many different headlines and predicting their effect, we get a sense of how generalizable it is" — is pulled as a featured quote.

**Why it works:** This is the paper's genuinely novel move (the "sense of generalizability" claim) and it's hard to grasp from text alone. Seeing three morphs of three different headlines all incorporating the same hypothesis makes the idea land.

**Caveat surfaced here:** A margin note flags: "The ML model's predictions are not ground truth — they're signals. The actual test is Studies 1 and 2, coming up in Stage 3."

#### Stage 3 — Filter

**What the reader sees:** A vertical funnel: 2,100 → 205 → 16 → 6. Each drop-off is animated and expandable.

**What the reader does:**
1. Drag the Euclidean distance slider (default 0.03, range 0.01–0.10). The 2,100 → 205 bar responds in real time (using pre-computed values at each threshold). Plain-English gloss: "Higher threshold = fewer hypotheses survive (we're demanding more distinctiveness). Lower threshold = more hypotheses survive but more redundancy."
2. Toggle FDR correction on/off. See how the 205 → 16 count changes.
3. At the bottom of the funnel, the 6 pre-registered hypotheses appear as cards. Clicking a card reveals: verbatim hypothesis text, Study 1 p-value, Study 2 p-value, the morphed headlines used in testing. The multimedia and surprise/cliffhanger cards get prominent caveat treatment.

**Text rail shows:** §2.3 final paragraph + §2.4 (hypothesis testing). The pre-registration link (AsPredicted #172038) is surfaced prominently.

**Why it works:** Makes the statistical machinery (Euclidean filtering, FDR correction) tactile. Non-specialists understand these procedures through interaction, not by reading about them.

**Caveat surfaced here:** "This paper shows 2 of 6 hypotheses survived the novelty check (controlling for BU features). Most did not. The authors treat this honestly in §5 — surface the quote."

### 3.4 Entry and exit

**Entry:** A short welcome panel (3-4 sentences) explaining: "This is the paper's method, made playable. Scroll to move through the three stages. The paper's verbatim text is always visible on the right." Reader clicks "Start" to begin Stage 1.

**Exit:** After Stage 3, a "What you just did" panel (DM Sans, `paperSubtle` container, clearly labelled as editorial gloss not paper text). It contains:
- A 3-sentence editorial reflection ("You just ran the paper's full pipeline on real data. The 6 hypotheses you saw at the bottom are the ones the authors pre-registered and tested. Four replicated in the social-media study; two did not.")
- Link to §3 (Limitations) rendered in full, verbatim, because this is the section most at risk of being skipped
- Link to Source Materials

### 3.5 What to cache vs. compute

- **Cache everything.** No live LLM calls. The paper already provides Table 1 (example hypotheses) and Table 2 (example morphs); the OSF has more. Pre-compute all example flows and store in `hypotheses.json` / `morphs.json`.
- **Predicted ∆CTR values:** Use the authors' published values where available. Where not, clearly label as illustrative and stay within the paper's reported ranges.
- **Euclidean/FDR sliders:** Pre-compute the survival counts at 20-30 threshold values; interpolate between them.

### 3.6 What NOT to do in Option B

- No "game" feel — no points, streaks, achievements, confetti. This is a scholarly tool, not a learning app.
- No procedurally generated content. All examples are from the paper or OSF.
- No forcing the reader through all three stages. They can jump to Stage 3 if they want.
- No animations longer than 400ms. The reader is here to think, not to be entertained.

---

## Part 4 — Accessibility

Both tabs must meet WCAG 2.2 AA:
- Color contrast ≥ 4.5:1 for body text against `paper` background (check `inkMuted` specifically)
- All interactive elements keyboard-accessible; focus rings visible and not suppressed
- All sliders have keyboard alternatives (arrow keys) and screen-reader labels
- All images (Figure 1, any icons) have alt text
- Motion respects `prefers-reduced-motion` — disable stage transitions and animations for users who opt out
- Verbatim quotes use proper `<blockquote>` with `<cite>` elements
- Semantic HTML throughout — no div soup

---

## Part 5 — Build phases

### Phase 0 — Setup (0.5 days)
- `create-next-app` with TypeScript + Tailwind
- Font loading, theme tokens, base layout
- Deploy skeleton to Vercel

### Phase 1 — Content extraction (1 day)
- Parse PDF into `paper.json` (manual + scripted)
- Populate `glossary.json` with 18 terms + authoritative links
- Populate `hypotheses.json`, `morphs.json`, `prompts.json` from paper tables + OSF
- Redraw Figure 1 as warm-palette SVG

### Phase 2 — Shared infrastructure (1 day)
- Landing page + tab switcher
- `Quote`, `Gloss`, `Glossary` components
- Source Materials section (end-of-page, shared)
- Top bar with paper metadata + OSF dropdown

### Phase 3 — Option A build (2 days)
- `AnnotatedReader` component: render `paper.json` with semantic borders, margin rail, term anchors
- Four interactives (shrinkage, R², funnel, results card)
- Mobile responsive passes

### Phase 4 — Option B build (2.5 days)
- Pipeline stage components
- Sticky text rail
- Three stages with curated data flows
- Entry/exit panels

### Phase 5 — Polish (1 day)
- Accessibility audit (axe DevTools, keyboard nav, screen reader test)
- Performance audit (Lighthouse, bundle size check)
- Cross-browser test (Safari iOS, Chrome Android, Firefox desktop)
- Copy-edit all editorial/gloss text

**Clearly keep track of which phase we are in. If we are able to push through multiple phases in the same day or across a few sessions -- we should. There must be good documentation in the folder for future Claude sessions to get upto speed quickly (Claude.md, README, Devlogs etc).

---

## Part 6 — Success criteria

A reviewer session should establish:

1. **Comprehension:** Can the reviewer accurately state the paper's contribution after using each tab? Can they quote the authors directly on key points?
2. **Engagement:** Which tab did they spend more time in? Which made them want to read §3 (Limitations)?
3. **Trust:** Did the tab ever feel like it was *replacing* the authors' words with its own? (This should never happen — flag any instance as a bug.)
4. **Appendix discovery:** Did the reviewer engage with Tables 1 & 2, the prompts, the OSF links? In Option A (margin promotion) vs Option B (playground substrate), which surfaces appendix material more effectively?
5. **Preference:** Which would they want for the *next* paper they read? (Open-ended — the answer might be "depends on the paper.")

Ship with a feedback form linked from the top bar (Typeform or Tally) asking these five questions.

---

## Part 7 — Known risks and counterfactual checks

- **Risk: Option B's sticky rail fights the playground for attention on desktop.** Mitigation: the rail auto-scrolls in sync with stage progression; readers can collapse it. If reviewers complain of cognitive load, consider making it a pull-out drawer triggered on demand rather than always-visible.
- **Risk: Option A feels too conservative — "just a nicely-styled PDF."** Mitigation: the four interactives + margin promotions + glossary need to carry weight. If in testing the interactives feel bolted-on, go further — add a fifth interactive around the prompt randomization (a dice-roll that shows how different preamble × structure combinations produce different hypotheses for the same headline pair).
- **Risk: building both is 2x the work of building one well.** Counterfactual: could you ship Option A in week 1, get 5-10 reviewer sessions on it, and only build Option B if the feedback says "I want more"? Honest assessment: probably yes, and it would save time. But the stated goal is A/B comparison, and comparison in series (A then B) loses calibration — reviewers anchor to whatever they saw first. If the goal is genuine comparison, build both. If the goal is shipping fast, build A and defer B.
- **Risk: the paper's own caveats (§3) get under-surfaced.** Both options must promote §3 heavily. In Option A, the entire section gets the caveat color-border. In Option B, Stage 3's exit panel links to §3 verbatim. If in testing reviewers don't remember any caveats, the design has failed.
- **Risk: mobile experience is an afterthought.** Mitigation: design mobile layouts first; test on actual devices early, not just Chrome DevTools.

---

## Part 8 — Out of scope for v1

- User accounts, saved progress, annotations
- Dark mode (though I want to prioritise this at the earliest once we have the other pieces ready)
- Multi-language
- A recommendation engine for other papers
- Comments / social features
- LLM-powered Q&A over the paper (this is important -- and should primarily draw from the paper and the cited references alone)
- Exporting a reader's annotations

Any of these can be v2 if reviewer feedback warrants. For v1: ship the reading experience -- a minimum loveable experience for both options, collect signal, iterate.
