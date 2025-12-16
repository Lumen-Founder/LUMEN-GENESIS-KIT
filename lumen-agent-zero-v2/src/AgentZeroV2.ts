import { Contract, JsonRpcProvider, Wallet, keccak256, toUtf8Bytes, ZeroHash } from 'ethers';
import { LumenKernelV0Abi } from './contracts.js';
import { TOPICS, TOPIC_NAMES } from './topics.js';

export type AgentZeroConfig = {
  kernelAddress: `0x${string}`;
  confirmations: number;
};

export type WriteContextArgs = {
  topic: `0x${string}`;
  payloadHash: `0x${string}`;
  uriHash?: `0x${string}`;
  metaHash?: `0x${string}`;
};

export type ContextEvent = {
  topic: string;
  seq: bigint;
  author: string;
  payloadHash: string;
  uriHash: string;
  metaHash: string;
  contextId: string;
};

export class AgentZeroV2 {
  public readonly provider: JsonRpcProvider;
  public readonly wallet: Wallet;
  public readonly kernel: Contract;
  public readonly config: AgentZeroConfig;

  constructor(provider: JsonRpcProvider, wallet: Wallet, config: AgentZeroConfig) {
    this.provider = provider;
    this.wallet = wallet.connect(provider);
    this.config = config;
    this.kernel = new Contract(config.kernelAddress, LumenKernelV0Abi, this.wallet);
  }

  async getAuthorNonce(): Promise<bigint> {
    const n: bigint = await this.kernel.authorNonce(this.wallet.address);
    return n;
  }

  async getRequiredFeeWei(): Promise<bigint> {
    const fee: bigint = await this.kernel.getWriteFeeFor(this.wallet.address);
    return fee;
  }

  async writeContext(args: WriteContextArgs): Promise<{ txHash: string; contextId: string; seq: bigint }> {
    const nonce = await this.getAuthorNonce();
    const requiredFee = await this.getRequiredFeeWei();

    const uriHash = args.uriHash ?? (ZeroHash as `0x${string}`);
    const metaHash = args.metaHash ?? (ZeroHash as `0x${string}`);

    const tx = await this.kernel.writeContext(args.topic, args.payloadHash, uriHash, metaHash, nonce, {
      value: requiredFee,
    });

    const receipt = await tx.wait(this.config.confirmations);
    if (!receipt) throw new Error('No receipt');

    const log = receipt.logs
      .map((l: any) => {
        try {
          return this.kernel.interface.parseLog(l);
        } catch {
          return null;
        }
      })
      .find((p: any) => p && p.name === 'ContextWritten');

    if (!log) throw new Error('ContextWritten event not found');

    const seq: bigint = log.args.seq as bigint;
    const contextId: string = log.args.contextId as string;

    return { txHash: receipt.hash, contextId, seq };
  }

  async emitJobRequest(job: { kind: string; prompt: string; ts?: number }): Promise<{ contextId: string; txHash: string }> {
    const payload = { ...job, ts: job.ts ?? Date.now() };
    const payloadHash = keccak256(toUtf8Bytes(JSON.stringify(payload))) as `0x${string}`;
    const metaHash = keccak256(toUtf8Bytes(`job:${payload.kind}`)) as `0x${string}`;

    const { txHash, contextId } = await this.writeContext({
      topic: TOPICS.JOB_REQUEST,
      payloadHash,
      metaHash,
    });

    return { txHash, contextId };
  }

  async handleJobRequest(ev: ContextEvent): Promise<{ txHash: string; receiptContextId: string }> {
    const outputHash = keccak256(
      toUtf8Bytes(`${ev.contextId}:${ev.payloadHash}:${this.wallet.address.toLowerCase()}`),
    ) as `0x${string}`;

    const receiptMeta = {
      forContextId: ev.contextId,
      by: this.wallet.address,
      outputHash,
      ts: Date.now(),
    };

    const payloadHash = outputHash;
    const metaHash = keccak256(toUtf8Bytes(JSON.stringify(receiptMeta))) as `0x${string}`;

    const res = await this.writeContext({
      topic: TOPICS.JOB_RECEIPT,
      payloadHash,
      metaHash,
    });

    return { txHash: res.txHash, receiptContextId: res.contextId };
  }

  /**
   * [FIXED] Manual Polling Subscription
   * 공용 RPC의 "filter not found" 에러를 피하기 위해, 수동으로 3초마다 로그를 긁어옵니다.
   */
  async subscribe(topic: `0x${string}`, onEvent: (ev: ContextEvent) => Promise<void> | void): Promise<() => void> {
    const filter = this.kernel.filters.ContextWritten(topic);
    
    // 현재 블록부터 시작
    let fromBlock = await this.provider.getBlockNumber();

    const timer = setInterval(async () => {
      try {
        const toBlock = await this.provider.getBlockNumber();
        // 새 블록이 없으면 패스
        if (toBlock <= fromBlock) return;

        // fromBlock+1 ~ toBlock 사이의 로그 조회
        const logs = await this.kernel.queryFilter(filter, fromBlock + 1, toBlock);

        for (const log of logs) {
          // Ethers v6는 queryFilter 결과를 자동으로 파싱해줍니다.
          if (!('args' in log)) continue; 

          const ev: ContextEvent = {
            topic: log.args.topic as string,
            seq: log.args.seq as bigint,
            author: log.args.author as string,
            payloadHash: log.args.payloadHash as string,
            uriHash: log.args.uriHash as string,
            metaHash: log.args.metaHash as string,
            contextId: log.args.contextId as string,
          };
          await onEvent(ev);
        }
        // 읽은 데까지 포인터 이동
        fromBlock = toBlock;
      } catch (e) {
        // RPC 에러가 나도 무시하고 다음 턴에 다시 시도 (죽지 않음)
      }
    }, 3000); // 3초마다 실행

    return () => clearInterval(timer);
  }

  async displayStatus(): Promise<void> {
    const fee = await this.kernel.getWriteFeeFor(this.wallet.address);
    const nonce = await this.kernel.authorNonce(this.wallet.address);
    console.log('--- AGENT STATUS ---');
    console.log('Address:', this.wallet.address);
    console.log('Kernel:', await this.kernel.getAddress());
    console.log('Write fee (for me):', fee.toString(), 'wei');
    console.log('Nonce:', nonce.toString());
    console.log('Topics:');
    console.log(`- ${TOPIC_NAMES.JOB_REQUEST} => ${TOPICS.JOB_REQUEST}`);
    console.log(`- ${TOPIC_NAMES.JOB_RECEIPT} => ${TOPICS.JOB_RECEIPT}`);
  }
}