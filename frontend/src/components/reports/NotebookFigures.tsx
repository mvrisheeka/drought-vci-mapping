import { useState } from 'react'
import { X } from 'lucide-react'
import { NOTEBOOK_FIGURES } from '../../data/notebookSnapshot'
import { Panel } from '../common/Panel'
import { SourceBadge } from '../common/SourceBadge'

export function NotebookFigures({ only }: { only?: number[] }) {
  const [open, setOpen] = useState<(typeof NOTEBOOK_FIGURES)[number] | null>(null)
  const figs = NOTEBOOK_FIGURES.filter((f) => !only || only.includes(f.cell))
  return (
    <Panel title="Notebook Figures" subtitle="Original matplotlib outputs embedded in drought_vci_mapping.ipynb" actions={<SourceBadge source="notebook" />}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {figs.map((f) => (
          <button key={f.file} onClick={() => setOpen(f)} className="group overflow-hidden rounded-md border border-line text-left hover:border-moss-500">
            <div className="flex h-44 items-center justify-center bg-white p-2">
              <img src={f.file} alt={f.title} loading="lazy" className="max-h-full max-w-full object-contain" />
            </div>
            <div className="border-t border-line px-3 py-2">
              <p className="truncate text-[12.5px] font-medium text-ink">{f.title}</p>
              <p className="text-[11px] text-ink-3">Cell {f.cell}</p>
            </div>
          </button>
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 p-4" onClick={() => setOpen(null)} role="dialog" aria-label={open.title}>
          <figure className="relative max-h-full max-w-4xl overflow-auto rounded-lg bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(null)} className="absolute top-2 right-2 rounded p-1 text-ink-3 hover:bg-sunken" aria-label="Close">
              <X className="size-5" />
            </button>
            <img src={open.file} alt={open.title} className="max-h-[78vh] w-auto" />
            <figcaption className="mt-2 text-[12px] text-ink-2">
              {open.title} — notebook cell {open.cell}
            </figcaption>
          </figure>
        </div>
      )}
    </Panel>
  )
}
