import type { Quote } from '../lib/api'
import { fmtChange, fmtPrice } from '../lib/format'
import { AnimatedNumber, Card, ChangePill, EASE, Sparkline } from './primitives'

export function IndexStrip({ indices }: { indices: Quote[] | undefined }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {indices
        ? indices.map((q, i) => {
            const up = (q.change ?? 0) >= 0
            return (
              <Card
                key={q.symbol}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.05 * i, ease: EASE }}
                whileHover={{ y: -2 }}
                className={`overflow-hidden p-4 ${i === 4 ? 'hidden lg:block' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted">{q.name}</span>
                  <ChangePill value={q.changePercent} />
                </div>
                <div className="mt-3 font-mono text-xl font-medium tracking-tight">
                  <AnimatedNumber value={q.price} format={fmtPrice} />
                </div>
                <div className={`mt-0.5 font-mono text-xs tabular ${up ? 'text-gain' : 'text-loss'}`}>
                  {fmtChange(q.change)}
                </div>
                <Sparkline data={q.spark} positive={up} className="-mx-4 -mb-4 mt-3 h-10 w-[calc(100%+2rem)]" delay={0.1 * i} />
              </Card>
            )
          })
        : Array.from({ length: 5 }, (_, i) => (
            <div key={i} className={`skeleton h-[134px] rounded-2xl ${i === 4 ? 'hidden lg:block' : ''}`} />
          ))}
    </div>
  )
}
