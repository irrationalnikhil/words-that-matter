import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        paper:        '#faf8f3',
        'paper-subtle': '#f3efe5',
        'paper-deep':   '#ede6d3',

        // Ink
        ink:          '#1a1a1a',
        'ink-muted':  '#5a5a5a',
        'ink-faint':  '#767676',  // WCAG AA fix: 4.54:1 against paper (was #8a8a8a at 3.27:1)

        // Semantic (left-border accents, small pills — never text highlights)
        method:       '#4a6fa5',
        finding:      '#6b8e4e',
        caveat:       '#b85c38',
        novel:        '#8b6bb1',

        // Interactive
        accent:       '#c4924a',
        'accent-deep': '#a67938',
      },
      fontFamily: {
        display: ['var(--font-dm-serif)', 'Georgia', 'serif'],
        serif:   ['var(--font-lora)', 'Georgia', 'serif'],
        sans:    ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-jetbrains)', 'Consolas', 'monospace'],
      },
      maxWidth: {
        reading: '680px',
        'reading-narrow': '560px',
      },
      fontSize: {
        // Typography scale: mobile → desktop handled via responsive utilities
        'display-mobile': ['2rem', { lineHeight: '1.1' }],       // 32px
        'display-desktop': ['3.5rem', { lineHeight: '1.1' }],    // 56px
        'h2-mobile': ['1.5rem', { lineHeight: '1.2' }],          // 24px
        'h2-desktop': ['2rem', { lineHeight: '1.2' }],           // 32px
        'h3-mobile': ['1.125rem', { lineHeight: '1.3' }],        // 18px
        'h3-desktop': ['1.375rem', { lineHeight: '1.3' }],       // 22px
        'body-mobile': ['1.125rem', { lineHeight: '1.65' }],     // 18px
        'body-desktop': ['1.1875rem', { lineHeight: '1.65' }],   // 19px
        'gloss': ['0.9375rem', { lineHeight: '1.5' }],           // 15px mobile
        'gloss-desktop': ['1rem', { lineHeight: '1.5' }],        // 16px desktop
        'mono-sm': ['0.875rem', { lineHeight: '1.5' }],          // 14px
        'mono-desktop': ['0.9375rem', { lineHeight: '1.5' }],    // 15px
      },
      spacing: {
        'margin-rail': '280px',
      },
    },
  },
  plugins: [],
}
export default config
