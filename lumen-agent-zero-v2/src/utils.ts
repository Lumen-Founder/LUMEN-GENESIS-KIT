import 'dotenv/config';
import { keccak256, toUtf8Bytes, isAddress } from 'ethers';

export function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) throw new Error(`Missing env: ${name}`);
  return v.trim();
}

export function envOr(name: string, fallback: string): string {
  const v = process.env[name];
  return (v && v.trim()) ? v.trim() : fallback;
}

export function parseIntEnv(name: string, fallback: number): number {
  const v = process.env[name];
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function hashJson(obj: unknown): `0x${string}` {
  const s = JSON.stringify(obj);
  return keccak256(toUtf8Bytes(s)) as `0x${string}`;
}

export function hashText(s: string): `0x${string}` {
  return keccak256(toUtf8Bytes(s)) as `0x${string}`;
}

export function assertAddress(addr: string, name: string): `0x${string}` {
  if (!isAddress(addr)) throw new Error(`Invalid ${name}: ${addr}`);
  return addr as `0x${string}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function banner(): string {
  return [
    '╔═══════════════════════════════════════════════════════════╗',
    '║                 🤖 LUMEN AGENT ZERO v2.0                 ║',
    '║      Global Context Bus Demo (Kernel V0 on Base)         ║',
    '╚═══════════════════════════════════════════════════════════╝',
  ].join('\n');
}
