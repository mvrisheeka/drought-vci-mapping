import { DROUGHT_CLASSES, NDVI_PALETTE, VCI_PALETTE } from '../../config/methodology'
import type { MapLayerId } from '../../types/drought'

function Gradient({ palette, title, ticks }: { palette: string[]; title: string; ticks: string[] }) {
  return (
    <div className="w-44">
      <p className="mb-1.5 text-[11px] font-semibold text-ink">{title}</p>
      <div className="h-2.5 rounded-sm ring-1 ring-black/10" style={{ background: `linear-gradient(90deg, ${palette.join(',')})` }} />
      <div className="tabular mt-1 flex justify-between font-mono text-[10px] text-ink-3">
        {ticks.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  )
}

export function MapLegend({ layer, year }: { layer: MapLayerId; year: number }) {
  return (
    <div className="rounded-md border border-line bg-surface/95 px-3 py-2.5 shadow-sm backdrop-blur">
      {layer === 'severity' || layer === 'boundary' ? (
        <>
          <p className="mb-1.5 text-[11px] font-semibold text-ink">Drought severity (VCI {year})</p>
          <ul className="space-y-1">
            {DROUGHT_CLASSES.map((c) => (
              <li key={c.id} className="flex items-center gap-2 text-[11.5px]">
                <span className="size-3 shrink-0 rounded-[2px] ring-1 ring-black/15" style={{ background: c.color }} />
                <span className="font-medium text-ink">{c.name}</span>
                <span className="ml-auto pl-3 font-mono text-[10.5px] text-ink-3">{c.range.replace('VCI ', '')}</span>
              </li>
            ))}
          </ul>
        </>
      ) : layer === 'vci' ? (
        <Gradient palette={VCI_PALETTE} title={`Vegetation Condition Index ${year}`} ticks={['0', '0.2', '0.4', '0.6', '0.8', '1']} />
      ) : (
        <Gradient palette={NDVI_PALETTE} title={`Mean NDVI ${year}`} ticks={['0', '0.25', '0.5', '0.75', '1']} />
      )}
    </div>
  )
}
