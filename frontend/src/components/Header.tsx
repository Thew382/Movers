import { motion, useMotionValueEvent, useScroll } from 'motion/react'
import { RotateCw } from 'lucide-react'
import { useState } from 'react'
import { marketStatus, type MarketStatus } from '../lib/format'
import { Logo } from './Intro'
import { EASE, useNow } from './primitives'

const LINKS = [
  { href: '#overview', label: 'Overview' },
  { href: '#gainers', label: 'Gainers' },
  { href: '#losers', label: 'Losers' },
  { href: '#active', label: 'Most active' },
]

const STATUS: Record<MarketStatus, { label: string; dot: string }> = {
  open: { label: 'Market open', dot: 'bg-gain' },
  pre: { label: 'Pre-market', dot: 'bg-amber-400' },
  after: { label: 'After hours', dot: 'bg-amber-400' },
  closed: { label: 'Market closed', dot: 'bg-faint' },
}

export function Header({ onRefresh, refreshing }: { onRefresh: () => void; refreshing: boolean }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 8))
  useNow()
  const status = STATUS[marketStatus()]

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE }}
      className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
        scrolled ? 'border-line bg-canvas/70 backdrop-blur-xl' : 'border-transparent'
      }`}
    >
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-8">
          <a href="#" className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight">
            <Logo />
            Movers
          </a>
          <nav className="hidden items-center md:flex" onMouseLeave={() => setHovered(null)}>
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onMouseEnter={() => setHovered(l.href)}
                className="relative px-3 py-1.5 text-[13px] text-muted transition-colors hover:text-fg"
              >
                {hovered === l.href && (
                  <motion.span
                    layoutId="nav-hover"
                    className="absolute inset-0 rounded-md bg-white/[0.06]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative">{l.label}</span>
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-line px-3 py-1 text-xs text-muted sm:flex">
            <span className="relative flex size-1.5">
              {status.dot === 'bg-gain' && (
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-gain opacity-60" />
              )}
              <span className={`relative inline-flex size-1.5 rounded-full ${status.dot}`} />
            </span>
            {status.label}
          </span>
          <motion.button
            onClick={onRefresh}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            className="flex h-8 items-center gap-2 rounded-lg bg-fg px-3 text-xs font-medium text-canvas shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_8px_24px_-8px_rgb(255_255_255/0.3)]"
          >
            <RotateCw className={`size-3.5 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={2.2} />
            Refresh
          </motion.button>
        </div>
      </div>
    </motion.header>
  )
}
