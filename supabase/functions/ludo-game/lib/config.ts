export const nowIso = () => new Date().toISOString();

export function rollDiceCrypto(): number {
  return (crypto.getRandomValues(new Uint32Array(1))[0] % 6) + 1;
}

export function pickRandomIndex(maxExclusive: number): number {
  const x = crypto.getRandomValues(new Uint32Array(1))[0];
  return x % maxExclusive;
}

export function isTxHash(s: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(s);
}
