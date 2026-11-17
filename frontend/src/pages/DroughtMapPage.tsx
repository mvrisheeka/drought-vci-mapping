import { Info } from 'lucide-react'
import { AnalysisControls } from '../components/controls/AnalysisControls'
import { DroughtMap } from '../components/map/DroughtMap'
import { Panel } from '../components/common/Panel'
import { VciExplainer } from '../components/education/VciExplainer'
import { useAnalysis } from '../hooks/useAnalysis'
import { METHODOLOGY } from '../config/methodology'

const LAYER_NOTES = {
  severity: `Four VCI classes after a ${METHODOLOGY.smoothing} filter removes isolated pixels. This is the layer exported as VCI_Drought_Map.tif.`,
  vci: 'Continuous VCI from 0 (worst on record) to 1 (best on record), using the notebook’s six-colour VCI palette.',
  ndvi: 'Mean NDVI of the analysis year’s 16-day composites, shown with the notebook’s brown→green palette (0–1). Low values indicate sparse or no vegetation.',
  boundary: METHODOLOGY.boundarySource,
} as const

export function DroughtMapPage() {
  const { params, result } = useAnalysis()
  const layer = result?.layers.find((l) => l.id === params.layer)
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <div className="rounded-lg border border-line bg-surface p-4">
        <AnalysisControls />
      </div>
      <DroughtMap heightClass="h-[60vh] min-h-[420px] lg:h-[calc(100vh-290px)] lg:min-h-[520px]" />
      <div className="grid gap-4 lg:grid-cols-[1fr_1.6fr]">
        <Panel title={<span className="flex items-center gap-1.5"><Info className="size-4 text-moss-600" /> About this layer</span>}>
          <p className="text-[13px] font-semibold text-ink">{layer?.label ?? '—'}</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-2">{LAYER_NOTES[params.layer]}</p>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[12px]">
            <dt className="text-ink-3">Dataset</dt>
            <dd className="font-mono text-ink">{METHODOLOGY.dataset}</dd>
            <dt className="text-ink-3">Resolution</dt>
            <dd className="text-ink">{METHODOLOGY.resolutionM} m</dd>
            <dt className="text-ink-3">Baseline</dt>
            <dd className="text-ink">
              {params.startYear}–{params.endYear} ({METHODOLOGY.compositeCount} composites)
            </dd>
            <dt className="text-ink-3">Delivery</dt>
            <dd className="text-ink">{layer?.kind === 'demo' ? 'Synthetic in-browser raster (demo)' : layer?.kind === 'tile' ? 'Earth Engine tiles' : layer?.kind ?? '—'}</dd>
          </dl>
        </Panel>
        <VciExplainer compact />
      </div>
    </div>
  )
}
