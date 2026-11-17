import { DownloadsPanel } from '../components/reports/DownloadsPanel'
import { NotebookFigures } from '../components/reports/NotebookFigures'
import { Panel } from '../components/common/Panel'
import { SourceBadge } from '../components/common/SourceBadge'
import type { DataSource } from '../types/drought'

const PROVENANCE: { item: string; source: DataSource; detail: string }[] = [
  { item: 'Mean / min / max / std. dev. VCI', source: 'notebook', detail: 'Cells 23–24 output' },
  { item: 'Class areas, percentages, total area', source: 'notebook', detail: 'Cells 33–37 output' },
  { item: 'Annual mean NDVI 2015–2023', source: 'notebook', detail: 'Cell 41 output' },
  { item: 'District boundary', source: 'notebook', detail: 'GADM 4.1 record 499 (same file as cell 4), simplified' },
  { item: 'Map rasters (severity / VCI / NDVI)', source: 'demo', detail: 'Synthetic until GET /drought/map serves EE tiles' },
  { item: 'Pixel inspector values', source: 'demo', detail: 'Synthetic until GET /drought/pixel is available' },
  { item: 'Interactive VCI histogram', source: 'demo', detail: 'Notebook did not print bin counts; real figure shown in gallery' },
]

export function ReportsPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <DownloadsPanel showAll />
      <Panel title="Data provenance" subtitle="Where every number in this dashboard comes from when no backend is connected">
        <ul className="divide-y divide-line">
          {PROVENANCE.map((p) => (
            <li key={p.item} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-[12.5px]">
              <span className="min-w-56 flex-1 font-medium text-ink">{p.item}</span>
              <span className="text-ink-3">{p.detail}</span>
              <SourceBadge source={p.source} />
            </li>
          ))}
        </ul>
      </Panel>
      <NotebookFigures />
    </div>
  )
}
