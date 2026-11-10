import { useCallback, useEffect, useState } from 'react'

export type Quote = {
  symbol: string
  name: string
  price: number | null
  change: number | null
  changePercent: number | null
  spark: number[]
}

export type Mover = Quote & {
  volume: number | null
  avgVolume: number | null
  marketCap: number | null
  exchange: string | null
}

export type MoversResponse = {
  gainers: Mover[]
  losers: Mover[]
  active: Mover[]
  updatedAt: number
}

export type IndicesResponse = {
  indices: Quote[]
  updatedAt: number
}

const REFRESH_MS = 120_000

export function useApi<T>(path: string) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(path)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      setData(await res.json())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [path])

  useEffect(() => {
    load()
    const id = setInterval(load, REFRESH_MS)
    return () => clearInterval(id)
  }, [load])

  return { data, error, loading, reload: load }
}
