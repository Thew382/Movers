const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 })

export const fmtPrice = (n: number | null) =>
  n == null ? '—' : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const fmtCompact = (n: number | null) => (n == null ? '—' : compact.format(n))

export const fmtPct = (n: number | null) => (n == null ? '—' : `${n > 0 ? '+' : ''}${n.toFixed(2)}%`)

export const fmtChange = (n: number | null) => (n == null ? '—' : `${n > 0 ? '+' : ''}${n.toFixed(2)}`)

export const fmtTime = (unix: number) =>
  new Date(unix * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

function nyParts(d = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(d)
  const get = (t: string) => parts.find((p) => p.type === t)!.value
  return { weekday: get('weekday'), minutes: Number(get('hour')) * 60 + Number(get('minute')) }
}

export type MarketStatus = 'open' | 'pre' | 'after' | 'closed'

export function marketStatus(): MarketStatus {
  const { weekday, minutes } = nyParts()
  if (weekday === 'Sat' || weekday === 'Sun') return 'closed'
  if (minutes >= 570 && minutes < 960) return 'open'
  if (minutes >= 240 && minutes < 570) return 'pre'
  if (minutes >= 960 && minutes < 1200) return 'after'
  return 'closed'
}

export function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}
