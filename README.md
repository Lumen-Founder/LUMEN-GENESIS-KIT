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
