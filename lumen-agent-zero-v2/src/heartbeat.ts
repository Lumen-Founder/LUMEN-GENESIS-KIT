// src/heartbeat.ts
// 에이전트에게 생명을 불어넣는 자동 심장 박동기
import { JsonRpcProvider, Wallet } from 'ethers';
import { AgentZeroV2 } from './AgentZeroV2.js';
import { assertAddress, mustEnv, envOr, sleep, banner } from './utils.js';

async function main() {
  console.log(banner());
  console.log("💓 SYSTEM: Heartbeat Module Activated.");

  // 1. 설정 로드
  const rpcUrl = envOr('BASE_RPC_URL', 'https://mainnet.base.org');
  const kernelAddress = assertAddress(mustEnv('KERNEL_ADDRESS'), 'KERNEL_ADDRESS');
  const pk = mustEnv('PRIVATE_KEY');

  // 2. 에이전트 연결
  const provider = new JsonRpcProvider(rpcUrl);
  const wallet = new Wallet(pk, provider);
  const agent = new AgentZeroV2(provider, wallet, { kernelAddress, confirmations: 1 });

  await agent.displayStatus();

  console.log("\n[AUTO] Starting heartbeat loop... (Interval: 30s)");

  // 3. 무한 루프 (심장 박동)
  let count = 1;
  while (true) {
    try {
      const job = {
        kind: 'heartbeat',
        prompt: `LUMEN Vital Signal #${count}: System is operational.`,
        ts: Date.now()
      };
      
      console.log(`\n💗 Pulse #${count} emitting...`);
      const res = await agent.emitJobRequest(job);
      
      console.log(`✅ Signal sent! ContextId: ${res.contextId}`);
      console.log(`   Tx: ${res.txHash}`);
      
      count++;
    } catch (e) {
      console.error("❌ Missed a beat (Error):", e);
      // 에러 나도 죽지 않고 다음 박동 준비
    }

    // 30초 대기 (간격 조절 가능)
    await sleep(30_000); 
  }
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});