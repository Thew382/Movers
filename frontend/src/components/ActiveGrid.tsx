import { motion } from 'motion/react'
import type { Mover } from '../lib/api'
import { fmtCompact, fmtPrice } from '../lib/format'
import { Card, ChangePill, EASE } from './primitives'

export function ActiveGrid({ movers }: { movers: Mover[] | undefined }) {
  if (!movers) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="skeleton h-[118px] rounded-2xl" />
        ))}
      </div>
    )
  }

  const maxVol = Math.max(...movers.map((m) => m.volume ?? 0)) || 1

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {movers.map((m, i) => (
        <Card
          key={m.symbol}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.04 * i, ease: EASE }}
          whileHover={{ y: -3 }}
          className="p-4"
        >
          <a href={`https://finance.yahoo.com/quote/${m.symbol}`} target="_blank" rel="noreferrer" className="block">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[13px] font-semibold tracking-tight">{m.symbol}</div>
                <div className="truncate text-[11px] text-muted">{m.name}</div>
              </div>
              <ChangePill value={m.changePercent} />
            </div>
            <div className="mt-4 font-mono text-base font-medium tabular">${fmtPrice(m.price)}</div>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-white/30 to-white/80"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${((m.volume ?? 0) / maxVol) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3 + 0.05 * i, ease: EASE }}
                />
              </div>
              <span className="font-mono text-[10px] text-faint tabular">{fmtCompact(m.volume)}</span>
            </div>
          </a>
        </Card>
      ))}
    </div>
  )
}
