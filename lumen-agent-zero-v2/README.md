# LUMEN Agent Zero v2.0 — World Computer Demo Agent (Base Mainnet)

**Agent Zero v2** is a reference autonomous agent for **LUMEN Kernel V0** (Global Context Bus).
It demonstrates the minimal OS loop:

> **WRITE_CONTEXT → SUBSCRIBE → EXECUTE (off-chain) → WRITE_RECEIPT**

- Chain: **Base Mainnet (8453)**
- Runtime: Node.js + TypeScript + ethers v6
- On-chain footprint: **one function call** (`writeContext`) + **event listening**

---

## What this agent does

### Topics
- `lumen.v0.job.request`  → Job request signal (hash-only)
- `lumen.v0.job.receipt`  → Deterministic receipt signal (hash-only)

The Kernel stores only `(topic, seq, author, payloadHash, uriHash, metaHash, contextId)` as an event.
**No payload is stored on-chain**. That is the whole point of Kernel V0.

### Behavior
- Listens to `JOB_REQUEST`
- For each request, produces a deterministic receipt derived from:
  - request `contextId`
  - request `payloadHash`
  - worker address
- Writes a `JOB_RECEIPT` back to the Kernel

This is a **hash-only demo**. In production, `uriHash/metaHash` would point to IPFS/Arweave or an indexer.

---

## 2-minute Quickstart (VS Code)

### 0) Requirements
- Node.js 18+ (recommended 20+)
- A **Base** wallet with small ETH for gas
- A deployed **LUMEN Kernel V0** address on Base

### 1) Install
```bash
npm install
cp .env.example .env
```

### 2) Configure `.env`
Set:
- `PRIVATE_KEY=...`
- `KERNEL_ADDRESS=0x...`  (Base-deployed Kernel V0)

Optional:
- `BASE_RPC_URL=` (default is `https://mainnet.base.org`)
- `CONFIRMATIONS=1`

### 3) Run (two terminals)

**Terminal A (listener / worker)**
```bash
npm run listen
```

**Terminal B (emit a demo request)**
```bash
npm run emit
```

You should see:
- a `JOB_REQUEST` event
- then a `JOB_RECEIPT` event written back by the worker

---

## Notes (Important)

### Permissions
If your Kernel requires capability for writes (non-public topic), you must:
- set `topicPublicWrite[topic] = true`, or
- grant write capability to your agent address

Otherwise, `writeContext` will revert with `NotAuthorized`.

### Fees
If your Kernel enforces a micro-fee:
- Agent Zero automatically reads `getWriteFeeFor(address)` and attaches `msg.value`.
- If you are fee-exempt, it will send `0`.

### Security
- **Never** use a main wallet private key.
- Use a dedicated agent key funded with small Base ETH.
- `.env` is gitignored — keep it that way.

---

## Commands
```bash
npm run dev        # listen + keep running (default)
npm run listen     # listen only
npm run emit       # emit a single JOB_REQUEST
npm run topics     # print topic hashes
npm run typecheck  # TS typecheck
```

---

## License
MIT
