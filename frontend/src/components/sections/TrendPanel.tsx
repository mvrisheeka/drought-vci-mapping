import { TrendingDown, TrendingUp } from 'lucide-react'
import { useAnalysis } from '../../hooks/useAnalysis'
import { Panel } from '../common/Panel'
import { SourceBadge } from '../common/SourceBadge'
import { ErrorBlock, LoadingBlock } from '../common/States'
import { NdviTrendChart } from '../charts/NdviTrendChart'

function Stat({ label, value, sub }: { label: string; value: string; sub?: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-3">{label}</p>
      <p className="tabular font-mono text-[15px] font-semibold text-ink">{value}</p>
      {sub && <p className="text-[11px] text-ink-3">{sub}</p>}
    </div>
  )
}

export function TrendPanel({ id, height = 300 }: { id?: string; height?: number }) {
  const { result, status, error, params } = useAnalysis()
  const series = result?.ndviSeries
  const data = series?.data ?? []
  const first = data[0]
  const last = data[data.length - 1]
  const min = data.length ? data.reduce((a, b) => (b.meanNDVI < a.meanNDVI ? b : a)) : undefined
  const max = data.length ? data.reduce((a, b) => (b.meanNDVI > a.meanNDVI ? b : a)) : undefined
  const change = first && last ? last.meanNDVI - first.meanNDVI : 0

  return (
    <Panel
      id={id}
      title="Annual Mean NDVI"
      subtitle={`District mean of each year's average NDVI · ${params.startYear}–${params.endYear}`}
      actions={series && <SourceBadge source={series.source} note={series.note} />}
    >
      {!series ? (
        status === 'error' ? <ErrorBlock message={error ?? 'Unavailable'} /> : <LoadingBlock />
      ) : (
        <>
          <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label={`${first?.year} → ${last?.year}`} value={`${change >= 0 ? '+' : ''}${change.toFixed(4)}`} sub={
              <span className="inline-flex items-center gap-1">{change >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />} change in mean NDVI</span>
            } />
            <Stat label="Lowest year" value={min ? min.meanNDVI.toFixed(4) : '—'} sub={min?.year} />
            <Stat label="Highest year" value={max ? max.meanNDVI.toFixed(4) : '—'} sub={max?.year} />
            <Stat label={`${params.year} (analysis)`} value={data.find((d) => d.year === params.year)?.meanNDVI.toFixed(4) ?? '—'} sub="highlighted point" />
          </div>
          <NdviTrendChart data={data} highlightYear={params.year} height={height} />
        </>
      )}
    </Panel>
  )
}
