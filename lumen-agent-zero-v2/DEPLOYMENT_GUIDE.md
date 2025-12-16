# DEPLOYMENT GUIDE — Agent Zero v2 (Base Mainnet)

This repo does **not** deploy the Kernel contract.
It assumes Kernel V0 is already deployed and verified.

## 1) Prepare a dedicated agent key
- Create a new EOA
- Fund with a small amount of Base ETH (gas only)
- Put the private key into `.env` (never commit)

## 2) Point to your Kernel address
Set:
- `KERNEL_ADDRESS=0x...` (Base mainnet)

Confirm chain:
```bash
npm run topics
```

## 3) Permissions checklist
If your Kernel has non-public topics:
- either owner calls `setTopicPublicWrite(topic, true)` for:
  - `TOPICS.JOB_REQUEST`
  - `TOPICS.JOB_RECEIPT`
- or owner grants capability to the agent address for those topics.

Without this, tx will revert with NotAuthorized.

## 4) Run
Worker:
```bash
npm run listen
```

Client:
```bash
npm run emit
```

## Troubleshooting
### A) "Missing env: PRIVATE_KEY"
You forgot to set `.env`.

### B) Revert: NotAuthorized
Topic is not public + you don't have capability.

### C) Revert: InsufficientFee
Kernel has a fee and you don't have enough ETH.
Agent reads `getWriteFeeFor` automatically, but the wallet must have ETH.

### D) RPC rate limit
Set `BASE_RPC_URL` to a paid provider endpoint (Alchemy/Infura/your node).
