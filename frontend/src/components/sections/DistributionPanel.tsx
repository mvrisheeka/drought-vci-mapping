import { useAnalysis } from '../../hooks/useAnalysis'
import { Panel } from '../common/Panel'
import { SourceBadge } from '../common/SourceBadge'
import { ErrorBlock, LoadingBlock } from '../common/States'
import { DroughtClassBarChart } from '../charts/DroughtClassBarChart'
import { ClassShareBar } from '../charts/ClassShareBar'
import { METHODOLOGY } from '../../config/methodology'

export function DistributionPanel({ id }: { id?: string }) {
  const { result, status, error, params } = useAnalysis()
  const stats = result?.statistics
  return (
    <Panel
      id={id}
      title="Drought Class Distribution"
      subtitle={`Area per class after spatial smoothing (${METHODOLOGY.smoothing}) · ${params.district} ${params.year}`}
      actions={stats && <SourceBadge source={stats.source} note={stats.note} />}
    >
      {!stats ? (
        status === 'error' ? <ErrorBlock message={error ?? 'Unavailable'} /> : <LoadingBlock />
      ) : (
        <>
          <DroughtClassBarChart data={stats.data.classAreas} />
          <div className="mt-4 border-t border-line pt-4">
            <ClassShareBar data={stats.data.classAreas} />
          </div>
        </>
      )}
    </Panel>
  )
}
