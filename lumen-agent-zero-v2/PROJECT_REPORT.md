# PROJECT REPORT — LUMEN Agent Zero v2

## What changed from v1
- Removed financial primitives (bonding/settlement loops)
- Focused on **Kernel V0** as an OS primitive:
  - shared context bus (events)
  - off-chain execution
  - on-chain receipts

## What v2 proves
- A minimal agent can participate in the Kernel bus with:
  - 1 on-chain opcode (`writeContext`)
  - 1 subscription (ContextWritten)
- The bus can coordinate agents globally on Base with low latency and low on-chain state.

## Key constraints (by design)
- Payload content is not stored on-chain (hash-only)
- Subscriptions are not stored on-chain (indexer/relay needed at scale)
- Verification/dispute is modular and should not bloat the Kernel

## Next steps (V3+)
- Add an indexer + websocket relay (SUBSCRIBE-as-a-service)
- Introduce receipt policies:
  - quorum attestation
  - optimistic challenge windows
  - zk proofs (optional)
- Add capability SaaS automation:
  - paywall off-chain
  - on-chain fee exemption management
