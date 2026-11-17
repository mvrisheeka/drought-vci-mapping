import { useMemo, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

export interface Column<T> {
  key: string
  header: string
  value: (row: T) => number | string
  render?: (row: T) => ReactNode
  align?: 'left' | 'right'
}

export function SortableTable<T>({ rows, columns, rowKey, footer }: { rows: T[]; columns: Column<T>[]; rowKey: (r: T) => string | number; footer?: ReactNode }) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null)
  const sorted = useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.key === sort.key)!
    return [...rows].sort((a, b) => {
      const va = col.value(a)
      const vb = col.value(b)
      return (va < vb ? -1 : va > vb ? 1 : 0) * sort.dir
    })
  }, [rows, columns, sort])

  const toggle = (key: string) => setSort((s) => (s?.key !== key ? { key, dir: 1 } : s.dir === 1 ? { key, dir: -1 } : null))

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-[12.5px]">
        <thead>
          <tr className="border-b border-line">
            {columns.map((c) => {
              const active = sort?.key === c.key
              const Icon = !active ? ArrowUpDown : sort!.dir === 1 ? ArrowUp : ArrowDown
              return (
                <th key={c.key} className={`px-3 py-2 font-semibold ${c.align === 'right' ? 'text-right' : 'text-left'}`} aria-sort={active ? (sort!.dir === 1 ? 'ascending' : 'descending') : 'none'}>
                  <button onClick={() => toggle(c.key)} className={`inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.05em] ${active ? 'text-ink' : 'text-ink-3 hover:text-ink'}`}>
                    {c.header}
                    <Icon className="size-3" />
                  </button>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {sorted.map((r) => (
            <tr key={rowKey(r)} className="hover:bg-sunken">
              {columns.map((c) => (
                <td key={c.key} className={`px-3 py-2 ${c.align === 'right' ? 'tabular text-right font-mono' : 'text-ink'}`}>
                  {c.render ? c.render(r) : c.value(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer && <tfoot className="border-t-2 border-line-strong">{footer}</tfoot>}
      </table>
    </div>
  )
}
