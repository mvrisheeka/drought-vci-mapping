/**
 * Drought API service — the single place the UI gets data from.
 *
 * Live mode (VITE_API_BASE_URL set): every function calls the FastAPI backend.
 * Offline mode / backend unreachable: functions fall back to
 *   - the NOTEBOOK SNAPSHOT (real recorded notebook outputs) where one exists, or
 *   - DEMO data (synthetic) for things the notebook never printed (rasters, pixels, histogram bins).
 * Every return value is wrapped in `Sourced<T>` so the UI can label it honestly.
 *
 * Endpoint contract: see /BACKEND_CONTRACT.md at the repo root.
 */
import { apiClient, ApiError } from './apiClient'
import { isApiConfigured, API_BASE_URL } from './config'
import { getDemoRaster } from './demoRaster'
import { NOTEBOOK_NDVI_SERIES, NOTEBOOK_PROVENANCE, NOTEBOOK_STATISTICS } from '../data/notebookSnapshot'
import { demoHistogram, demoPixelInfo } from '../data/mockDroughtData'
import { METHODOLOGY } from '../config/methodology'
import { STUDY_AREAS } from '../config/studyAreas'
import type {
  AnalysisParams,
  AnalysisResult,
  BackendStatus,
  DownloadArtifact,
  DroughtStatistics,
  HistogramBin,
  MapLayerDescriptor,
  NDVIRecord,
  PixelInfo,
  Sourced,
} from '../types/drought'

export class NotAvailableError extends Error {}

function areaFor(district: string) {
  const area = STUDY_AREAS.find((a) => a.district === district)
  if (!area) throw new NotAvailableError(`No study area configured for ${district}`)
  return area
}

/** True when the request matches what the notebook actually computed. */
function snapshotCovers(p: Pick<AnalysisParams, 'district' | 'year'> & Partial<AnalysisParams>) {
  return (
    NOTEBOOK_PROVENANCE.districts.includes(p.district) &&
    NOTEBOOK_PROVENANCE.availableYears.includes(p.year) &&
    (p.startYear ?? METHODOLOGY.historicalStart) === METHODOLOGY.historicalStart &&
    (p.endYear ?? METHODOLOGY.historicalEnd) === METHODOLOGY.historicalEnd
  )
}

/** Try live, otherwise run the fallback and annotate why. */
async function withFallback<T>(live: () => Promise<T>, liveNote: string, fallback: (reason: string) => Promise<Sourced<T>>): Promise<Sourced<T>> {
  if (!isApiConfigured) return fallback('Backend not configured')
  try {
    return { data: await live(), source: 'live', note: liveNote }
  } catch (err) {
    const reason = err instanceof ApiError ? err.message : 'Backend error'
    return fallback(reason)
  }
}

