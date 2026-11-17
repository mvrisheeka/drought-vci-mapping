import { Gauge, Leaf, Ruler, Sun } from 'lucide-react'
import type { ReactNode } from 'react'
import { useAnalysis } from '../../hooks/useAnalysis'
import { SourceBadge } from '../common/SourceBadge'
import { classOf } from '../../utils/vci'
import { fmt } from '../../utils/format'
import type { DataSource } from '../../types/drought'

interface CardProps {
  icon: ReactNode
  label: string
  value: ReactNode
  unit?: string
  explanation: string
  indicator?: ReactNode
  source?: DataSource
  note?: string
}

function SummaryCard({ icon, label, value, unit, explanation, indicator, source, note }: CardProps) {
  return (
    <div className="flex flex-col rounded-lg border border-line bg-surface p-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-ink-2">
          <span className="grid size-7 place-items-center rounded-md bg-moss-50 text-moss-600">{icon}</span>
          <span className="text-[12px] font-semibold">{label}</span>
        </div>
        {source && <SourceBadge source={source} note={note} compact />}
      </div>
      <p className="tabular mt-2.5 text-[26px] font-semibold leading-none tracking-tight text-ink">
        {value}
        {unit && <span className="ml-1 text-sm font-medium text-ink-3">{unit}</span>}
      </p>
      {indicator && <div className="mt-2">{indicator}</div>}
      <p className="mt-2 text-[11.5px] leading-snug text-ink-3">{explanation}</p>
    </div>
  )
}

function Skeleton() {
  return <div className="h-[132px] animate-pulse rounded-lg border border-line bg-surface" />
}

export function SummaryCards() {
  const { result, status, error } = useAnalysis()
  if (!result) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {status === 'error' ? (
          <p className="col-span-full rounded-lg border border-line bg-surface p-4 text-sm text-ink-2">{error}</p>
        ) : (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} />)
        )}
      </div>
    )
  }
  const { data: s, source, note } = result.statistics
  const meanClass = classOf(s.meanVCI)
  const extremeModerate = s.classAreas.filter((c) => c.classId <= 2).reduce((a, c) => a + c.percentage, 0)

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        icon={<Gauge className="size-4" />}
        label="Mean VCI"
        value={s.meanVCI.toFixed(3)}
        source={source}
        note={note}
        indicator={
          <div>
            <div className="relative h-1.5 rounded-full bg-[linear-gradient(90deg,#8B0000_0_20%,#FF4500_20%_40%,#FFD700_40%_60%,#228B22_60%)]">
              <span
                className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-ink shadow"
                style={{ left: `${Math.min(100, s.meanVCI * 100)}%` }}
                aria-hidden
              />
            </div>
            <p className="mt-1.5 text-[11.5px] font-medium text-ink-2">Falls in the {meanClass.name} range ({meanClass.range})</p>
          </div>
        }
        explanation="District average of pixel VCI (unsmoothed, 250 m)."
      />
      <SummaryCard
        icon={<Sun className="size-4" />}
        label="Drought-Affected Area"
        value={s.droughtAffectedPercentage.toFixed(1)}
        unit="%"
        source={source}
        note={note}
        indicator={<p className="text-[11.5px] font-medium text-ink-2">{fmt.pct(extremeModerate)} extreme + moderate</p>}
        explanation="Share of area in Extreme, Moderate or Mild classes (VCI < 0.6)."
      />
      <SummaryCard
        icon={<Leaf className="size-4" />}
        label="Healthy Vegetation"
        value={s.healthyPercentage.toFixed(2)}
        unit="%"
        source={source}
        note={note}
        indicator={<p className="text-[11.5px] font-medium text-ink-2">{fmt.km2(s.classAreas.find((c) => c.classId === 4)?.areaKm2 ?? 0)}</p>}
        explanation="Share of area with VCI ≥ 0.6 after spatial smoothing."
      />
      <SummaryCard
        icon={<Ruler className="size-4" />}
        label="Total Study Area"
        value={fmt.num(s.totalAreaKm2, 0)}
        unit="km²"
        source={source}
        note={note}
        indicator={<p className="text-[11.5px] font-medium text-ink-2">Sum of classified 250 m pixels</p>}
        explanation="Jodhpur district (GADM 4.1), from ee.Image.pixelArea()."
      />
    </div>
  )
}
