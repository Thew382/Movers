import { motion } from 'motion/react'
import { useEffect } from 'react'
import { EASE } from './primitives'

const WORD = 'Movers'

export function Logo({ className = 'size-6', animated = false }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none">
      <rect x="0.5" y="0.5" width="31" height="31" rx="8.5" className="fill-raised stroke-line-strong" />
      <motion.path
        d="M8 21.5 L13.5 16 L17.5 19.5 L24 11.5"
        stroke="var(--color-gain)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animated ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
      />
      <motion.circle
        cx="24"
        cy="11.5"
        r="2"
        fill="var(--color-gain)"
        initial={animated ? { scale: 0, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 400, damping: 15 }}
      />
    </svg>
  )
}

export function Intro({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2100)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-canvas"
      exit={{ opacity: 0, filter: 'blur(12px)', scale: 1.04 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute size-[520px] rounded-full bg-gain/10 blur-[120px]"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, ease: EASE }}
      />
      <div className="relative flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: 'blur(6px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <Logo className="size-14" animated />
        </motion.div>

        <div className="flex overflow-hidden text-3xl font-semibold tracking-[-0.04em]">
          {WORD.split('').map((ch, i) => (
            <motion.span
              key={i}
              initial={{ y: '100%', opacity: 0, filter: 'blur(4px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, delay: 0.5 + i * 0.05, ease: EASE }}
            >
              {ch}
            </motion.span>
          ))}
        </div>

        <div className="h-px w-40 overflow-hidden rounded-full bg-line">
          <motion.div
            className="h-full origin-left bg-gradient-to-r from-transparent via-gain to-fg"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.4, delay: 0.6, ease: [0.65, 0, 0.35, 1] }}
          />
        </div>

        <motion.p
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-faint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          Fetching today's market
        </motion.p>
      </div>
    </motion.div>
  )
}
