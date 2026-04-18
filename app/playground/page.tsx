import TabSwitcher from '@/components/shared/TabSwitcher'
import PipelinePlayground from '@/components/playground/PipelinePlayground'
import AppendixSection from '@/components/shared/AppendixSection'

export const metadata = {
  title: 'The Pipeline Playground — Words that Work',
  description: 'Run the paper\'s method yourself on real headlines. The paper\'s text follows along.',
}

export default function PlaygroundPage() {
  return (
    <>
      <TabSwitcher />
      <main className="min-h-screen bg-paper">
        <div className="max-w-5xl mx-auto px-5">
          <header className="pt-8 md:pt-12 pb-4">
            <h1 className="font-display text-display-mobile md:text-display-desktop text-ink mb-3">
              The Pipeline Playground
            </h1>
            <p className="font-sans text-gloss md:text-gloss-desktop text-ink-muted">
              Batista &amp; Ross &middot; NeurIPS 2024
            </p>
          </header>

          <PipelinePlayground />
        </div>
      </main>

      {/* Source materials — shared across both tabs */}
      <AppendixSection />
    </>
  )
}
