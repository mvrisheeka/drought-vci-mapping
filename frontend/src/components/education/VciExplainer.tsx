import { DROUGHT_CLASSES, METHODOLOGY } from '../../config/methodology'
import { Panel } from '../common/Panel'

function Frac({ num, den }: { num: React.ReactNode; den: React.ReactNode }) {
  return (
    <span className="inline-flex flex-col items-center align-middle">
      <span className="px-2 pb-1">{num}</span>
      <span className="w-full border-t-[1.5px] border-ink px-2 pt-1">{den}</span>
    </span>
  )
}

const Sub = ({ children }: { children: React.ReactNode }) => <sub className="text-[0.7em] font-medium text-ink-2">{children}</sub>

export function VciExplainer({ id, compact = false }: { id?: string; compact?: boolean }) {
  return (
    <Panel id={id} title="Understanding the Vegetation Condition Index" subtitle="How each pixel’s drought class is derived (Kogan, 1995)">
      <div className={`grid gap-5 ${compact ? '' : 'lg:grid-cols-[1.1fr_1fr]'}`}>
        <div>
          <div className="flex items-center justify-center rounded-md bg-sunken px-4 py-5 font-serif text-[17px] text-ink md:text-lg" aria-label="VCI equals NDVI current minus NDVI min, divided by NDVI max minus NDVI min">
            <span className="mr-3 font-sans font-semibold">VCI =</span>
            <Frac
              num={<>NDVI<Sub>current</Sub> − NDVI<Sub>min</Sub></>}
              den={<>NDVI<Sub>max</Sub> − NDVI<Sub>min</Sub></>}
            />
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-2">
            VCI normalizes current vegetation conditions against the historical minimum and maximum NDVI for each pixel. A value near 0 means
            vegetation is as poor as it has been in the record; near 1 means it is as good as it has been.
          </p>
          <dl className="mt-3 grid gap-x-4 gap-y-1.5 text-[12px] sm:grid-cols-[auto_1fr]">
            <dt className="font-mono text-ink">NDVI<sub>current</sub></dt>
            <dd className="text-ink-2">Mean of all {METHODOLOGY.analysisYear} MOD13Q1 composites (NDVI × {METHODOLOGY.scaleFactor})</dd>
            <dt className="font-mono text-ink">NDVI<sub>min</sub></dt>
            <dd className="text-ink-2">Per-pixel minimum over all {METHODOLOGY.compositeCount} composites, {METHODOLOGY.historicalStart}–{METHODOLOGY.historicalEnd}</dd>
            <dt className="font-mono text-ink">NDVI<sub>max</sub></dt>
            <dd className="text-ink-2">Per-pixel maximum over the same composites</dd>
          </dl>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">Classification thresholds</p>
          <div className="flex h-2.5 overflow-hidden rounded-sm" aria-hidden>
            {DROUGHT_CLASSES.map((c, i) => (
              <span key={c.id} style={{ background: c.color, flex: i === 3 ? 2 : 1 }} />
            ))}
          </div>
          <div className="tabular relative mb-3 h-4 font-mono text-[10px] text-ink-3" aria-hidden>
            {['0', '0.2', '0.4', '0.6', '1.0'].map((t, i) => (
              <span key={t} className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full" style={{ left: `${i * 20 + (i === 4 ? 20 : 0)}%` }}>
                {t}
              </span>
            ))}
          </div>
          <ul className="divide-y divide-line rounded-md border border-line">
            {DROUGHT_CLASSES.map((c) => (
              <li key={c.id} className="flex items-start gap-3 px-3 py-2">
                <span className="mt-0.5 size-3.5 shrink-0 rounded-[3px] ring-1 ring-black/15" style={{ background: c.color }} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <p className="text-[12.5px] font-semibold text-ink">{c.name}</p>
                    <p className="font-mono text-[11px] text-ink-2">{c.range}</p>
                  </div>
                  {!compact && <p className="text-[11.5px] text-ink-3">{c.meaning}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  )
}
