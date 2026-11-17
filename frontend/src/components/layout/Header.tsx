import { CalendarDays, Database, MapPin, Menu } from 'lucide-react'
import { useAnalysis } from '../../hooks/useAnalysis'
import { STUDY_AREAS } from '../../config/studyAreas'

function Chip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-1.5">
      <span className="text-moss-600">{icon}</span>
      <div className="leading-tight">
        <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-3">{label}</p>
        <p className="text-[12.5px] font-medium text-ink">{value}</p>
      </div>
    </div>
  )
}

function StatusIndicator() {
  const { status, result, backend } = useAnalysis()
  const source = result?.statistics.source
  let tone = 'bg-ink-3'
  let label = 'Starting…'
  let detail = ''
  if (status === 'loading') {
    tone = 'bg-mild animate-pulse'
    label = 'Running analysis'
  } else if (status === 'error') {
    tone = 'bg-moderate'
    label = 'Analysis unavailable'
  } else if (source === 'live') {
    tone = 'bg-live'
    label = 'Analysis ready'
    detail = 'Live backend'
  } else if (source) {
    tone = 'bg-snapshot'
    label = 'Analysis ready'
    detail = backend?.configured ? 'Backend unreachable · snapshot' : 'Notebook snapshot · demo map'
  }
  return (
    <div className="flex items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-1.5" role="status" aria-live="polite" title={backend?.message}>
      <span className={`size-2 rounded-full ${tone}`} aria-hidden />
      <div className="leading-tight">
        <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-3">Status</p>
        <p className="text-[12.5px] font-medium text-ink">
          {label}
          {detail && <span className="ml-1.5 font-normal text-ink-3">· {detail}</span>}
        </p>
      </div>
    </div>
  )
}

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { params } = useAnalysis()
  const area = STUDY_AREAS.find((a) => a.district === params.district)
  return (
    <header className="border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button onClick={onOpenMenu} className="-ml-1 rounded-md p-1.5 text-ink-2 hover:bg-sunken lg:hidden" aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-[17px] font-semibold tracking-tight text-ink md:text-lg">Drought Monitoring &amp; VCI Analysis</h1>
            <p className="truncate text-xs text-ink-3 md:text-[13px]">Remote Sensing Based Vegetation Condition Assessment</p>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 2xl:w-auto">
          <Chip icon={<MapPin className="size-4" />} label="Study area" value={area ? `${area.district}, ${area.state}` : params.district} />
          <Chip icon={<CalendarDays className="size-4" />} label="Analysis year" value={`${params.year} · base ${params.startYear}–${params.endYear}`} />
          <Chip icon={<Database className="size-4" />} label="Data" value="MODIS NDVI (MOD13Q1)" />
          <StatusIndicator />
        </div>
      </div>
    </header>
  )
}
