'use client'

import { useState, useCallback } from 'react'

/**
 * Shrinkage formula interactive — Eq. 1
 * Two sliders: Clicks (0–500) and Impressions (10–10,000).
 * Shows raw CTR, smoothed CTR (Eq. 1), grand-mean reference,
 * and a visual bar showing pull toward the mean.
 * Per briefing §2.4(a).
 *
 * Grand-mean CTR (0.02) is an illustrative value consistent with
 * Upworthy's reported CTR range. The paper does not publish the exact value.
 */

// Illustrative grand mean CTR — Upworthy headlines typically 1–3% CTR
const GRAND_MEAN_CTR = 0.02

// Log-scale slider helpers: convert linear 0–1 → log-distributed value
function logScale(value: number, min: number, max: number): number {
  const minLog = Math.log(Math.max(min, 0.1))
  const maxLog = Math.log(max)
  return Math.exp(minLog + value * (maxLog - minLog))
}

function inverseLogScale(value: number, min: number, max: number): number {
  const minLog = Math.log(Math.max(min, 0.1))
  const maxLog = Math.log(max)
  return (Math.log(Math.max(value, 0.1)) - minLog) / (maxLog - minLog)
}

export default function ShrinkageSlider() {
  // Store slider positions as normalized 0–1 values (for log-scale mapping)
  const [clicksNorm, setClicksNorm] = useState(() => inverseLogScale(10, 1, 500))
  const [impressionsNorm, setImpressionsNorm] = useState(() => inverseLogScale(200, 10, 10000))

  const clicks = Math.round(logScale(clicksNorm, 1, 500))
  const impressions = Math.round(logScale(impressionsNorm, 10, 10000))

  // Raw CTR
  const rawCTR = impressions > 0 ? clicks / impressions : 0

  // Smoothed CTR from Eq. 1: (Clicks + CTR̄) / (Impressions + 1)
  const smoothedCTR = (clicks + GRAND_MEAN_CTR) / (impressions + 1)

  // How much is the smoothed value pulled toward the mean (0 = fully at mean, 1 = fully at raw)
  const pullFraction =
    rawCTR === GRAND_MEAN_CTR
      ? 1
      : Math.abs(smoothedCTR - GRAND_MEAN_CTR) / Math.max(Math.abs(rawCTR - GRAND_MEAN_CTR), 0.0001)

  const handleClicksChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setClicksNorm(Number(e.target.value))
  }, [])

  const handleImpressionsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setImpressionsNorm(Number(e.target.value))
  }, [])

  return (
    <div>
      <p className="font-sans text-xs text-ink-faint mb-5">
        Adjust clicks and impressions to see how the smoothed CTR is pulled toward the grand mean
        at low sample sizes.
      </p>

      {/* Sliders */}
      <div className="space-y-4 mb-6">
        <SliderRow
          label="Clicks"
          value={clicks}
          normValue={clicksNorm}
          onChange={handleClicksChange}
          displayValue={clicks.toLocaleString()}
          ariaLabel="Number of clicks (log scale, 1 to 500)"
        />
        <SliderRow
          label="Impressions"
          value={impressions}
          normValue={impressionsNorm}
          onChange={handleImpressionsChange}
          displayValue={impressions.toLocaleString()}
          ariaLabel="Number of impressions (log scale, 10 to 10,000)"
        />
      </div>

      {/* Results panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <MetricCard
          label="Raw CTR"
          value={formatPct(rawCTR)}
          sublabel="clicks ÷ impressions"
          color="text-ink"
        />
        <MetricCard
          label="Smoothed CTR"
          value={formatPct(smoothedCTR)}
          sublabel="Eq. 1 applied"
          color="text-accent-deep"
          highlight
        />
        <MetricCard
          label="Grand mean CTR"
          value={formatPct(GRAND_MEAN_CTR)}
          sublabel="dataset average*"
          color="text-ink-faint"
        />
      </div>

      {/* Pull-toward-mean visualization */}
      <div className="mb-4">
        <p className="font-sans text-xs text-ink-faint mb-2">
          How much is the smoothed value pulled toward the mean?
        </p>
        <div className="relative h-8 bg-paper-deep rounded-full overflow-hidden">
          {/* Grand mean marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-ink-faint z-10"
            style={{ left: `${Math.min(GRAND_MEAN_CTR * 500, 100)}%` }}
            aria-hidden="true"
          />
          {/* Raw CTR marker */}
          <div
            className="absolute top-1 bottom-1 w-1 rounded-full bg-ink/30"
            style={{ left: `${Math.min(rawCTR * 500, 99)}%` }}
            title={`Raw CTR: ${formatPct(rawCTR)}`}
          />
          {/* Smoothed CTR marker — the main indicator */}
          <div
            className="absolute top-0.5 bottom-0.5 w-3 rounded-full bg-accent shadow-sm transition-all duration-300"
            style={{ left: `${Math.min(smoothedCTR * 500, 97)}%` }}
            title={`Smoothed CTR: ${formatPct(smoothedCTR)}`}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-sans text-[10px] text-ink-faint">0%</span>
          <span className="font-sans text-[10px] text-ink-faint">20%</span>
        </div>
      </div>

      {/* Insight text */}
      <p className="font-sans text-xs text-ink-muted leading-relaxed">
        {impressions < 50
          ? 'At low impressions, the smoothed CTR stays close to the grand mean — the formula "doesn\'t trust" small samples.'
          : impressions < 500
          ? 'With moderate impressions, the smoothed CTR begins tracking the raw CTR more closely.'
          : 'At high impressions, the smoothed CTR nearly equals the raw CTR — the large sample speaks for itself.'}
        {' '}This is what the authors call shrinkage.
      </p>

      <p className="font-sans text-[10px] text-ink-faint mt-3">
        *Grand mean CTR of {formatPct(GRAND_MEAN_CTR)} is illustrative, consistent with Upworthy&apos;s
        reported CTR range. The paper does not publish the exact value.
      </p>
    </div>
  )
}

function SliderRow({
  label,
  value,
  normValue,
  onChange,
  displayValue,
  ariaLabel,
}: {
  label: string
  value: number
  normValue: number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  displayValue: string
  ariaLabel: string
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <label className="font-sans text-xs text-ink-muted">{label}</label>
        <span className="font-mono text-sm text-ink tabular-nums">{displayValue}</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.005}
        value={normValue}
        onChange={onChange}
        className="w-full h-2 bg-paper-deep rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-sm
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-accent/30 focus:ring-offset-2 focus:ring-offset-paper-subtle"
        aria-label={ariaLabel}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={1}
      />
    </div>
  )
}

function MetricCard({
  label,
  value,
  sublabel,
  color,
  highlight,
}: {
  label: string
  value: string
  sublabel: string
  color: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-md px-3 py-2.5 ${
        highlight ? 'bg-accent/5 border border-accent/20' : 'bg-paper'
      }`}
    >
      <p className="font-sans text-[10px] text-ink-faint uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className={`font-mono text-lg font-semibold tabular-nums ${color}`}>{value}</p>
      <p className="font-sans text-[10px] text-ink-faint">{sublabel}</p>
    </div>
  )
}

function formatPct(value: number): string {
  return (value * 100).toFixed(2) + '%'
}
