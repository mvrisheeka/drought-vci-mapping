/**
 * DEMO DATA — synthetic, generated in the browser.
 *
 * Nothing in this file is an analysis result. It exists so the map, pixel
 * inspector and histogram have something to render before the backend can serve
 * real rasters. The synthetic field is pushed through the real VCI formula and
 * class thresholds (utils/vci.ts) so the UI logic is exercised end-to-end, but
 * the spatial pattern itself is invented.
 */
import type { HistogramBin, PixelInfo } from '../types/drought'
import { CLASS_BY_ID, METHODOLOGY } from '../config/methodology'
import { classifyVCI, computeVCI } from '../utils/vci'

export interface DemoRaster {
  width: number
  height: number
  /** [[south, west], [north, east]] */
  bounds: [[number, number], [number, number]]
  cellDeg: number
  ndviMin: Float32Array
  ndviMax: Float32Array
  ndviCurrent: Float32Array
  vci: Float32Array // NaN outside the district
  classSmoothed: Uint8Array // 0 outside, 1..4 inside
}

type Ring = [number, number][] // [lon, lat]

// ---------- deterministic value noise ----------
function hash(x: number, y: number, seed: number) {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}
function smooth(t: number) {
  return t * t * (3 - 2 * t)
}
function valueNoise(x: number, y: number, seed: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = smooth(x - xi)
  const yf = smooth(y - yi)
  const a = hash(xi, yi, seed)
  const b = hash(xi + 1, yi, seed)
  const c = hash(xi, yi + 1, seed)
  const d = hash(xi + 1, yi + 1, seed)
  return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf
}
function fbm(x: number, y: number, seed: number) {
  let amp = 0.5
  let freq = 1
  let sum = 0
  for (let o = 0; o < 4; o++) {
    sum += amp * (valueNoise(x * freq, y * freq, seed + o) * 2 - 1)
    amp *= 0.5
    freq *= 2
  }
  return sum // ≈ [-1, 1]
}

function pointInRings(lon: number, lat: number, rings: Ring[]) {
  let inside = false
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i]
      const [xj, yj] = ring[j]
      if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
    }
  }
  return inside
}

/** Build a synthetic ~1 km raster clipped to the real district boundary. */
export function generateDemoRaster(rings: Ring[], cellDeg = 0.01): DemoRaster {
  let w = Infinity
  let s = Infinity
  let e = -Infinity
  let n = -Infinity
  for (const r of rings)
    for (const [lon, lat] of r) {
      w = Math.min(w, lon)
      e = Math.max(e, lon)
      s = Math.min(s, lat)
      n = Math.max(n, lat)
    }
  const width = Math.ceil((e - w) / cellDeg)
  const height = Math.ceil((n - s) / cellDeg)
  const size = width * height
  const ndviMin = new Float32Array(size)
  const ndviMax = new Float32Array(size)
  const ndviCurrent = new Float32Array(size)
  const vci = new Float32Array(size).fill(Number.NaN)
  const rawClass = new Uint8Array(size)

  for (let row = 0; row < height; row++) {
    const lat = n - (row + 0.5) * cellDeg
    for (let col = 0; col < width; col++) {
      const lon = w + (col + 0.5) * cellDeg
      if (!pointInRings(lon, lat, rings)) continue
      const i = row * width + col
      const g = (lon - w) / (e - w) // west → east
      const nx = col / 28
      const ny = row / 28
      const max = Math.min(0.85, Math.max(0.18, 0.3 + 0.22 * g + 0.12 * fbm(nx, ny, 11)))
      const min = Math.max(0.02, 0.05 + 0.04 * g + 0.02 * fbm(nx, ny, 23))
      const targetVci = Math.min(0.98, Math.max(0.02, 0.34 + 0.42 * fbm(nx * 1.4, ny * 1.4, 37) + 0.08 * (g - 0.5)))
      const current = min + targetVci * (max - min)
      ndviMin[i] = min
      ndviMax[i] = max
      ndviCurrent[i] = current
      vci[i] = computeVCI(current, min, max)
      rawClass[i] = classifyVCI(vci[i])
    }
  }

  // 3×3 focal mode, mirroring the notebook's spatial smoothing step.
  const classSmoothed = new Uint8Array(size)
  const counts = new Uint8Array(5)
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const i = row * width + col
      if (!rawClass[i]) continue
      counts.fill(0)
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const r = row + dy
          const c = col + dx
          if (r < 0 || c < 0 || r >= height || c >= width) continue
          counts[rawClass[r * width + c]]++
        }
      let best = rawClass[i]
      for (let k = 1; k <= 4; k++) if (counts[k] > counts[best]) best = k
      classSmoothed[i] = best
    }
  }

  return { width, height, bounds: [[s, w], [s + height * cellDeg, w + width * cellDeg]], cellDeg, ndviMin, ndviMax, ndviCurrent, vci, classSmoothed }
}

export function demoPixelInfo(r: DemoRaster, lat: number, lon: number): PixelInfo | null {
  const col = Math.floor((lon - r.bounds[0][1]) / r.cellDeg)
  const row = Math.floor((r.bounds[1][0] - lat) / r.cellDeg)
  if (col < 0 || row < 0 || col >= r.width || row >= r.height) return null
  const i = row * r.width + col
  if (Number.isNaN(r.vci[i])) return null
  const classId = classifyVCI(r.vci[i])
  return {
    latitude: lat,
    longitude: lon,
    ndvi: r.ndviCurrent[i],
    historicalMin: r.ndviMin[i],
    historicalMax: r.ndviMax[i],
    vci: r.vci[i],
    classId,
    classification: CLASS_BY_ID[classId].name,
  }
}

/** Histogram of the synthetic VCI field, same bin count as notebook cell 46. */
export function demoHistogram(r: DemoRaster, bins: number = METHODOLOGY.histogramSample.bins): HistogramBin[] {
  const values: number[] = []
  for (const v of r.vci) if (!Number.isNaN(v)) values.push(v)
  let lo = Infinity
  let hi = -Infinity
  for (const v of values) {
    lo = Math.min(lo, v)
    hi = Math.max(hi, v)
  }
  const width = (hi - lo) / bins
  const out: HistogramBin[] = Array.from({ length: bins }, (_, k) => ({ x0: lo + k * width, x1: lo + (k + 1) * width, count: 0 }))
  for (const v of values) out[Math.min(bins - 1, Math.floor((v - lo) / width))].count++
  return out
}
