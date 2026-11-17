import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { TooltipCard } from './ChartTooltip'
import { AXIS_PROPS, GRID_STROKE } from './chartTheme'
import type { NDVIRecord } from '../../types/drought'

const LINE = '#3f6a4c'

export function NdviTrendChart({ data, highlightYear, height = 300 }: { data: NDVIRecord[]; highlightYear?: number; height?: number }) {
  const mean = data.reduce((s, d) => s + d.meanNDVI, 0) / (data.length || 1)
  const values = data.map((d) => d.meanNDVI)
  const lo = Math.floor((Math.min(...values) - 0.01) * 100) / 100
  const hi = Math.ceil((Math.max(...values) + 0.01) * 100) / 100

  return (
    <div style={{ height }} role="img" aria-label="Line chart of annual mean NDVI">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 16, left: 4, bottom: 4 }}>
          <CartesianGrid vertical={false} stroke={GRID_STROKE} />
          <XAxis dataKey="year" {...AXIS_PROPS} padding={{ left: 12, right: 12 }} />
          <YAxis
            {...AXIS_PROPS}
            axisLine={false}
            width={52}
            domain={[lo, hi]}
            tickFormatter={(v: number) => v.toFixed(2)}
            label={{ value: 'Mean NDVI', angle: -90, position: 'insideLeft', offset: 8, style: { fill: '#7a807b', fontSize: 11, textAnchor: 'middle' } }}
          />
          <ReferenceLine
            y={mean}
            stroke="#7a807b"
            strokeDasharray="4 4"
            label={{ value: `period mean ${mean.toFixed(3)}`, position: 'insideBottomLeft', fill: '#7a807b', fontSize: 10.5 }}
          />
          <Tooltip
            cursor={{ stroke: '#7a807b', strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload as NDVIRecord
              const diff = d.meanNDVI - mean
              return (
                <TooltipCard
                  title={`Year ${d.year}`}
                  rows={[
                    { label: 'Mean NDVI', value: d.meanNDVI.toFixed(4), color: LINE },
                    { label: 'vs period mean', value: `${diff >= 0 ? '+' : ''}${diff.toFixed(4)}` },
                  ]}
                />
              )
            }}
          />
          <Line
            type="linear"
            dataKey="meanNDVI"
            stroke={LINE}
            strokeWidth={2}
            isAnimationActive={false}
            dot={(props) => {
              const { cx, cy, payload } = props as { cx: number; cy: number; payload: NDVIRecord }
              const hl = payload.year === highlightYear
              return <circle key={payload.year} cx={cx} cy={cy} r={hl ? 6 : 4} fill={hl ? LINE : '#fff'} stroke={hl ? '#fff' : LINE} strokeWidth={2} />
            }}
            activeDot={{ r: 7, fill: LINE, stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
