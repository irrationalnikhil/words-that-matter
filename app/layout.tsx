import type { Metadata } from 'next'
import { DM_Serif_Display, Lora, DM_Sans, JetBrains_Mono } from 'next/font/google'
import 'katex/dist/katex.min.css'
import './globals.css'

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-serif',
})

const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lora',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  title: 'Words that Work — Interactive Paper Reader',
  description:
    'Two interactive reading experiences for "Words that Work: Using Language to Generate Hypotheses" (Batista & Ross, NeurIPS 2024).',
  openGraph: {
    title: 'Words that Work — Interactive Paper Reader',
    description:
      'An A/B comparison of two ways to read a NeurIPS 2024 paper on generating hypotheses from language.',
    type: 'website',
    url: 'https://words-that-matter.vercel.app',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Words that Work — Interactive Paper Reader. Batista & Ross, NeurIPS 2024.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Words that Work — Interactive Paper Reader',
    description:
      'Two ways to read a NeurIPS 2024 paper on generating hypotheses from language using LLMs, ML, and experiments.',
    images: ['/og-image.svg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${lora.variable} ${dmSans.variable} ${jetbrains.variable}`}
    >
      <body className="bg-paper text-ink font-serif antialiased">
        {children}
      </body>
    </html>
  )
}
