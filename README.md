# Movers

Daily dashboard of the stock market's biggest winners and losers.

- **backend/** — FastAPI + yfinance (`/api/movers`, `/api/indices`, 2‑min cache)
- **frontend/** — React + Vite + Tailwind v4 + Motion, Geist / Geist Mono

## Run

```sh
# terminal 1
cd backend
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt   # first time only
.venv/bin/uvicorn main:app --port 8000

# terminal 2
cd frontend
npm install   # first time only
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` to the backend.
# Movers
