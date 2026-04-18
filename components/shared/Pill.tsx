import { type Category } from '@/lib/types'

const pillStyles: Record<string, string> = {
  method:  'bg-method/10 text-method',
  finding: 'bg-finding/10 text-finding',
  caveat:  'bg-caveat/10 text-caveat',
  novel:   'bg-novel/10 text-novel',
}

const labels: Record<string, string> = {
  method:  'Method',
  finding: 'Finding',
  caveat:  'Caveat',
  novel:   'Novel',
}

interface PillProps {
  category: Category
}

/**
 * Small category pill — used sparingly for labeling paragraph types.
 */
export default function Pill({ category }: PillProps) {
  return (
    <span
      className={`inline-block font-sans text-xs font-medium px-2 py-0.5 rounded-full ${pillStyles[category]}`}
    >
      {labels[category]}
    </span>
  )
}
