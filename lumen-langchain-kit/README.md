# 🔗 LUMEN LangChain Kit

**LangChain Integration for LUMEN World Computer**

[![npm version](https://img.shields.io/npm/v/lumen-langchain-kit)](https://www.npmjs.com/package/lumen-langchain-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Enable AI agents built with LangChain to interact directly with the LUMEN World Computer blockchain infrastructure.

---

## 🎯 What is This?

LUMEN LangChain Kit provides custom LangChain tools that allow Large Language Models (LLMs) to write permanent records to the blockchain, creating a bridge between AI reasoning and decentralized storage.

### Key Features

- 🤖 **AI-to-Blockchain Bridge**: Let AI agents write directly to LUMEN
- 🔧 **LangChain Native**: Works seamlessly with existing LangChain workflows
- ⛓️ **Base Mainnet**: Deployed on Ethereum L2 for low fees
- 🔐 **Trustless**: All operations are cryptographically verified on-chain

---

## 📦 Installation

```bash
npm install lumen-langchain-kit
```

### Peer Dependencies

```bash
npm install @langchain/core ethers
```

---

## 🚀 Quick Start

### Basic Usage

```typescript
import { LumenWriteTool } from 'lumen-langchain-kit';

// Initialize the tool
const lumenTool = new LumenWriteTool(
  process.env.PRIVATE_KEY!,           // Your wallet private key
  "0xKERNEL_ADDRESS",                 // LUMEN Kernel contract address
  "https://mainnet.base.org"          // Base Mainnet RPC
);

// Use with LangChain agent
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({ temperature: 0 });

const executor = await initializeAgentExecutorWithOptions(
  [lumenTool],
  model,
  {
    agentType: "zero-shot-react-description",
  }
);

// Let the AI decide when to write to blockchain
const result = await executor.invoke({
  input: "Save a record that user Alice completed task #42 at 2025-01-15"
});

console.log(result.output);
```

---

## 🔧 Available Tools

### `LumenWriteTool`

Writes a permanent context record to the LUMEN World Computer.

**Parameters:**
- `privateKey`: Ethereum wallet private key (must have ETH for gas)
- `kernelAddress`: Address of the LUMEN Kernel contract
- `rpcUrl`: RPC endpoint for Base Mainnet

**Usage:**
```typescript
const tool = new LumenWriteTool(
  "0x1234...",
  "0xKERNEL_ADDRESS",
  "https://mainnet.base.org"
);

// Call directly
const result = await tool._call("Log: User completed payment");
console.log(result); // ✅ Success! Context written to LUMEN. Tx: 0xabc...
```

---

## 📖 How It Works

1. **AI Reasoning**: The LangChain agent decides when blockchain storage is needed
2. **Tool Invocation**: Agent calls `LumenWriteTool` with the data to store
3. **On-Chain Write**: Tool calculates fees, prepares transaction, and writes to LUMEN Kernel
4. **Verification**: Transaction hash is returned for permanent proof

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   AI Agent  │─────▶│  LumenTool   │─────▶│   LUMEN     │
│  (LangChain)│      │              │      │   Kernel    │
└─────────────┘      └──────────────┘      └─────────────┘
     Decides              Executes           Stores Forever
```

---

## 🌐 Network Information

- **Chain**: Base Mainnet
- **Chain ID**: 8453
- **RPC**: https://mainnet.base.org
- **Explorer**: https://basescan.org

---

## 🛡️ Security

### Best Practices

- ✅ Never hardcode private keys in source code
- ✅ Use environment variables for sensitive data
- ✅ Start with testnet before mainnet deployment
- ✅ Monitor gas prices and transaction costs
- ✅ Implement rate limiting for production agents

### Environment Setup

Create a `.env` file:

```env
PRIVATE_KEY=your_wallet_private_key_here
KERNEL_ADDRESS=0xYourKernelAddress
BASE_RPC_URL=https://mainnet.base.org
```

---

## 📚 Examples

### Example 1: AI Logger

```typescript
import { LumenWriteTool } from 'lumen-langchain-kit';
import { ChatOpenAI } from "@langchain/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";

const lumenTool = new LumenWriteTool(
  process.env.PRIVATE_KEY!,
  process.env.KERNEL_ADDRESS!,
  process.env.BASE_RPC_URL!
);

const model = new ChatOpenAI({ temperature: 0 });

const executor = await initializeAgentExecutorWithOptions(
  [lumenTool],
  model,
  { agentType: "zero-shot-react-description" }
);

const result = await executor.invoke({
  input: "A critical event occurred: Database backup completed successfully at 2025-01-15 14:30 UTC. Store this permanently."
});

console.log(result.output);
```

### Example 2: Multi-Agent Coordination

```typescript
// Agent 1 writes a job request
const jobRequest = await agentExecutor1.invoke({
  input: "Create a job request for data analysis task #123"
});

// Agent 2 reads and responds (via LUMEN event monitoring)
const jobResponse = await agentExecutor2.invoke({
  input: "Check for pending job requests and accept task #123"
});
```

---

## 🔗 Related Projects

- **LUMEN GENESIS KIT**: https://github.com/Lumen-Founder/LUMEN-GENESIS-KIT
- **Agent Zero V2**: Autonomous agent implementation
- **Deploy Kit**: Smart contract deployment tools
- **Relay Monitor**: Real-time network monitoring

---

## 🤝 Contributing

Contributions are welcome! Please open issues or submit pull requests.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🚀 What's Next?

The LUMEN LangChain Kit enables:

- 🤖 AI agents that can prove their actions on-chain
- 🔐 Trustless AI-to-AI communication
- 💱 Autonomous agent marketplaces
- 🌍 Decentralized AI orchestration
- ⚡ Verifiable AI reasoning trails

**Build the future of AI × Blockchain.**

---

**Made with ❤️ by LUMEN Protocol**

*"Trust, but Verify"*
