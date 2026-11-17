import { Crosshair, MapPinOff } from 'lucide-react'
import { CLASS_BY_ID, METHODOLOGY } from '../../config/methodology'
import { fmt } from '../../utils/format'
import { SourceBadge } from '../common/SourceBadge'
import { LoadingBlock } from '../common/States'
import type { PixelInfo, Sourced } from '../../types/drought'

export type PixelSelection = { lat: number; lon: number; loading: boolean; info: Sourced<PixelInfo | null> | null }

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <dt className="text-[12px] text-ink-2">
        {label}
        {hint && <span className="block text-[10.5px] text-ink-3">{hint}</span>}
      </dt>
      <dd className="tabular font-mono text-[13px] font-medium text-ink">{value}</dd>
    </div>
  )
}

export function PixelInspector({ selection, year, startYear, endYear }: { selection: PixelSelection | null; year: number; startYear: number; endYear: number }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
        <h3 className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
          <Crosshair className="size-4 text-moss-600" /> Location details
        </h3>
        {selection?.info && <SourceBadge source={selection.info.source} note={selection.info.note} />}
      </div>

      {!selection ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
          <Crosshair className="size-6 text-ink-3" />
          <p className="text-[12.5px] text-ink-2">Click anywhere on the map to inspect a pixel.</p>
          <p className="text-[11.5px] text-ink-3">Shows {year} NDVI, the {startYear}–{endYear} NDVI range, the VCI and its class.</p>
        </div>
      ) : (
        <div className="flex-1 px-4 py-3">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-3">Location</p>
          <dl className="divide-y divide-line">
            <Row label="Latitude" value={fmt.coord(selection.lat, 'lat')} />
            <Row label="Longitude" value={fmt.coord(selection.lon, 'lon')} />
          </dl>
          {selection.loading ? (
            <LoadingBlock className="h-40" label="Sampling pixel…" />
          ) : !selection.info?.data ? (
            <div className="mt-4 flex items-center gap-2 rounded-md bg-sunken px-3 py-3 text-[12px] text-ink-2">
              <MapPinOff className="size-4 shrink-0 text-ink-3" /> Outside the study area — no data.
            </div>
          ) : (
            <PixelValues info={selection.info.data} year={year} startYear={startYear} endYear={endYear} />
          )}
        </div>
      )}
    </div>
  )
}

function PixelValues({ info, year, startYear, endYear }: { info: PixelInfo; year: number; startYear: number; endYear: number }) {
  const cls = CLASS_BY_ID[info.classId]
  return (
    <>
      <p className="mt-3 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-3">NDVI</p>
      <dl className="divide-y divide-line">
        <Row label={`NDVI ${year}`} hint="mean of the year's composites" value={info.ndvi.toFixed(3)} />
        <Row label="Historical minimum" hint={`all composites ${startYear}–${endYear}`} value={info.historicalMin.toFixed(3)} />
        <Row label="Historical maximum" hint={`all composites ${startYear}–${endYear}`} value={info.historicalMax.toFixed(3)} />
      </dl>
      <div className="mt-3 rounded-md bg-sunken px-3 py-2.5">
        <p className="font-mono text-[11px] leading-relaxed text-ink-2">
          VCI = ({info.ndvi.toFixed(3)} − {info.historicalMin.toFixed(3)}) / ({info.historicalMax.toFixed(3)} − {info.historicalMin.toFixed(3)})
        </p>
        <p className="tabular mt-1 font-mono text-xl font-semibold text-ink">{info.vci.toFixed(3)}</p>
      </div>
      <div className="mt-3 flex items-center gap-2.5 rounded-md border border-line px-3 py-2.5">
        <span className="size-4 shrink-0 rounded-[3px] ring-1 ring-black/15" style={{ background: cls.color }} />
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-ink">{info.classification}</p>
          <p className="text-[11px] text-ink-3">
            {cls.range} · {cls.meaning}
          </p>
        </div>
      </div>
      <p className="mt-3 text-[10.5px] text-ink-3">Pixel size {METHODOLOGY.resolutionM} m (MOD13Q1). Class shown is for the unsmoothed pixel.</p>
    </>
  )
}