export const droughtApi = {
  async getBackendStatus(): Promise<BackendStatus> {
    if (!isApiConfigured) {
      return { configured: false, reachable: false, baseUrl: null, message: 'No backend configured — using notebook snapshot and demo layers.' }
    }
    try {
      await apiClient.get<unknown>('/health')
      return { configured: true, reachable: true, baseUrl: API_BASE_URL, message: 'Connected to analysis backend.' }
    } catch (err) {
      return { configured: true, reachable: false, baseUrl: API_BASE_URL, message: err instanceof Error ? err.message : 'Backend unreachable' }
    }
  },

  /** GET /drought/statistics?district=&year= */
  getStatistics(p: AnalysisParams): Promise<Sourced<DroughtStatistics>> {
    return withFallback(
      () => apiClient.get<DroughtStatistics>('/drought/statistics', { district: p.district, year: p.year, startYear: p.startYear, endYear: p.endYear }),
      'Computed by backend (Earth Engine)',
      async (reason) => {
        if (!snapshotCovers(p)) throw new NotAvailableError(`${reason}. The notebook only has results for Jodhpur ${METHODOLOGY.analysisYear} (baseline ${METHODOLOGY.historicalStart}–${METHODOLOGY.historicalEnd}).`)
        return { data: NOTEBOOK_STATISTICS, source: 'notebook', note: NOTEBOOK_PROVENANCE.statistics }
      },
    )
  },

  /** GET /drought/ndvi?district=&startYear=&endYear= */
  getNdviSeries(p: AnalysisParams): Promise<Sourced<NDVIRecord[]>> {
    return withFallback(
      () => apiClient.get<NDVIRecord[]>('/drought/ndvi', { district: p.district, startYear: p.startYear, endYear: p.endYear }),
      'Computed by backend (Earth Engine)',
      async (reason) => {
        if (!NOTEBOOK_PROVENANCE.districts.includes(p.district)) throw new NotAvailableError(reason)
        const data = NOTEBOOK_NDVI_SERIES.filter((r) => r.year >= p.startYear && r.year <= p.endYear)
        return { data, source: 'notebook', note: NOTEBOOK_PROVENANCE.ndvi }
      },
    )
  },

  /** GET /drought/histogram?district=&year=  (VCI sample histogram, notebook cell 46) */
  getVciHistogram(p: AnalysisParams): Promise<Sourced<HistogramBin[]>> {
    return withFallback(
      () => apiClient.get<HistogramBin[]>('/drought/histogram', { district: p.district, year: p.year, bins: METHODOLOGY.histogramSample.bins }),
      `Sample of ${METHODOLOGY.histogramSample.numPixels} pixels (backend)`,
      async () => ({
        data: demoHistogram(await getDemoRaster(areaFor(p.district))),
        source: 'demo',
        note: 'Synthetic VCI field — the notebook plotted this histogram but did not print the bin values.',
      }),
    )
  },

  /** GET /drought/map?district=&year=  → layer descriptors (tile URLs, image overlays…) */
  async getMapLayers(p: AnalysisParams): Promise<MapLayerDescriptor[]> {
    const fallback = async (): Promise<Sourced<MapLayerDescriptor[]>> => ({
      source: 'demo',
      data: [
        { id: 'severity', label: 'Drought Severity', kind: 'demo', opacity: 0.85, source: 'demo', description: 'Smoothed VCI classes (focal mode 3×3)' },
        { id: 'vci', label: `VCI ${p.year}`, kind: 'demo', opacity: 0.85, source: 'demo', description: 'Continuous Vegetation Condition Index, 0–1' },
        { id: 'ndvi', label: `NDVI ${p.year}`, kind: 'demo', opacity: 0.85, source: 'demo', description: `Mean NDVI of ${p.year} composites, 0–1` },
        { id: 'boundary', label: 'District Boundary', kind: 'geojson', url: areaFor(p.district).boundaryUrl, opacity: 1, source: 'notebook', description: METHODOLOGY.boundarySource },
      ],
    })
    const res = await withFallback(() => apiClient.get<MapLayerDescriptor[]>('/drought/map', { district: p.district, year: p.year }), 'Backend map layers', fallback)
    return res.data
  },

  /** GET /drought/pixel?lat=&lon=&district=&year= */
  getPixelInfo(lat: number, lon: number, p: AnalysisParams): Promise<Sourced<PixelInfo | null>> {
    return withFallback(
      () => apiClient.get<PixelInfo | null>('/drought/pixel', { lat, lon, district: p.district, year: p.year, startYear: p.startYear, endYear: p.endYear }),
      'Sampled from Earth Engine at 250 m',
      async () => ({
        data: demoPixelInfo(await getDemoRaster(areaFor(p.district)), lat, lon),
        source: 'demo',
        note: 'Synthetic pixel values — not from MODIS.',
      }),
    )
  },

  /** GET /drought/downloads?district=&year= */
  async getDownloads(p: AnalysisParams): Promise<DownloadArtifact[]> {
    const res = await withFallback(
      () => apiClient.get<DownloadArtifact[]>('/drought/downloads', { district: p.district, year: p.year }),
      'Backend artifacts',
      async () => {
        const covered = snapshotCovers(p)
        const client = covered ? ('client' as const) : ('unavailable' as const)
        return {
          source: 'notebook',
          data: [
            { id: 'area-csv', format: 'csv', fileName: 'VCI_Drought_Area_Statistics.csv', label: 'Download CSV', description: 'Area and percentage per drought class', notebookCell: 38, availability: client, source: 'notebook' },
            { id: 'ndvi-csv', format: 'csv', fileName: 'Annual_NDVI_Statistics.csv', label: 'Annual NDVI CSV', description: 'Mean annual NDVI 2015–2023', notebookCell: 49, availability: client, source: 'notebook' },
            { id: 'excel', format: 'xlsx', fileName: 'Final_Drought_Results.xlsx', label: 'Download Excel', description: 'NDVI + Drought Statistics sheets', notebookCell: 51, availability: 'unavailable', source: 'notebook' },
            { id: 'geotiff', format: 'geotiff', fileName: 'VCI_Drought_Map.tif', label: 'Download GeoTIFF', description: 'Smoothed drought class raster, 250 m', notebookCell: 48, availability: 'unavailable', source: 'notebook' },
            { id: 'report', format: 'report', fileName: 'Drought_Report.html', label: 'Generate Report', description: 'Printable summary of results & method', notebookCell: 50, availability: client, source: 'notebook' },
          ] satisfies DownloadArtifact[],
        }
      },
    )
    return res.data
  },

  /** POST /drought/analyze — runs (or re-runs) the full pipeline. */
  async runAnalysis(p: AnalysisParams): Promise<AnalysisResult> {
    if (isApiConfigured) {
      try {
        return await apiClient.post<AnalysisResult>('/drought/analyze', p)
      } catch {
        /* fall through to assembling from individual (fallback-aware) calls */
      }
    }
    const [statistics, ndviSeries, histogram, layers] = await Promise.all([
      droughtApi.getStatistics(p),
      droughtApi.getNdviSeries(p),
      droughtApi.getVciHistogram(p),
      droughtApi.getMapLayers(p),
    ])
    return { params: p, statistics, ndviSeries, histogram, layers, generatedAt: new Date().toISOString() }
  },
}
