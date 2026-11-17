import type { ReactNode } from 'react'

/** Shared tooltip shell: text stays in ink tokens; a swatch carries series colour. */
export function TooltipCard({ title, rows }: { title: ReactNode; rows: { label: string; value: string; color?: string }[] }) {
  return (
    <div className="min-w-40 rounded-md border border-line bg-surface px-3 py-2 text-[12px] shadow-md">
      <p className="mb-1 font-semibold text-ink">{title}</p>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2 py-0.5">
          {r.color && <span className="size-2.5 rounded-[2px] ring-1 ring-black/15" style={{ background: r.color }} />}
          <span className="text-ink-2">{r.label}</span>
          <span className="tabular ml-auto pl-4 font-mono font-medium text-ink">{r.value}</span>
        </div>
      ))}
    </div>
  )
}
