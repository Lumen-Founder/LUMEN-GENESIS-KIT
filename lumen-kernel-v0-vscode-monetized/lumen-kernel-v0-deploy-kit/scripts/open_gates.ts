import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

const JOB_REQUEST = ethers.id("lumen.v0.job.request");
const JOB_RECEIPT = ethers.id("lumen.v0.job.receipt");

async function main() {
  const KERNEL_ADDRESS = process.env.KERNEL_ADDRESS || "0x52078D914CbccD78EE856b37b438818afaB3899c"; 
  const Kernel = await ethers.getContractAt("LumenKernelV0", KERNEL_ADDRESS);

  console.log("🔓 Opening Gates...");
  // 1. 요청 게시판 공개
  console.log("- Unlocking JOB_REQUEST...");
  let tx = await Kernel.setTopicPublicWrite(JOB_REQUEST, true);
  await tx.wait();
  
  // 2. 결과 게시판 공개
  console.log("- Unlocking JOB_RECEIPT...");
  tx = await Kernel.setTopicPublicWrite(JOB_RECEIPT, true);
  await tx.wait();

  console.log("✅ All Gates Opened! (Access Granted)");
}
main().catch((e) => console.error(e));