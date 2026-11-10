import logging
import math
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager

import yfinance as yf
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

REFRESH_SECONDS = 60
MOVERS_COUNT = 10

INDICES = {
    "^GSPC": "S&P 500",
    "^IXIC": "Nasdaq",
    "^DJI": "Dow Jones",
    "^RUT": "Russell 2000",
    "^VIX": "VIX",
}

log = logging.getLogger("uvicorn.error")
pool = ThreadPoolExecutor(32)
_cache: dict[str, dict] = {}
_ready = {"movers": threading.Event(), "indices": threading.Event()}


def clean(x):
    if x is None or (isinstance(x, float) and math.isnan(x)):
        return None
    return round(float(x), 4)


def intraday(symbol: str):
    ticker = yf.Ticker(symbol)
    closes = ticker.history(period="1d", interval="5m")["Close"].dropna()
    return [round(float(v), 4) for v in closes], ticker.history_metadata


def screen(name: str) -> list[dict]:
    quotes = yf.screen(name, count=MOVERS_COUNT)["quotes"]
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


def build_movers():
    gainers, losers, active = pool.map(screen, ["day_gainers", "day_losers", "most_actives"])
    rows = gainers + losers + active
    symbols = list({q["symbol"] for q in rows})
    spark = dict(zip(symbols, (s for s, _ in pool.map(intraday, symbols))))
    for q in rows:
        q["spark"] = spark[q["symbol"]]
    return {"gainers": gainers, "losers": losers, "active": active, "updatedAt": int(time.time())}


def build_indices():
    out = []
    for (symbol, name), (spark, meta) in zip(INDICES.items(), pool.map(intraday, INDICES)):
        price = clean(meta.get("regularMarketPrice"))
        prev = clean(meta.get("chartPreviousClose"))
        change = price - prev if price and prev else None
        out.append(
            {
                "symbol": symbol,
                "name": name,
                "price": price,
                "change": clean(change),
                "changePercent": clean(change / prev * 100) if change is not None else None,
                "spark": spark,
            }
        )
    return {"indices": out, "updatedAt": int(time.time())}


def refresh(key: str, build):
    try:
        _cache[key] = build()
        _ready[key].set()
    except Exception:
        log.exception("Refreshing %s failed; serving previous data", key)


def refresher():
    while True:
        jobs = [pool.submit(refresh, "movers", build_movers), pool.submit(refresh, "indices", build_indices)]
        for job in jobs:
            job.result()
        time.sleep(REFRESH_SECONDS)


@asynccontextmanager
async def lifespan(app: FastAPI):
    threading.Thread(target=refresher, daemon=True).start()
    yield


app = FastAPI(title="Movers API", lifespan=lifespan)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["GET"], allow_headers=["*"])


def serve(key: str):
    if not _ready[key].wait(timeout=30):
        raise HTTPException(503, "Market data is still loading, try again shortly")
    return _cache[key]


@app.get("/api/movers")
def movers():
    return serve("movers")


@app.get("/api/indices")
def indices():
    return serve("indices")
