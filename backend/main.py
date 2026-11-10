import math
import time
from concurrent.futures import ThreadPoolExecutor

import yfinance as yf
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Movers API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["GET"], allow_headers=["*"])

CACHE_TTL = 120
_cache: dict[str, tuple[float, object]] = {}

INDICES = {
    "^GSPC": "S&P 500",
    "^IXIC": "Nasdaq",
    "^DJI": "Dow Jones",
    "^RUT": "Russell 2000",
    "^VIX": "VIX",
}


def cached(key, fn):
    hit = _cache.get(key)
    if hit and time.time() - hit[0] < CACHE_TTL:
        return hit[1]
    value = fn()
    _cache[key] = (time.time(), value)
    return value


def clean(x):
    if x is None or (isinstance(x, float) and math.isnan(x)):
        return None
    return round(float(x), 4)


def sparklines(symbols: list[str]) -> dict[str, list[float]]:
    if not symbols:
        return {}
    df = yf.download(symbols, period="1d", interval="5m", progress=False, group_by="column", auto_adjust=False)
    if df.empty:
        return {}
    closes = df["Close"]
    out = {}
    for s in symbols:
        if s in closes:
            out[s] = [round(float(v), 4) for v in closes[s].dropna().tolist()]
    return out


def screen(name: str, count: int) -> list[dict]:
    quotes = yf.screen(name, count=count)["quotes"]
    return [
        {
            "symbol": q["symbol"],
            "name": q.get("shortName") or q.get("longName") or q["symbol"],
            "price": clean(q.get("regularMarketPrice")),
            "change": clean(q.get("regularMarketChange")),
            "changePercent": clean(q.get("regularMarketChangePercent")),
            "volume": q.get("regularMarketVolume"),
            "avgVolume": q.get("averageDailyVolume3Month"),
            "marketCap": q.get("marketCap"),
            "exchange": q.get("fullExchangeName"),
        }
        for q in quotes
    ]


def build_movers(count: int):
    with ThreadPoolExecutor(3) as pool:
        gainers, losers, active = pool.map(
            lambda n: screen(n, count), ["day_gainers", "day_losers", "most_actives"]
        )
    symbols = list({q["symbol"] for q in gainers + losers + active})
    spark = sparklines(symbols)
    for q in gainers + losers + active:
        q["spark"] = spark.get(q["symbol"], [])
    return {"gainers": gainers, "losers": losers, "active": active, "updatedAt": int(time.time())}


def build_indices():
    spark = sparklines(list(INDICES))
    out = []
    for symbol, name in INDICES.items():
        info = yf.Ticker(symbol).fast_info
        price = clean(info.last_price)
        prev = clean(info.previous_close)
        change = price - prev if price and prev else None
        out.append(
            {
                "symbol": symbol,
                "name": name,
                "price": price,
                "change": clean(change),
                "changePercent": clean(change / prev * 100) if change is not None else None,
                "spark": spark.get(symbol, []),
            }
        )
    return {"indices": out, "updatedAt": int(time.time())}


@app.get("/api/movers")
def movers(count: int = 10):
    count = max(1, min(count, 25))
    try:
        return cached(f"movers:{count}", lambda: build_movers(count))
    except Exception as e:
        raise HTTPException(502, f"Upstream data error: {e}")


@app.get("/api/indices")
def indices():
    try:
        return cached("indices", build_indices)
    except Exception as e:
        raise HTTPException(502, f"Upstream data error: {e}")
