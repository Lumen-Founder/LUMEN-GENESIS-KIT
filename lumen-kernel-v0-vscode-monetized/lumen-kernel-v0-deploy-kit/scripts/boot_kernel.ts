import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  // 1. 설정
  const KERNEL_ADDRESS = "0x52078D914CbccD78EE856b37b438818afaB3899c"; // 배포된 주소
  const [signer] = await ethers.getSigners();

  console.log("=== LUMEN GENESIS BOOT ===");
  console.log("Operator:", signer.address);
  console.log("Kernel:", KERNEL_ADDRESS);

  // 2. 커널 연결
  const Kernel = await ethers.getContractAt("LumenKernelV0", KERNEL_ADDRESS);

  // 3. 토픽 준비
  const topic = ethers.keccak256(ethers.toUtf8Bytes("LUMEN_GENESIS"));
  
  // [추가된 단계] 🚨 권한 셀프 부여 (Grant Capability)
  // Owner 권한으로 자신(signer)에게 쓰기 권한(1 = PERM_WRITE)을 줍니다.
  console.log("\n1. Granting Write Permission...");
  const grantTx = await Kernel.grantCapability(topic, signer.address, 1);
  await grantTx.wait();
  console.log("✅ Permission Granted.");

  // 4. 메시지 준비 (Genesis Payload)
  const payloadMessage = "LUMEN World Computer: Online. The Agent Civilization begins here.";
  const payloadHash = ethers.keccak256(ethers.toUtf8Bytes(payloadMessage));
  const zeroHash = ethers.ZeroHash;
  
  // Nonce 가져오기
  const nonce = await Kernel.authorNonce(signer.address);

  console.log("\n2. Writing Genesis Context...");
  console.log("Topic Hash:", topic);
  console.log("Payload:", payloadMessage);
  
  // 5. 실행 (Owner는 수수료 면제되므로 value: 0)
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