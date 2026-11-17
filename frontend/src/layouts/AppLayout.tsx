import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Info, X } from 'lucide-react'
import { Sidebar } from '../components/layout/Sidebar'
import { Header } from '../components/layout/Header'
import { useAnalysis } from '../hooks/useAnalysis'

function readCollapsed() {
  try {
    return localStorage.getItem('sidebar-collapsed') === '1'
  } catch {
    return false
  }
}

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { notice, dismissNotice } = useAnalysis()

  const toggleCollapsed = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem('sidebar-collapsed', c ? '0' : '1')
      } catch {
        /* storage unavailable */
      }
      return !c
    })

  return (
    <div className="flex min-h-full">
      <Sidebar collapsed={collapsed} onToggleCollapsed={toggleCollapsed} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="top-0 z-[1050] lg:sticky">
          <Header onOpenMenu={() => setMobileOpen(true)} />
          {notice && (
            <div className="flex items-start gap-2 border-b border-snapshot/20 bg-[#eef3f7] px-4 py-2 text-[12.5px] text-snapshot md:px-6">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p className="flex-1">{notice}</p>
              <button onClick={dismissNotice} className="rounded p-0.5 hover:bg-snapshot/10" aria-label="Dismiss">
                <X className="size-4" />
              </button>
            </div>
          )}
        </div>
        <main className="flex-1 px-4 py-5 md:px-6 md:py-6">
          <Outlet />
        </main>
        <footer className="border-t border-line px-4 py-3 text-[11px] text-ink-3 md:px-6">
          Methodology: <span className="font-mono">drought_vci_mapping.ipynb</span> · MODIS/061/MOD13Q1 NDVI · GADM 4.1 boundaries · Values labelled{' '}
          <span className="font-semibold text-demo">Demo data</span> are synthetic.
        </footer>
      </div>
    </div>
  )
}
