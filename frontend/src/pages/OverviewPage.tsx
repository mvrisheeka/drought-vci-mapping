import { SlidersHorizontal } from 'lucide-react'
import { Panel, SectionHeading } from '../components/common/Panel'
import { AnalysisControls } from '../components/controls/AnalysisControls'
import { SummaryCards } from '../components/summary/SummaryCards'
import { DroughtMap } from '../components/map/DroughtMap'
import { VciExplainer } from '../components/education/VciExplainer'
import { DistributionPanel } from '../components/sections/DistributionPanel'
import { HistogramPanel } from '../components/sections/HistogramPanel'
import { TrendPanel } from '../components/sections/TrendPanel'
import { DownloadsPanel } from '../components/reports/DownloadsPanel'

export function OverviewPage() {
  return (
    <div className="mx-auto max-w-[1500px] space-y-5">
      <Panel
        title={
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="size-4 text-moss-600" /> Analysis controls
          </span>
        }
      >
        <AnalysisControls />
      </Panel>

      <SummaryCards />

      <section>
        <SectionHeading eyebrow="Spatial analysis" title="Drought Severity Map">
          <p className="text-xs text-ink-3">Click any location to inspect its NDVI and VCI.</p>
        </SectionHeading>
        <DroughtMap />
      </section>

      <VciExplainer />

      <div className="grid gap-5 lg:grid-cols-2">
        <DistributionPanel />
        <HistogramPanel />
      </div>

      <TrendPanel />

      <DownloadsPanel />
    </div>
  )
}
