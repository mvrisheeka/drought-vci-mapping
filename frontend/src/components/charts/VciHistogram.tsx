import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { classOf } from '../../utils/vci'
import { TooltipCard } from './ChartTooltip'
import { AXIS_PROPS, GRID_STROKE } from './chartTheme'
import type { HistogramBin } from '../../types/drought'

/** Bars coloured by the drought class of each bin's midpoint; thresholds drawn as guides. */
export function VciHistogram({ bins, height = 260 }: { bins: HistogramBin[]; height?: number }) {
  const total = bins.reduce((s, b) => s + b.count, 0)
  const rows = bins.map((b) => ({ ...b, mid: (b.x0 + b.x1) / 2, label: ((b.x0 + b.x1) / 2).toFixed(2) }))
  return (
    <div style={{ height }} role="img" aria-label="Histogram of VCI values">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 16, right: 8, left: 4, bottom: 4 }} barCategoryGap={1}>
          <CartesianGrid vertical={false} stroke={GRID_STROKE} />
          <XAxis
            dataKey="mid"
            type="number"
            domain={[0, 1]}
            ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]}
            {...AXIS_PROPS}
            label={{ value: 'VCI', position: 'insideBottomRight', offset: -2, style: { fill: '#7a807b', fontSize: 11 } }}
          />
          <YAxis {...AXIS_PROPS} axisLine={false} width={44} label={{ value: 'Pixels', angle: -90, position: 'insideLeft', offset: 10, style: { fill: '#7a807b', fontSize: 11, textAnchor: 'middle' } }} />
          {[0.2, 0.4, 0.6].map((t) => (
            <ReferenceLine key={t} x={t} stroke="#4b524d" strokeDasharray="3 3" strokeOpacity={0.5} />
          ))}
          <Tooltip
            cursor={{ fill: 'rgb(0 0 0 / 0.04)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload as (typeof rows)[number]
              const cls = classOf(d.mid)
              return (
                <TooltipCard
                  title={`VCI ${d.x0.toFixed(3)} – ${d.x1.toFixed(3)}`}
                  rows={[
                    { label: 'Pixels', value: d.count.toLocaleString(), color: cls.color },
                    { label: 'Share', value: `${((d.count / total) * 100).toFixed(1)}%` },
                    { label: 'Class', value: cls.short },
                  ]}
                />
              )
            }}
          />
          <Bar dataKey="count" isAnimationActive={false} radius={[2, 2, 0, 0]}>
            {rows.map((d, i) => (
              <Cell key={i} fill={classOf(d.mid).color} fillOpacity={0.9} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
