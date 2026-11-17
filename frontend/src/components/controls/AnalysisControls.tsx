import { Play, RotateCcw } from 'lucide-react'
import { useAnalysis } from '../../hooks/useAnalysis'
import { Button, Field, Select } from '../common/Controls'
import { STUDY_AREAS } from '../../config/studyAreas'
import { METHODOLOGY } from '../../config/methodology'
import { NOTEBOOK_PROVENANCE } from '../../data/notebookSnapshot'
import { isApiConfigured } from '../../services/config'
import type { MapLayerId } from '../../types/drought'

const YEARS = Array.from({ length: METHODOLOGY.historicalEnd - METHODOLOGY.historicalStart + 1 }, (_, i) => METHODOLOGY.historicalStart + i)

const LAYER_OPTIONS: { value: MapLayerId; label: string }[] = [
  { value: 'severity', label: 'Drought Severity' },
  { value: 'vci', label: 'VCI (continuous)' },
  { value: 'ndvi', label: 'NDVI (analysis year)' },
]

/** Without a backend, only combinations the notebook actually computed are selectable. */
const yearAvailable = (y: number) => isApiConfigured || NOTEBOOK_PROVENANCE.availableYears.includes(y)

export function AnalysisControls({ layout = 'bar' }: { layout?: 'bar' | 'stack' }) {
  const { draft, setDraft, setLayer, run, reset, status } = useAnalysis()
  const periodLocked = !isApiConfigured
  const grid = layout === 'bar' ? 'grid-cols-2 md:grid-cols-4 xl:grid-cols-[1fr_1fr_1.2fr_1.4fr_auto]' : 'grid-cols-1 sm:grid-cols-2'

  return (
    <div className={`grid items-end gap-3 ${grid}`}>
      <Field label="Study area">
        <Select value={draft.district} onChange={(e) => setDraft({ district: e.target.value })}>
          {STUDY_AREAS.map((a) => (
            <option key={a.id} value={a.district}>
              {a.district}, {a.state}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Analysis year">
        <Select value={draft.year} onChange={(e) => setDraft({ year: Number(e.target.value) })}>
          {[...YEARS].reverse().map((y) => (
            <option key={y} value={y} disabled={!yearAvailable(y)}>
              {y}
              {!yearAvailable(y) ? ' — needs backend' : ''}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Data layer">
        <Select value={draft.layer} onChange={(e) => setLayer(e.target.value as MapLayerId)}>
          {LAYER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </Field>
      <div className={layout === 'bar' ? 'col-span-2 md:col-span-1' : ''}>
      <Field label={periodLocked ? 'Historical period (fixed)' : 'Historical period'}>
        <div className="flex items-center gap-1.5">
          <Select className="flex-1" value={draft.startYear} disabled={periodLocked} onChange={(e) => setDraft({ startYear: Number(e.target.value) })} aria-label="Start year">
            {YEARS.filter((y) => y < draft.endYear).map((y) => (
              <option key={y}>{y}</option>
            ))}
          </Select>
          <span className="text-ink-3">—</span>
          <Select className="flex-1" value={draft.endYear} disabled={periodLocked} onChange={(e) => setDraft({ endYear: Number(e.target.value) })} aria-label="End year">
            {YEARS.filter((y) => y > draft.startYear).map((y) => (
              <option key={y}>{y}</option>
            ))}
          </Select>
        </div>
      </Field>
      </div>
      <div className={`flex gap-2 ${layout === 'bar' ? 'col-span-2 md:col-span-4 xl:col-span-1' : 'col-span-full'}`}>
        <Button variant="primary" icon={<Play className="size-4" />} loading={status === 'loading'} onClick={() => void run()} className="flex-1 xl:flex-none">
          {status === 'loading' ? 'Running…' : 'Run Analysis'}
        </Button>
        <Button icon={<RotateCcw className="size-4" />} onClick={reset} disabled={status === 'loading'}>
          Reset
        </Button>
      </div>
    </div>
  )
}
