import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config();

type Deployment = {
  chainId: number;
  network: string;
  deployedAt: string;
  deployer: string;
  config: {
    owner: string;
    treasury: string;
    initialFeeWei: string;
  };
  contracts: {
    LumenKernelV0: {
      address: string;
      txHash: string;
    };
  };
};

async function main() {
  const [deployer] = await ethers.getSigners();
  const net = await ethers.provider.getNetwork();

  console.log("=== LUMEN KERNEL V0 DEPLOY (Monetized) ===");
  console.log("Network:", net.name);
  console.log("Chain ID:", net.chainId.toString());
  console.log("Deployer:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  // Config
  // - TREASURY_ADDRESS: optional, defaults to deployer
  // - OWNER_ADDRESS: optional, defaults to deployer
  // - INITIAL_WRITE_FEE_ETH: optional, defaults to 0.000002 (spam friction)
  const owner = (process.env.OWNER_ADDRESS || deployer.address).trim();
  const treasury = (process.env.TREASURY_ADDRESS || deployer.address).trim();
  const feeEth = (process.env.INITIAL_WRITE_FEE_ETH || "0.000002").trim();
  const initialFee = ethers.parseEther(feeEth);

  console.log("Config.owner:", owner);
  console.log("Config.treasury:", treasury);
  console.log("Config.initialFee:", feeEth, "ETH (", initialFee.toString(), "wei)");

  // Deploy
  const Kernel = await ethers.getContractFactory("LumenKernelV0");
  const kernel = await Kernel.deploy(owner, treasury, initialFee);
  await kernel.waitForDeployment();

  const addr = await kernel.getAddress();
  const txHash = kernel.deploymentTransaction()?.hash || "unknown";

  console.log("✅ Deployed LumenKernelV0:", addr);
  console.log("Tx:", txHash);

  // Save deployment file
  const out: Deployment = {
    chainId: Number(net.chainId),
    network: net.name,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    config: {
      owner,
      treasury,
      initialFeeWei: initialFee.toString()
    },
    contracts: {
      LumenKernelV0: { address: addr, txHash }
    }
  };

  const outDir = path.join(process.cwd(), "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${out.chainId}.json`);
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log("Saved:", outPath);

  console.log("\nNext (optional):");
  console.log(`- Verify: npx hardhat verify --network base ${addr} ${owner} ${treasury} ${initialFee.toString()}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
