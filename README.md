# 🌟 LUMEN GENESIS KIT

**The Complete Development Kit for Building on LUMEN World Computer**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Base Mainnet](https://img.shields.io/badge/Network-Base%20Mainnet-blue)](https://base.org)

LUMEN GENESIS KIT is a comprehensive monorepo containing all the essential tools, libraries, and examples you need to build autonomous agents and decentralized applications on the LUMEN World Computer infrastructure.

---

## 🌐 Deployed Contracts

**LUMEN Kernel V0 on Base Mainnet:**

| Contract | Address | Network |
|----------|---------|---------|
| **LumenKernelV0** | `0x52078D914CbccD78EE856b37b438818afaB3899c` | Base Mainnet (Chain ID: 8453) |

🔗 **Verify on Blockscout**: [View Contract](https://base.blockscout.com/address/0x52078D914CbccD78EE856b37b438818afaB3899c)

---

## 📦 What's Inside

This monorepo contains four core modules:

### 1. 🚀 **lumen-agent-zero-v2**
The next generation autonomous agent implementation focused on Context Bus interaction.
- **Heartbeat & Pulse**: Autonomous liveness proof on-chain
- **Context Emission**: Writes generic context data to LUMEN Kernel
- **Fee-Aware**: Manages gas and write fees automatically
- **State Persistence**: SQLite-based local state management

### 2. ⚙️ **lumen-kernel-v0-deploy-kit**
Smart contract deployment toolkit for LUMEN infrastructure.
- Hardhat-based deployment scripts
- Contract verification tools
- Network configuration for Base Mainnet
- Comprehensive testing suite

### 3. 🔗 **lumen-langchain-kit**
LangChain integration for LUMEN World Computer.
- Custom LangChain tools for LUMEN
- AI agent integration examples
- Seamless blockchain interaction from LLMs
- **Available on NPM**: `lumen-langchain-kit`

### 4. 📊 **lumen-relay-monitor**
Real-time monitoring dashboard for LUMEN network activity.
- Live event tracking
- Transaction monitoring
- Agent activity visualization
- SQLite-based data persistence

---

## 🎯 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git
- A wallet with ETH on Base Mainnet

### Installation

```bash
# Clone the repository
git clone https://github.com/Lumen-Founder/LUMEN-GENESIS-KIT.git
cd LUMEN-GENESIS-KIT

# Install dependencies for each module
cd lumen-agent-zero-v2 && npm install && cd ..
cd lumen-kernel-v0-vscode-monetized/lumen-kernel-v0-deploy-kit && npm install && cd ../..
cd lumen-langchain-kit && npm install && cd ..
cd lumen-relay-monitor/lumen-relay-monitor && npm install && cd ../..
```

### Quick Configuration

Create a `.env` file in each module directory based on your needs.

**1. Common Configuration (Required for All)**  
*Used for reading data from the blockchain (Monitor, Agent, etc).*

```env
KERNEL_ADDRESS=0x52078D914CbccD78EE856b37b438818afaB3899c
BASE_RPC_URL=https://mainnet.base.org
```

**2. Signer Configuration (Only for Agent & Deploy Kit)**  
*Required **only** for modules that submit transactions (write operations).*

```env
PRIVATE_KEY=your_private_key_here
```

---

## 📚 Module Documentation

### Agent Zero V2

Navigate to `lumen-agent-zero-v2/` for the complete autonomous agent implementation.

**Key Features:**

- **Autonomous Heartbeat**: Proves liveness to the network via periodic pulses.
- **Context Bus Integration**: Emits verifiable context to the Kernel.
- **Gas Management**: Optimized transaction handling for Base Mainnet.
- **Local Database**: Persistent storage for agent state and memory.

### Deploy Kit

Navigate to `lumen-kernel-v0-vscode-monetized/lumen-kernel-v0-deploy-kit/` for contract deployment tools.

**Key Features:**
- One-command deployment to Base Mainnet
- Automated contract verification
- Environment-based configuration
- Comprehensive test coverage

### LangChain Kit

Navigate to `lumen-langchain-kit/` for AI integration tools.

**Key Features:**
- Custom LangChain tools for blockchain interaction
- LUMEN-specific function calling
- AI agent examples
- Easy integration with existing LangChain workflows

**NPM Installation:**
```bash
npm install lumen-langchain-kit
```

**Quick Example:**
```typescript
import { LumenWriteTool } from 'lumen-langchain-kit';

const lumenTool = new LumenWriteTool(
  process.env.PRIVATE_KEY!,
  "0x52078D914CbccD78EE856b37b438818afaB3899c",
  "https://mainnet.base.org"
);
```

### Relay Monitor

Navigate to `lumen-relay-monitor/lumen-relay-monitor/` for the monitoring dashboard.

**Key Features:**
- Real-time event polling
- Web-based dashboard
- Historical data tracking
- Agent activity analytics

---

## 🏗️ Architecture

```
LUMEN-GENESIS-KIT/
├── lumen-agent-zero-v2/          # Autonomous agent implementation
├── lumen-kernel-v0-vscode-monetized/
│   └── lumen-kernel-v0-deploy-kit/  # Smart contract deployment
├── lumen-langchain-kit/          # LangChain integration (NPM package)
└── lumen-relay-monitor/
    └── lumen-relay-monitor/      # Monitoring dashboard
```

---

## 🌐 Network Information

- **Chain**: Base Mainnet
- **Chain ID**: 8453
- **RPC**: https://mainnet.base.org
- **Explorer**: https://basescan.org
- **Blockscout**: https://base.blockscout.com

---

## 🔧 Development

Each module is independently developed but shares common infrastructure:

1. **Agent Zero V2**: TypeScript-based agent runtime
2. **Deploy Kit**: Hardhat + TypeScript for smart contracts
3. **LangChain Kit**: TypeScript library for AI integration
4. **Relay Monitor**: Express + TypeScript for monitoring

---

## 📖 Resources

### LUMEN Protocol
- **GitHub**: https://github.com/Lumen-Founder/LUMEN-GENESIS-KIT
- **NPM Package**: [`lumen-langchain-kit`](https://www.npmjs.com/package/lumen-langchain-kit)

### Documentation
- **Base Docs**: https://docs.base.org
- **LangChain Docs**: https://docs.langchain.com
- **Ethers.js Docs**: https://docs.ethers.org/v6/

---

## 🤝 Contributing

We welcome contributions to any module in this monorepo!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - see LICENSE file in each module for details

---

## 🚀 What's Next?

The LUMEN GENESIS KIT enables developers to:

- 🤖 Build autonomous AI agents with economic incentives
- 🔐 Deploy trustless smart contract infrastructure
- 💱 Create agent-to-agent marketplaces
- 🌍 Participate in the decentralized agent economy
- ⚡ Integrate AI with blockchain seamlessly

**Join us in building the future of autonomous agents.**

---

**Made with ❤️ by LUMEN Protocol**

*"Trust, but Verify"*
