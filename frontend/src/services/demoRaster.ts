import { generateDemoRaster, type DemoRaster } from '../data/mockDroughtData'
import type { StudyArea } from '../types/drought'

type Geometry = { type: 'Polygon'; coordinates: [number, number][][] } | { type: 'MultiPolygon'; coordinates: [number, number][][][] }
export interface BoundaryCollection {
  type: 'FeatureCollection'
  features: { type: 'Feature'; properties: Record<string, string>; geometry: Geometry }[]
}

const boundaryCache = new Map<string, Promise<BoundaryCollection>>()
const rasterCache = new Map<string, Promise<DemoRaster>>()

export function loadBoundary(area: StudyArea): Promise<BoundaryCollection> {
  if (!boundaryCache.has(area.id)) {
    boundaryCache.set(
      area.id,
      fetch(area.boundaryUrl).then((r) => {
        if (!r.ok) throw new Error(`Could not load boundary for ${area.district}`)
        return r.json() as Promise<BoundaryCollection>
      }),
    )
  }
  return boundaryCache.get(area.id)!
}

/** Synthetic raster clipped to the real boundary; generated once per area. */
export function getDemoRaster(area: StudyArea): Promise<DemoRaster> {
  if (!rasterCache.has(area.id)) {
    rasterCache.set(
      area.id,
      loadBoundary(area).then((fc) => {
        const rings: [number, number][][] = []
        for (const f of fc.features) {
          if (f.geometry.type === 'Polygon') rings.push(...f.geometry.coordinates)
          else for (const poly of f.geometry.coordinates) rings.push(...poly)
        }
        return generateDemoRaster(rings)
      }),
    )
  }
  return rasterCache.get(area.id)!
}
