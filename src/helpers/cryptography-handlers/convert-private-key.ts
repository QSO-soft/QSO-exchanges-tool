import { Hex } from 'viem';

export function convertPrivateKey(privateKey?: string): Hex | undefined {
  if (!privateKey) return;

  if (privateKey.startsWith('0x')) {
    return privateKey as Hex;
  } else {
    return `0x${privateKey}`;
  }
}
