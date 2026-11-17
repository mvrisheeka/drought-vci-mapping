import { useState } from 'react'
import { useAnalysis } from '../../hooks/useAnalysis'
import { Panel } from '../common/Panel'
import { Segmented } from '../common/Controls'
import { SourceBadge } from '../common/SourceBadge'
import { DemoNote, ErrorBlock, LoadingBlock } from '../common/States'
import { VciHistogram } from '../charts/VciHistogram'
import { NOTEBOOK_FIGURES } from '../../data/notebookSnapshot'
import { METHODOLOGY } from '../../config/methodology'

const HIST_FIGURE = NOTEBOOK_FIGURES.find((f) => f.cell === 46)!

export function HistogramPanel({ id }: { id?: string }) {
  const { result, status, error, params } = useAnalysis()
  const hist = result?.histogram
  const isDemo = hist?.source === 'demo'
  const [view, setView] = useState<'chart' | 'figure'>('chart')
  const showFigure = view === 'figure' && params.district === 'Jodhpur' && params.year === 2023

  return (
    <Panel
      id={id}
      title={`VCI Distribution — ${params.year}`}
      subtitle="VCI indicates current vegetation condition relative to the historical NDVI range."
      actions={
        <>
          {isDemo && <Segmented size="xs" value={view} onChange={setView} options={[{ value: 'chart', label: 'Interactive' }, { value: 'figure', label: 'Notebook figure' }]} />}
          {hist && <SourceBadge source={showFigure ? 'notebook' : hist.source} note={showFigure ? `Notebook cell ${HIST_FIGURE.cell}` : hist.note} />}
        </>
      }
    >
      {!hist ? (
        status === 'error' ? <ErrorBlock message={error ?? 'Unavailable'} /> : <LoadingBlock />
      ) : showFigure ? (
        <figure>
          <img src={HIST_FIGURE.file} alt={HIST_FIGURE.title} className="mx-auto max-h-[300px] w-auto" />
          <figcaption className="mt-2 text-center text-[11px] text-ink-3">
            Original matplotlib output, notebook cell {HIST_FIGURE.cell} ({METHODOLOGY.histogramSample.numPixels.toLocaleString()} sampled pixels, {METHODOLOGY.histogramSample.bins} bins).
          </figcaption>
        </figure>
      ) : (
        <>
          <VciHistogram bins={hist.data} />
          {isDemo && (
            <div className="mt-3">
              <DemoNote>
                Demo histogram from a synthetic VCI field. The notebook plotted the real distribution but did not print the bin counts — switch to
                “Notebook figure” to see the original, or connect the backend (<span className="font-mono">GET /drought/histogram</span>).
              </DemoNote>
            </div>
          )}
        </>
      )}
    </Panel>
  )
}
