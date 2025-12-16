import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  // 1. Configuration
  const KERNEL_ADDRESS = "0x52078D914CbccD78EE856b37b438818afaB3899c"; // Deployed address
  const [signer] = await ethers.getSigners();

  console.log("=== LUMEN GENESIS BOOT ===");
  console.log("Operator:", signer.address);
  console.log("Kernel:", KERNEL_ADDRESS);

  // 2. Connect to Kernel
  const Kernel = await ethers.getContractAt("LumenKernelV0", KERNEL_ADDRESS);

  // 3. Prepare Topic
  const topic = ethers.keccak256(ethers.toUtf8Bytes("LUMEN_GENESIS"));
  
// [Added Step] 🚨 Self-Grant Capability
// Grant write permission (1 = PERM_WRITE) to self (signer) using Owner privileges.
  console.log("\n1. Granting Write Permission...");
  const grantTx = await Kernel.grantCapability(topic, signer.address, 1);
  await grantTx.wait();
  console.log("✅ Permission Granted.");

  // 4. Prepare Message (Genesis Payload)
  const payloadMessage = "LUMEN World Computer: Online. The Agent Civilization begins here.";
  const payloadHash = ethers.keccak256(ethers.toUtf8Bytes(payloadMessage));
  const zeroHash = ethers.ZeroHash;
  
  // Fetch Nonce
  const nonce = await Kernel.authorNonce(signer.address);

  console.log("\n2. Writing Genesis Context...");
  console.log("Topic Hash:", topic);
  console.log("Payload:", payloadMessage);
  
  // 5. Execute (Owner is fee-exempt, so value: 0)
  const tx = await Kernel.writeContext(
    topic,
    payloadHash,
    zeroHash, // uriHash
    zeroHash, // metaHash
    nonce
  );

  console.log("Tx sent:", tx.hash);
  await tx.wait();

  console.log("\n🎉 GENESIS BOOT COMPLETE!");
  console.log("The World Computer is now ALIVE.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});