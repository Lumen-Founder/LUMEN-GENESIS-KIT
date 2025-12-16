# LUMEN Kernel V0 — Base Mainnet Deployment Kit (VS Code)

This repository is a **drop-in VS Code project** that deploys **LUMEN Kernel V0** (Global Context Bus) to **Base Mainnet**.

This version includes **sustainable monetization**:
- **Micro-toll per `writeContext`** (spam friction + baseline revenue)
- **Enterprise exemption (Free Pass)** via `feeExempt[address]=true`
- Fees **accumulate in the kernel** and are withdrawn in batches via `withdrawFees()`

**Kernel philosophy:** on-chain = *capabilities + receipts + append-only topic sequencing*; off-chain = *payloads + indexing + execution*.

---

## What this kit does

- Deploys `contracts/LumenKernelV0.sol` to Base Mainnet (chainId **8453**)
- Saves deployment metadata to `deployments/8453.json`
- Keeps secrets out of git (`.env` ignored)
- Optional explorer verification (BaseScan)

---

## Prerequisites

- Node.js 18+ (recommended 20+)
- NPM
- A **fresh deployer** private key with enough ETH on Base for deployment gas

> Safety: do **NOT** reuse a hot wallet with meaningful funds. Use a dedicated deployer key.

---

## Quickstart (Base Mainnet)

```bash
git clone <THIS_REPO>
cd lumen-kernel-v0-deploy-kit

npm install
cp .env.example .env
# edit .env and set PRIVATE_KEY
npm run compile
npm run deploy:base
```

---

## Environment variables

`.env` (required):
- `PRIVATE_KEY` — deployer EOA key (hex, no spaces)

Optional:
- `BASE_RPC_URL` — default: `https://mainnet.base.org`
- `OWNER_ADDRESS` — defaults to deployer
- `TREASURY_ADDRESS` — defaults to deployer
- `INITIAL_WRITE_FEE_ETH` — defaults to `0.000002`
- `BASESCAN_API_KEY` — only needed for `hardhat verify`

---

## Verify (optional)

After deploy, run:

```bash
npx hardhat verify --network base <DEPLOYED_ADDRESS> <OWNER_ADDRESS> <TREASURY_ADDRESS> <INITIAL_FEE_WEI>
```

If verification tooling changes, you can always verify by publishing sources in the explorer UI.

---

## Core opcode: WRITE_CONTEXT

`writeContext(topic, payloadHash, uriHash, metaHash, nonce)` emits an append-only log per topic.

### Micro-toll rule
`writeContext` is **payable** and requires an **exact fee**:
- If caller is exempt (`feeExempt[caller]=true`): `msg.value` must be `0`
- Otherwise: `msg.value` must equal `writeFee`

**Rules:**
- Payloads are never stored on-chain.
- Subscriptions are off-chain (indexers listen to events).
- Only authorized writers can write (capability model), unless `topicPublicWrite[topic]=true`.

---

## Suggested next steps (production hardening)

- Add a `PolicyModule` (rate limit / allowlist / dynamic fee gate)
- Add `ReceiptRegistry` for execution receipts
- Add Indexer + WebSocket relay for topic subscription streams

---

## License

MIT
