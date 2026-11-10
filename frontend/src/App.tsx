import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { AlertTriangle } from 'lucide-react'
import { useCallback, useState, type ReactNode } from 'react'
import { ActiveGrid } from './components/ActiveGrid'
import { FeatureCard } from './components/FeatureCard'
import { Header } from './components/Header'
import { IndexStrip } from './components/IndexStrip'
import { Intro } from './components/Intro'
import { MoversTable } from './components/MoversTable'
import { EASE, Reveal } from './components/primitives'
import { useApi, type IndicesResponse, type MoversResponse } from './lib/api'
import { fmtPct, fmtTime, greeting } from './lib/format'

function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.035)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_40%,transparent_100%)]" />
      <motion.div
        className="absolute left-1/2 top-[-280px] h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(61_220_151/0.14),transparent)]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: EASE }}
      />
      <div className="absolute left-1/2 top-0 h-px w-[640px] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    </div>
  )
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, ease: EASE }}
      className="mb-6"
    >
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">{eyebrow}</div>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{title}</h2>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </motion.div>
  )
}

function Section({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 py-10">
      {children}
    </section>
  )
}

export default function App() {
  const [introDone, setIntroDone] = useState(false)
  const movers = useApi<MoversResponse>('/api/movers')
  const indices = useApi<IndicesResponse>('/api/indices')
  const finishIntro = useCallback(() => setIntroDone(true), [])

  const refresh = () => {
    movers.reload()
    indices.reload()
  }

  const spx = indices.data?.indices.find((i) => i.symbol === '^GSPC')
  const leader = movers.data?.gainers[0]
  const laggard = movers.data?.losers[0]
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const error = movers.error ?? indices.error

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>{!introDone && <Intro onDone={finishIntro} />}</AnimatePresence>
      <Background />

      {introDone && (
        <>
          <Header onRefresh={refresh} refreshing={movers.loading || indices.loading} />

          <main className="mx-auto max-w-6xl px-4 sm:px-6">
            <section id="overview" className="pb-10 pt-16 sm:pt-24">
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.02] py-1 pl-1 pr-3 text-xs text-muted">
                  <span className="rounded-full bg-gain/15 px-2 py-0.5 font-medium text-gain">Live</span>
                  {movers.data ? `Updated ${fmtTime(movers.data.updatedAt)}` : 'Loading data…'}
                  <span className="text-faint">·</span>
                  Yahoo Finance
                </span>
              </Reveal>

              <Reveal delay={0.08}>
                <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-7xl">
                  {greeting()}.
                  <span className="block bg-gradient-to-b from-fg/70 to-fg/30 bg-clip-text text-transparent">
                    Here's what moved.
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={0.16}>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                  {today}.{' '}
                  {spx && leader && laggard ? (
                    <>
                      The S&P 500 is{' '}
                      <span className={(spx.changePercent ?? 0) >= 0 ? 'text-gain' : 'text-loss'}>
                        {(spx.changePercent ?? 0) >= 0 ? 'up' : 'down'} {fmtPct(Math.abs(spx.changePercent ?? 0))}
                      </span>
                      . <span className="text-fg">{leader.symbol}</span> leads with {fmtPct(leader.changePercent)}, while{' '}
                      <span className="text-fg">{laggard.symbol}</span> trails at {fmtPct(laggard.changePercent)}.
                    </>
                  ) : (
                    'Your daily snapshot of the biggest winners and losers in the US market.'
                  )}
                </p>
              </Reveal>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-6 flex items-center gap-3 rounded-xl border border-loss/20 bg-loss/5 px-4 py-3 text-sm text-loss">
                      <AlertTriangle className="size-4 shrink-0" />
                      <span className="flex-1">Couldn't reach the data API — {error}</span>
                      <button onClick={refresh} className="font-medium underline-offset-4 hover:underline">
                        Retry
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Reveal delay={0.24} className="mt-12">
                <IndexStrip indices={indices.data?.indices} />
              </Reveal>
            </section>

            <Section>
              <SectionHeading
                eyebrow="01 — Headliners"
                title="Today's extremes"
                description="The single biggest move on each side of the tape."
              />
              <div className="grid gap-4 md:grid-cols-2">
                <FeatureCard mover={leader} kind="gain" delay={0.3} />
                <FeatureCard mover={laggard} kind="loss" delay={0.4} />
              </div>
            </Section>

            <Section>
              <SectionHeading
                eyebrow="02 — Leaderboard"
                title="Winners & losers"
                description="Top 10 by percent change. Click any row for volume and market cap."
              />
              <div className="grid gap-4 lg:grid-cols-2">
                <MoversTable id="gainers" title="Top gainers" subtitle="Largest % increase today" movers={movers.data?.gainers} />
                <MoversTable id="losers" title="Top losers" subtitle="Largest % decrease today" movers={movers.data?.losers} delay={0.1} />
              </div>
            </Section>

            <Section id="active">
              <SectionHeading
                eyebrow="03 — Volume"
                title="Most active"
                description="Where the shares changed hands. Bars show volume relative to the busiest ticker."
              />
              <ActiveGrid movers={movers.data?.active} />
            </Section>
          </main>

          <footer className="mt-16 border-t border-line">
            <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-4 py-8 text-xs text-faint sm:flex-row sm:px-6">
              <span>Movers — a daily market snapshot</span>
              <span>Data via yfinance. Quotes may be delayed. Not investment advice.</span>
            </div>
          </footer>
        </>
      )}
    </MotionConfig>
  )
}
