import type { DemoRaster } from '../data/mockDroughtData'
import { CLASS_BY_ID, NDVI_PALETTE, VCI_PALETTE } from '../config/methodology'
import { hexToRgb, rampColor } from './vci'
import type { DroughtClassId, MapLayerId } from '../types/drought'

const cache = new WeakMap<DemoRaster, Map<MapLayerId, string>>()

/** Render one band of the demo raster to a PNG data URL using the notebook's palettes. */
export function renderDemoLayer(r: DemoRaster, layer: Exclude<MapLayerId, 'boundary'>): string {
  let perRaster = cache.get(r)
  if (!perRaster) cache.set(r, (perRaster = new Map()))
  const hit = perRaster.get(layer)
  if (hit) return hit

  const canvas = document.createElement('canvas')
  canvas.width = r.width
  canvas.height = r.height
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(r.width, r.height)
  const classRgb = ([1, 2, 3, 4] as DroughtClassId[]).map((id) => hexToRgb(CLASS_BY_ID[id].color))

  for (let i = 0; i < r.width * r.height; i++) {
    if (Number.isNaN(r.vci[i])) continue
    let rgb: [number, number, number]
    if (layer === 'severity') rgb = classRgb[r.classSmoothed[i] - 1]
    else if (layer === 'vci') rgb = rampColor(VCI_PALETTE, r.vci[i])
    else rgb = rampColor(NDVI_PALETTE, r.ndviCurrent[i]) // NDVI vis: min 0, max 1
    img.data[i * 4] = rgb[0]
    img.data[i * 4 + 1] = rgb[1]
    img.data[i * 4 + 2] = rgb[2]
    img.data[i * 4 + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  const url = canvas.toDataURL('image/png')
  perRaster.set(layer, url)
  return url
}
