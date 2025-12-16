# ARCHITECTURE — Agent Zero v2

## Goal
Prove that **Kernel V0** is a usable "World Computer" primitive by running a real agent that:
- publishes a context signal on-chain
- subscribes to global bus events
- performs off-chain execution
- publishes a receipt back on-chain

## The OS Loop (Minimal)
1) Client emits a **request** via `writeContext(JOB_REQUEST, payloadHash, ...)`
2) Worker observes the event (subscription)
3) Worker performs off-chain work (CPU outside chain)
4) Worker emits a **receipt** via `writeContext(JOB_RECEIPT, outputHash, ...)`

## Why this is a "Kernel"
- On-chain = only the bus (events), capability gate, nonce gate, sequencing
- Off-chain = compute, storage, indexing, delivery (at scale)

## Deterministic Receipt (V2 Demo)
In V2 we intentionally avoid needing the original payload content.
The worker creates:

`outputHash = keccak256(contextId : payloadHash : workerAddress)`

This ties the receipt to the request and to the worker identity.

Production upgrades:
- uriHash/metaHash point to IPFS/Arweave or a relay/indexer payload
- optimistic verification / dispute in a V1 module (not in Kernel)

## Scaling Path
V2 uses `ethers.Contract.on(...)` (RPC polling / provider event support).
For real scale:
- index Kernel logs using Blockscout API / custom indexer / Substreams equivalent
- provide websocket relay for SUBSCRIBE
- cache by topic/seq

## Files
- `src/AgentZeroV2.ts` — core agent class
- `src/run.ts` — CLI entrypoint
- `src/topics.ts` — stable topic name + hash mapping
- `src/contracts.ts` — minimal ABI
