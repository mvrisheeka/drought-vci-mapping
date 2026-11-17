import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CLASS_BY_ID } from '../../config/methodology'
import { fmt } from '../../utils/format'
import { TooltipCard } from './ChartTooltip'
import { AXIS_PROPS, GRID_STROKE } from './chartTheme'
import type { DroughtClassArea } from '../../types/drought'

/** Darker outline so the gold "Mild" bar stays visible on white. */
const OUTLINE: Record<number, string> = { 1: '#5c0000', 2: '#c23400', 3: '#b89600', 4: '#176317' }

export function DroughtClassBarChart({ data, height = 280 }: { data: DroughtClassArea[]; height?: number }) {
  const rows = data.map((d) => ({ ...d, short: CLASS_BY_ID[d.classId].short }))
  return (
    <div style={{ height }} role="img" aria-label="Bar chart of area per drought class">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 22, right: 8, left: 4, bottom: 0 }} barCategoryGap="22%">
          <CartesianGrid vertical={false} stroke={GRID_STROKE} />
          <XAxis dataKey="short" {...AXIS_PROPS} />
          <YAxis
            {...AXIS_PROPS}
            axisLine={false}
            width={56}
            tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
            label={{ value: 'Area (km²)', angle: -90, position: 'insideLeft', offset: 8, style: { fill: '#7a807b', fontSize: 11, textAnchor: 'middle' } }}
          />
          <Tooltip
            cursor={{ fill: 'rgb(0 0 0 / 0.04)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload as (typeof rows)[number]
              const cls = CLASS_BY_ID[d.classId]
              return (
                <TooltipCard
                  title={d.className}
                  rows={[
                    { label: 'Area', value: fmt.km2(d.areaKm2, 2), color: cls.color },
                    { label: 'Share', value: fmt.pct(d.percentage, 2) },
                    { label: 'VCI range', value: cls.range.replace('VCI ', '') },
                  ]}
                />
              )
            }}
          />
          <Bar dataKey="areaKm2" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {rows.map((d) => (
              <Cell key={d.classId} fill={CLASS_BY_ID[d.classId].color} stroke={OUTLINE[d.classId]} strokeWidth={1} />
            ))}
            <LabelList dataKey="percentage" position="top" formatter={(v) => fmt.pct(Number(v), 1)} style={{ fill: '#4b524d', fontSize: 11, fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
