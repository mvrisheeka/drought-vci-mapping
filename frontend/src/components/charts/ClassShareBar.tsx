import { CLASS_BY_ID } from '../../config/methodology'
import { fmt } from '../../utils/format'
import type { DroughtClassArea } from '../../types/drought'

/** 100% stacked bar of class shares with a labelled list (identity never colour-only). */
export function ClassShareBar({ data }: { data: DroughtClassArea[] }) {
  return (
    <div>
      <div className="flex h-3.5 w-full gap-[2px] overflow-hidden rounded" role="img" aria-label="Share of study area per drought class">
        {data.map((d) => (
          <div
            key={d.classId}
            title={`${d.className}: ${fmt.pct(d.percentage, 2)}`}
            style={{ width: `${d.percentage}%`, background: CLASS_BY_ID[d.classId].color, minWidth: d.percentage > 0 ? 3 : 0 }}
          />
        ))}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
        {data.map((d) => (
          <li key={d.classId} className="flex items-center gap-2 text-[12px]">
            <span className="size-2.5 shrink-0 rounded-[2px] ring-1 ring-black/15" style={{ background: CLASS_BY_ID[d.classId].color }} />
            <span className="truncate text-ink-2">{d.className}</span>
            <span className="tabular ml-auto font-mono font-medium text-ink">{fmt.pct(d.percentage, 1)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
