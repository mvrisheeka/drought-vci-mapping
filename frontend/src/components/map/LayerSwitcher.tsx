import { useState } from 'react'
import { Layers, X } from 'lucide-react'
import type { MapLayerDescriptor, MapLayerId } from '../../types/drought'
import { SourceBadge } from '../common/SourceBadge'
import { BASEMAPS, type BasemapId } from '../../config/basemaps'

interface Props {
  layers: MapLayerDescriptor[]
  active: MapLayerId | null
  onActive: (id: MapLayerId | null) => void
  showBoundary: boolean
  onShowBoundary: (v: boolean) => void
  opacity: number
  onOpacity: (v: number) => void
  basemap: BasemapId
  onBasemap: (b: BasemapId) => void
}

export function LayerSwitcher(p: Props) {
  const [open, setOpen] = useState(() => typeof window === 'undefined' || window.innerWidth >= 768)
  const rasters = p.layers.filter((l) => l.id !== 'boundary')
  const boundary = p.layers.find((l) => l.id === 'boundary')

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="grid size-9 place-items-center rounded-md border border-line bg-surface text-ink-2 shadow-sm hover:text-ink" aria-label="Show layers" title="Layers">
        <Layers className="size-[18px]" />
      </button>
    )
  }

  return (
    <div className="w-60 rounded-md border border-line bg-surface/97 shadow-md backdrop-blur">
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <p className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
          <Layers className="size-3.5" /> Layers
        </p>
        <button onClick={() => setOpen(false)} className="rounded p-0.5 text-ink-3 hover:bg-sunken hover:text-ink" aria-label="Hide layers">
          <X className="size-4" />
        </button>
      </div>
      <fieldset className="space-y-0.5 px-2 py-2">
        <legend className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-3">Analysis layer</legend>
        {rasters.map((l) => (
          <label key={l.id} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-[12.5px] hover:bg-sunken">
            <input type="checkbox" className="accent-moss-600" checked={p.active === l.id} onChange={(e) => p.onActive(e.target.checked ? l.id : null)} />
            <span className="flex-1 text-ink">{l.label}</span>
            {l.source !== 'live' && <SourceBadge source={l.source} compact />}
          </label>
        ))}
        {boundary && (
          <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-[12.5px] hover:bg-sunken">
            <input type="checkbox" className="accent-moss-600" checked={p.showBoundary} onChange={(e) => p.onShowBoundary(e.target.checked)} />
            <span className="flex-1 text-ink">{boundary.label}</span>
            <span className="text-[10px] text-ink-3">GADM</span>
          </label>
        )}
      </fieldset>
      <div className="border-t border-line px-3 py-2">
        <label className="flex items-center gap-2 text-[11px] text-ink-3">
          Opacity
          <input type="range" min={0.2} max={1} step={0.05} value={p.opacity} onChange={(e) => p.onOpacity(Number(e.target.value))} className="flex-1 accent-moss-600" />
          <span className="tabular w-8 text-right font-mono">{Math.round(p.opacity * 100)}%</span>
        </label>
      </div>
      <div className="border-t border-line px-3 py-2">
        <p className="pb-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-3">Basemap</p>
        <div className="grid grid-cols-3 gap-1">
          {(Object.keys(BASEMAPS) as BasemapId[]).map((b) => (
            <button
              key={b}
              onClick={() => p.onBasemap(b)}
              className={`rounded px-1.5 py-1 text-[11px] font-medium ring-1 ring-inset ${p.basemap === b ? 'bg-moss-700 text-white ring-moss-700' : 'text-ink-2 ring-line hover:bg-sunken'}`}
            >
              {BASEMAPS[b].label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
