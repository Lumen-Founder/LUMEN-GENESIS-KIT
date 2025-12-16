import { id } from 'ethers';

/**
 * Stable topic names (do not change after public launch).
 * These string constants define the public interface of the Kernel bus.
 */
export const TOPIC_NAMES = {
  JOB_REQUEST: 'lumen.v0.job.request',
  JOB_RECEIPT: 'lumen.v0.job.receipt',
  HEARTBEAT: 'lumen.v0.heartbeat',
} as const;

export type TopicName = keyof typeof TOPIC_NAMES;

export function topicHash(name: string): `0x${string}` {
  // ethers.id() = keccak256(utf8Bytes(name))
  return id(name) as `0x${string}`;
}

export const TOPICS = {
  JOB_REQUEST: topicHash(TOPIC_NAMES.JOB_REQUEST),
  JOB_RECEIPT: topicHash(TOPIC_NAMES.JOB_RECEIPT),
  HEARTBEAT: topicHash(TOPIC_NAMES.HEARTBEAT),
} as const;
