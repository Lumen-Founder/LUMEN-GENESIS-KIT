import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { openDb, queryEvents, queryTopics } from "./db.js";
import { startRelay, makeProvider } from "./poller.js";
import { Wallet, Contract, keccak256, toUtf8Bytes, randomBytes, hexlify } from "ethers";
import { KERNEL_ABI } from "./abi.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 8787);
const DB_PATH = process.env.DB_PATH || "./lumen.db";

const kernelAddress = process.env.KERNEL_ADDRESS;
if (!kernelAddress || !kernelAddress.startsWith("0x") || kernelAddress.length !== 42) {
  console.error("ERROR: Set KERNEL_ADDRESS in .env (a Base mainnet address).");
  process.exit(1);
}

const BASE_WS_URL = process.env.BASE_WS_URL || "";
const BASE_RPC_URL = process.env.BASE_RPC_URL || "";
const chainId = 8453;

const BACKFILL_BLOCKS = Number(process.env.BACKFILL_BLOCKS || 5000);
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS || 2000);
const START_BLOCK = process.env.START_BLOCK ? Number(process.env.START_BLOCK) : undefined;

const db = openDb(DB_PATH);

const app = express();
app.use(cors());
app.use(express.json());

// serve frontend
app.use(express.static(path.join(process.cwd(), "public")));

type SseClient = { id: number; res: express.Response };
const clients: SseClient[] = [];
let nextClientId = 1;

function sseWrite(res: express.Response, event: string, data: any) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

app.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const id = nextClientId++;
  clients.push({ id, res });

  // initial hello
  sseWrite(res, "hello", { ok: true, kernelAddress, chainId });

  req.on("close", () => {
    const idx = clients.findIndex((c) => c.id === id);
    if (idx >= 0) clients.splice(idx, 1);
  });
});

app.get("/health", async (_req, res) => {
  try {
    const provider = await makeProvider({ kernelAddress, chainId, wsUrl: BASE_WS_URL, rpcUrl: BASE_RPC_URL, backfillBlocks: BACKFILL_BLOCKS, pollIntervalMs: POLL_INTERVAL_MS });
    const latestBlock = await provider.getBlockNumber();
    res.json({ ok: true, chainId, kernelAddress, latestBlock, ws: !!BASE_WS_URL, rpc: !!BASE_RPC_URL });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

app.get("/events", (req, res) => {
  const topic = (req.query.topic as string | undefined)?.trim() || undefined;
  const author = (req.query.author as string | undefined)?.trim() || undefined;
  const limit = Math.min(Math.max(Number(req.query.limit || 200), 1), 1000);
  const events = queryEvents(db, { topic, author, limit });
  res.json({ events });
});

app.get("/topics", (_req, res) => {
  const topics = queryTopics(db, 50);
  res.json({ topics });
});

// Optional: emit dummy context from server (demo only)
app.post("/emit", async (_req, res) => {
  const pk = process.env.PRIVATE_KEY;
  if (!pk) return res.status(400).json({ ok: false, error: "PRIVATE_KEY not set" });

  try {
    const provider = await makeProvider({ kernelAddress, chainId, wsUrl: BASE_WS_URL, rpcUrl: BASE_RPC_URL, backfillBlocks: BACKFILL_BLOCKS, pollIntervalMs: POLL_INTERVAL_MS });
    const wallet = new Wallet(pk, provider);
    const kernel = new Contract(kernelAddress, KERNEL_ABI, wallet);

    // demo topic: keccak256("lumen.v0.demo")
    const topic = keccak256(toUtf8Bytes("lumen.v0.demo"));
    const payloadHash = keccak256(hexlify(randomBytes(32)));
    const uriHash = keccak256(toUtf8Bytes("ipfs://demo"));
    const metaHash = keccak256(toUtf8Bytes("demo"));

    // nonce is agent-managed; for demo assume wallet nonce starts at 0.
    // If your kernel enforces authorNonce, you must query off-chain state or track it.
    // We try 0..5 to find the next valid nonce without modifying the kernel.
    let sent = false;
    for (let i = 0; i < 6; i++) {
      try {
        // fee: if kernel exposes getWriteFeeFor, use it
        let fee = 0n;
        try { fee = await kernel.getWriteFeeFor(wallet.address); } catch {}
        const tx = await kernel.writeContext(topic, payloadHash, uriHash, metaHash, i, { value: fee });
        const rcp = await tx.wait();
        sent = true;
        return res.json({ ok: true, txHash: rcp?.hash, nonce: i });
      } catch {}
    }
    if (!sent) return res.status(500).json({ ok: false, error: "Failed to emit (nonce/permission/fee). See README notes." });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

app.listen(PORT, async () => {
  console.log(`LUMEN Relay+Monitor running on http://localhost:${PORT}`);
  console.log(`Kernel: ${kernelAddress} (chainId=${chainId})`);
  console.log(`DB: ${DB_PATH}`);
  console.log(`WS: ${BASE_WS_URL ? "ON" : "OFF"} | RPC: ${BASE_RPC_URL ? "ON" : "OFF"} | poll=${POLL_INTERVAL_MS}ms backfill=${BACKFILL_BLOCKS}`);

  await startRelay(db, {
    kernelAddress,
    chainId,
    wsUrl: BASE_WS_URL || undefined,
    rpcUrl: BASE_RPC_URL || undefined,
    startBlock: START_BLOCK,
    backfillBlocks: BACKFILL_BLOCKS,
    pollIntervalMs: POLL_INTERVAL_MS,
  }, (row) => {
    // broadcast new row to SSE clients
    for (const c of clients) {
      try { sseWrite(c.res, "context", row); } catch {}
    }
  });
});
