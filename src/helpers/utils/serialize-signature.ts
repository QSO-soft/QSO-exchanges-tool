import { secp256k1 } from '@noble/curves/secp256k1';
import { Hex, hexToNumber, toHex } from 'viem';

export const serializeSignature = (signature: Hex) => {
  const { r, s } = secp256k1.Signature.fromCompact(signature.slice(2, 130));
  return {
    v: hexToNumber(`0x${signature.slice(130)}`),
    r: toHex(r),
    s: toHex(s),
  };
};
