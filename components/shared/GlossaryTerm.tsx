'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { GlossaryEntry } from '@/lib/types'

interface GlossaryTermProps {
  children: React.ReactNode
  entry: GlossaryEntry
}

/**
 * Wraps a glossary term with a dotted underline and hover/tap popover.
 * Desktop: hover to show, click to pin.
 * Mobile: tap to show, tap elsewhere to dismiss.
 * Keyboard: Enter/Space to toggle, Escape to close.
 * Non-modal, dismissable per briefing §2.2.
 */
export default function GlossaryTerm({ children, entry }: GlossaryTermProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setIsPinned(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
        setIsPinned(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleClick = useCallback(() => {
    if (isPinned) {
      setIsOpen(false)
      setIsPinned(false)
    } else {
      setIsOpen(true)
      setIsPinned(true)
    }
  }, [isPinned])

  const handleMouseEnter = useCallback(() => {
    if (!isPinned) setIsOpen(true)
  }, [isPinned])

  const handleMouseLeave = useCallback(() => {
    if (!isPinned) setIsOpen(false)
  }, [isPinned])

  return (
    <span className="relative inline">
      <button
        ref={triggerRef}
        type="button"
        className="underline decoration-dotted decoration-ink-faint underline-offset-[3px] hover:decoration-accent transition-colors cursor-help text-left"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-expanded={isOpen}
        aria-describedby={isOpen ? `glossary-${entry.term}` : undefined}
      >
        {children}
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          id={`glossary-${entry.term}`}
          role="tooltip"
          className="absolute z-40 left-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg border border-paper-deep p-4 animate-in"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Term name */}
          <p className="font-sans text-sm font-semibold text-ink mb-1.5">
            {entry.term}
          </p>

          {/* Plain-English definition */}
          <p className="font-sans text-sm text-ink-muted leading-relaxed mb-2">
            {entry.plainEnglish}
          </p>

          {/* Authoritative source */}
          <p className="font-sans text-xs text-ink-faint">
            <a
              href={entry.authoritativeSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-dotted underline-offset-2 hover:text-ink-muted transition-colors"
            >
              {entry.authoritativeSource.citation}
            </a>
          </p>
        </div>
      )}
    </span>
  )
}
