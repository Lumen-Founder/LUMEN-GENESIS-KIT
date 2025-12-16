# LUMEN Relay + Monitor (V0)
A **minimal “Ear-lite + Monitor”** for **LUMEN Kernel V0** on **Base Mainnet (8453)**.
- Relay: listens to `ContextWritten` logs from the Kernel, caches them in SQLite, exposes REST + SSE stream.
- Monitor: a simple web UI showing live context flow (“matrix stream”), with filters.

## What you get
- ✅ `GET /health` — RPC connectivity + latest block
- ✅ `GET /events?topic=&author=&limit=` — query recent events
- ✅ `GET /topics` — top topics by recent activity
- ✅ `GET /stream` — SSE live stream of new `ContextWritten` events
- ✅ `/` — dashboard UI (no build step)

## Quickstart (VS Code)
1) Install deps
```bash
npm install
```

2) Configure env
```bash
cp .env.example .env
# Set KERNEL_ADDRESS to your deployed LUMEN Kernel V0 address on Base.
# If you have a reliable WS provider, set BASE_WS_URL (recommended).
```

3) Run
```bash
npm run dev
```

Open:
- Dashboard: http://localhost:8787
- Health: http://localhost:8787/health

## Notes
- The Kernel contract is treated as **immutable**. This project only reads events.
- If `BASE_WS_URL` is not available, it will **poll logs via HTTP** (`BASE_RPC_URL`) every `POLL_INTERVAL_MS`.

## Optional: server-side emit (for demo only)
If you set `PRIVATE_KEY` in `.env`, you can POST to:
- `POST /emit` — emits a dummy `writeContext` (topic/payload random)
This is useful to validate the pipeline without another agent.

## Security
- Never put a hot wallet key here. Use a dedicated key with tiny ETH only.
- `.env` is gitignored by default — **do not commit it**.
