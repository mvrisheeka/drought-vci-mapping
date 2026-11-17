import type { DroughtClassId, DroughtClassName } from '../types/drought'

/**
 * Methodology constants transcribed from `drought_vci_mapping.ipynb`.
 * The notebook is the source of truth; cell numbers are 0-indexed.
 */
export const METHODOLOGY = {
  dataset: 'MODIS/061/MOD13Q1',
  datasetLabel: 'MODIS Terra MOD13Q1 v6.1 — 16-day NDVI',
  band: 'NDVI',
  scaleFactor: 0.0001, // cell 9
  resolutionM: 250, // reduceRegion / export scale
  historicalStart: 2015, // cell 8 filterDate("2015-01-01", "2023-12-31")
  historicalEnd: 2023,
  analysisYear: 2023, // cell 16
  compositeCount: 207, // cell 8 output
  boundarySource: 'GADM 4.1 level-2 (gadm41_IND_2.shp)',
  district: 'Jodhpur',
  state: 'Rajasthan',
  smoothing: 'focal_mode, radius 1 pixel (3×3)', // cell 29
  histogramSample: { numPixels: 5000, bins: 25 }, // cell 46
} as const

export interface DroughtClassDef {
  id: DroughtClassId
  name: DroughtClassName
  short: string
  /** Inclusive lower bound (null = -∞). */
  min: number | null
  /** Exclusive upper bound (null = +∞). */
  max: number | null
  range: string
  color: string
  meaning: string
}

/** Classes and colours exactly as in notebook cells 26–27 and 35. */
export const DROUGHT_CLASSES: readonly DroughtClassDef[] = [
  {
    id: 1,
    name: 'Extreme Drought',
    short: 'Extreme',
    min: null,
    max: 0.2,
    range: 'VCI < 0.2',
    color: '#8B0000',
    meaning: 'Vegetation near the lowest level recorded for the pixel.',
  },
  {
    id: 2,
    name: 'Moderate Drought',
    short: 'Moderate',
    min: 0.2,
    max: 0.4,
    range: '0.2 ≤ VCI < 0.4',
    color: '#FF4500',
    meaning: 'Clearly below the pixel’s typical vegetation condition.',
  },
  {
    id: 3,
    name: 'Mild Drought',
    short: 'Mild',
    min: 0.4,
    max: 0.6,
    range: '0.4 ≤ VCI < 0.6',
    color: '#FFD700',
    meaning: 'Slightly stressed; around the middle of the historical range.',
  },
  {
    id: 4,
    name: 'Healthy Vegetation',
    short: 'Healthy',
    min: 0.6,
    max: null,
    range: 'VCI ≥ 0.6',
    color: '#228B22',
    meaning: 'Vegetation in the upper part of its historical range.',
  },
] as const

export const CLASS_BY_ID: Record<DroughtClassId, DroughtClassDef> = {
  1: DROUGHT_CLASSES[0],
  2: DROUGHT_CLASSES[1],
  3: DROUGHT_CLASSES[2],
  4: DROUGHT_CLASSES[3],
}

/** Continuous palettes used by the notebook's geemap layers. */
export const VCI_PALETTE = ['#8B0000', '#FF0000', '#FFA500', '#FFFF00', '#90EE90', '#008000'] // cell 21
export const NDVI_PALETTE = ['#A52A2A', '#FFFF00', '#90EE90', '#006400'] // cell 10
