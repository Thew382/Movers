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

const REFRESH_MS = 60_000

function readCache<T>(path: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(`cache:${path}`) ?? 'null')
  } catch {
    return null
  }
}

function writeCache(path: string, value: unknown) {
  try {
    localStorage.setItem(`cache:${path}`, JSON.stringify(value))
  } catch {
    // storage full or blocked; the in-memory copy is enough
  }
}

export function useApi<T>(path: string) {
  const [data, setData] = useState<T | null>(() => readCache<T>(path))
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(path)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const json = await res.json()
      setData(json)
      writeCache(path, json)
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
