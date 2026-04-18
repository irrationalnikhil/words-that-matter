'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect, useCallback } from 'react'

const sourceLinks = [
  { label: 'Paper (SSRN)', href: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4926398' },
  { label: 'Data (Upworthy Archive)', href: 'https://www.nature.com/articles/s41597-021-00934-7' },
  { label: 'Code & prompts (OSF)', href: 'https://osf.io/d5xvb/?view_only=301ca63ed1004401adb697a625ff8d61' },
  { label: 'Pre-registration', href: 'https://aspredicted.org/S6H_ZPF' },
]

/**
 * Persistent top bar with tab switcher and source materials dropdown.
 * Present on /annotated and /playground routes.
 * Dropdown is keyboard-navigable (arrow keys, escape, enter).
 */
export default function TabSwitcher() {
  const pathname = usePathname()
  const isAnnotated = pathname === '/annotated'
  const isPlayground = pathname === '/playground'

  return (
    <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur-sm border-b border-paper-deep">
      <div className="reading-column flex items-center justify-between py-3 md:max-w-4xl">
        {/* Compact title */}
        <Link href="/" className="font-display text-base md:text-lg text-ink hover:text-accent-deep transition-colors">
          Words that Work
        </Link>

        {/* Tab switcher */}
        <nav className="flex gap-1" aria-label="Reading view">
          <Link
            href="/annotated"
            className={`font-sans text-sm px-3 py-1.5 rounded-md transition-colors ${
              isAnnotated
                ? 'bg-paper-deep text-ink font-medium'
                : 'text-ink-muted hover:text-ink hover:bg-paper-subtle'
            }`}
            aria-current={isAnnotated ? 'page' : undefined}
          >
            Annotated
          </Link>
          <Link
            href="/playground"
            className={`font-sans text-sm px-3 py-1.5 rounded-md transition-colors ${
              isPlayground
                ? 'bg-paper-deep text-ink font-medium'
                : 'text-ink-muted hover:text-ink hover:bg-paper-subtle'
            }`}
            aria-current={isPlayground ? 'page' : undefined}
          >
            Playground
          </Link>
        </nav>

        {/* Right-side actions */}
        <div className="flex items-center gap-3">
          <a
            href="#sm-about"
            className="hidden md:inline-flex font-sans text-sm text-ink-muted hover:text-accent-deep transition-colors"
          >
            Reviewer questions
          </a>
          <SourceDropdown />
        </div>
      </div>
    </header>
  )
}

function SourceDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [focusIndex, setFocusIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setFocusIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setIsOpen(true)
          setFocusIndex(0)
        }
        return
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          setIsOpen(false)
          setFocusIndex(-1)
          buttonRef.current?.focus()
          break
        case 'ArrowDown':
          e.preventDefault()
          setFocusIndex((prev) => Math.min(prev + 1, sourceLinks.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'Tab':
          setIsOpen(false)
          setFocusIndex(-1)
          break
      }
    },
    [isOpen]
  )

  // Focus the active item when focusIndex changes
  useEffect(() => {
    if (focusIndex >= 0 && itemRefs.current[focusIndex]) {
      itemRefs.current[focusIndex]?.focus()
    }
  }, [focusIndex])

  return (
    <div ref={containerRef} className="relative hidden md:block" onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) setFocusIndex(-1)
        }}
        className="font-sans text-sm text-ink-muted hover:text-ink transition-colors flex items-center gap-1"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Source materials
        <svg
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-paper-deep py-1.5 animate-in"
          role="menu"
          aria-label="Source materials"
        >
          {sourceLinks.map((link, i) => (
            <a
              key={link.href}
              ref={(el) => { itemRefs.current[i] = el }}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              tabIndex={-1}
              className={`block px-4 py-2 font-sans text-sm transition-colors ${
                focusIndex === i
                  ? 'bg-paper-subtle text-ink'
                  : 'text-ink-muted hover:bg-paper-subtle hover:text-ink'
              }`}
              onClick={() => {
                setIsOpen(false)
                setFocusIndex(-1)
              }}
            >
              {link.label}
              <span className="text-xs ml-1" aria-hidden="true">↗</span>
            </a>
          ))}

          {/* Link to full source materials section at bottom of page */}
          <div className="border-t border-paper-deep mt-1.5 pt-1.5">
            <a
              href="#sm-paper"
              className="block px-4 py-2 font-sans text-xs text-ink-faint hover:text-ink-muted transition-colors"
              onClick={() => {
                setIsOpen(false)
                setFocusIndex(-1)
              }}
            >
              View all source materials ↓
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
