import { NavLink } from 'react-router-dom'
import { BarChart3, ChevronsLeft, ChevronsRight, FileDown, LayoutDashboard, LineChart, Map as MapIcon, Satellite, X } from 'lucide-react'
import { METHODOLOGY } from '../../config/methodology'

const NAV_ITEMS = [
  { to: '/', label: 'Overview', Icon: LayoutDashboard },
  { to: '/map', label: 'Drought Map', Icon: MapIcon },
  { to: '/trends', label: 'Historical Trends', Icon: LineChart },
  { to: '/statistics', label: 'Statistics', Icon: BarChart3 },
  { to: '/reports', label: 'Reports', Icon: FileDown },
] as const

interface SidebarProps {
  collapsed: boolean
  onToggleCollapsed: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

export function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {/* Mobile scrim */}
      <div
        className={`fixed inset-0 z-[1100] bg-moss-900/40 transition-opacity lg:hidden ${mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onCloseMobile}
        aria-hidden
      />
      <aside
        className={`fixed inset-y-0 left-0 z-[1200] flex w-64 flex-col bg-moss-900 text-moss-100 transition-[transform,width] duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'lg:w-[68px]' : 'lg:w-60'}`}
        aria-label="Primary"
      >
        <div className={`flex h-14 items-center gap-2.5 border-b border-white/8 px-4 ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}>
          <div className="grid size-8 shrink-0 grid-cols-2 gap-0.5 rounded-md bg-white/8 p-1.5" aria-hidden>
            <span className="rounded-[2px] bg-extreme" />
            <span className="rounded-[2px] bg-moderate" />
            <span className="rounded-[2px] bg-mild" />
            <span className="rounded-[2px] bg-healthy" />
          </div>
          <div className={`min-w-0 leading-tight ${collapsed ? 'lg:hidden' : ''}`}>
            <p className="truncate text-[13px] font-semibold text-white">Drought_sev</p>
            <p className="truncate text-[11px] text-moss-100/60">VCI drought monitor</p>
          </div>
          <button onClick={onCloseMobile} className="ml-auto rounded p-1 text-moss-100/70 hover:bg-white/10 lg:hidden" aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-3">
          <p className={`px-2 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-moss-100/40 ${collapsed ? 'lg:hidden' : ''}`}>Analysis</p>
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onCloseMobile}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `group flex h-9 items-center gap-3 rounded-md px-2.5 text-[13px] font-medium transition-colors ${collapsed ? 'lg:justify-center lg:px-0' : ''} ${
                  isActive ? 'bg-white/12 text-white' : 'text-moss-100/70 hover:bg-white/6 hover:text-white'
                }`
              }
            >
              <Icon className="size-[18px] shrink-0" aria-hidden />
              <span className={collapsed ? 'lg:hidden' : ''}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={`mx-2.5 mb-2 rounded-md border border-white/8 bg-white/4 p-3 text-[11px] leading-relaxed text-moss-100/70 ${collapsed ? 'lg:hidden' : ''}`}>
          <p className="mb-1 flex items-center gap-1.5 font-semibold text-moss-100">
            <Satellite className="size-3.5" aria-hidden /> Data source
          </p>
          <p>{METHODOLOGY.dataset}</p>
          <p>
            {METHODOLOGY.resolutionM} m · 16-day · {METHODOLOGY.historicalStart}–{METHODOLOGY.historicalEnd}
          </p>
          <p>Boundary: GADM 4.1</p>
        </div>

        <button
          onClick={onToggleCollapsed}
          className="hidden h-10 items-center justify-center gap-2 border-t border-white/8 text-[12px] text-moss-100/60 hover:bg-white/5 hover:text-white lg:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight className="size-4" /> : (<><ChevronsLeft className="size-4" /> Collapse</>)}
        </button>
      </aside>
    </>
  )
}
