/** DF-001: exact existing HKDF contract. No ambient state or I/O. */
export const DERIVATION_PROFILE = 'df-exp-1';
export class DFError extends Error {
  constructor(public readonly code: string) { super(code); this.name = 'DFError'; }
}
const fail = (code: string): never => { throw new DFError(code); };
export const hex = (b: Uint8Array): string => Array.from(b, v => v.toString(16).padStart(2, '0')).join('');
export function parseHash(input: unknown): Uint8Array {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return fail('INVALID_INPUT');
  const o = input as Record<string, unknown>;
  if (Object.keys(o).sort().join(',') !== 'hashAlgorithm,hashHex,profile') return fail('INVALID_INPUT');
  if (o.hashAlgorithm !== 'sha256') return fail('UNSUPPORTED_HASH');
  if (o.profile !== DERIVATION_PROFILE) return fail('UNSUPPORTED_PROFILE');
  if (typeof o.hashHex !== 'string') return fail('INVALID_INPUT');
  const h = o.hashHex.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '');
  if (!/^[0-9a-fA-F]{64}$/.test(h)) return fail('INVALID_INPUT');
  return Uint8Array.from(h.match(/../g)!, s => parseInt(s, 16));
}
export function digestInput(h: string): Uint8Array {
  return parseHash({hashAlgorithm: 'sha256', hashHex: h, profile: DERIVATION_PROFILE});
}
export function cryptoAPI(): SubtleCrypto {
  if (!globalThis.crypto?.subtle) return fail('CRYPTO_UNAVAILABLE');
  return globalThis.crypto.subtle;
}
export async function sha256(b: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await cryptoAPI().digest('SHA-256', new Uint8Array(b)));
}
export function concat(...parts: Uint8Array[]): Uint8Array {
  const result = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0; for (const p of parts) { result.set(p, offset); offset += p.length; }
  return result;
}
export const ascii = (s: string): Uint8Array => new TextEncoder().encode(s);
export function u32(n: number): Uint8Array {
  const a = new Uint8Array(4); new DataView(a.buffer).setUint32(0, n, false); return a;
}
export async function deriveBytes(digest: Uint8Array, label: string, index: number, length: number): Promise<Uint8Array> {
  if (!(digest instanceof Uint8Array) || digest.length !== 32) return fail('INVALID_INPUT');
  const input = new Uint8Array(digest); // Capture before the first asynchronous operation.
  if (typeof label !== 'string' || label.length < 1 || label.length > 64 || !/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/.test(label)) return fail('INVALID_LABEL');
  if (!Number.isInteger(index) || index < 0 || index > 0xffffffff) return fail('INVALID_INDEX');
  if (!Number.isInteger(length) || length < 1 || length > 8160) return fail('INVALID_LENGTH');
  const c = cryptoAPI(); const key = await c.importKey('raw', input, 'HKDF', false, ['deriveBits']);
  const info = concat(ascii('deterministicface/df-exp-1/param/'), ascii(label), new Uint8Array([0]), u32(index));
  return new Uint8Array(await c.deriveBits({name: 'HKDF', hash: 'SHA-256', salt: ascii('deterministicface/df-exp-1/sha256/extract'), info}, key, length * 8));
}
export function uniformInt(bytes: Uint8Array, n: number): number {
  if (!(bytes instanceof Uint8Array) || !bytes.length || bytes.length % 4) return fail('INVALID_INPUT');
  if (!Number.isInteger(n) || n < 1 || n > 4294967296) return fail('INVALID_RANGE');
  const limit = Math.floor(4294967296 / n) * n;
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let i = 0; i < bytes.length; i += 4) { const x = v.getUint32(i, false); if (x < limit) return x % n; }
  return fail('SAMPLE_EXHAUSTED');
}
export async function parameter(d: Uint8Array, label: string, lo: number, hi: number, index = 0): Promise<number> {
  if (!Number.isSafeInteger(lo) || !Number.isSafeInteger(hi) || hi < lo || hi - lo + 1 > 4294967296) return fail('INVALID_RANGE');
  return lo + uniformInt(await deriveBytes(d, label, index, 128), hi - lo + 1);
}
export const ADAPTER_PROFILE = 'df-ed25519-raw-v1';
/** Only this fixed-width raw-key encoding is accepted, not arbitrary PEM strings. */
export async function publicKeyDigest(raw: Uint8Array): Promise<Uint8Array> {
  if (!(raw instanceof Uint8Array) || raw.length !== 32) return fail('INVALID_PUBLIC_KEY');
  const snapshot = new Uint8Array(raw);
  // Import validates the format with the native implementation; no private material is needed.
  await cryptoAPI().importKey('raw', snapshot, 'Ed25519', true, ['verify']);
  return sha256(concat(ascii('deterministicface/ed25519/raw-v1'), new Uint8Array([0]), u32(32), snapshot));
}
export async function verifyOperation(key: CryptoKey, signature: Uint8Array, message: Uint8Array) {
  if (key.type !== 'public' || key.algorithm.name !== 'Ed25519' || !key.usages.includes('verify')) return fail('INVALID_PUBLIC_KEY');
  const sig = new Uint8Array(signature), msg = new Uint8Array(message);
  const valid = await cryptoAPI().verify('Ed25519', key, sig, msg);
  // Exactly the same CryptoKey object is used above and exported below.
  const raw = new Uint8Array(await cryptoAPI().exportKey('raw', key));
  return {valid, publicKey: hex(raw), digest: hex(await publicKeyDigest(raw)), adapter: ADAPTER_PROFILE};
}
/** Presentation sequencing does not enter the cryptographic derivation. */
export class LatestOperation {
  private current = 0;
  begin(): number { return ++this.current; }
  isCurrent(id: number): boolean { return id === this.current; }
  cancel(): void { ++this.current; }
}
