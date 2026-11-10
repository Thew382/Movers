import { animate, motion, useInView, type HTMLMotionProps } from 'motion/react'
import { useEffect, useId, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react'

export const EASE = [0.16, 1, 0.3, 1] as const

export function Reveal({ delay = 0, className, children }: { delay?: number; className?: string; children: ReactNode }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

export function Card({ className = '', children, ...props }: HTMLMotionProps<'div'>) {
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`)
  }
  return (
    <motion.div
      onMouseMove={onMove}
      className={`spotlight rounded-2xl border border-line bg-surface/80 shadow-[0_1px_0_0_rgb(255_255_255/0.04)_inset] backdrop-blur-sm ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedNumber({ value, format }: { value: number | null; format: (n: number | null) => string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const prev = useRef(0)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView || value == null || !ref.current) return
    const node = ref.current
    const controls = animate(prev.current, value, {
      duration: 1.4,
      ease: EASE,
      onUpdate: (v) => (node.textContent = format(v)),
    })
    prev.current = value
    return () => controls.stop()
  }, [value, inView, format])

  return (
    <span ref={ref} className="tabular">
      {format(value == null ? null : 0)}
    </span>
  )
}

export function Sparkline({
  data,
  positive,
  className = '',
  fill = true,
  delay = 0,
}: {
  data: number[]
  positive: boolean
  className?: string
  fill?: boolean
  delay?: number
}) {
  const id = useId()
  const w = 100
  const h = 32
  const { line, area } = useMemo(() => {
    if (data.length < 2) return { line: '', area: '' }
    const min = Math.min(...data)
    const max = Math.max(...data)
    const span = max - min || 1
    const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - 2 - ((v - min) / span) * (h - 4)])
    const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
    return { line, area: `${line} L${w},${h} L0,${h} Z` }
  }, [data])

  if (!line) return <div className={className} />
  const color = positive ? 'var(--color-gain)' : 'var(--color-loss)'

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={`overflow-visible ${className}`}>
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <motion.rect
            x={-1}
            y={-2}
            height={h + 4}
            initial={{ width: 0 }}
            animate={{ width: w + 2 }}
            transition={{ duration: 1.4, delay, ease: EASE }}
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        {fill && <path d={area} fill={`url(#${id}-fill)`} />}
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

export function ChangePill({ value, size = 'sm' }: { value: number | null; size?: 'sm' | 'lg' }) {
  const up = (value ?? 0) >= 0
  const sizing = size === 'lg' ? 'px-2.5 py-1 text-sm' : 'px-1.5 py-0.5 text-xs'
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md font-mono font-medium tabular ring-1 ring-inset ${sizing} ${
        up ? 'bg-gain/10 text-gain ring-gain/20' : 'bg-loss/10 text-loss ring-loss/20'
      }`}
    >
      <svg viewBox="0 0 10 10" className={`size-2 ${up ? '' : 'rotate-180'}`}>
        <path d="M5 1.5 L8.5 7.5 L1.5 7.5 Z" fill="currentColor" />
      </svg>
      {value == null ? '—' : `${Math.abs(value).toFixed(2)}%`}
    </span>
  )
}

export function Monogram({ symbol }: { symbol: string }) {
  const hue = useMemo(() => [...symbol].reduce((a, c) => a + c.charCodeAt(0) * 37, 0) % 360, [symbol])
  return (
    <span
      className="grid size-8 shrink-0 place-items-center rounded-lg border border-line text-[11px] font-semibold tracking-tight text-fg/90"
      style={{ background: `linear-gradient(135deg, hsl(${hue} 40% 22%), hsl(${(hue + 40) % 360} 30% 12%))` }}
    >
      {symbol.replace(/[^A-Z]/g, '').slice(0, 2)}
    </span>
  )
}

export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
