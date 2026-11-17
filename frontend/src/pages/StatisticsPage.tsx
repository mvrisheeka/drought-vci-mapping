import { useState } from 'react'
import { Panel } from '../components/common/Panel'
import { SourceBadge } from '../components/common/SourceBadge'
import { Segmented } from '../components/common/Controls'
import { ErrorBlock, LoadingBlock } from '../components/common/States'
import { SortableTable } from '../components/stats/SortableTable'
import { DistributionPanel } from '../components/sections/DistributionPanel'
import { HistogramPanel } from '../components/sections/HistogramPanel'
import { useAnalysis } from '../hooks/useAnalysis'
import { CLASS_BY_ID } from '../config/methodology'
import { classOf } from '../utils/vci'
import { fmt } from '../utils/format'
import type { DroughtClassArea, NDVIRecord } from '../types/drought'

function VciTile({ label, value, hint }: { label: string; value: number; hint: string }) {
  const cls = classOf(value)
  return (
    <div className="rounded-md border border-line px-3.5 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">{label}</p>
      <p className="tabular mt-1 font-mono text-2xl font-semibold text-ink">{value.toFixed(4)}</p>
      <p className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-3">
        {label !== 'Std. deviation' && <span className="size-2 rounded-[2px]" style={{ background: cls.color }} />}
        {hint}
      </p>
    </div>
  )
}

export function StatisticsPage() {
  const { result, status, error } = useAnalysis()
  const [filter, setFilter] = useState<'all' | 'drought'>('all')
  if (!result) return status === 'error' ? <ErrorBlock message={error ?? 'Unavailable'} /> : <LoadingBlock className="h-96" />

  const { data: s, source, note } = result.statistics
  const classRows = s.classAreas.filter((c) => filter === 'all' || c.classId !== 4)
  const shownArea = classRows.reduce((a, c) => a + c.areaKm2, 0)
  const shownPct = classRows.reduce((a, c) => a + c.percentage, 0)

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <Panel title="VCI summary statistics" subtitle="reduceRegion over the district at 250 m on the unsmoothed VCI image" actions={<SourceBadge source={source} note={note} />}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <VciTile label="Mean VCI" value={s.meanVCI} hint={classOf(s.meanVCI).name} />
          <VciTile label="Minimum VCI" value={s.minVCI} hint={classOf(s.minVCI).name} />
          <VciTile label="Maximum VCI" value={s.maxVCI} hint={classOf(s.maxVCI).name} />
          <VciTile label="Std. deviation" value={s.stdDevVCI} hint="Spread of pixel VCI" />
        </div>
      </Panel>

      <Panel
        title="Drought class area table"
        subtitle={`Total classified area ${fmt.km2(s.totalAreaKm2, 2)} · smoothed class map`}
        actions={
          <>
            <Segmented
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'All classes' },
                { value: 'drought', label: 'Drought only' },
              ]}
            />
            <SourceBadge source={source} note={note} />
          </>
        }
      >
        <SortableTable<DroughtClassArea>
          rows={classRows}
          rowKey={(r) => r.classId}
          columns={[
            { key: 'code', header: 'Code', value: (r) => r.classId, render: (r) => <span className="font-mono text-ink-3">{r.classId}</span> },
            {
              key: 'name',
              header: 'Drought class',
              value: (r) => r.classId,
              render: (r) => (
                <span className="flex items-center gap-2">
                  <span className="size-3 rounded-[2px] ring-1 ring-black/15" style={{ background: CLASS_BY_ID[r.classId].color }} />
                  {r.className}
                </span>
              ),
            },
            { key: 'range', header: 'VCI range', value: (r) => r.classId, render: (r) => <span className="font-mono text-[11.5px] text-ink-2">{CLASS_BY_ID[r.classId].range}</span> },
            { key: 'area', header: 'Area (km²)', align: 'right', value: (r) => r.areaKm2, render: (r) => fmt.num(r.areaKm2, 2) },
            {
              key: 'pct',
              header: 'Percentage',
              align: 'right',
              value: (r) => r.percentage,
              render: (r) => (
                <span className="inline-flex items-center justify-end gap-2">
                  <span className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-sunken sm:inline-block">
                    <span className="block h-full" style={{ width: `${r.percentage}%`, background: CLASS_BY_ID[r.classId].color }} />
                  </span>
                  {fmt.pct(r.percentage, 2)}
                </span>
              ),
            },
          ]}
          footer={
            <tr className="font-semibold">
              <td className="px-3 py-2" colSpan={3}>
                {filter === 'all' ? 'Total' : 'Drought-affected total'}
              </td>
              <td className="tabular px-3 py-2 text-right font-mono">{fmt.num(shownArea, 2)}</td>
              <td className="tabular px-3 py-2 text-right font-mono">{fmt.pct(shownPct, 2)}</td>
            </tr>
          }
        />
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <DistributionPanel />
        <HistogramPanel />
      </div>

      <Panel title="Annual NDVI table" actions={<SourceBadge source={result.ndviSeries.source} note={result.ndviSeries.note} />}>
        <SortableTable<NDVIRecord>
          rows={result.ndviSeries.data}
          rowKey={(r) => r.year}
          columns={[
            { key: 'year', header: 'Year', value: (r) => r.year },
            { key: 'ndvi', header: 'Mean NDVI', align: 'right', value: (r) => r.meanNDVI, render: (r) => r.meanNDVI.toFixed(6) },
          ]}
        />
      </Panel>
    </div>
  )
}
