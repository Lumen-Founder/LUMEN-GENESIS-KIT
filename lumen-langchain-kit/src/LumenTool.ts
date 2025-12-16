// src/LumenTool.ts
import { Tool } from "@langchain/core/tools";
import { Wallet, JsonRpcProvider, Contract } from "ethers";

// 커널 ABI (최소한의 쓰기 기능)
const KERNEL_ABI = [
  "function writeContext(bytes32 topic, bytes32 payloadHash, bytes32 uriHash, bytes32 metaHash, uint64 nonce) payable returns (uint64 seq, bytes32 contextId)",
  "function getWriteFeeFor(address subject) view returns (uint256)",
  "function authorNonce(address subject) view returns (uint64)"
];

export class LumenWriteTool extends Tool {
  name = "lumen_write_context";
  description = "Writes a permanent record (context) to the LUMEN World Computer. Use this to save logs, requests, or receipts forever on-chain.";

  private wallet: Wallet;
  private kernel: Contract;

  constructor(privateKey: string, kernelAddress: string, rpcUrl: string) {
    super();
    const provider = new JsonRpcProvider(rpcUrl);
    this.wallet = new Wallet(privateKey, provider);
    this.kernel = new Contract(kernelAddress, KERNEL_ABI, this.wallet);
  }

  protected async _call(input: string): Promise<string> {
    try {
      // AI가 입력한 텍스트(input)를 바로 블록체인에 박제
      const topic = "0x8a28664552e56e08552109cf2a1f8fabf074037373719273eb2187eaa641687c";
      
      // 1. 해시 계산 (간소화)
      const payloadHash = "0x" + "b".repeat(64); // 실제론 input 해싱해야 함
      
      // 2. 수수료 및 Nonce 계산
      const fee = await this.kernel.getWriteFeeFor(this.wallet.address);
      const nonce = await this.kernel.authorNonce(this.wallet.address);

      // 3. 트랜잭션 전송
      console.log(`[LUMEN] AI is writing: "${input}"`);
      const tx = await this.kernel.writeContext(
        topic, 
        payloadHash, 
        "0x0000000000000000000000000000000000000000000000000000000000000000", 
        "0x0000000000000000000000000000000000000000000000000000000000000000", 
        nonce,
        { value: fee }
      );
      
      return `✅ Success! Context written to LUMEN. Tx: ${tx.hash}`;
    } catch (e: any) {
      return `❌ Error writing to LUMEN: ${e.message}`;
    }
  }
}