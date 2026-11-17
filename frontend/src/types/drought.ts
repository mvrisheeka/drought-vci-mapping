/**
 * Domain types shared by the UI and the API layer.
 *
 * These mirror the objects produced by `drought_vci_mapping.ipynb` and are the
 * contract a future FastAPI backend should return (see `services/droughtApi.ts`
 * and `BACKEND_CONTRACT.md`).
 */

/**
 * Where a piece of data came from. Every value shown in the UI carries one of these.
 *  - live:     returned by the backend API (Earth Engine computed on request)
 *  - notebook: transcribed from the recorded outputs of the executed notebook
 *  - demo:     synthetic, generated in the browser for layout/demo purposes only
 */
export type DataSource = 'live' | 'notebook' | 'demo'

export interface Sourced<T> {
  data: T
  source: DataSource
  /** Human-readable provenance, e.g. "Notebook cell 33 (reduceRegion, scale 250 m)". */
  note?: string
}

/** Class codes used in the notebook: ee.Image(0).where(...) → 1..4 (cell 26). */
export type DroughtClassId = 1 | 2 | 3 | 4

export type DroughtClassName =
  | 'Extreme Drought'
  | 'Moderate Drought'
  | 'Mild Drought'
  | 'Healthy Vegetation'

export interface DroughtClassArea {
  classId: DroughtClassId
  className: DroughtClassName
  areaKm2: number
  percentage: number
}

export interface DroughtStatistics {
  meanVCI: number
  minVCI: number
  maxVCI: number
  stdDevVCI: number
  /** Extreme + Moderate + Mild classes (smoothed class map). */
  droughtAffectedPercentage: number
  healthyPercentage: number
  totalAreaKm2: number
  classAreas: DroughtClassArea[]
}

export interface NDVIRecord {
  year: number
  meanNDVI: number
}

export interface PixelInfo {
  latitude: number
  longitude: number
  /** Mean NDVI of the analysis year (e.g. 2023) at this pixel. */
  ndvi: number
  /** Minimum NDVI over all composites in the historical period. */
  historicalMin: number
  /** Maximum NDVI over all composites in the historical period. */
  historicalMax: number
  vci: number
  classId: DroughtClassId
  classification: DroughtClassName
}

export interface HistogramBin {
  /** Inclusive lower edge. */
  x0: number
  /** Exclusive upper edge (inclusive for the final bin). */
  x1: number
  count: number
}

export interface StudyArea {
  id: string
  district: string
  state: string
  /** GeoJSON URL for the administrative boundary. */
  boundaryUrl: string
  center: [number, number]
  bounds: [[number, number], [number, number]]
}

export type MapLayerId = 'severity' | 'vci' | 'ndvi' | 'boundary'

/**
 * How a map layer is delivered.
 *  - tile:     XYZ tile template (e.g. Earth Engine `getMapId()['tile_fetcher'].url_format`)
 *  - image:    a single georeferenced PNG + bounds (e.g. EE `getThumbURL`)
 *  - geojson:  vector features (boundary)
 *  - demo:     synthetic raster rendered in the browser
 */
export type MapLayerKind = 'tile' | 'image' | 'geojson' | 'demo'

export interface MapLayerDescriptor {
  id: MapLayerId
  label: string
  kind: MapLayerKind
  url?: string
  bounds?: [[number, number], [number, number]]
  opacity: number
  source: DataSource
  description: string
}

export interface AnalysisParams {
  district: string
  year: number
  startYear: number
  endYear: number
  layer: MapLayerId
}

export interface AnalysisResult {
  params: AnalysisParams
  statistics: Sourced<DroughtStatistics>
  ndviSeries: Sourced<NDVIRecord[]>
  histogram: Sourced<HistogramBin[]>
  layers: MapLayerDescriptor[]
  generatedAt: string
}

export type DownloadFormat = 'csv' | 'xlsx' | 'geotiff' | 'report'

export interface DownloadArtifact {
  id: string
  format: DownloadFormat
  /** Filename produced by the notebook. */
  fileName: string
  label: string
  description: string
  /** Notebook cell that produces the file. */
  notebookCell: number
  /** Present when the file can actually be downloaded. */
  url?: string
  /** 'client' = built in the browser from notebook outputs. */
  availability: 'backend' | 'client' | 'unavailable'
  source: DataSource
}

export interface BackendStatus {
  configured: boolean
  reachable: boolean
  baseUrl: string | null
  message: string
}
