import { JsonRpcProvider, WebSocketProvider, Log, getAddress } from "ethers";
import { CONTEXT_WRITTEN_TOPIC0, iface } from "./abi.js";
import { Db, getMeta, insertContext, setMeta } from "./db.js";

type Provider = JsonRpcProvider | WebSocketProvider;

export type RelayConfig = {
  kernelAddress: string;
  chainId: number;
  wsUrl?: string;
  rpcUrl?: string;
  startBlock?: number;
  backfillBlocks: number;
  pollIntervalMs: number;
};

export type OnContext = (row: {
  chainId: number;
  blockNumber: number;
  txHash: string;
  logIndex: number;
  timestamp: number;
  topic: string;
  seq: number;
  author: string;
  payloadHash: string;
  uriHash: string;
  metaHash: string;
  contextId: string;
}) => void;

export async function makeProvider(cfg: RelayConfig): Promise<Provider> {
  if (cfg.wsUrl && cfg.wsUrl.startsWith("ws")) {
    return new WebSocketProvider(cfg.wsUrl, cfg.chainId);
  }
  if (!cfg.rpcUrl) throw new Error("BASE_RPC_URL missing");
  const p = new JsonRpcProvider(cfg.rpcUrl, cfg.chainId);
  return p;
}

export async function startRelay(db: Db, cfg: RelayConfig, onContext: OnContext): Promise<{ provider: Provider }> {
  const kernel = getAddress(cfg.kernelAddress);
  const provider = await makeProvider(cfg);

  const metaKey = `lastBlock:${cfg.chainId}:${kernel}`;
  const latest = await provider.getBlockNumber();

  let fromBlock: number;
  const saved = getMeta(db, metaKey);
  if (saved) {
    fromBlock = Math.max(0, Number(saved));
  } else if (typeof cfg.startBlock === "number") {
    fromBlock = cfg.startBlock;
  } else {
    fromBlock = Math.max(0, latest - cfg.backfillBlocks);
  }

  // If WS provider, subscribe in real-time AND also do a quick backfill loop.
  const isWs = provider instanceof WebSocketProvider;

  async function handleLogs(logs: Log[]) {
    // cache block timestamps to avoid repeated RPC calls
    const tsCache = new Map<number, number>();
    for (const lg of logs) {
      const parsed = iface.parseLog(lg);
      if (!parsed) continue;
      const blockNumber = lg.blockNumber!;
      let ts = tsCache.get(blockNumber);
      if (!ts) {
        const b = await provider.getBlock(blockNumber);
        ts = Number(b?.timestamp ?? 0);
        tsCache.set(blockNumber, ts);
      }

      const row = {
        chainId: cfg.chainId,
        blockNumber,
        txHash: lg.transactionHash!,
        logIndex: lg.index!,
        timestamp: ts,
        topic: parsed.args.topic as string,
        seq: Number(parsed.args.seq),
        author: parsed.args.author as string,
        payloadHash: parsed.args.payloadHash as string,
        uriHash: parsed.args.uriHash as string,
        metaHash: parsed.args.metaHash as string,
        contextId: parsed.args.contextId as string,
      };

      const inserted = insertContext(db, row);
      if (inserted) onContext(row);
    }
  }

  async function pollLoop() {
    while (true) {
      try {
        const head = await provider.getBlockNumber();
        if (fromBlock > head) {
          await sleep(cfg.pollIntervalMs);
          continue;
        }
        const toBlock = head;
        // Query in chunks to avoid provider limits
        const chunk = 2000;
        for (let a = fromBlock; a <= toBlock; a += chunk) {
          const b = Math.min(a + chunk - 1, toBlock);
          const logs = await provider.getLogs({
            address: kernel,
            fromBlock: a,
            toBlock: b,
            topics: [CONTEXT_WRITTEN_TOPIC0],
          });
          if (logs.length) await handleLogs(logs);
          fromBlock = b + 1;
          setMeta(db, metaKey, String(fromBlock));
        }
      } catch (e) {
        // swallow and retry
      }
      await sleep(cfg.pollIntervalMs);
    }
  }

  if (isWs) {
    // Real-time subscription
    provider.on({ address: kernel, topics: [CONTEXT_WRITTEN_TOPIC0] }, async (lg: Log) => {
      await handleLogs([lg]);
    });
  }

  // Always run poll loop for backfill and as WS safety-net
  void pollLoop();

  return { provider };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
