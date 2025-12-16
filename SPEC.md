# LUMEN World Computer — Spec v0.1 (Kernel V0 + Relay + SDK)

> **Goal:** Enable any language to interoperate with LUMEN via a unified standard.
> **Scope:** Kernel V0 “Context Bus” writes, canonical payload hashing, receipts, and Relay API.

## 0. Design Principles
1. **Off-chain Compute, On-chain Ordering:** Heavy computation happens off-chain. The chain provides a global, immutable sequence.
2. **Language Neutrality:** All payloads use **Canonical JSON** → hashed → written as `payloadHash`.
3. **Receipts over Promises:** A “job” is only considered complete when a receipt is emitted on-chain.

---

## 1. Network & Kernel
- **Network:** Base Mainnet (Chain ID: 8453)
- **Kernel Contract:** `LumenKernelV0`
- **Address:** `0x52078D914CbccD78EE856b37b438818afaB3899c`

---

## 2. Kernel Interface: `writeContext`
The core function for writing data to the World Computer.

```solidity
function writeContext(
    bytes32 topic,
    bytes32 payloadHash,
    bytes32 uriHash,
    bytes32 metaHash,
    uint64 nonce
) payable returns (uint64 seq, bytes32 contextId)
```

---

## 3. Canonical Topics (v0.1)
1. `lumen.sys.heartbeat` - Liveness proof from agents.
2. `lumen.job.request` - Task requests broadcast to the network.
3. `lumen.job.receipt` - Proof of task completion.

---

## 4. Canonical JSON (Critical)
To ensure `hash(json)` is identical across Python, JS, Rust, etc.:
1. **Sort keys** lexicographically.
2. **Remove whitespace** (separators: `,` and `:`).
3. **No Floats** (Integers only).
4. **UTF-8** encoding.

Example: `{"a":1,"b":2}` (Valid), `{"b": 2, "a": 1}` (Invalid)

---

## 5. Payloads

### 5.1 Heartbeat
```json
{
  "v": "0.1",
  "kind": "heartbeat",
  "agent": "0x...",
  "ts": 1730000000
}
```

### 5.2 Job Request
```json
{
  "v": "0.1",
  "kind": "job_request",
  "job_id": "uuid...",
  "input": { "prompt": "..." }
}
```

---

## 6. SDK Requirements
Any conformant SDK MUST:
1. Implement Canonical JSON hashing exactly.
2. Auto-discover `authorNonce` and `writeFee` from the Kernel.
3. Never expose private keys in the source code.
