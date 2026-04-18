'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Section } from '@/lib/types'

interface SectionProgressProps {
  sections: Section[]
}

/**
 * Sticky breadcrumb below the top bar showing current section name + thin progress bar.
 * Uses IntersectionObserver to track which section is in view.
 * Only shows sections that have content (non-empty paragraphs).
 */
export default function SectionProgress({ sections }: SectionProgressProps) {
  const [currentSection, setCurrentSection] = useState<Section | null>(null)
  const [progress, setProgress] = useState(0)

  // Filter to sections with content
  const contentSections = sections.filter((s) => s.paragraphs.length > 0)

  // Track which section is in view via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = []

    contentSections.forEach((section) => {
      const el = document.getElementById(`section-${section.id}`)
      if (!el) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setCurrentSection(section)
            }
          })
        },
        {
          rootMargin: '-80px 0px -60% 0px', // triggers when section is near top
          threshold: 0,
        }
      )

      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Track reading progress based on scroll position
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    if (docHeight > 0) {
      setProgress(Math.min(scrollTop / docHeight, 1))
    }
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // initial
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const sectionLabel = currentSection
    ? currentSection.id === 'abstract'
      ? 'Abstract'
      : `§${currentSection.id} ${currentSection.title}`
    : ''

  return (
    <div className="sticky top-[49px] z-40 bg-paper/95 backdrop-blur-sm border-b border-paper-deep/50">
      {/* Section breadcrumb */}
      <div className="reading-column md:max-w-4xl py-1.5">
        <p className="font-sans text-xs text-ink-faint truncate" aria-live="polite" aria-atomic="true">
          {sectionLabel}
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] bg-paper-deep">
        <div
          className="h-full bg-accent transition-[width] duration-150 ease-out"
          style={{ width: `${progress * 100}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Reading progress"
        />
      </div>
    </div>
  )
}
