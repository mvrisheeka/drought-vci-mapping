import type { StudyArea } from '../types/drought'

/**
 * Study areas known to the frontend. Jodhpur is the only district processed by the
 * notebook. Its boundary is the real GADM 4.1 polygon (record 499 of
 * gadm41_IND_2.shp, as selected in notebook cell 4), simplified for the web.
 */
export const STUDY_AREAS: StudyArea[] = [
  {
    id: 'jodhpur',
    district: 'Jodhpur',
    state: 'Rajasthan',
    boundaryUrl: '/data/jodhpur_boundary.geojson',
    center: [26.748, 72.789], // geemap centerObject() centre printed in notebook cell 7
    bounds: [
      [25.8518, 71.7894],
      [27.6154, 73.8712],
    ],
  },
]

export const DEFAULT_AREA = STUDY_AREAS[0]
