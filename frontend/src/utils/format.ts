export const fmt = {
  num(value: number, digits = 2) {
    return value.toLocaleString('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits })
  },
  km2(value: number, digits = 1) {
    return `${fmt.num(value, digits)} km²`
  },
  pct(value: number, digits = 1) {
    return `${value.toFixed(digits)}%`
  },
  coord(value: number, axis: 'lat' | 'lon') {
    const hemi = axis === 'lat' ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W'
    return `${Math.abs(value).toFixed(4)}° ${hemi}`
  },
}

export function downloadText(fileName: string, content: string, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function toCsv(header: string[], rows: (string | number)[][]): string {
  const esc = (v: string | number) => {
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [header, ...rows].map((r) => r.map(esc).join(',')).join('\n') + '\n'
}
