/**
 * NOTEBOOK SNAPSHOT — real values, transcribed verbatim from the recorded outputs
 * of the executed `drought_vci_mapping.ipynb` (Jodhpur, 2023, baseline 2015–2023).
 *
 * These are NOT live results: they are a static copy of what the notebook printed
 * when it was last run. Once the FastAPI backend is available the same objects are
 * fetched from the API instead (see services/droughtApi.ts).
 *
 * Cell numbers are 0-indexed positions in the notebook.
 */
import type { DroughtClassArea, DroughtStatistics, NDVIRecord } from '../types/drought'

/** Cell 33/35/37 — area per smoothed class, ee.Image.pixelArea() at 250 m. */
const classAreas: DroughtClassArea[] = [
  { classId: 1, className: 'Extreme Drought', areaKm2: 580.4443121670979, percentage: 2.545602 },
  { classId: 2, className: 'Moderate Drought', areaKm2: 17303.64286399098, percentage: 75.887004 },
  { classId: 3, className: 'Mild Drought', areaKm2: 4849.8770626812875, percentage: 21.269662 },
  { classId: 4, className: 'Healthy Vegetation', areaKm2: 67.88831972460187, percentage: 0.297732 },
]

/** Cell 24 — minMax + mean + stdDev of (unsmoothed) VCI over the district, scale 250 m. */
const vciStats = {
  VCI_max: 0.8693540297246639,
  VCI_mean: 0.34146762304464906,
  VCI_min: 0.07575018801186745,
  VCI_stdDev: 0.08526831632533682,
}

export const NOTEBOOK_STATISTICS: DroughtStatistics = {
  meanVCI: vciStats.VCI_mean,
  minVCI: vciStats.VCI_min,
  maxVCI: vciStats.VCI_max,
  stdDevVCI: vciStats.VCI_stdDev,
  // Derived only by summing the class percentages printed in cell 37.
  droughtAffectedPercentage: classAreas
    .filter((c) => c.classId !== 4)
    .reduce((s, c) => s + c.percentage, 0),
  healthyPercentage: classAreas.find((c) => c.classId === 4)!.percentage,
  totalAreaKm2: 22801.85255856397, // cell 36
  classAreas,
}

/** Cell 41 — mean of annual-mean NDVI over the district, per year. */
export const NOTEBOOK_NDVI_SERIES: NDVIRecord[] = [
  { year: 2015, meanNDVI: 0.225706 },
  { year: 2016, meanNDVI: 0.233914 },
  { year: 2017, meanNDVI: 0.23991 },
  { year: 2018, meanNDVI: 0.217744 },
  { year: 2019, meanNDVI: 0.230332 },
  { year: 2020, meanNDVI: 0.244882 },
  { year: 2021, meanNDVI: 0.234661 },
  { year: 2022, meanNDVI: 0.251701 },
  { year: 2023, meanNDVI: 0.266496 },
]

export const NOTEBOOK_PROVENANCE = {
  statistics: 'Notebook cells 24, 33–37 (reduceRegion @ 250 m)',
  ndvi: 'Notebook cell 41 (annual mean NDVI, reduceRegion @ 250 m)',
  /** Years for which the notebook produced VCI results. */
  availableYears: [2023],
  districts: ['Jodhpur'],
}

/** Static figures exported from the notebook's embedded PNG outputs. */
export const NOTEBOOK_FIGURES = [
  { file: '/notebook-figures/fig1_study_area.png', title: 'Study Area: Jodhpur District, Rajasthan', cell: 5 },
  { file: '/notebook-figures/fig2_ndvi_timeseries.png', title: 'Mean Annual NDVI (2015–2023)', cell: 42 },
  { file: '/notebook-figures/fig3_drought_area_bar.png', title: 'Area under Different Drought Classes', cell: 44 },
  { file: '/notebook-figures/fig4_drought_pie.png', title: 'Percentage Distribution of Drought Classes', cell: 45 },
  { file: '/notebook-figures/fig5_vci_histogram.png', title: 'Distribution of Vegetation Condition Index', cell: 46 },
] as const
