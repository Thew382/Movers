import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { Mover } from '../lib/api'
import { fmtCompact, fmtPrice } from '../lib/format'
import { Card, ChangePill, EASE, Monogram, Sparkline } from './primitives'

type Props = {
  id: string
  title: string
  subtitle: string
  movers: Mover[] | undefined
  delay?: number
}

export function MoversTable({ id, title, subtitle, movers, delay = 0 }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [open, setOpen] = useState<string | null>(null)

  return (
    <Card
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, delay, ease: EASE }}
      className="scroll-mt-20 overflow-hidden"
    >
      <div className="flex items-end justify-between border-b border-line px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
        </div>
        <span className="font-mono text-[11px] text-faint">{movers?.length ?? 0} tickers</span>
      </div>

      <ul className="p-1.5" onMouseLeave={() => setHovered(null)}>
        {movers
          ? movers.map((m, i) => {
              const up = (m.changePercent ?? 0) >= 0
              const expanded = open === m.symbol
              const relVol = m.volume && m.avgVolume ? m.volume / m.avgVolume : null
              return (
                <motion.li
                  key={m.symbol}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: delay + 0.04 * i, ease: EASE }}
                  className="relative"
                  onMouseEnter={() => setHovered(m.symbol)}
                >
                  {(hovered === m.symbol || expanded) && (
                    <div className="absolute inset-0 rounded-xl bg-white/[0.04] ring-1 ring-inset ring-white/[0.04]" />
                  )}
                  <button
                    onClick={() => setOpen(expanded ? null : m.symbol)}
                    className="relative flex w-full items-center gap-3 px-3 py-2.5 text-left"
                  >
                    <span className="w-4 font-mono text-[11px] text-faint tabular">{i + 1}</span>
                    <Monogram symbol={m.symbol} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium tracking-tight">{m.symbol}</div>
                      <div className="truncate text-xs text-muted">{m.name}</div>
                    </div>
                    <Sparkline data={m.spark} positive={up} fill={false} className="hidden h-7 w-20 sm:block" delay={delay + 0.04 * i} />
                    <div className="w-20 text-right font-mono text-[13px] tabular">{fmtPrice(m.price)}</div>
                    <div className="w-[72px] text-right">
                      <ChangePill value={m.changePercent} />
                    </div>
                    <ChevronDown
                      className={`size-3.5 text-faint transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="relative overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 px-3 pb-4 pl-[60px] pt-1 sm:grid-cols-4">
                          {[
                            ['Volume', fmtCompact(m.volume)],
                            ['Avg volume', fmtCompact(m.avgVolume)],
                            ['Rel. volume', relVol ? `${relVol.toFixed(1)}×` : '—'],
                            ['Market cap', fmtCompact(m.marketCap)],
                          ].map(([k, v]) => (
                            <div key={k}>
                              <div className="text-[10px] uppercase tracking-wider text-faint">{k}</div>
                              <div className="mt-0.5 font-mono text-xs tabular">{v}</div>
                            </div>
                          ))}
                          <a
                            href={`https://finance.yahoo.com/quote/${m.symbol}`}
                            target="_blank"
                            rel="noreferrer"
                            className="col-span-full inline-flex w-fit items-center gap-1 text-xs text-muted transition-colors hover:text-fg"
                          >
                            {m.exchange} · View on Yahoo Finance
                            <ArrowUpRight className="size-3" />
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              )
            })
          : Array.from({ length: 8 }, (_, i) => <li key={i} className="skeleton m-1 h-12 rounded-xl" />)}
      </ul>
    </Card>
  )
}
