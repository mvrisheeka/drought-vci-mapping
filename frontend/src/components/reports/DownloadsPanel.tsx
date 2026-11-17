import { FileSpreadsheet, FileText, Image as ImageIcon, Lock, Sheet, Download } from 'lucide-react'
import { useAnalysis } from '../../hooks/useAnalysis'
import { useAsync } from '../../hooks/useAsync'
import { droughtApi } from '../../services/droughtApi'
import { downloadText } from '../../utils/format'
import { annualNdviCsv, areaStatisticsCsv, openPrintableReport } from '../../utils/exports'
import { Panel } from '../common/Panel'
import { LoadingBlock } from '../common/States'
import type { DownloadArtifact, DownloadFormat } from '../../types/drought'

const ICONS: Record<DownloadFormat, typeof Sheet> = { csv: Sheet, xlsx: FileSpreadsheet, geotiff: ImageIcon, report: FileText }

function availabilityText(a: DownloadArtifact) {
  if (a.availability === 'backend') return 'From backend'
  if (a.availability === 'client') return a.format === 'report' ? 'Printable · from loaded results' : 'Rebuilt from notebook output'
  return 'Requires backend'
}

export function DownloadsPanel({ id, showAll = false }: { id?: string; showAll?: boolean }) {
  const { params, result } = useAnalysis()
  const { data, loading } = useAsync(() => droughtApi.getDownloads(params), [params.district, params.year, params.startYear, params.endYear])
  const items = (data ?? []).filter((a) => showAll || a.id !== 'ndvi-csv')

  const handle = (a: DownloadArtifact) => {
    if (!result) return
    if (a.availability === 'backend' && a.url) {
      window.open(a.url, '_blank', 'noopener')
      return
    }
    if (a.id === 'area-csv') downloadText(a.fileName, areaStatisticsCsv(result))
    else if (a.id === 'ndvi-csv') downloadText(a.fileName, annualNdviCsv(result))
    else if (a.id === 'report') openPrintableReport(result)
  }

  return (
    <Panel id={id} title="Results & Downloads" subtitle="Outputs produced by the notebook pipeline">
      {loading && !data ? (
        <LoadingBlock className="h-24" />
      ) : (
        <>
          <div className={`grid gap-2.5 sm:grid-cols-2 ${showAll ? 'lg:grid-cols-3' : 'xl:grid-cols-4'}`}>
            {items.map((a) => {
              const Icon = ICONS[a.format]
              const disabled = a.availability === 'unavailable' || !result
              return (
                <button
                  key={a.id}
                  onClick={() => handle(a)}
                  disabled={disabled}
                  title={disabled ? 'Not available until the FastAPI backend serves this file' : `Notebook cell ${a.notebookCell}`}
                  className="group flex items-start gap-3 rounded-md border border-line bg-surface p-3 text-left transition-colors enabled:hover:border-moss-500 enabled:hover:bg-moss-50 disabled:cursor-not-allowed disabled:bg-sunken"
                >
                  <span className={`grid size-9 shrink-0 place-items-center rounded-md ${disabled ? 'bg-line/60 text-ink-3' : 'bg-moss-50 text-moss-600 group-hover:bg-white'}`}>
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`flex items-center gap-1.5 text-[13px] font-semibold ${disabled ? 'text-ink-3' : 'text-ink'}`}>
                      {a.label}
                      {disabled ? <Lock className="size-3" /> : <Download className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />}
                    </span>
                    <span className="block truncate font-mono text-[10.5px] text-ink-3">{a.fileName}</span>
                    <span className={`mt-1 block text-[11px] ${disabled ? 'text-demo' : 'text-ink-3'}`}>{availabilityText(a)}</span>
                  </span>
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-[11.5px] text-ink-3">
            The notebook writes these files to its Colab/Drive workspace. CSVs and the report are rebuilt here from the loaded results; Excel and GeoTIFF
            need the backend to serve the actual files.
          </p>
        </>
      )}
    </Panel>
  )
}
