import { AlertTriangle, Loader2 } from 'lucide-react'

export function LoadingBlock({ label = 'Loading…', className = 'h-48' }: { label?: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 text-xs text-ink-3 ${className}`}>
      <Loader2 className="size-4 animate-spin" aria-hidden /> {label}
    </div>
  )
}

export function ErrorBlock({ message, className = 'h-48' }: { message: string; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 px-6 text-center text-xs text-ink-2 ${className}`}>
      <AlertTriangle className="size-5 text-demo" aria-hidden />
      <p className="max-w-sm">{message}</p>
    </div>
  )
}

export function DemoNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="demo-stripes rounded-md border border-demo/25 px-3 py-2 text-[11.5px] leading-relaxed text-[#6b4000]">
      {children}
    </p>
  )
}
