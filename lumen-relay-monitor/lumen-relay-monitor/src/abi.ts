import { Interface } from "ethers";

export const KERNEL_ABI = [
  "event ContextWritten(bytes32 indexed topic, uint64 indexed seq, address indexed author, bytes32 payloadHash, bytes32 uriHash, bytes32 metaHash, bytes32 contextId)",
  "function getWriteFeeFor(address subject) view returns (uint256)",
  "function writeContext(bytes32 topic, bytes32 payloadHash, bytes32 uriHash, bytes32 metaHash, uint64 nonce) payable returns (uint64 seq, bytes32 contextId)"
] as const;

export const iface = new Interface(KERNEL_ABI);
export const CONTEXT_WRITTEN_TOPIC0 = iface.getEvent("ContextWritten").topicHash;
