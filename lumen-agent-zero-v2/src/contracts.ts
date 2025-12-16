import { Interface } from 'ethers';

export const LumenKernelV0Abi = [
  // Events
  'event ContextWritten(bytes32 indexed topic, uint64 indexed seq, address indexed author, bytes32 payloadHash, bytes32 uriHash, bytes32 metaHash, bytes32 contextId)',
  'event CapabilityGranted(bytes32 indexed topic, address indexed subject, uint8 perms)',
  'event TopicPublicWriteSet(bytes32 indexed topic, bool enabled)',
  'event WriteFeeUpdated(uint256 newFee)',
  'event FeeExemptionUpdated(address indexed subject, bool isExempt)',
  'event FeesWithdrawn(address indexed to, uint256 amount)',

  // Writes
  'function writeContext(bytes32 topic, bytes32 payloadHash, bytes32 uriHash, bytes32 metaHash, uint64 nonce) payable returns (uint64 seq, bytes32 contextId)',

  // Reads
  'function authorNonce(address author) view returns (uint64)',
  'function getWriteFeeFor(address subject) view returns (uint256)',
  'function writeFee() view returns (uint256)',
  'function feeExempt(address subject) view returns (bool)',
] as const;

export const KernelIface = new Interface(LumenKernelV0Abi);
