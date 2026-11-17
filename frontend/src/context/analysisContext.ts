import { createContext } from 'react'
import { METHODOLOGY } from '../config/methodology'
import { DEFAULT_AREA } from '../config/studyAreas'
import type { AnalysisParams, AnalysisResult, BackendStatus } from '../types/drought'

export const DEFAULT_PARAMS: AnalysisParams = {
  district: DEFAULT_AREA.district,
  year: METHODOLOGY.analysisYear,
  startYear: METHODOLOGY.historicalStart,
  endYear: METHODOLOGY.historicalEnd,
  layer: 'severity',
}

export type RunStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface AnalysisContextValue {
  /** Parameters of the result currently displayed. */
  params: AnalysisParams
  /** Parameters being edited in the control panel (applied on Run). */
  draft: AnalysisParams
  setDraft: (patch: Partial<AnalysisParams>) => void
  /** Active map layer — switches immediately, no re-run needed. */
  setLayer: (layer: AnalysisParams['layer']) => void
  result: AnalysisResult | null
  status: RunStatus
  error: string | null
  notice: string | null
  dismissNotice: () => void
  backend: BackendStatus | null
  run: () => Promise<void>
  reset: () => void
}

export const AnalysisContext = createContext<AnalysisContextValue | null>(null)
