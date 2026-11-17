import type { ReactNode } from 'react'

interface PanelProps {
  title?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  id?: string
}

export function Panel({ title, subtitle, actions, children, className = '', bodyClassName = 'p-4', id }: PanelProps) {
  return (
    <section id={id} className={`scroll-mt-20 rounded-lg border border-line bg-surface shadow-[0_1px_0_rgb(0_0_0/0.03)] ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2 border-b border-line px-4 py-3">
          <div className="min-w-0">
            {title && <h2 className="text-[13.5px] font-semibold tracking-tight text-ink">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-ink-3">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}

export function SectionHeading({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <div>
        {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-moss-600">{eyebrow}</p>}
        <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
      </div>
      {children}
    </div>
  )
}
