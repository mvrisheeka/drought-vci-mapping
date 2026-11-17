import { CLASS_BY_ID } from '../config/methodology'
import type { DroughtClassId } from '../types/drought'

/** VCI = (NDVI_current − NDVI_min) / (NDVI_max − NDVI_min)   — notebook cell 20. */
export function computeVCI(current: number, min: number, max: number): number {
  const range = max - min
  if (range === 0) return Number.NaN
  return (current - min) / range
}

/** Same thresholds and order as the `.where()` chain in notebook cell 26. */
export function classifyVCI(vci: number): DroughtClassId {
  if (vci < 0.2) return 1
  if (vci < 0.4) return 2
  if (vci < 0.6) return 3
  return 4
}

export function classOf(vci: number) {
  return CLASS_BY_ID[classifyVCI(vci)]
}

/** Linear interpolation across a list of hex colours, t in [0, 1]. */
export function rampColor(palette: string[], t: number): [number, number, number] {
  const clamped = Math.min(1, Math.max(0, t))
  const pos = clamped * (palette.length - 1)
  const i = Math.min(palette.length - 2, Math.floor(pos))
  const f = pos - i
  const a = hexToRgb(palette[i])
  const b = hexToRgb(palette[i + 1])
  return [0, 1, 2].map((k) => Math.round(a[k] + (b[k] - a[k]) * f)) as [number, number, number]
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
