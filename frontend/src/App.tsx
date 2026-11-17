import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AnalysisProvider } from './context/AnalysisProvider'
import { AppLayout } from './layouts/AppLayout'
import { OverviewPage } from './pages/OverviewPage'
import { DroughtMapPage } from './pages/DroughtMapPage'
import { TrendsPage } from './pages/TrendsPage'
import { StatisticsPage } from './pages/StatisticsPage'
import { ReportsPage } from './pages/ReportsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AnalysisProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="map" element={<DroughtMapPage />} />
            <Route path="trends" element={<TrendsPage />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AnalysisProvider>
    </BrowserRouter>
  )
}
