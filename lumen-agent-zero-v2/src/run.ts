import { JsonRpcProvider, Wallet } from 'ethers';
import { AgentZeroV2 } from './AgentZeroV2.js';
import { banner, assertAddress, mustEnv, envOr, parseIntEnv, sleep } from './utils.js';
import { TOPICS } from './topics.js';

type Mode = 'dev' | 'emit' | 'listen';

function parseArgs(): { emit: boolean; listen: boolean } {
  const args = new Set(process.argv.slice(2));
  return {
    emit: args.has('--emit'),
    listen: args.has('--listen'),
  };
}

async function main() {
  console.log(banner());

  const { emit, listen } = parseArgs();
  const mode = (envOr('MODE', 'dev') as Mode) ?? 'dev';

  const rpcUrl = envOr('BASE_RPC_URL', 'https://mainnet.base.org');
  const kernelAddress = assertAddress(mustEnv('KERNEL_ADDRESS'), 'KERNEL_ADDRESS');
  const pk = mustEnv('PRIVATE_KEY');
  const confirmations = parseIntEnv('CONFIRMATIONS', 1);

  const provider = new JsonRpcProvider(rpcUrl);
  const wallet = new Wallet(pk);

  const agent = new AgentZeroV2(provider, wallet, { kernelAddress, confirmations });

  console.log('RPC:', rpcUrl);
  console.log('ChainId:', (await provider.getNetwork()).chainId.toString());

  await agent.displayStatus();

  const shouldListen = listen || mode === 'listen' || mode === 'dev';
  const shouldEmit = emit || mode === 'emit';

  if (shouldListen) {
    console.log('\n[LISTEN] Subscribing to JOB_REQUEST & JOB_RECEIPT topics...');
    await agent.subscribe(TOPICS.JOB_REQUEST, async (ev) => {
      console.log(`\n📥 JOB_REQUEST seq=${ev.seq.toString()} author=${ev.author}`);
      console.log(`   payloadHash=${ev.payloadHash}`);
      console.log(`   contextId=${ev.contextId}`);

      // Ignore our own events
      if (ev.author.toLowerCase() === agent.wallet.address.toLowerCase()) return;

      // Produce a receipt (deterministic, no payload needed)
      console.log('   ↳ processing (off-chain) ...');
      const out = await agent.handleJobRequest(ev);
      console.log('✅ wrote JOB_RECEIPT');
      console.log('   tx:', out.txHash);
      console.log('   receiptContextId:', out.receiptContextId);
    });

    await agent.subscribe(TOPICS.JOB_RECEIPT, async (ev) => {
      console.log(`\n🧾 JOB_RECEIPT seq=${ev.seq.toString()} author=${ev.author}`);
      console.log(`   receiptPayloadHash=${ev.payloadHash}`);
      console.log(`   contextId=${ev.contextId}`);
    });
  }

  if (shouldEmit) {
    console.log('\n[EMIT] Sending a demo job request...');
    const job = {
      kind: 'demo',
      prompt: 'Generate a deterministic receipt for this request (hash-only demo).',
    };
    const res = await agent.emitJobRequest(job);
    console.log('✅ wrote JOB_REQUEST');
    console.log('   tx:', res.txHash);
    console.log('   contextId:', res.contextId);
  }

  if (shouldListen) {
    console.log('\nListening... (Ctrl+C to exit)');
    // Keep process alive.
    // eslint-disable-next-line no-constant-condition
    while (true) await sleep(60_000);
  }
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
