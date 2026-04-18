/**
 * Plain-English gloss container.
 * Clearly demarcated from author text: sans font, indented, muted color, subtle background.
 * Never replaces the authors' words — always appears *beside* them.
 */
interface GlossProps {
  children: React.ReactNode
}

export default function Gloss({ children }: GlossProps) {
  return (
    <aside
      className="bg-paper-subtle rounded-md px-5 py-4 my-4 ml-4 border-l-2 border-paper-deep"
      aria-label="Editorial gloss"
    >
      <p className="font-sans text-gloss md:text-gloss-desktop text-ink-muted leading-relaxed">
        {children}
      </p>
    </aside>
  )
}
