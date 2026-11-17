/**
 * Client-side rebuilds of the notebook's tabular outputs, using whatever
 * statistics are loaded (notebook snapshot or live). Column names match the
 * pandas DataFrames written by the notebook (cells 37–38 and 41/49).
 */
import { DROUGHT_CLASSES, METHODOLOGY } from '../config/methodology'
import { fmt, toCsv } from './format'
import type { AnalysisResult } from '../types/drought'

export function areaStatisticsCsv(r: AnalysisResult) {
  return toCsv(
    ['Drought Class', 'Area (sq km)', 'Percentage'],
    r.statistics.data.classAreas.map((c) => [c.className, c.areaKm2, c.percentage]),
  )
}

export function annualNdviCsv(r: AnalysisResult) {
  return toCsv(['Year', 'Mean NDVI'], r.ndviSeries.data.map((d) => [d.year, d.meanNDVI]))
}

const SOURCE_LABEL = { live: 'Live backend', notebook: 'Recorded notebook output (static snapshot)', demo: 'DEMO (synthetic)' }

/** Opens a printable HTML report in a new window. */
export function openPrintableReport(r: AnalysisResult) {
  const s = r.statistics.data
  const p = r.params
  const esc = (t: string) => t.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)
  const classRows = s.classAreas
    .map((c) => {
      const def = DROUGHT_CLASSES.find((d) => d.id === c.classId)!
      return `<tr><td><span class="sw" style="background:${def.color}"></span>${esc(c.className)}</td><td>${esc(def.range)}</td><td class="n">${fmt.num(c.areaKm2, 2)}</td><td class="n">${c.percentage.toFixed(2)}%</td></tr>`
    })
    .join('')
  const ndviRows = r.ndviSeries.data.map((d) => `<tr><td>${d.year}</td><td class="n">${d.meanNDVI.toFixed(4)}</td></tr>`).join('')
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Drought Report — ${esc(p.district)} ${p.year}</title>
<style>body{font:13px/1.5 Inter,system-ui,sans-serif;color:#1f2421;max-width:820px;margin:32px auto;padding:0 24px}
h1{font-size:20px;margin:0}h2{font-size:14px;margin:24px 0 8px;border-bottom:1px solid #ddd;padding-bottom:4px}
.meta{color:#666;font-size:12px}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #eee;padding:5px 8px;text-align:left}
th{font-size:11px;text-transform:uppercase;color:#666}.n{text-align:right;font-variant-numeric:tabular-nums}
.sw{display:inline-block;width:10px;height:10px;margin-right:6px;border:1px solid #0002}.kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.kpi div{border:1px solid #ddd;border-radius:6px;padding:8px 10px}.kpi b{display:block;font-size:18px}.src{font-size:11px;color:#2d5a7b}
img{max-width:100%}@media print{body{margin:0}}</style></head><body>
<h1>Drought Severity Assessment — ${esc(p.district)}, ${p.year}</h1>
<p class="meta">VCI from ${METHODOLOGY.dataset} NDVI · baseline ${p.startYear}–${p.endYear} · ${METHODOLOGY.resolutionM} m · generated ${new Date().toLocaleString()}</p>
<p class="src">Statistics source: ${SOURCE_LABEL[r.statistics.source]}${r.statistics.note ? ` — ${esc(r.statistics.note)}` : ''}</p>
<h2>Summary</h2><div class="kpi">
<div>Mean VCI<b>${s.meanVCI.toFixed(3)}</b></div><div>Drought-affected<b>${s.droughtAffectedPercentage.toFixed(2)}%</b></div>
<div>Healthy vegetation<b>${s.healthyPercentage.toFixed(2)}%</b></div><div>Total area<b>${fmt.num(s.totalAreaKm2, 2)} km²</b></div></div>
<p>VCI min ${s.minVCI.toFixed(4)} · max ${s.maxVCI.toFixed(4)} · std. dev. ${s.stdDevVCI.toFixed(4)}</p>
<h2>Area by drought class</h2><table><tr><th>Class</th><th>VCI range</th><th class="n">Area (km²)</th><th class="n">Share</th></tr>${classRows}</table>
<h2>Annual mean NDVI</h2><p class="src">Source: ${SOURCE_LABEL[r.ndviSeries.source]}</p><table><tr><th>Year</th><th class="n">Mean NDVI</th></tr>${ndviRows}</table>
<h2>Method</h2><p>VCI = (NDVI<sub>current</sub> − NDVI<sub>min</sub>) / (NDVI<sub>max</sub> − NDVI<sub>min</sub>), where NDVI<sub>current</sub> is the mean of ${p.year} composites and NDVI<sub>min/max</sub> are per-pixel extremes over all ${p.startYear}–${p.endYear} composites. Classes: Extreme &lt; 0.2 ≤ Moderate &lt; 0.4 ≤ Mild &lt; 0.6 ≤ Healthy. Class map smoothed with ${METHODOLOGY.smoothing}; areas from ee.Image.pixelArea().</p>
${r.statistics.source === 'notebook' ? '<h2>Notebook figures</h2><img src="' + location.origin + '/notebook-figures/fig3_drought_area_bar.png"><img src="' + location.origin + '/notebook-figures/fig2_ndvi_timeseries.png">' : ''}
<script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`
  const w = window.open('', '_blank')
  if (!w) return false
  w.document.write(html)
  w.document.close()
  return true
}
