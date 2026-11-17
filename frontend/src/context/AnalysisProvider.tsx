import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnalysisContext, DEFAULT_PARAMS, type AnalysisContextValue, type RunStatus } from './analysisContext'
import { droughtApi } from '../services/droughtApi'
import { isApiConfigured } from '../services/config'
import type { AnalysisParams, AnalysisResult, BackendStatus } from '../types/drought'

/** Minimum spinner time in offline mode so "Run Analysis" visibly does something. */
const OFFLINE_RUN_DELAY_MS = 650

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useState<AnalysisParams>(DEFAULT_PARAMS)
  const [draft, setDraftState] = useState<AnalysisParams>(DEFAULT_PARAMS)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [status, setStatus] = useState<RunStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [backend, setBackend] = useState<BackendStatus | null>(null)
  const runId = useRef(0)

  const execute = useCallback(async (p: AnalysisParams, userTriggered: boolean) => {
    const id = ++runId.current
    setStatus('loading')
    setError(null)
    try {
      const [res] = await Promise.all([
        droughtApi.runAnalysis(p),
        userTriggered && !isApiConfigured ? new Promise((r) => setTimeout(r, OFFLINE_RUN_DELAY_MS)) : null,
      ])
      if (id !== runId.current) return
      setResult(res)
      setParams(p)
      setStatus('ready')
      if (userTriggered && res.statistics.source !== 'live') {
        setNotice('Backend not connected — loaded the recorded notebook results (Jodhpur 2023). Map rasters and pixel values are demo data.')
      }
    } catch (err) {
      if (id !== runId.current) return
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Analysis failed')
    }
  }, [])

  useEffect(() => {
    droughtApi.getBackendStatus().then(setBackend)
    void execute(DEFAULT_PARAMS, false)
  }, [execute])

  const value = useMemo<AnalysisContextValue>(
    () => ({
      params,
      draft,
      setDraft: (patch) => setDraftState((d) => ({ ...d, ...patch })),
      setLayer: (layer) => {
        setDraftState((d) => ({ ...d, layer }))
        setParams((p) => ({ ...p, layer }))
      },
      result,
      status,
      error,
      notice,
      dismissNotice: () => setNotice(null),
      backend,
      run: () => execute(draft, true),
      reset: () => {
        setDraftState(DEFAULT_PARAMS)
        setNotice(null)
        void execute(DEFAULT_PARAMS, false)
      },
    }),
    [params, draft, result, status, error, notice, backend, execute],
  )

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>
}
