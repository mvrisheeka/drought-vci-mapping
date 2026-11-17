import { FlaskConical, NotebookText, Radio } from 'lucide-react'
import type { DataSource } from '../../types/drought'

const META: Record<DataSource, { label: string; title: string; cls: string; Icon: typeof Radio }> = {
  live: {
    label: 'Live',
    title: 'Computed by the backend (Google Earth Engine)',
    cls: 'text-live bg-live/8 ring-live/25',
    Icon: Radio,
  },
  notebook: {
    label: 'Notebook output',
    title: 'Real values transcribed from the executed drought_vci_mapping.ipynb (static snapshot)',
    cls: 'text-snapshot bg-snapshot/8 ring-snapshot/25',
    Icon: NotebookText,
  },
  demo: {
    label: 'Demo data',
    title: 'Synthetic data generated in the browser — not an analysis result',
    cls: 'text-demo bg-demo/10 ring-demo/30',
    Icon: FlaskConical,
  },
}

export function SourceBadge({ source, note, compact = false }: { source: DataSource; note?: string; compact?: boolean }) {
  const m = META[source]
  return (
    <span
      title={note ? `${m.title}\n${note}` : m.title}
      className={`inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide ring-1 ring-inset ${m.cls}`}
    >
      <m.Icon className="size-3" aria-hidden />
      {compact ? m.label.split(' ')[0] : m.label}
    </span>
  )
}
