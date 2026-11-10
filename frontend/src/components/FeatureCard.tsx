import { TrendingDown, TrendingUp } from 'lucide-react'
import type { Mover } from '../lib/api'
import { fmtChange, fmtCompact, fmtPct, fmtPrice } from '../lib/format'
import { AnimatedNumber, Card, EASE, Monogram, Sparkline } from './primitives'

export function FeatureCard({ mover, kind, delay = 0 }: { mover: Mover | undefined; kind: 'gain' | 'loss'; delay?: number }) {
  if (!mover) return <div className="skeleton h-[340px] rounded-2xl" />

  const up = kind === 'gain'
  const Icon = up ? TrendingUp : TrendingDown
  const relVol = mover.volume && mover.avgVolume ? mover.volume / mover.avgVolume : null

  return (
    <Card
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: EASE }}
      className="group overflow-hidden"
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute -top-24 right-0 size-72 rounded-full blur-[90px] transition-opacity duration-700 group-hover:opacity-100 ${
          up ? 'bg-gain/15' : 'bg-loss/15'
        } opacity-60`}
      />
      <div className="relative p-6">
        <div className={`flex items-center gap-2 text-xs font-medium ${up ? 'text-gain' : 'text-loss'}`}>
          <Icon className="size-3.5" />
          {up ? 'Biggest winner today' : 'Biggest loser today'}
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Monogram symbol={mover.symbol} />
          <div className="min-w-0">
            <div className="text-sm font-semibold tracking-tight">{mover.symbol}</div>
            <div className="truncate text-xs text-muted">{mover.name}</div>
          </div>
        </div>

        <div className="mt-6 flex items-end justify-between gap-4">
          <div
            className={`bg-gradient-to-b bg-clip-text pr-[0.1em] font-mono text-5xl font-semibold tracking-[-0.05em] text-transparent sm:text-6xl ${
              up ? 'from-gain to-gain/60' : 'from-loss to-loss/60'
            }`}
          >
            <AnimatedNumber value={mover.changePercent} format={fmtPct} />
          </div>
          <div className="pb-1.5 text-right font-mono">
            <div className="text-lg font-medium tabular">${fmtPrice(mover.price)}</div>
            <div className={`text-xs tabular ${up ? 'text-gain' : 'text-loss'}`}>{fmtChange(mover.change)} today</div>
          </div>
        </div>
      </div>

      <Sparkline data={mover.spark} positive={up} className="relative h-24 w-full" delay={delay + 0.3} />

      <dl className="relative grid grid-cols-3 divide-x divide-line border-t border-line">
        {[
          ['Volume', fmtCompact(mover.volume)],
          ['Rel. volume', relVol ? `${relVol.toFixed(1)}×` : '—'],
          ['Market cap', fmtCompact(mover.marketCap)],
        ].map(([k, v]) => (
          <div key={k} className="px-6 py-4">
            <dt className="text-[11px] uppercase tracking-wider text-faint">{k}</dt>
            <dd className="mt-1 font-mono text-sm tabular">{v}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}
