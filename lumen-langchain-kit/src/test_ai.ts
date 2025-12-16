import * as dotenv from "dotenv";
dotenv.config();
import { ChatOpenAI } from "@langchain/openai";
import { LumenWriteTool } from "./LumenTool.js";

async function main() {
  // 1. LUMEN 도구 준비
  const lumenTool = new LumenWriteTool(
    process.env.PRIVATE_KEY!,
    process.env.KERNEL_ADDRESS!,
    "https://mainnet.base.org"
  );

  // 2. AI 준비 (OpenAI) - 키가 없으면 도구만 테스트
  console.log("🤖 AI: I have received the LUMEN Tool.");
  
  // 3. 도구 직접 실행 테스트
  console.log("Testing Tool directly...");
  const result = await lumenTool.invoke("Hello from LangChain!");
  console.log(result);
}

main().catch(console.error);