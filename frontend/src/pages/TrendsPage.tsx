import { TrendPanel } from '../components/sections/TrendPanel'
import { Panel } from '../components/common/Panel'
import { SourceBadge } from '../components/common/SourceBadge'
import { SortableTable } from '../components/stats/SortableTable'
import { NotebookFigures } from '../components/reports/NotebookFigures'
import { useAnalysis } from '../hooks/useAnalysis'
import { METHODOLOGY } from '../config/methodology'

export function TrendsPage() {
  const { result, params } = useAnalysis()
  const series = result?.ndviSeries
  const data = series?.data ?? []
  const mean = data.reduce((s, d) => s + d.meanNDVI, 0) / (data.length || 1)
  const rows = data.map((d, i) => ({ ...d, delta: i === 0 ? null : d.meanNDVI - data[i - 1].meanNDVI, anomaly: d.meanNDVI - mean }))

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <TrendPanel height={380} />
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Panel title="Annual NDVI table" subtitle="Year-on-year change and deviation from the period mean (derived)" actions={series && <SourceBadge source={series.source} note={series.note} />}>
          <SortableTable<(typeof rows)[number]>
            rows={rows}
            rowKey={(r) => r.year}
            columns={[
              { key: 'year', header: 'Year', value: (r) => r.year, render: (r) => <span className={r.year === params.year ? 'font-semibold' : ''}>{r.year}</span> },
              { key: 'ndvi', header: 'Mean NDVI', align: 'right', value: (r) => r.meanNDVI, render: (r) => r.meanNDVI.toFixed(4) },
              { key: 'delta', header: 'Δ prev. year', align: 'right', value: (r) => r.delta ?? -Infinity, render: (r) => (r.delta === null ? '—' : `${r.delta >= 0 ? '+' : ''}${r.delta.toFixed(4)}`) },
              { key: 'anom', header: 'vs mean', align: 'right', value: (r) => r.anomaly, render: (r) => `${r.anomaly >= 0 ? '+' : ''}${r.anomaly.toFixed(4)}` },
            ]}
          />
        </Panel>
        <Panel title="How the series is computed">
          <ol className="list-decimal space-y-2 pl-4 text-[12.5px] leading-relaxed text-ink-2">
            <li>
              Load <span className="font-mono text-ink">{METHODOLOGY.dataset}</span> NDVI for {METHODOLOGY.historicalStart}–{METHODOLOGY.historicalEnd} and scale by{' '}
              {METHODOLOGY.scaleFactor}.
            </li>
            <li>For each year, average all 16-day composites → one annual NDVI image.</li>
            <li>
              Reduce each annual image to its mean over the Jodhpur boundary at {METHODOLOGY.resolutionM} m (<span className="font-mono">ee.Reducer.mean()</span>).
            </li>
          </ol>
          <p className="mt-3 text-[12px] text-ink-3">
            Note: the district-wide mean NDVI is a different quantity from VCI. VCI compares each pixel with its own historical NDVI range, so a year can have a
            high district mean NDVI while many pixels still sit low in their own range.
          </p>
        </Panel>
      </div>
      <NotebookFigures only={[42]} />
    </div>
  )
}
